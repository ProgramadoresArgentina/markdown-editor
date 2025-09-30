'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { marked } from 'marked';
import { ArticleSuggestions, useArticleSuggestions } from './article-suggestions';
import { 
  Bold, 
  Italic, 
  Code, 
  Link as LinkIcon, 
  Image as ImageIcon,
  List, 
  ListOrdered, 
  Save,
  Download,
  Upload,
  Eye,
  EyeOff,
  Heading1,
  Heading2,
  Heading3,
  Quote
} from 'lucide-react';

interface MarkdownEditorProps {
  className?: string;
}

export default function MarkdownEditor({ className }: MarkdownEditorProps) {
  const [markdownContent, setMarkdownContent] = useState('# Mi Documento\n\nEscribe aquí tu contenido en Markdown...\n\nPuedes referenciar artículos usando @ seguido del nombre del artículo.\n\nPrueba escribir @ para ver sugerencias.\n\n');
  const [previewContent, setPreviewContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [spellErrors, setSpellErrors] = useState<Array<{start: number, end: number, word: string}>>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [currentSuggestion, setCurrentSuggestion] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ghostTextRef = useRef<HTMLDivElement>(null);
  
  // Hook para sugerencias de artículos
  const {
    showSuggestions: showArticleSuggestions,
    suggestionQuery,
    suggestionPosition,
    handleAtSymbol,
    insertArticleReference,
    setShowSuggestions: setShowArticleSuggestions
  } = useArticleSuggestions();

  // Palabras en español para spell checking
  const spanishWords = useMemo(() => new Set([
    'el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'una', 'del', 'los', 'las', 'pero', 'sus', 'han', 'más', 'como', 'muy', 'sin', 'fue', 'ser', 'dos', 'año', 'años', 'sobre', 'todo', 'hasta', 'tan', 'bien', 'puede', 'este', 'esta', 'estos', 'estas', 'tiene', 'tengo', 'hacer', 'tiempo', 'vida', 'casa', 'día', 'días', 'trabajo', 'hombre', 'mujer', 'mundo', 'país', 'parte', 'lugar', 'caso', 'forma', 'manera', 'ejemplo', 'momento', 'persona', 'personas', 'problema', 'problemas', 'sistema', 'sistemas', 'información', 'datos', 'texto', 'contenido', 'archivo', 'archivos', 'documento', 'documentos', 'aplicación', 'aplicaciones', 'función', 'funciones', 'código', 'códigos', 'programa', 'programas', 'proyecto', 'proyectos', 'editor', 'editores', 'markdown', 'formato', 'formatos', 'lista', 'listas', 'línea', 'líneas', 'página', 'páginas', 'vista', 'vistas', 'tabla', 'tablas', 'imagen', 'imágenes', 'enlace', 'enlaces', 'botón', 'botones', 'menú', 'menús', 'ventana', 'ventanas', 'pantalla', 'pantallas', 'usuario', 'usuarios', 'cliente', 'clientes', 'servidor', 'servidores', 'base', 'bases', 'datos', 'web', 'internet', 'red', 'redes', 'tecnología', 'tecnologías', 'desarrollo', 'desarrollos', 'diseño', 'diseños', 'creación', 'creaciones', 'configuración', 'configuraciones', 'instalación', 'instalaciones', 'actualización', 'actualizaciones', 'versión', 'versiones', 'error', 'errores', 'solución', 'soluciones', 'ayuda', 'ayudas', 'soporte', 'soportes', 'servicio', 'servicios', 'producto', 'productos', 'empresa', 'empresas', 'negocio', 'negocios', 'mercado', 'mercados', 'cliente', 'clientes', 'venta', 'ventas', 'compra', 'compras', 'precio', 'precios', 'dinero', 'dineros', 'valor', 'valores', 'calidad', 'calidades', 'cantidad', 'cantidades', 'número', 'números', 'orden', 'órdenes', 'grupo', 'grupos', 'equipo', 'equipos', 'miembro', 'miembros', 'comunidad', 'comunidades', 'social', 'sociales', 'público', 'públicos', 'privado', 'privados', 'general', 'generales', 'especial', 'especiales', 'importante', 'importantes', 'necesario', 'necesarios', 'posible', 'posibles', 'disponible', 'disponibles', 'útil', 'útiles', 'fácil', 'fáciles', 'difícil', 'difíciles', 'simple', 'simples', 'complejo', 'complejos', 'rápido', 'rápidos', 'lento', 'lentos', 'nuevo', 'nuevos', 'viejo', 'viejos', 'grande', 'grandes', 'pequeño', 'pequeños', 'alto', 'altos', 'bajo', 'bajos', 'largo', 'largos', 'corto', 'cortos', 'bueno', 'buenos', 'malo', 'malos', 'mejor', 'mejores', 'peor', 'peores', 'primero', 'primeros', 'último', 'últimos', 'siguiente', 'siguientes', 'anterior', 'anteriores', 'principal', 'principales', 'secundario', 'secundarios', 'básico', 'básicos', 'avanzado', 'avanzados', 'completo', 'completos', 'parcial', 'parciales', 'total', 'totales', 'final', 'finales', 'inicial', 'iniciales', 'medio', 'medios', 'centro', 'centros', 'derecha', 'izquierda', 'arriba', 'abajo', 'dentro', 'fuera', 'cerca', 'lejos', 'aquí', 'allí', 'donde', 'cuando', 'como', 'porque', 'aunque', 'mientras', 'durante', 'antes', 'después', 'siempre', 'nunca', 'ahora', 'hoy', 'ayer', 'mañana', 'semana', 'mes', 'año', 'hora', 'minuto', 'segundo', 'momento', 'vez', 'veces', 'ocasión', 'ocasiones', 'evento', 'eventos', 'actividad', 'actividades', 'acción', 'acciones', 'operación', 'operaciones', 'proceso', 'procesos', 'método', 'métodos', 'técnica', 'técnicas', 'herramienta', 'herramientas', 'recurso', 'recursos', 'material', 'materiales', 'elemento', 'elementos', 'componente', 'componentes', 'parte', 'partes', 'sección', 'secciones', 'capítulo', 'capítulos', 'tema', 'temas', 'asunto', 'asuntos', 'materia', 'materias', 'campo', 'campos', 'área', 'áreas', 'zona', 'zonas', 'región', 'regiones', 'territorio', 'territorios', 'espacio', 'espacios', 'lugar', 'lugares', 'sitio', 'sitios', 'posición', 'posiciones', 'ubicación', 'ubicaciones', 'dirección', 'direcciones', 'camino', 'caminos', 'ruta', 'rutas', 'vía', 'vías', 'medio', 'medios', 'canal', 'canales', 'forma', 'formas', 'modo', 'modos', 'manera', 'maneras', 'estilo', 'estilos', 'tipo', 'tipos', 'clase', 'clases', 'categoría', 'categorías', 'nivel', 'niveles', 'grado', 'grados', 'estado', 'estados', 'situación', 'situaciones', 'condición', 'condiciones', 'circunstancia', 'circunstancias', 'contexto', 'contextos', 'ambiente', 'ambientes', 'entorno', 'entornos', 'marco', 'marcos', 'estructura', 'estructuras', 'organización', 'organizaciones', 'institución', 'instituciones', 'establecimiento', 'establecimientos', 'centro', 'centros', 'oficina', 'oficinas', 'local', 'locales', 'edificio', 'edificios', 'construcción', 'construcciones', 'instalación', 'instalaciones', 'facilidad', 'facilidades', 'servicio', 'servicios', 'atención', 'atenciones', 'cuidado', 'cuidados', 'mantenimiento', 'mantenimientos', 'reparación', 'reparaciones', 'mejora', 'mejoras', 'cambio', 'cambios', 'modificación', 'modificaciones', 'transformación', 'transformaciones', 'desarrollo', 'desarrollos', 'crecimiento', 'crecimientos', 'evolución', 'evoluciones', 'progreso', 'progresos', 'avance', 'avances', 'adelanto', 'adelantos', 'innovación', 'innovaciones', 'invención', 'invenciones', 'descubrimiento', 'descubrimientos', 'hallazgo', 'hallazgos', 'resultado', 'resultados', 'consecuencia', 'consecuencias', 'efecto', 'efectos', 'impacto', 'impactos', 'influencia', 'influencias', 'poder', 'poderes', 'fuerza', 'fuerzas', 'energía', 'energías', 'capacidad', 'capacidades', 'habilidad', 'habilidades', 'destreza', 'destrezas', 'talento', 'talentos', 'don', 'dones', 'cualidad', 'cualidades', 'característica', 'características', 'propiedad', 'propiedades', 'atributo', 'atributos', 'rasgo', 'rasgos', 'aspecto', 'aspectos', 'detalle', 'detalles', 'particular', 'particulares', 'específico', 'específicos', 'concreto', 'concretos', 'exacto', 'exactos', 'preciso', 'precisos', 'claro', 'claros', 'evidente', 'evidentes', 'obvio', 'obvios', 'cierto', 'ciertos', 'seguro', 'seguros', 'verdadero', 'verdaderos', 'real', 'reales', 'auténtico', 'auténticos', 'genuino', 'genuinos', 'original', 'originales', 'único', 'únicos', 'especial', 'especiales', 'diferente', 'diferentes', 'distinto', 'distintos', 'otro', 'otros', 'adicional', 'adicionales', 'extra', 'extras', 'más', 'menos', 'mucho', 'muchos', 'poco', 'pocos', 'bastante', 'bastantes', 'suficiente', 'suficientes', 'demasiado', 'demasiados', 'todo', 'todos', 'nada', 'ninguno', 'algunos', 'varios', 'ciertos', 'determinados', 'específicos', 'particulares', 'propios', 'ajenos', 'común', 'comunes', 'normal', 'normales', 'regular', 'regulares', 'habitual', 'habituales', 'frecuente', 'frecuentes', 'raro', 'raros', 'extraño', 'extraños', 'curioso', 'curiosos', 'interesante', 'interesantes', 'importante', 'importantes', 'significativo', 'significativos', 'relevante', 'relevantes', 'fundamental', 'fundamentales', 'esencial', 'esenciales', 'básico', 'básicos', 'principal', 'principales', 'central', 'centrales', 'clave', 'claves', 'crítico', 'críticos', 'vital', 'vitales', 'necesario', 'necesarios', 'imprescindible', 'imprescindibles', 'obligatorio', 'obligatorios', 'requerido', 'requeridos', 'exigido', 'exigidos', 'demandado', 'demandados', 'solicitado', 'solicitados', 'pedido', 'pedidos', 'buscado', 'buscados', 'deseado', 'deseados', 'querido', 'queridos', 'amado', 'amados', 'apreciado', 'apreciados', 'valorado', 'valorados', 'estimado', 'estimados', 'respetado', 'respetados', 'admirado', 'admirados', 'reconocido', 'reconocidos', 'conocido', 'conocidos', 'famoso', 'famosos', 'popular', 'populares', 'exitoso', 'exitosos', 'triunfante', 'triunfantes', 'ganador', 'ganadores', 'vencedor', 'vencedores', 'campeón', 'campeones', 'líder', 'líderes', 'jefe', 'jefes', 'director', 'directores', 'gerente', 'gerentes', 'administrador', 'administradores', 'supervisor', 'supervisores', 'coordinador', 'coordinadores', 'responsable', 'responsables', 'encargado', 'encargados', 'especialista', 'especialistas', 'experto', 'expertos', 'profesional', 'profesionales', 'técnico', 'técnicos', 'ingeniero', 'ingenieros', 'desarrollador', 'desarrolladores', 'programador', 'programadores', 'diseñador', 'diseñadores', 'analista', 'analistas', 'consultor', 'consultores', 'asesor', 'asesores', 'consejero', 'consejeros', 'instructor', 'instructores', 'profesor', 'profesores', 'maestro', 'maestros', 'educador', 'educadores', 'formador', 'formadores', 'entrenador', 'entrenadores', 'capacitador', 'capacitadores', 'guía', 'guías', 'mentor', 'mentores', 'tutor', 'tutores', 'coach', 'coaches', 'facilitador', 'facilitadores', 'mediador', 'mediadores', 'intermediario', 'intermediarios', 'representante', 'representantes', 'delegado', 'delegados', 'embajador', 'embajadores', 'portavoz', 'portavoces', 'vocero', 'voceros', 'comunicador', 'comunicadores', 'periodista', 'periodistas', 'reportero', 'reporteros', 'corresponsal', 'corresponsales', 'editor', 'editores', 'redactor', 'redactores', 'escritor', 'escritores', 'autor', 'autores', 'creador', 'creadores', 'productor', 'productores', 'fabricante', 'fabricantes', 'constructor', 'constructores', 'builder', 'builders', 'desarrollador', 'desarrolladores', 'programador', 'programadores'
  ]), []);

  // Función para compilar markdown a HTML
  const compileMarkdown = useCallback(async (content: string) => {
    try {
      // Configurar marked para que los links se abran en nueva pestaña
      marked.setOptions({
        breaks: true,
        gfm: true,
      });

      // Procesar links con target="_blank"
      const processedContent = content.replace(
        /\[([^\]]+)\]\(([^)]+)\)\{:target="_blank"\}/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      const html = await marked(processedContent);
      return html;
    } catch (error) {
      console.error('Error compilando markdown:', error);
      return content;
    }
  }, []);

  // Actualizar preview cuando cambia el contenido
  useEffect(() => {
    const updatePreview = async () => {
      const html = await compileMarkdown(markdownContent);
      setPreviewContent(html);
    };
    
    updatePreview();
  }, [markdownContent, compileMarkdown]);

  // Función para manejar cambios en el textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    setMarkdownContent(newContent);
    setCursorPosition(cursorPos);
    
    // Verificar si se está escribiendo una referencia de artículo (@)
    const atResult = handleAtSymbol(newContent, cursorPos, textareaRef);
    
    if (!atResult.showSuggestions) {
      // Si no estamos mostrando sugerencias de artículos, mostrar sugerencias normales
      generateSuggestions(newContent, cursorPos);
      checkSpelling(newContent);
    }
  };

  // Función para manejar cambios en la posición del cursor
  const handleCursorPositionChange = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPos = textarea.selectionStart || 0;
      setCursorPosition(cursorPos);
      
      // Verificar referencias de artículos
      const atResult = handleAtSymbol(markdownContent, cursorPos, textareaRef);
      
      if (!atResult.showSuggestions) {
        generateSuggestions(markdownContent, cursorPos);
      }
    }
  };

  // Función para generar sugerencias de autocompletado (simplificada)
  const generateSuggestions = useCallback((text: string, cursorPos: number) => {
    const beforeCursor = text.substring(0, cursorPos);
    const currentLine = beforeCursor.split('\n').pop() || '';
    const currentWord = currentLine.split(/\s+/).pop() || '';
    
    if (currentWord.length < 2) {
      setCurrentSuggestion('');
      return;
    }

    const suggestions: string[] = [];

    // Solo sugerir headers si estamos al inicio de una línea
    if (currentLine.trim() === currentWord && currentWord.startsWith('#')) {
      suggestions.push('# Título principal', '## Subtítulo', '### Título de sección');
    }
    // Sugerencias de palabras comunes
    else if (currentWord.length >= 2) {
      const commonWords = Array.from(spanishWords);
      
      suggestions.push(
        ...commonWords
          .filter(word => word.startsWith(currentWord.toLowerCase()))
          .slice(0, 3)
      );
    }

    if (suggestions.length > 0) {
      const filteredSuggestions = [...new Set(suggestions)].slice(0, 5);
      // Mostrar la primera sugerencia como ghost text
      const firstSuggestion = filteredSuggestions[0];
      if (firstSuggestion.toLowerCase().startsWith(currentWord.toLowerCase())) {
        setCurrentSuggestion(firstSuggestion.slice(currentWord.length));
      } else {
        setCurrentSuggestion('');
      }
    } else {
      setCurrentSuggestion('');
    }
  }, [spanishWords]);

  // Función de spell checking básica
  const checkSpelling = useCallback((text: string) => {
    const words = text.match(/\b[a-záéíóúñü]+\b/gi) || [];
    const errors: Array<{start: number, end: number, word: string}> = [];
    
    let searchIndex = 0;
    words.forEach(word => {
      if (word.length > 2 && !spanishWords.has(word.toLowerCase())) {
        const start = text.indexOf(word, searchIndex);
        if (start !== -1) {
          errors.push({
            start,
            end: start + word.length,
            word
          });
          searchIndex = start + word.length;
        }
      }
    });
    
    setSpellErrors(errors);
  }, [spanishWords]);

  // Función para aplicar formato Markdown
  const applyMarkdownFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdownContent.substring(start, end);
    const beforeSelection = markdownContent.substring(0, start);
    const afterSelection = markdownContent.substring(end);

    let newText = '';
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        if (selectedText) {
          newText = beforeSelection + `**${selectedText}**` + afterSelection;
          newCursorPos = end + 4;
        } else {
          newText = beforeSelection + '****' + afterSelection;
          newCursorPos = start + 2;
        }
        break;
      case 'italic':
        if (selectedText) {
          newText = beforeSelection + `*${selectedText}*` + afterSelection;
          newCursorPos = end + 2;
        } else {
          newText = beforeSelection + '**' + afterSelection;
          newCursorPos = start + 1;
        }
        break;
      case 'strikethrough':
        if (selectedText) {
          newText = beforeSelection + `~~${selectedText}~~` + afterSelection;
          newCursorPos = end + 4;
        } else {
          newText = beforeSelection + '~~~~' + afterSelection;
          newCursorPos = start + 2;
        }
        break;
      case 'code':
        if (selectedText) {
          newText = beforeSelection + `\`${selectedText}\`` + afterSelection;
          newCursorPos = end + 2;
        } else {
          newText = beforeSelection + '``' + afterSelection;
          newCursorPos = start + 1;
        }
        break;
      case 'h1':
        if (selectedText) {
          newText = beforeSelection + `# ${selectedText}` + afterSelection;
          newCursorPos = end + 2;
        } else {
          newText = beforeSelection + '# ' + afterSelection;
          newCursorPos = start + 2;
        }
        break;
      case 'h2':
        if (selectedText) {
          newText = beforeSelection + `## ${selectedText}` + afterSelection;
          newCursorPos = end + 3;
        } else {
          newText = beforeSelection + '## ' + afterSelection;
          newCursorPos = start + 3;
        }
        break;
      case 'h3':
        if (selectedText) {
          newText = beforeSelection + `### ${selectedText}` + afterSelection;
          newCursorPos = end + 4;
        } else {
          newText = beforeSelection + '### ' + afterSelection;
          newCursorPos = start + 4;
        }
        break;
      case 'list':
        if (selectedText) {
          const lines = selectedText.split('\n');
          const listItems = lines.map(line => `- ${line}`).join('\n');
          newText = beforeSelection + listItems + afterSelection;
          newCursorPos = end + (lines.length * 2);
        } else {
          newText = beforeSelection + '- ' + afterSelection;
          newCursorPos = start + 2;
        }
        break;
      case 'orderedList':
        if (selectedText) {
          const lines = selectedText.split('\n');
          const listItems = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
          newText = beforeSelection + listItems + afterSelection;
          newCursorPos = end + (lines.length * 3);
        } else {
          newText = beforeSelection + '1. ' + afterSelection;
          newCursorPos = start + 3;
        }
        break;
      case 'quote':
        if (selectedText) {
          const lines = selectedText.split('\n');
          const quotedLines = lines.map(line => `> ${line}`).join('\n');
          newText = beforeSelection + quotedLines + afterSelection;
          newCursorPos = end + (lines.length * 2);
        } else {
          newText = beforeSelection + '> ' + afterSelection;
          newCursorPos = start + 2;
        }
        break;
      case 'link':
        if (selectedText) {
          newText = beforeSelection + `[${selectedText}](url)` + afterSelection;
          newCursorPos = end + selectedText.length + 3;
        } else {
          newText = beforeSelection + '[texto](url)' + afterSelection;
          newCursorPos = start + 1;
        }
        break;
      case 'image':
        if (selectedText) {
          newText = beforeSelection + `![${selectedText}](url)` + afterSelection;
          newCursorPos = end + selectedText.length + 4;
        } else {
          newText = beforeSelection + '![alt](url)' + afterSelection;
          newCursorPos = start + 2;
        }
        break;
      default:
        return;
    }

    setMarkdownContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Función para manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Manejar sugerencias de artículos
    if (showArticleSuggestions) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowArticleSuggestions(false);
        return;
      }
      return; // Dejar que ArticleSuggestions maneje otras teclas
    }

    // Manejar autocompletado normal
    if (currentSuggestion && (e.key === 'Tab' || e.key === 'ArrowRight')) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      const beforeCursor = markdownContent.substring(0, cursorPos);
      const afterCursor = markdownContent.substring(cursorPos);
      
      const newText = beforeCursor + currentSuggestion + afterCursor;
      setMarkdownContent(newText);
      
      setTimeout(() => {
        const newCursorPos = cursorPos + currentSuggestion.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }, 0);
      
      setCurrentSuggestion('');
    }

    if (e.key === 'Escape') {
      setCurrentSuggestion('');
    }
  };

  // Funciones para archivos
  const saveFile = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportHTML = () => {
    const blob = new Blob([previewContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setMarkdownContent(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };


  return (
    <div className={`flex flex-col h-screen bg-gray-50 ${className}`}>
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-4 bg-white border-b border-gray-200">
        {/* Botones principales - siempre visibles */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {/* Botones de formato básico - siempre visibles */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyMarkdownFormat('bold')}
            className="btn-portland-orange flex-shrink-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyMarkdownFormat('italic')}
            className="btn-magic-mint flex-shrink-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyMarkdownFormat('code')}
            className="flex-shrink-0"
          >
            <Code className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          
          {/* Botones de encabezados - ocultos en móviles */}
          <div className="hidden sm:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyMarkdownFormat('h1')}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyMarkdownFormat('h2')}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyMarkdownFormat('h3')}
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          
          {/* Botones de listas - ocultos en móviles */}
          <div className="hidden sm:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyMarkdownFormat('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyMarkdownFormat('orderedList')}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyMarkdownFormat('quote')}
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          
          {/* Botones de enlaces e imágenes - ocultos en móviles */}
          <div className="hidden sm:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyMarkdownFormat('link')}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyMarkdownFormat('image')}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Botones de control - responsive */}
        <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Botón de vista previa - siempre visible */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex-shrink-0"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline ml-1">
              {showPreview ? 'Ocultar' : 'Vista Previa'}
            </span>
          </Button>
          
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          
          {/* Botones de archivo - ocultos en móviles muy pequeños */}
          <div className="hidden xs:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={importFile}
              className="flex-shrink-0"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Importar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={saveFile}
              className="flex-shrink-0"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Guardar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportHTML}
              className="flex-shrink-0"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Exportar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Área principal de edición */}
      <div className="flex flex-col sm:flex-row flex-1 overflow-hidden gap-2 mx-1 sm:mx-3">
        {/* Panel del editor */}
        <div className={`flex-1 ${showPreview ? 'sm:w-1/2' : 'w-full'} relative`}>
          <Card className="h-full">
            <div className="relative h-full">
              <div className="relative w-full h-full">
                <Textarea
                  ref={textareaRef}
                  value={markdownContent}
                  onChange={handleTextareaChange}
                  onSelect={handleCursorPositionChange}
                  onKeyUp={handleCursorPositionChange}
                  onMouseUp={handleCursorPositionChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu contenido en Markdown aquí... Usa @ para referenciar artículos."
                  className="w-full h-full border-none resize-none focus:ring-0 font-mono text-base sm:text-sm leading-6 sm:leading-6 p-3 sm:p-4 relative z-10 bg-transparent"
                  style={{ minHeight: '400px' }}
                />

                {/* Ghost text para autocompletado */}
                {currentSuggestion && (
                  <div
                    ref={ghostTextRef}
                    className="absolute top-0 left-0 w-full h-full p-3 sm:p-4 font-mono text-base sm:text-sm leading-6 pointer-events-none z-5"
                    style={{
                      color: 'rgba(107, 114, 126, 0.6)',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word'
                    }}
                  >
                    {/* Renderizar el texto hasta el cursor de forma invisible */}
                    <span style={{ opacity: 0 }}>
                      {markdownContent.substring(0, textareaRef.current?.selectionStart || 0)}
                    </span>
                    {/* Mostrar la sugerencia en gris */}
                    <span style={{ color: 'rgba(107, 114, 126, 0.6)' }}>
                      {currentSuggestion}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Sugerencias de artículos */}
              {showArticleSuggestions && (
                <div 
                  className="absolute z-50" 
                  style={{ 
                    top: `${suggestionPosition.top}px`, 
                    left: `${suggestionPosition.left}px` 
                  }}
                >
                  <ArticleSuggestions
                    visible={showArticleSuggestions}
                    query={suggestionQuery}
                    onSelect={(article) => {
                      insertArticleReference(
                        article,
                        markdownContent,
                        cursorPosition,
                        setMarkdownContent,
                        setCursorPosition
                      );
                      setTimeout(() => textareaRef.current?.focus(), 0);
                    }}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Panel de vista previa */}
        {showPreview && (
          <div className="flex-1 sm:w-1/2 w-full">
            <Card className="h-full overflow-hidden">
              <div 
                className="preview-content h-full overflow-y-auto p-3 sm:p-4 text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </Card>
          </div>
        )}
      </div>

      {/* Información de estado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 sm:px-4 py-2 bg-gray-100 border-t border-gray-200 text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-0">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
          <span>Palabras: {markdownContent.split(/\s+/).filter(word => word.length > 0).length}</span>
          <span className="hidden sm:inline">Caracteres: {markdownContent.length}</span>
          {spellErrors.length > 0 && (
            <span className="text-red-500">
              Errores: {spellErrors.length}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
          <span className="hidden sm:inline">Usa @ para referenciar artículos</span>
          <span className="sm:hidden">@ para artículos</span>
          {showArticleSuggestions && (
            <span className="text-green-500 text-xs">
              @ detectado
            </span>
          )}
          {currentSuggestion && (
            <span className="text-blue-500 text-xs">
              Tab para autocompletar
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
