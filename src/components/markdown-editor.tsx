'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { marked } from 'marked';
import { ArticleSuggestions, useArticleSuggestions } from '@/components/article-suggestions';
import { FileSidebar } from '@/components/file-sidebar';
import { TourGuide } from '@/components/tour-guide';
import { FileManager, type SavedFile } from '@/lib/file-manager';
import { useTour } from '@/lib/use-tour';
import type { Article } from '@/lib/minio-client';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Link as LinkIcon, 
  Image as ImageIcon,
  List, 
  ListOrdered, 
  CheckSquare, 
  Save,
  Download,
  Upload,
  Eye,
  EyeOff,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  HelpCircle
} from 'lucide-react';

interface MarkdownEditorProps {
  className?: string;
}

export default function MarkdownEditor({ className }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  
  // Cargar contenido guardado desde localStorage o usar template por defecto
  const [markdownContent, setMarkdownContent] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedContent = localStorage.getItem('markdown-content');
      if (savedContent) {
        return savedContent;
      }
    }
    return `# ¡Bienvenido al Editor de Markdown!

Este es un **editor de texto** con soporte completo para Markdown.

## Características principales

- **Vista previa en tiempo real**: Editor a la izquierda, vista previa a la derecha
- **Autocompletado inteligente**: Sugerencias contextuales
- **Corrección ortográfica**: Errores marcados automáticamente
- **Soporte completo de Markdown**

### Lista de tareas

- [x] Crear el editor principal
- [ ] Implementar funciones avanzadas
- [ ] Agregar más características

### Código de ejemplo

\`\`\`javascript
function saludar(nombre) {
  return \`¡Hola, \${nombre}!\`;
}
\`\`\`

### Enlaces e imágenes

[Visita nuestro sitio web](https://ejemplo.com)

> Esta es una cita importante

---

*¡Disfruta escribiendo!*`;
  });
  
  const [previewContent, setPreviewContent] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ghostTextRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para deshacer/rehacer
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);

  // Estado para manejo de archivos múltiples
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLoadConfirm, setShowLoadConfirm] = useState<{
    isOpen: boolean;
    file: SavedFile | null;
  }>({ isOpen: false, file: null });

  // Hook para las sugerencias de artículos
  const {
    showSuggestions: showArticleSuggestions,
    suggestionQuery: articleQuery,
    suggestionPosition,
    handleAtSymbol,
    insertArticleReference
  } = useArticleSuggestions();

  // Hook para el tour
  const {
    runTour,
    startTour,
    completeTour
  } = useTour();

  // Funciones para deshacer/rehacer
  const addToHistory = useCallback((content: string) => {
    if (isUndoRedoAction) return;
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(content);
      
      // Limitar el historial a 50 entradas para evitar problemas de memoria
      if (newHistory.length > 50) {
        newHistory.shift();
        setHistoryIndex(prev => Math.max(0, prev));
        return newHistory;
      }
      
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [historyIndex, isUndoRedoAction]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setIsUndoRedoAction(true);
      const previousContent = history[historyIndex - 1];
      setMarkdownContent(previousContent);
      setHistoryIndex(prev => prev - 1);
      
      // Enfocar el textarea después del undo
      setTimeout(() => {
        textareaRef.current?.focus();
        setIsUndoRedoAction(false);
      }, 0);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedoAction(true);
      const nextContent = history[historyIndex + 1];
      setMarkdownContent(nextContent);
      setHistoryIndex(prev => prev + 1);
      
      // Enfocar el textarea después del redo
      setTimeout(() => {
        textareaRef.current?.focus();
        setIsUndoRedoAction(false);
      }, 0);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Diccionario básico para corrección ortográfica
  const spanishWords = useMemo(() => new Set([
    'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 
    'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'uno', 'esta', 'este', 'está', 
    'están', 'texto', 'markdown', 'editor', 'documento', 'archivo', 'contenido', 'escribir', 'crear', 
    'editar', 'formato', 'título', 'párrafo', 'lista', 'enlace', 'imagen', 'tabla', 'código', 'ejemplo',
    'función', 'importante', 'necesario', 'posible', 'siguiente', 'anterior', 'información', 'desarrollo',
    'proyecto', 'aplicación', 'sistema', 'bienvenido', 'características', 'principales', 'tiempo', 'real',
    'inteligente', 'sugerencias', 'contextuales', 'corrección', 'ortográfica', 'errores', 'marcados',
    'automáticamente', 'soporte', 'completo', 'tareas', 'implementar', 'funciones', 'avanzadas', 'agregar',
    'más', 'javascript', 'nombre', 'hola', 'enlaces', 'imágenes', 'visita', 'nuestro', 'sitio', 'web',
    'cita', 'disfruta', 'escribiendo'
  ]), []);

  // Función para compilar markdown a HTML
  const compileMarkdown = useCallback(async (markdown: string) => {
    try {
      const result = await marked(markdown);
      return typeof result === 'string' ? result : String(result);
    } catch (error) {
      console.error('Error compilando markdown:', error);
      return '<p>Error al compilar markdown</p>';
    }
  }, []);

  // Función para verificar ortografía
  const checkSpelling = useCallback((text: string) => {
    const words = text.toLowerCase().match(/\b[a-záéíóúñü]+\b/g) || [];
    const errors = new Set<string>();
    
    words.forEach(word => {
      if (word.length > 2 && !spanishWords.has(word)) {
        errors.add(word);
      }
    });
    
  }, [spanishWords]);

  // Cargar archivos guardados al inicializar
  useEffect(() => {
    const files = FileManager.getAllFiles();
    setSavedFiles(files);
    
    const currentId = FileManager.getCurrentFileId();
    setCurrentFileId(currentId);
  }, []);

  // Inicializar historial con el contenido inicial
  useEffect(() => {
    if (history.length === 0 && markdownContent) {
      setHistory([markdownContent]);
      setHistoryIndex(0);
    }
  }, [markdownContent, history.length]);

  // Actualizar vista previa cuando cambie el contenido
  useEffect(() => {
    const updatePreview = async () => {
      const compiled = await compileMarkdown(markdownContent);
      setPreviewContent(compiled);
    };
    updatePreview();
    checkSpelling(markdownContent);
  }, [markdownContent, compileMarkdown, checkSpelling]);

  // Función para analizar patrones de escritura y predecir siguiente palabra
  const analyzeWritingPatterns = useCallback((text: string, cursorPos: number) => {
    const beforeCursor = text.substring(0, cursorPos);
    const words = beforeCursor.toLowerCase().match(/\b\w+\b/g) || [];
    
    // Crear mapa de bigramas (pares de palabras consecutivas)
    const bigramMap = new Map<string, Map<string, number>>();
    
    for (let i = 0; i < words.length - 1; i++) {
      const currentWord = words[i];
      const nextWord = words[i + 1];
      
      if (!bigramMap.has(currentWord)) {
        bigramMap.set(currentWord, new Map());
      }
      
      const nextWords = bigramMap.get(currentWord)!;
      nextWords.set(nextWord, (nextWords.get(nextWord) || 0) + 1);
    }
    
    return bigramMap;
  }, []);

  // Función para generar sugerencias de autocompletado inteligente
  const generateSuggestions = useCallback((text: string, cursorPos: number) => {
    const beforeCursor = text.substring(0, cursorPos);
    const currentLine = beforeCursor.split('\n').pop() || '';
    const currentWord = currentLine.split(/\s+/).pop() || '';
    const wordsInLine = currentLine.split(/\s+/);
    const previousWord = wordsInLine.length > 1 ? wordsInLine[wordsInLine.length - 2] : '';
    
    if (currentWord.length < 1) {
      setSuggestions([]);
      setCurrentSuggestion('');
      return;
    }

    const suggestions: string[] = [];

    // Predicción basada en contexto (palabra anterior)
    if (currentWord.length >= 1) {
      const bigramMap = analyzeWritingPatterns(text, cursorPos);
      
      // Si hay palabra anterior, buscar patrones
      if (previousWord && bigramMap.has(previousWord.toLowerCase())) {
        const nextWords = bigramMap.get(previousWord.toLowerCase())!;
        const sortedNextWords = Array.from(nextWords.entries())
          .sort((a, b) => b[1] - a[1]) // Ordenar por frecuencia
          .map(entry => entry[0])
          .filter(word => word.startsWith(currentWord.toLowerCase()))
          .slice(0, 3);
        
        suggestions.push(...sortedNextWords);
      }
    }

    // Predicción basada en patrones comunes en español
    const contextPredictions = getContextualPredictions(previousWord, currentWord);
    suggestions.push(...contextPredictions);

    // Predicción de frases completas basada en el contexto
    const phrasePredictions = getPhraseCompletions(currentLine, currentWord);
    suggestions.push(...phrasePredictions);

    // Solo sugerir headers si estamos al inicio de una línea
    if (currentLine.trim() === currentWord && currentWord.startsWith('#')) {
      suggestions.push('# Título principal', '## Subtítulo', '### Título de sección');
    }
    // Sugerencias de palabras comunes que coincidan
    else if (currentWord.length >= 2) {
      const commonWords = Array.from(spanishWords);
      
      suggestions.push(
        ...commonWords
          .filter(word => word.startsWith(currentWord.toLowerCase()))
          .slice(0, 3)
      );
    }

    // Sugerencias contextuales basadas en el contenido existente
    const words = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const uniqueWords = [...new Set(words)];
    suggestions.push(
      ...uniqueWords
        .filter(word => 
          word.startsWith(currentWord.toLowerCase()) && 
          word !== currentWord.toLowerCase() &&
          word.length >= currentWord.length + 1
        )
        .slice(0, 2)
    );

    if (suggestions.length > 0) {
      const filteredSuggestions = [...new Set(suggestions)].slice(0, 5);
      setSuggestions(filteredSuggestions);
      setSuggestionIndex(0);
      // Mostrar la primera sugerencia como ghost text
      const firstSuggestion = filteredSuggestions[0];
      if (firstSuggestion.toLowerCase().startsWith(currentWord.toLowerCase())) {
        setCurrentSuggestion(firstSuggestion.slice(currentWord.length));
      } else {
        setCurrentSuggestion('');
      }
    } else {
      setSuggestions([]);
      setCurrentSuggestion('');
    }
  }, [spanishWords, analyzeWritingPatterns]);

  // Función para obtener predicciones contextuales basadas en patrones del español
  const getContextualPredictions = useCallback((previousWord: string, currentWord: string) => {
    const predictions: string[] = [];
    
    if (!previousWord || currentWord.length < 1) return predictions;
    
    const prev = previousWord.toLowerCase();
    const curr = currentWord.toLowerCase();
    
    // Patrones comunes en español
    const patterns: Record<string, string[]> = {
      'el': ['editor', 'texto', 'contenido', 'archivo', 'documento', 'código', 'formato'],
      'la': ['lista', 'línea', 'aplicación', 'función', 'página', 'vista', 'tabla'],
      'un': ['editor', 'texto', 'archivo', 'documento', 'ejemplo', 'formato', 'enlace'],
      'una': ['lista', 'línea', 'aplicación', 'función', 'página', 'vista', 'tabla'],
      'de': ['texto', 'markdown', 'código', 'datos', 'archivos', 'contenido', 'formato'],
      'en': ['tiempo', 'markdown', 'español', 'línea', 'formato', 'código', 'texto'],
      'con': ['markdown', 'texto', 'código', 'formato', 'contenido', 'datos', 'archivos'],
      'para': ['escribir', 'editar', 'crear', 'formatear', 'guardar', 'exportar', 'importar'],
      'es': ['un', 'una', 'muy', 'importante', 'necesario', 'posible', 'fácil'],
      'este': ['editor', 'texto', 'archivo', 'documento', 'formato', 'código', 'ejemplo'],
      'esta': ['aplicación', 'función', 'página', 'vista', 'tabla', 'lista', 'línea'],
      'muy': ['importante', 'útil', 'fácil', 'rápido', 'simple', 'eficiente', 'práctico'],
      'más': ['información', 'detalles', 'opciones', 'funciones', 'características', 'contenido'],
      'markdown': ['editor', 'texto', 'formato', 'código', 'documento', 'archivo', 'contenido'],
      'editor': ['de', 'markdown', 'texto', 'código', 'avanzado', 'simple', 'moderno'],
      'texto': ['plano', 'enriquecido', 'markdown', 'formato', 'contenido', 'documento'],
      'código': ['fuente', 'javascript', 'python', 'html', 'css', 'markdown', 'ejemplo']
    };
    
    if (patterns[prev]) {
      predictions.push(
        ...patterns[prev]
          .filter(word => word.startsWith(curr))
          .slice(0, 3)
      );
    }
    
    return predictions;
  }, []);

  // Función para predicción de frases completas
  const getPhraseCompletions = useCallback((currentLine: string, currentWord: string) => {
    const completions: string[] = [];
    
    if (currentWord.length < 2) return completions;
    
    const line = currentLine.toLowerCase();
    const word = currentWord.toLowerCase();
    
    // Patrones de frases comunes en markdown y español
    const phrasePatterns: Record<string, string[]> = {
      // Patrones de inicio
      'este': ['este es un ejemplo', 'este editor permite', 'este documento contiene'],
      'esta': ['esta aplicación ofrece', 'esta función permite', 'esta herramienta facilita'],
      'el': ['el editor de markdown', 'el siguiente ejemplo', 'el código fuente'],
      'la': ['la siguiente sección', 'la aplicación permite', 'la función principal'],
      'para': ['para más información', 'para obtener ayuda', 'para crear un documento'],
      'con': ['con esta herramienta', 'con markdown puedes', 'con este editor'],
      'en': ['en este ejemplo', 'en la siguiente sección', 'en tiempo real'],
      
      // Patrones técnicos
      'función': ['función principal', 'función que permite', 'función de autocompletado'],
      'editor': ['editor de markdown', 'editor de texto', 'editor avanzado'],
      'markdown': ['markdown permite crear', 'markdown es un lenguaje', 'markdown facilita'],
      'código': ['código fuente', 'código de ejemplo', 'código javascript'],
      'ejemplo': ['ejemplo de uso', 'ejemplo práctico', 'ejemplo de código'],
      'aplicación': ['aplicación web', 'aplicación moderna', 'aplicación de escritorio'],
      
      // Patrones de documentación
      'cómo': ['cómo usar esta función', 'cómo crear un documento', 'cómo exportar archivos'],
      'qué': ['qué es markdown', 'qué hace esta función', 'qué características ofrece'],
      'por': ['por ejemplo', 'por defecto', 'por favor'],
      'también': ['también puedes usar', 'también es posible', 'también incluye'],
      'además': ['además de esto', 'además puedes', 'además incluye'],
      
      // Patrones de instrucciones
      'puedes': ['puedes usar esta función', 'puedes crear documentos', 'puedes exportar archivos'],
      'permite': ['permite crear documentos', 'permite editar texto', 'permite formatear contenido'],
      'incluye': ['incluye características avanzadas', 'incluye autocompletado', 'incluye vista previa'],
      'ofrece': ['ofrece múltiples opciones', 'ofrece funcionalidad avanzada', 'ofrece una interfaz moderna'],
    };
    
    // Buscar patrones que coincidan
    for (const [pattern, completions_list] of Object.entries(phrasePatterns)) {
      if (word.startsWith(pattern.substring(0, Math.min(pattern.length, word.length)))) {
        completions.push(
          ...completions_list
            .filter(completion => completion.startsWith(word))
            .slice(0, 2)
        );
      }
    }
    
    // Patrones basados en el contexto de la línea actual
    if (line.includes('##') || line.includes('###')) {
      // Estamos en una sección, sugerir contenido relacionado
      if (word.startsWith('e')) {
        completions.push('ejemplo de uso', 'explicación detallada', 'elementos importantes');
      } else if (word.startsWith('c')) {
        completions.push('características principales', 'código de ejemplo', 'configuración necesaria');
      } else if (word.startsWith('f')) {
        completions.push('funcionalidad avanzada', 'formato de archivo', 'funciones principales');
      }
    }
    
    // Si estamos en una lista (- o 1.)
    if (line.match(/^\s*[-*]\s/) || line.match(/^\s*\d+\.\s/)) {
      if (word.startsWith('f')) {
        completions.push('funcionalidad completa', 'formato markdown', 'fácil de usar');
      } else if (word.startsWith('s')) {
        completions.push('soporte completo', 'sistema inteligente', 'sintaxis simple');
      } else if (word.startsWith('i')) {
        completions.push('interfaz moderna', 'integración perfecta', 'importar archivos');
      }
    }
    
    return completions;
  }, []);

  // Función para insertar texto en el cursor
  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = 
      markdownContent.substring(0, start) + 
      textToInsert + 
      markdownContent.substring(end);
    
    setMarkdownContent(newContent);
    
    // Mantener el cursor en la posición correcta
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
      textarea.focus();
    }, 0);
  };

  // Función para envolver texto seleccionado
  const wrapSelectedText = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdownContent.substring(start, end);
    
    if (selectedText) {
      const newText = before + selectedText + after;
      const newContent = 
        markdownContent.substring(0, start) + 
        newText + 
        markdownContent.substring(end);
      
      setMarkdownContent(newContent);
      
      setTimeout(() => {
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + selectedText.length;
        textarea.focus();
      }, 0);
    } else {
      insertAtCursor(before + after);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + before.length;
        textarea.focus();
      }, 0);
    }
  };

  // Función para convertir línea a header
  const makeHeader = (level: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lines = markdownContent.split('\n');
    const lineIndex = markdownContent.substring(0, start).split('\n').length - 1;
    
    if (lines[lineIndex] !== undefined) {
      const currentLine = lines[lineIndex];
      const cleanLine = currentLine.replace(/^#+\s*/, '');
      const newLine = '#'.repeat(level) + ' ' + cleanLine;
      lines[lineIndex] = newLine;
      
      setMarkdownContent(lines.join('\n'));
      
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  };

  // Ref para el timeout del historial
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Manejar cambios en el textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setMarkdownContent(newContent);
    
    // Agregar al historial solo si no es una acción de deshacer/rehacer
    if (!isUndoRedoAction) {
      // Limpiar timeout anterior
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
      
      // Usar un debounce para evitar agregar cada caracter al historial
      historyTimeoutRef.current = setTimeout(() => {
        addToHistory(newContent);
      }, 1000);
    }
    
    generateSuggestions(newContent, cursorPos);
    
    // Manejar sugerencias de artículos con @
    handleAtSymbol(newContent, cursorPos, textareaRef);
  };

  // Manejar cambios en la posición del cursor
  const handleCursorPositionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    const cursorPos = textarea.selectionStart;
    generateSuggestions(markdownContent, cursorPos);
    
    // También manejar sugerencias de artículos al mover el cursor
    handleAtSymbol(markdownContent, cursorPos, textareaRef);
  };

  // Manejar atajos de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Atajos de deshacer/rehacer
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          undo();
          return;
        }
        if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault();
          redo();
          return;
        }
      }

      if (suggestions.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex = (suggestionIndex + 1) % suggestions.length;
          setSuggestionIndex(nextIndex);
          // Actualizar ghost text con la nueva sugerencia
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const beforeCursor = markdownContent.substring(0, start);
            const currentLine = beforeCursor.split('\n').pop() || '';
            const currentWord = currentLine.split(/\s+/).pop() || '';
            
            const newSuggestion = suggestions[nextIndex];
            if (newSuggestion.toLowerCase().startsWith(currentWord.toLowerCase())) {
              setCurrentSuggestion(newSuggestion.slice(currentWord.length));
            }
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          const prevIndex = (suggestionIndex - 1 + suggestions.length) % suggestions.length;
          setSuggestionIndex(prevIndex);
          // Actualizar ghost text con la nueva sugerencia
          const textareaUp = textareaRef.current;
          if (textareaUp) {
            const start = textareaUp.selectionStart;
            const beforeCursor = markdownContent.substring(0, start);
            const currentLine = beforeCursor.split('\n').pop() || '';
            const currentWord = currentLine.split(/\s+/).pop() || '';
            
            const newSuggestion = suggestions[prevIndex];
            if (newSuggestion.toLowerCase().startsWith(currentWord.toLowerCase())) {
              setCurrentSuggestion(newSuggestion.slice(currentWord.length));
            }
          }
          break;
        case 'Tab':
          event.preventDefault();
          if (suggestions[suggestionIndex]) {
            const textarea = textareaRef.current;
            if (textarea) {
              const start = textarea.selectionStart;
              const beforeCursor = markdownContent.substring(0, start);
              const currentLine = beforeCursor.split('\n').pop() || '';
              const currentWord = currentLine.split(/\s+/).pop() || '';
              
              const newContent = 
                markdownContent.substring(0, start - currentWord.length) + 
                suggestions[suggestionIndex] + 
                markdownContent.substring(start);
              
              setMarkdownContent(newContent);
              setSuggestions([]);
              setCurrentSuggestion('');
              
              setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = 
                  start - currentWord.length + suggestions[suggestionIndex].length;
                textarea.focus();
              }, 0);
            }
          }
          break;
        case 'Escape':
          event.preventDefault();
          setSuggestions([]);
          setCurrentSuggestion('');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, suggestionIndex, markdownContent, undo, redo]);

  // Función para manejar la selección de artículos
  const handleArticleSelect = (article: Article) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      insertArticleReference(
        article,
        markdownContent,
        cursorPos,
        setMarkdownContent,
        (newPos: number) => {
          textarea.selectionStart = textarea.selectionEnd = newPos;
          textarea.focus();
        }
      );
    }
  };

  // Funciones para manejo de archivos múltiples
  const handleFileSelect = (file: SavedFile) => {
    if (markdownContent !== file.content) {
      setShowLoadConfirm({ isOpen: true, file });
    }
  };

  const handleConfirmLoadFile = () => {
    if (showLoadConfirm.file) {
      setMarkdownContent(showLoadConfirm.file.content);
      setCurrentFileId(showLoadConfirm.file.id);
      FileManager.setCurrentFileId(showLoadConfirm.file.id);
      
      // Reiniciar historial con el nuevo contenido
      setHistory([showLoadConfirm.file.content]);
      setHistoryIndex(0);
      
      setShowLoadConfirm({ isOpen: false, file: null });
    }
  };

  const handleFileDelete = (fileId: string) => {
    FileManager.deleteFile(fileId);
    const updatedFiles = FileManager.getAllFiles();
    setSavedFiles(updatedFiles);
    
    // Si el archivo eliminado era el actual, limpiar la referencia
    if (currentFileId === fileId) {
      setCurrentFileId(null);
      FileManager.setCurrentFileId(null);
    }
  };

  const handleSaveAsNew = () => {
    const title = FileManager.extractTitle(markdownContent);
    const newFile = FileManager.saveFile({
      title,
      content: markdownContent
    });
    
    const updatedFiles = FileManager.getAllFiles();
    setSavedFiles(updatedFiles);
    setCurrentFileId(newFile.id);
    FileManager.setCurrentFileId(newFile.id);
    
    alert(`Archivo guardado como: ${title}`);
  };

  const handleUpdateCurrent = () => {
    if (currentFileId) {
      const title = FileManager.extractTitle(markdownContent);
      FileManager.updateFile(currentFileId, {
        title,
        content: markdownContent
      });
      
      const updatedFiles = FileManager.getAllFiles();
      setSavedFiles(updatedFiles);
      alert('Archivo actualizado');
    } else {
      handleSaveAsNew();
    }
  };

  // Funciones de archivo (legacy)
  const handleSave = () => {
    handleUpdateCurrent();
  };

  // Auto-guardar contenido cada vez que cambie
  useEffect(() => {
    if (markdownContent && typeof window !== 'undefined') {
      localStorage.setItem('markdown-content', markdownContent);
    }
  }, [markdownContent]);

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, []);

  const handleExport = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setMarkdownContent(content);
      };
      reader.readAsText(file);
    }
  };

  // Funciones de toolbar
  const toggleBold = () => wrapSelectedText('**');
  const toggleItalic = () => wrapSelectedText('*');
  const toggleStrike = () => wrapSelectedText('~~');
  const toggleCode = () => wrapSelectedText('`');
  const addLink = () => {
    const url = window.prompt('Ingresa la URL:');
    if (url) {
      wrapSelectedText('[', `](${url})`);
    }
  };
  const addImage = () => {
    const url = window.prompt('Ingresa la URL de la imagen:');
    if (url) {
      insertAtCursor(`![Descripción](${url})`);
    }
  };
  const addList = () => insertAtCursor('- ');
  const addOrderedList = () => insertAtCursor('1. ');
  const addTaskList = () => insertAtCursor('- [ ] ');
  const addQuote = () => insertAtCursor('> ');


  return (
    <div className={`flex flex-col h-screen bg-gray-50 tour-welcome ${className}`}>
      {/* Barra de herramientas */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Botones de deshacer/rehacer */}
            <div className="tour-undo-redo flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={undo}
                disabled={!canUndo}
                title="Deshacer (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={redo}
                disabled={!canRedo}
                title="Rehacer (Ctrl+Y)"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="tour-formatting flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => makeHeader(1)}>
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => makeHeader(2)}>
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => makeHeader(3)}>
                <Heading3 className="h-4 w-4" />
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button variant="outline" size="sm" onClick={toggleBold}>
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleItalic}>
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleStrike}>
                <Strikethrough className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleCode}>
                <Code className="h-4 w-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="outline" size="sm" onClick={addList}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={addOrderedList}>
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={addTaskList}>
              <CheckSquare className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={addQuote}>
              <Quote className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="outline" size="sm" onClick={addLink}>
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={addImage}>
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="tour-save-buttons flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {currentFileId ? 'Actualizar' : 'Guardar'}
              </Button>
              {currentFileId && (
                <Button variant="outline" size="sm" onClick={handleSaveAsNew}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar como nuevo
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPreview ? 'Ocultar' : 'Vista previa'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={startTour}
              title="Ver tour de funciones"
              className="tour-tour-button"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Área principal */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className={`flex-1 ${showPreview ? 'w-1/2' : sidebarCollapsed ? 'w-full' : 'w-3/4'} relative`}>
          <Card className="h-full m-4 tour-editor">
            <div className="relative h-full">
              <div className="relative w-full h-full">
                <Textarea
                  ref={textareaRef}
                  value={markdownContent}
                  onChange={handleTextareaChange}
                  onSelect={handleCursorPositionChange}
                  onKeyUp={handleCursorPositionChange}
                  onMouseUp={handleCursorPositionChange}
                  placeholder="Escribe tu contenido en Markdown aquí..."
                  className="w-full h-full border-none resize-none focus:ring-0 font-mono text-sm leading-6 p-4 relative z-10 bg-transparent"
                  style={{ minHeight: '500px' }}
                />
                
                {/* Ghost text para autocompletado */}
                {currentSuggestion && (
                  <div
                    ref={ghostTextRef}
                    className="absolute top-0 left-0 w-full h-full p-4 font-mono text-sm leading-6 pointer-events-none z-5"
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
            </div>
          </Card>
        </div>

        {/* Vista previa */}
        {showPreview && (
          <div className="w-1/2 tour-preview">
            <Card className="h-full m-4 p-0">
              <div 
                className="preview-content prose prose-sm max-w-none h-full"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </Card>
          </div>
        )}

        {/* Sidebar de archivos */}
        <div className="tour-file-sidebar">
          <FileSidebar
            files={savedFiles}
            currentFileId={currentFileId}
            onFileSelect={handleFileSelect}
            onFileDelete={handleFileDelete}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      </div>

      {/* Sugerencias de artículos */}
      {showArticleSuggestions && (
        <div
          className="fixed z-50"
          style={{
            top: suggestionPosition.top,
            left: suggestionPosition.left,
          }}
        >
          <ArticleSuggestions
            onSelect={handleArticleSelect}
            query={articleQuery}
            visible={showArticleSuggestions}
          />
        </div>
      )}

      {/* Modal de confirmación para cargar archivo */}
      <Dialog open={showLoadConfirm.isOpen} onOpenChange={(open) => 
        setShowLoadConfirm({ isOpen: open, file: null })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cargar archivo?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cargar &quot;{showLoadConfirm.file?.title}&quot;? 
              Los cambios no guardados en el editor actual se perderán.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLoadConfirm({ isOpen: false, file: null })}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmLoadFile}
            >
              Cargar archivo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Componente del tour */}
      <TourGuide
        run={runTour}
        onTourEnd={completeTour}
        onTourSkip={completeTour}
      />

      {/* Input oculto para importar archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.txt"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}