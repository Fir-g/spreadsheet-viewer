import { useState, useCallback } from 'react';
import { fileService } from '@/services';
import type { FileData } from '@/types';

interface UseSplitManagerReturn {
  xlsxFiles: FileData[];
  loading: boolean;
  error: string | null;
  fetchXlsxFiles: (projectId: string) => Promise<void>;
  setXlsxFiles: (files: FileData[]) => void;
}

export const useSplitManager = (): UseSplitManagerReturn => {
  const [xlsxFiles, setXlsxFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchXlsxFiles = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const files = await fileService.getFiles(projectId);
      // Filter for xlsx files that are uploaded/completed
      const xlsxFiles = files.filter(file => 
        file.type?.toLowerCase() === 'xlsx' && 
        (file.status === 'uploaded' || file.status === 'completed' || file.status === 'paused_for_hitl')
      );
      setXlsxFiles(xlsxFiles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch xlsx files';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    xlsxFiles,
    loading,
    error,
    fetchXlsxFiles,
    setXlsxFiles,
  };
};