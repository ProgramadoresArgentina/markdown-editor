import { Extension } from '@tiptap/core';

// Extensión simplificada de corrección ortográfica
export const SpellCheckExtension = Extension.create({
  name: 'spellCheck',

  addProseMirrorPlugins() {
    return [];
  },
});

