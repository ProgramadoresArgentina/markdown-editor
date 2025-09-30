import { Step } from 'react-joyride';

export const tourSteps: Step[] = [
  {
    target: '.tour-welcome',
    content: '¡Bienvenido al Editor de Markdown! Te voy a mostrar las funciones principales de este editor avanzado. ¡Empecemos!',
    placement: 'center',
    disableBeacon: true,
    title: '¡Bienvenido!',
  },
  {
    target: '.tour-undo-redo',
    content: 'Usa estos botones o Ctrl+Z / Ctrl+Y para deshacer y rehacer cambios.',
    placement: 'bottom',
    title: 'Deshacer y Rehacer',
  },
  {
    target: '.tour-formatting',
    content: 'Usa estos botones para dar formato rápido a tu texto: negrita, cursiva, títulos, listas y más.',
    placement: 'bottom',
    title: 'Herramientas de Formato',
  },
  {
    target: '.tour-save-buttons',
    content: 'Guarda tu trabajo localmente, expórtalo como archivo .md, o importa archivos existentes.',
    placement: 'bottom',
    title: 'Guardar y Exportar',
  },
  {
    target: '.tour-editor',
    content: 'Escribe aquí tu contenido. El editor tiene autocompletado inteligente - simplemente empieza a escribir y verás sugerencias.',
    placement: 'top',
    title: 'Editor Inteligente',
  },
  {
    target: '.tour-editor',
    content: 'Escribe @ seguido del nombre de un artículo para crear enlaces rápidos a otros contenidos.',
    placement: 'top',
    title: 'Función @ para Artículos',
  },
  {
    target: '.tour-preview',
    content: 'Aquí puedes ver cómo se verá tu contenido renderizado. Se actualiza automáticamente mientras escribes.',
    placement: 'left',
    title: 'Vista Previa en Tiempo Real',
  },
  {
    target: '.tour-file-sidebar',
    content: 'Aquí puedes ver todos tus archivos guardados, cambiar entre ellos, y eliminar los que no necesites.',
    placement: 'left',
    title: 'Gestión de Archivos',
  },
  {
    target: '.tour-tour-button',
    content: 'Puedes revisar este tour en cualquier momento haciendo clic en este botón. ¡Ahora empieza a crear contenido increíble!',
    placement: 'bottom',
    title: '¡Tour Completado!',
  },
];

export const tourStyles = {
  options: {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#374151',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
    beaconSize: 36,
    zIndex: 10000,
  },
  tooltip: {
    fontSize: '14px',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    maxWidth: '90vw',
    width: '320px',
  },
  tooltipContainer: {
    textAlign: 'left' as const,
  },
  tooltipTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1f2937',
  },
  tooltipContent: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#374151',
  },
  buttonNext: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: '14px',
    padding: '10px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    minWidth: '80px',
  },
  buttonBack: {
    color: '#6b7280',
    fontSize: '14px',
    padding: '10px 16px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    marginRight: '8px',
    minWidth: '80px',
  },
  buttonSkip: {
    color: '#6b7280',
    fontSize: '14px',
    padding: '10px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
};
