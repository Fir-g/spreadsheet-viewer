import { useState } from "react";
import { Search, FileSpreadsheet, ChevronRight, Layers, Loader2 } from "lucide-react";
import { extractedDataService } from '@/services';

interface FileExplorerProps {
  files: any[];
  excelData: any;
  selectedFileId: string;
  selectedSheet: string | null;
  expandedFiles: Set<string>;
  searchQuery: string;
  filesLoading: boolean;
  onFileSelect: (fileId: string) => void;
  onSheetSelect: (sheetName: string) => void;
  onToggleExpansion: (fileId: string, event: React.MouseEvent) => void;
  onSearchChange: (query: string) => void;
}

export const FileExplorer = ({
  files,
  excelData,
  selectedFileId,
  selectedSheet,
  expandedFiles,
  searchQuery,
  filesLoading,
  onFileSelect,
  onSheetSelect,
  onToggleExpansion,
  onSearchChange,
}: FileExplorerProps) => {
  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
      <div className="p-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>

        {/* File Tree */}
        <div className="space-y-2">
          {filesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No files available</p>
            </div>
          ) : (
            files
              .filter(file => 
                !searchQuery || 
                file.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((file) => {
                const fileConfig = extractedDataService.getFileTypeConfig(file.name);
                const isSelected = selectedFileId === file.id;
                const isExpanded = expandedFiles.has(file.id);
                
                return (
                  <div key={file.id} className="space-y-1">
                    <div className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all ${
                      isSelected 
                        ? 'bg-gray-900 text-white shadow-md' 
                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      <button
                        onClick={() => onFileSelect(file.id)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <div className={`p-1.5 rounded-md ${isSelected ? 'bg-white/20' : fileConfig.bgColor}`}>
                          <FileSpreadsheet className={`h-4 w-4 ${isSelected ? 'text-white' : fileConfig.color}`} />
                        </div>               
                        <div className="flex-1">
                          <p className="text-sm font-medium break-words">{file.name}</p>
                          <p className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                            {!isExpanded && excelData?.files && (() => {
                              const selectedFile = Object.values(excelData.files).find((f: any) => f.file_id === file.id);
                              const sheetCount = selectedFile?.sheets ? Object.keys(selectedFile.sheets).length : 0;
                              return sheetCount > 0 ? ` • ${sheetCount} sheet${sheetCount > 1 ? 's' : ''}` : '';
                            })()}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={(e) => onToggleExpansion(file.id, e)}
                        className={`p-1 rounded-md hover:bg-white/10 transition-all duration-200 ${
                          isSelected ? 'text-white hover:bg-white/20' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                        title={isExpanded ? 'Collapse file contents' : 'Expand file contents'}
                      >
                        <ChevronRight 
                          className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                        />
                      </button>
                    </div>
                    
                    {/* Sheets */}
                    {isExpanded && excelData?.files && (
                      <div className="ml-8 space-y-1">
                        {(() => {
                          const selectedFile = Object.values(excelData.files).find((f: any) => f.file_id === file.id);
                          if (!selectedFile?.sheets) return null;
                          
                          return Object.keys(selectedFile.sheets).map((sheetName) => (
                            <button
                              key={sheetName}
                              onClick={() => onSheetSelect(sheetName)}
                              className={`w-full px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-all ${
                                selectedSheet === sheetName 
                                  ? 'bg-gray-200 text-gray-900 font-medium' 
                                  : 'hover:bg-gray-100 text-gray-600'
                              }`}
                            >
                              <Layers className="h-3 w-3" />
                              <span className="truncate">{sheetName}</span>
                              {selectedFile.sheets[sheetName]?.Tables && (
                                <span className="text-xs text-gray-400 ml-auto">
                                  {Object.keys(selectedFile.sheets[sheetName].Tables).length}
                                </span>
                              )}
                            </button>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};