export interface SavedFile {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export class FileManager {
  private static readonly STORAGE_KEY = 'markdown-files';
  private static readonly CURRENT_FILE_KEY = 'current-file-id';

  static getAllFiles(): SavedFile[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading files:', error);
      return [];
    }
  }

  static saveFile(file: Omit<SavedFile, 'id' | 'createdAt' | 'updatedAt'>): SavedFile {
    const files = this.getAllFiles();
    const now = Date.now();
    
    const newFile: SavedFile = {
      ...file,
      id: `file_${now}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };

    files.push(newFile);
    this.saveFiles(files);
    return newFile;
  }

  static updateFile(id: string, updates: Partial<Pick<SavedFile, 'title' | 'content'>>): SavedFile | null {
    const files = this.getAllFiles();
    const fileIndex = files.findIndex(f => f.id === id);
    
    if (fileIndex === -1) return null;

    files[fileIndex] = {
      ...files[fileIndex],
      ...updates,
      updatedAt: Date.now()
    };

    this.saveFiles(files);
    return files[fileIndex];
  }

  static deleteFile(id: string): boolean {
    const files = this.getAllFiles();
    const filteredFiles = files.filter(f => f.id !== id);
    
    if (filteredFiles.length === files.length) return false;

    this.saveFiles(filteredFiles);
    
    // Si el archivo eliminado era el actual, limpiar la referencia
    if (this.getCurrentFileId() === id) {
      this.setCurrentFileId(null);
    }
    
    return true;
  }

  static getFile(id: string): SavedFile | null {
    const files = this.getAllFiles();
    return files.find(f => f.id === id) || null;
  }

  static getCurrentFileId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.CURRENT_FILE_KEY);
  }

  static setCurrentFileId(id: string | null): void {
    if (typeof window === 'undefined') return;
    
    if (id) {
      localStorage.setItem(this.CURRENT_FILE_KEY, id);
    } else {
      localStorage.removeItem(this.CURRENT_FILE_KEY);
    }
  }

  static getCurrentFile(): SavedFile | null {
    const currentId = this.getCurrentFileId();
    return currentId ? this.getFile(currentId) : null;
  }

  private static saveFiles(files: SavedFile[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files));
    } catch (error) {
      console.error('Error saving files:', error);
    }
  }

  static extractTitle(content: string): string {
    // Extraer el primer header o las primeras palabras como título
    const lines = content.split('\n');
    
    // Buscar el primer header
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        return trimmed.replace(/^#+\s*/, '').trim() || 'Sin título';
      }
    }

    // Si no hay header, usar las primeras palabras
    const firstLine = lines.find(line => line.trim().length > 0);
    if (firstLine) {
      const words = firstLine.trim().split(/\s+/).slice(0, 5);
      return words.join(' ') + (firstLine.trim().split(/\s+/).length > 5 ? '...' : '');
    }

    return 'Sin título';
  }
}
