import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FileData {
  name: string;
  type: string;
  document_type: string;
  file_size: string | null;
  uploaded_at: string;
  modified_at: string;
  status: string;
}

interface FileStore {
  files: FileData[];
  setFiles: (files: FileData[]) => void;
  addFile: (file: FileData) => void;
  removeFile: (fileName: string) => void;
  updateFileStatus: (fileName: string, status: string) => void;
  clearFiles: () => void;
}

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      files: [],
      setFiles: (files) => set({ files }),
      addFile: (file) => set((state) => ({ files: [...state.files, file] })),
      removeFile: (fileName) => 
        set((state) => ({ 
          files: state.files.filter(f => f.name !== fileName) 
        })),
      updateFileStatus: (fileName, status) =>
        set((state) => ({
          files: state.files.map(f => 
            f.name === fileName ? { ...f, status } : f
          )
        })),
      clearFiles: () => set({ files: [] }),
    }),
    {
      name: 'file-storage',
      partialize: (state) => ({ files: state.files }),
    }
  )
);