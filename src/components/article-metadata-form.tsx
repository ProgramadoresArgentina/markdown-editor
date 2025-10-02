'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Settings, Info } from 'lucide-react';

export interface ArticleMetadata {
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  image: string;
  isPublic: boolean;
  excerpt: string;
}

interface ArticleMetadataFormProps {
  metadata: ArticleMetadata;
  onMetadataChange: (metadata: ArticleMetadata) => void;
}

const METADATA_STORAGE_KEY = 'markdown-editor-metadata';

export function ArticleMetadataForm({ metadata, onMetadataChange }: ArticleMetadataFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ArticleMetadata>(metadata);

  // Cargar metadatos desde localStorage al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMetadata = localStorage.getItem(METADATA_STORAGE_KEY);
      if (savedMetadata) {
        try {
          const parsed = JSON.parse(savedMetadata);
          setFormData(parsed);
          onMetadataChange(parsed);
        } catch (error) {
          console.error('Error parsing saved metadata:', error);
        }
      }
    }
  }, [onMetadataChange]);

  // Verificar si los metadatos están completos
  const isMetadataComplete = () => {
    return (
      formData.title.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.date.trim() !== '' &&
      formData.author.trim() !== '' &&
      formData.category.trim() !== '' &&
      formData.image.trim() !== '' &&
      formData.excerpt.trim() !== ''
    );
  };

  const handleInputChange = (field: keyof ArticleMetadata, value: string | boolean) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
  };

  const handleSave = () => {
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(formData));
    }
    
    onMetadataChange(formData);
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Restaurar datos originales
    setFormData(metadata);
    setIsOpen(false);
  };

  // Obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <TooltipProvider>
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="relative flex-shrink-0"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Metadatos</span>
              {!isMetadataComplete() && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-3 w-3 p-0 flex items-center justify-center text-xs"
                >
                  !
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMetadataComplete() ? 'Metadatos completos' : 'Metadatos incompletos'}</p>
          </TooltipContent>
        </Tooltip>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Metadatos del Artículo</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Título */}
              <div className="grid gap-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Título del artículo"
                />
              </div>

              {/* Descripción */}
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descripción breve del artículo"
                  rows={3}
                />
              </div>

              {/* Fecha */}
              <div className="grid gap-2">
                <Label htmlFor="date">Fecha *</Label>
                <div className="flex gap-2">
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange('date', getCurrentDate())}
                  >
                    Hoy
                  </Button>
                </div>
              </div>

              {/* Autor */}
              <div className="grid gap-2">
                <Label htmlFor="author">Autor *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  placeholder="Nombre del autor"
                />
              </div>

              {/* Categoría */}
              <div className="grid gap-2">
                <Label htmlFor="category">Categoría *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Categoría del artículo"
                />
              </div>

              {/* Imagen */}
              <div className="grid gap-2">
                <Label htmlFor="image">Imagen *</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="Nombre del archivo de imagen (ej: banner.png)"
                />
              </div>

              {/* Excerpt */}
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Información que verá el usuario sobre el artículo si isPublic es false</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Resumen o extracto del artículo"
                  rows={3}
                />
              </div>

              {/* isPublic */}
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="isPublic">Público</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Si es true el usuario deberá ser miembro del club para leerlo</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                  />
                  <Label htmlFor="isPublic" className="text-sm text-muted-foreground">
                    {formData.isPublic ? 'Solo miembros del club' : 'Público general'}
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

// Hook para usar los metadatos
export function useArticleMetadata() {
  const [metadata, setMetadata] = useState<ArticleMetadata>({
    title: '',
    description: '',
    date: '',
    author: '',
    category: '',
    image: '',
    isPublic: true,
    excerpt: ''
  });

  return {
    metadata,
    setMetadata
  };
}
