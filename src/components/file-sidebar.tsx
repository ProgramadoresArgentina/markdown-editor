'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  FileText, 
  Trash2, 
  Calendar,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { type SavedFile } from '@/lib/file-manager';

interface FileSidebarProps {
  files: SavedFile[];
  currentFileId: string | null;
  onFileSelect: (file: SavedFile) => void;
  onFileDelete: (fileId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function FileSidebar({ 
  files, 
  currentFileId, 
  onFileSelect, 
  onFileDelete,
  isCollapsed,
  onToggleCollapse
}: FileSidebarProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    file: SavedFile | null;
  }>({ isOpen: false, file: null });

  const handleDeleteClick = (file: SavedFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, file });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.file) {
      onFileDelete(deleteConfirm.file.id);
      setDeleteConfirm({ isOpen: false, file: null });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('es-ES', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  };

  return (
    <>
      <div className={`bg-white border-l border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-12' : 'w-80'
      } flex flex-col`}>
        {/* Header del sidebar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <h3 className="font-semibold text-gray-900">Archivos Guardados</h3>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-1 h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Lista de archivos */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay archivos guardados</p>
                <p className="text-xs mt-1">Guarda tu primer artículo</p>
              </div>
            ) : (
              files
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((file) => (
                  <Card
                    key={file.id}
                    className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                      currentFileId === file.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onFileSelect(file)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {file.title}
                          </h4>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(file.updatedAt)}</span>
                        </div>
                        
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {file.content.substring(0, 80)}
                          {file.content.length > 80 ? '...' : ''}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(file, e)}
                        className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 ml-2 flex-shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))
            )}
          </div>
        )}

        {/* Collapsed state */}
        {isCollapsed && files.length > 0 && (
          <div className="flex-1 overflow-y-auto p-1 space-y-1">
            {files
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .slice(0, 10)
              .map((file) => (
                <div
                  key={file.id}
                  className={`p-2 cursor-pointer transition-all hover:bg-gray-100 rounded ${
                    currentFileId === file.id ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => onFileSelect(file)}
                  title={file.title}
                >
                  <FileText className="h-4 w-4 text-blue-600 mx-auto" />
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      <Dialog open={deleteConfirm.isOpen} onOpenChange={(open) => 
        setDeleteConfirm({ isOpen: open, file: null })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar archivo?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar &quot;{deleteConfirm.file?.title}&quot;? 
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ isOpen: false, file: null })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
