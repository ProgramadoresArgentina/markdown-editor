'use client';

import { useState, useEffect, useCallback } from 'react';
import { defaultArticles, type Article } from '@/lib/minio-client';

export interface ArticleSuggestionProps {
  onSelect: (article: Article) => void;
  query: string;
  visible: boolean;
}

export function ArticleSuggestions({ onSelect, query, visible }: ArticleSuggestionProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);

  // Función para filtrar artículos basado en la consulta
  const filterArticles = useCallback((searchQuery: string) => {
    // Si el query está vacío (solo @), mostrar todos los artículos
    if (!searchQuery || searchQuery.trim() === '') {
      setFilteredArticles(articles.slice(0, 5));
      return;
    }

    const normalizedQuery = searchQuery.toLowerCase();
    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(normalizedQuery) ||
      article.slug.toLowerCase().includes(normalizedQuery)
    );
    
    setFilteredArticles(filtered.slice(0, 5)); // Mostrar máximo 5 sugerencias
  }, [articles]);

  // Cargar artículos por defecto
  useEffect(() => {
    setArticles(defaultArticles);
  }, []);

  // Efecto separado para manejar cambios en articles después de cargarlos
  useEffect(() => {
    if (articles.length > 0 && query !== undefined) {
      filterArticles(query);
    }
  }, [articles, query, filterArticles]);

  if (!visible || filteredArticles.length === 0) {
    return null;
  }

  return (
    <div 
      className="bg-white border border-gray-300 rounded-lg shadow-xl w-80 overflow-hidden"
      style={{ 
        maxHeight: '200px'
      }}
    >
      {filteredArticles.map((article) => (
        <div
          key={article.slug}
          className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-800 text-sm border-b border-gray-100 last:border-b-0 transition-colors duration-150"
          onClick={() => onSelect(article)}
        >
          <div className="font-medium text-gray-900 truncate">
            {article.title}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            @{article.slug}
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook para manejar las sugerencias de artículos
export function useArticleSuggestions() {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });

  const handleAtSymbol = useCallback((text: string, cursorPos: number, textareaRef: React.RefObject<HTMLTextAreaElement | null>) => {
    const beforeCursor = text.substring(0, cursorPos);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1 && (cursorPos - atIndex) <= 50) {
      const query = beforeCursor.substring(atIndex + 1);
      
      // Mostrar sugerencias si no hay espacios en la consulta o está vacía
      if (!query.includes(' ') && !query.includes('\n')) {
        setSuggestionQuery(query);
        setShowSuggestions(true);
        
        // Calcular posición de las sugerencias
        if (textareaRef.current) {
          const textarea = textareaRef.current;
          const rect = textarea.getBoundingClientRect();
          
          // Aproximar la posición del cursor
          const lineHeight = 24;
          const lines = beforeCursor.split('\n');
          const currentLineIndex = lines.length - 1;
          const top = rect.top + (currentLineIndex * lineHeight) + lineHeight + 10;
          
          setSuggestionPosition({
            top,
            left: rect.left + 20
          });
        }
        
        return { showSuggestions: true, query };
      }
    }
    
    setShowSuggestions(false);
    return { showSuggestions: false, query: '' };
  }, []);

  const insertArticleReference = useCallback((
    article: Article, 
    text: string, 
    cursorPos: number,
    onTextChange: (newText: string) => void,
    onCursorChange: (newPos: number) => void
  ) => {
    const beforeCursor = text.substring(0, cursorPos);
    const afterCursor = text.substring(cursorPos);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      // Crear el link markdown que se abre en nueva pestaña
      const markdownLink = `[${article.title}](${article.url}){:target="_blank"}`;
      
      const newText = 
        text.substring(0, atIndex) + 
        markdownLink + 
        afterCursor;
      
      onTextChange(newText);
      
      // Posicionar cursor después del link insertado
      const newCursorPos = atIndex + markdownLink.length;
      setTimeout(() => onCursorChange(newCursorPos), 0);
    }
    
    setShowSuggestions(false);
  }, []);

  return {
    showSuggestions,
    suggestionQuery,
    suggestionPosition,
    handleAtSymbol,
    insertArticleReference,
    setShowSuggestions
  };
}
