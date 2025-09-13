import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useExtractedDataStore } from "../stores/extractedStore";
import { extractedDataService } from '@/services';
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import * as XLSX from "xlsx";
import {
  DataExplorerHeader,
  FileExplorer,
  DataBreadcrumb,
  ExplorerView,
  TableView,
  CardsView,
  EmptyDataState,
} from './data-explorer';
import { fetchCompaniesFundsAPI, handleAuthError } from "@/utils/api";
import type { ProjectExtractedData } from '@/types';

export function ExtractedDataView() {
  const { projectId } = useParams();
  const { 
    data, 
    loading, 
    error, 
    fetchData, 
    setError, 
    setLoading 
  } = useExtractedDataStore();
  
  const extractedData = projectId ? (data[projectId] || []) : [];
  const isLoading = projectId ? (loading[projectId] || false) : false;
  const currentError = projectId ? (error[projectId] || null) : null;
  
  // State management
  const [selectedFileId, setSelectedFileId] = useState<string>("");
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'explorer' | 'table' | 'cards'>('explorer');
  const [searchQuery, setSearchQuery] = useState("");
  const [excelData, setExcelData] = useState<ProjectExtractedData | null>(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);

  // Fetch available files
  const fetchAvailableFiles = useCallback(async () => {
    try {
      setFilesLoading(true);
      
      // Call both services simultaneously
      const [files, excelData] = await Promise.all([
        extractedDataService.getFiles(projectId!),
        fetchCompaniesFundsAPI(projectId!)
      ]);

      // Set excel data
      setExcelData(excelData);

      // Filter active files
      const activeFiles = files.filter((file: any) => 
        file.status === 'completed' && !file.deleted
      );
      setAvailableFiles(activeFiles);
      
      // Auto-select first file if only one exists
      if (activeFiles.length === 1 && !selectedFileId) {
        const fileId = activeFiles[0].id;
        setSelectedFileId(fileId);
        setExpandedFiles(new Set([fileId]));
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
      if (handleAuthError(error)) {
        setExcelError("Authentication failed. Please log in again.");
        return;
      }
      setExcelError("Failed to fetch files");
    } finally {
      setFilesLoading(false);
    }
  }, []);
  // Toggle file expansion
  const toggleFileExpansion = useCallback((fileId: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

   // Handle file selection (without toggling expansion)
   const handleFileSelect = useCallback((fileId: string) => {
    // Only update state if the file is different
    if (selectedFileId !== fileId) {
      setSelectedFileId(fileId);
      setSelectedSheet(null);
    }
    
    // Only expand if not already expanded
    if (!expandedFiles.has(fileId)) {
      setExpandedFiles(prev => new Set([...prev, fileId]));
    }
  }, []);

   // Handle file expansion toggle (separate from selection)
   const handleFileExpansionToggle = useCallback((fileId: string, event: React.MouseEvent) => {
     event.stopPropagation(); // Prevent file selection
     toggleFileExpansion(fileId);
   }, [toggleFileExpansion]);

   // Handle sheet selection (optimized to prevent unnecessary updates)
   const handleSheetSelect = useCallback((sheetName: string) => {
     // Only update if the sheet is different
     if (selectedSheet !== sheetName) {
       setSelectedSheet(sheetName);
     }
   }, []);

  // Export data
  const exportData = useCallback(() => {
    if (!excelData || !selectedFileId || !selectedSheet) return;
    
    // Find the selected file data
    const selectedFile = Object.values(excelData.files).find((file: any) => file.file_id === selectedFileId);
    if (!selectedFile?.sheets?.[selectedSheet]?.Tables) return;
    
    const workbook = XLSX.utils.book_new();
    
    Object.entries(selectedFile.sheets[selectedSheet].Tables).forEach(([tableName, tableInfo]) => {
      if (tableInfo?.data) {
        const worksheet = XLSX.utils.aoa_to_sheet(tableInfo.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, tableName.slice(0, 31));
      }
    });
    
    XLSX.writeFile(workbook, `${selectedSheet}-export.xlsx`);
  }, [excelData, selectedFileId, selectedSheet]);

   // Effects
   useEffect(() => {
     if (projectId) {
       fetchAvailableFiles();
     }
   }, [projectId, fetchAvailableFiles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingSpinner text="Loading extracted data..." />
      </div>
    );
  }

  if (currentError) {
    return (
      <div className="p-6">
        <ErrorMessage message={currentError} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <DataExplorerHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={exportData}
        canExport={!!selectedSheet}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <FileExplorer
          files={availableFiles}
          excelData={excelData}
          selectedFileId={selectedFileId}
          selectedSheet={selectedSheet}
          expandedFiles={expandedFiles}
          searchQuery={searchQuery}
          filesLoading={filesLoading}
          onFileSelect={handleFileSelect}
          onSheetSelect={handleSheetSelect}
          onToggleExpansion={handleFileExpansionToggle}
          onSearchChange={setSearchQuery}
        />

        {/* Right Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedFileId && selectedSheet ? (
            <>
              <DataBreadcrumb
                fileName={availableFiles.find(f => f.id === selectedFileId)?.name || ''}
                sheetName={selectedSheet}
              />

              {/* Content */}
              <div className="flex-1 overflow-auto p-6 bg-gray-50">
                {excelLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <LoadingSpinner />
                  </div>
                ) : excelError ? (
                  <div className="max-w-md mx-auto mt-8">
                    <ErrorMessage message={excelError} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const selectedFile = Object.values(excelData?.files || {}).find((file: any) => file.file_id === selectedFileId);
                      const sheetData = selectedFile?.sheets?.[selectedSheet];
                      
                      switch (viewMode) {
                        case 'explorer':
                          return (
                            <ExplorerView
                              sheetData={sheetData}
                              selectedFileId={selectedFileId}
                              selectedSheet={selectedSheet}
                              excelData={excelData}
                            />
                          );
                        case 'table':
                          return <TableView sheetData={sheetData} />;
                        case 'cards':
                          return <CardsView sheetData={sheetData} onViewData={() => setViewMode('explorer')} />;
                        default:
                          return null;
                      }
                    })()}
                  </div>
                )}
              </div>
            </>
          ) : (
            <EmptyDataState selectedFileId={selectedFileId} />
          )}
        </div>
      </div>
    </div>
  );
}