# Markdown AI Editor

Un editor de texto enriquecido en Markdown con mejoras de IA, construido con Next.js, Tiptap y shadcn/ui.

## ✨ Características

- **Pantalla dividida**: Editor a la izquierda, vista previa a la derecha
- **Autocompletado inteligente**: Sugerencias basadas en el contexto de palabras anteriores
- **Corrección ortográfica**: Errores marcados con línea amarilla ondulada
- **Soporte completo de Markdown**: Headers, listas, enlaces, imágenes, tablas, código, etc.
- **Interfaz moderna**: Diseño inspirado en la paleta de colores proporcionada
- **Iconos de Lucide**: Iconografía consistente y moderna
- **Tema naranja**: Configurado con el color Portland Orange (#FC5A31)

## ��� Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd markdown-editor
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## ��� Paleta de Colores

El editor utiliza la siguiente paleta de colores:

- **Portland Orange**: #FC5A31 (Color principal)
- **Magic Mint**: #B7FCBF (Color de acento)
- **Columbia Blue**: #C7DDDC
- **Rich Black**: #004638
- **Pale Violet**: #D199F9
- **Maximum Green Yellow**: #DCED59 (Para corrección ortográfica)

## ���️ Tecnologías Utilizadas

- **Next.js 15**: Framework de React
- **TypeScript**: Tipado estático
- **Tiptap**: Editor de texto enriquecido
- **shadcn/ui**: Componentes de interfaz
- **Tailwind CSS**: Estilos utilitarios
- **Lucide React**: Iconos
- **Radix UI**: Componentes primitivos accesibles

## ��� Uso

### Autocompletado
- Escribe algunas palabras y presiona **TAB** para aceptar sugerencias
- Usa las flechas **↑↓** para navegar entre sugerencias
- Presiona **ESC** para cerrar las sugerencias

### Corrección Ortográfica
- Los errores ortográficos se marcan automáticamente con una línea amarilla ondulada
- Pasa el cursor sobre las palabras marcadas para ver sugerencias

### Atajos de Teclado
- **Ctrl+B**: Negrita
- **Ctrl+I**: Cursiva
- **Ctrl+U**: Subrayado
- **Ctrl+Shift+S**: Tachado
- **Ctrl+`**: Código inline
- **Ctrl+Shift+`**: Bloque de código

### Funciones de Archivo
- **Guardar**: Guarda el contenido actual
- **Exportar**: Descarga el archivo como .md
- **Importar**: Carga un archivo .md existente

## ��� Características de IA

### Autocompletado Contextual
El editor analiza el contexto de las palabras anteriores para sugerir:
- Palabras similares usadas previamente
- Elementos comunes de Markdown
- Patrones de escritura del usuario

### Corrección Ortográfica Inteligente
- Detección automática de errores ortográficos
- Diccionario en español integrado
- Sugerencias de corrección contextual
- Exclusión de palabras técnicas y nombres propios

## ��� Personalización

### Colores
Los colores se pueden personalizar en `src/app/globals.css`:

```css
:root {
  --portland-orange: #FC5A31;
  --magic-mint: #B7FCBF;
  /* ... más colores */
}
```

### Fuentes
Las fuentes se configuran en `tailwind.config.ts`:

```typescript
fontFamily: {
  sans: ["var(--font-aktiv)", "Inter", "system-ui", "sans-serif"],
  mono: ["var(--font-mono)", "monospace"],
}
```

## ��� Estructura del Proyecto

```
src/
├── app/
│   ├── globals.css          # Estilos globales y variables CSS
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página principal
├── components/
│   ├── ui/                  # Componentes de shadcn/ui
│   ├── markdown-editor.tsx  # Editor principal
│   └── spell-checker.tsx    # Corrector ortográfico
└── lib/
    └── utils.ts             # Utilidades
```

## ��� Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## ��� Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## ��� Agradecimientos

- [Tiptap](https://tiptap.dev/) por el excelente editor
- [shadcn/ui](https://ui.shadcn.com/) por los componentes
- [Lucide](https://lucide.dev/) por los iconos
- [Next.js](https://nextjs.org/) por el framework
