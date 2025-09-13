import { useState, useEffect, useCallback } from 'react';
import { fileService } from '@/services';
import { useFileStore } from '@/stores/fileStore';
import { toast } from '@/hooks/use-toast';
import type { FileData } from '@/types';

interface UseFilesReturn {
  files: FileData[];
  isLoading: boolean;
  error: string | null;
  uploadFile: (file: File, documentType: string, projectId: string, description?: string) => Promise<FileData>;
  deleteFile: (projectId: string, fileId: string) => Promise<void>;
  refreshFiles: (projectId: string) => Promise<void>;
}

export const useFiles = (projectId?: string): UseFilesReturn => {
  const { files, setFiles, addFile, removeFile, clearFiles } = useFileStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedFiles = await fileService.getFiles(projectId);
      setFiles(fetchedFiles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch files';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [setFiles]);

  const uploadFile = useCallback(async (
    file: File,
    documentType: string,
    projectId: string,
    description?: string
  ): Promise<FileData> => {
    try {
      setError(null);
      const uploadedFile = await fileService.uploadFile({
        file,
        document_type: documentType,
        project_id: projectId,
        description,
      });
      addFile(uploadedFile);
      return uploadedFile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      throw err;
    }
  }, [addFile]);

  const deleteFile = useCallback(async (projectId: string, fileId: string): Promise<void> => {
    const fileToDelete = files.find(f => f.id === fileId);
    try {
      setError(null);
      await fileService.deleteFile(projectId, fileId);
      removeFile(fileId);
      
      if (fileToDelete) {
        toast({
          title: "File Deleted",
          description: `"${fileToDelete.name}" has been deleted successfully.`,
          variant: "default",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file';
      setError(errorMessage);
      
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    }
  }, [removeFile]);

  const refreshFiles = useCallback(async (projectId: string): Promise<void> => {
    await fetchFiles(projectId);
  }, [fetchFiles]);

  useEffect(() => {
    if (projectId) {
      fetchFiles(projectId);
    } else {
      clearFiles();
    }
  }, [projectId, fetchFiles, clearFiles]);

  return {
    files,
    isLoading,
    error,
    uploadFile,
    deleteFile,
    refreshFiles,
  };
};