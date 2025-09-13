import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useExtractedDataStore } from "../stores/extractedStore";
import { handleAuthError } from "../utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Database,
  Download,
  Edit,
  Copy,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Building2,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  Eye,
  X,
  TrendingUp,
  DollarSign,
  Calendar,
  Grid3X3,
  TableIcon,
  LayoutGrid,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchCompaniesFundsAPI } from "@/utils/api";

// Type definitions
interface FundCompanyData {
  fund_name: string;
  company_names: string[];
}

interface ExtractedDataEntry {
  value: string;
  reference: string;
  type?: string;
  heading?: string;
  sub_heading?: string;
  section?: string;
  subsection?: string;
}

interface ApiExtractedDataItem {
  value: string;
  field_name: string;
  reference: string;
  type: string;
  heading: string;
  sub_heading: string;
  company_name: string;
}

interface FlattenedDataItem {
  key: string;
  value: string;
  reference: string;
  type: string;
  citation: string;
  heading: string;
  sub_heading: string;
}

interface TableDimensions {
  rows: number;
  columns: number;
}

interface TableInfo {
  name: string;
  table_number: number;
  section_number: number;
  row_count: number;
  column_count: number;
  start_row: number;
  end_row: number;
  max_column: number;
  dimensions: TableDimensions;
  data: any[][];
  metadata: any;
}

interface SheetData {
  Tables: Record<string, TableInfo>;
  Metadata: any;
}

interface FileData {
  file_id: string;
  file_type: string;
  file_path: string;
  sheets: Record<string, SheetData>;
}

interface ProjectData {
  gp_name: string;
  files: Record<string, FileData>;
}

// Utility functions
const getFileTypeConfig = (fileName: string) => {
  const name = fileName.toLowerCase();
  if (name.includes('irr') || name.includes('cashflow') || name.includes('cash flow')) {
    return { 
      icon: TrendingUp, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      label: 'CASHFLOWS' 
    };
  }
  if (name.includes('portfolio') || name.includes('summary')) {
    return { 
      icon: Building2, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      label: 'SUMMARY' 
    };
  }
  if (name.includes('transaction')) {
    return { 
      icon: DollarSign, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50',
      label: 'TRANSACTION' 
    };
  }
  return { 
    icon: FileSpreadsheet, 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-50',
    label: 'EXCEL' 
  };
};

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
  const [excelData, setExcelData] = useState<ProjectData | null>(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);

  // Get backend URL
  const getBackendUrl = useCallback((): string => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    if (envUrl) {
      if (window.location.protocol === 'https:' && envUrl.startsWith('http:')) {
        return envUrl.replace('http:', 'https:');
      }
      return envUrl;
    }
  }, []);

  // Fetch available files
  const fetchAvailableFiles = useCallback(async () => {
    try {
      setFilesLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const baseUrl = getBackendUrl();
      
      // Call both endpoints simultaneously
      const [filesResponse, excelData] = await Promise.all([
        fetch(`${baseUrl}/projects/${projectId}/files`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetchCompaniesFundsAPI(projectId!)
      ]);

      // Set excel data
      setExcelData(excelData);

      // Handle files response
      if (filesResponse.ok) {
        const files = await filesResponse.json();
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
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
      // Handle authentication errors
      if (handleAuthError(error)) {
        setExcelError("Authentication failed. Please log in again.");
        return;
      }
      setExcelError("Failed to fetch files");
    } finally {
      setFilesLoading(false);
    }
  }, []);

   // Fetch all project data with caching
   const fetchProjectData = useCallback(async (forceRefresh = false) => {
     if (!projectId) return;

     try {
       setExcelLoading(true);
       setExcelError(null);
       
       // Auto-select first file and sheet if available
       if (data?.files && Object.keys(data.files).length > 0 && !selectedFileId) {
         const firstFileName = Object.keys(data.files)[0];
         const firstFile = data.files[firstFileName];
         if (firstFile.sheets && Object.keys(firstFile.sheets).length > 0) {
           const firstSheetName = Object.keys(firstFile.sheets)[0];
           setSelectedFileId(firstFile.file_id);
           setSelectedSheet(firstSheetName);
         }
       }
     } catch (error) {
       console.error("Failed to fetch project data:", error);
       // Handle authentication errors
       if (handleAuthError(error)) {
         setExcelError("Authentication failed. Please log in again.");
         return;
       }
       setExcelError(error instanceof Error ? error.message : "Failed to fetch project data");
     } finally {
       setExcelLoading(false);
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
    const selectedFile = Object.values(excelData.files).find((file) => file.file_id === selectedFileId);
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

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  }, []);

   // Effects
   useEffect(() => {
     if (projectId) {
       fetchAvailableFiles();
       fetchProjectData();
     }
   }, [projectId]);

  // Render table
  const renderTable = (data: any[][], tableName: string, dimensions: TableDimensions) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Database className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {data[0]?.map((header: any, colIndex: number) => (
                  <th 
                    key={colIndex} 
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {header || `Column ${colIndex + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.slice(1).map((row: any[], rowIndex: number) => (
                <tr 
                  key={rowIndex} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.map((cell: any, colIndex: number) => (
                    <td 
                      key={colIndex} 
                      className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                    >
                      <div className="max-w-xs truncate" title={cell !== null && cell !== undefined ? String(cell) : ''}>
                        {cell !== null && cell !== undefined ? String(cell) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading extracted data...</p>
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {currentError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Data Explorer</h2>
            <p className="text-sm text-gray-500 mt-1">Navigate and analyze Excel Data</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('explorer')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'explorer' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="h-4 w-4 inline mr-1.5" />
                Explorer
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="h-4 w-4 inline mr-1.5" />
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="h-4 w-4 inline mr-1.5" />
                Cards
              </button>
            </div>
            
            {selectedSheet && (
              <Button 
                onClick={exportData}
                className="bg-gray-900 hover:bg-gray-800 text-white"
                size="sm"
              >
                <Download className="h-4 w-4 mr-1.5" />
                Export
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              ) : availableFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FileSpreadsheet className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No files available</p>
                </div>
              ) : (
                availableFiles
                  .filter(file => 
                    !searchQuery || 
                    file.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((file) => {
                    const fileConfig = getFileTypeConfig(file.name);
                    const FileIcon = fileConfig.icon;
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
                            onClick={() => handleFileSelect(file.id)}
                            className="flex items-center gap-3 flex-1 text-left"
                          >
                            <div className={`p-1.5 rounded-md ${isSelected ? 'bg-white/20' : fileConfig.bgColor}`}>
                              <FileIcon className={`h-4 w-4 ${isSelected ? 'text-white' : fileConfig.color}`} />
                            </div>               
                            <div className="flex-1">
                              <p className="text-sm font-medium break-words">{file.name}</p>
                              <p className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                {/* {fileConfig.label} • {file.file_size || 'Processing...'} */}
                                {!isExpanded && excelData?.files && (() => {
                                  const selectedFile = Object.values(excelData.files).find((f) => f.file_id === file.id);
                                  const sheetCount = selectedFile?.sheets ? Object.keys(selectedFile.sheets).length : 0;
                                  return sheetCount > 0 ? ` • ${sheetCount} sheet${sheetCount > 1 ? 's' : ''}` : '';
                                })()}
                              </p>
                            </div>
                          </button>
                          <button
                            onClick={(e) => handleFileExpansionToggle(file.id, e)}
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
                               const selectedFile = Object.values(excelData.files).find((f) => f.file_id === file.id);
                               if (!selectedFile?.sheets) return null;
                               
                               return Object.keys(selectedFile.sheets).map((sheetName) => (
                                 <button
                                   key={sheetName}
                                   onClick={() => handleSheetSelect(sheetName)}
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

        {/* Right Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedFileId && selectedSheet ? (
            <>
              {/* Breadcrumb */}
              <div className="border-b border-gray-100 bg-white px-6 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="font-medium text-gray-900">
                    {availableFiles.find(f => f.id === selectedFileId)?.name}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                  <span>{selectedSheet}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6 bg-gray-50">
                {excelLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : excelError ? (
                  <Alert className="max-w-md mx-auto mt-8">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{excelError}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-6">
                     {/* View Mode Content */}
                     {viewMode === 'explorer' && (() => {
                       const selectedFile = Object.values(excelData.files).find((file) => file.file_id === selectedFileId);
                       const sheetData = selectedFile?.sheets?.[selectedSheet];
                       
                       if (!sheetData?.Tables) return null;
                       
                       return (
                         <div className="space-y-6">
                           {Object.entries(sheetData.Tables).map(([tableName, tableInfo]) => {
                             if (tableInfo && typeof tableInfo === 'object' && 'data' in tableInfo) {
                               return (
                                 <div key={tableName} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                   <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                     <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                       <Database className="h-4 w-4 text-gray-400" />
                                       {tableName}
                                     </h4>
                                     <Badge variant="secondary" className="text-xs">
                                       {(tableInfo as any).dimensions?.rows || 0} × {(tableInfo as any).dimensions?.columns || 0}
                                     </Badge>
                                   </div>
                                   <div className="p-4">
                                     {renderTable(
                                       (tableInfo as any).data,
                                       tableName,
                                       (tableInfo as any).dimensions
                                     )}
                                   </div>
                                 </div>
                               );
                             }
                             return null;
                           })}
                         </div>
                       );
                     })()}

                     {viewMode === 'table' && (() => {
                       const selectedFile = Object.values(excelData.files).find((file) => file.file_id === selectedFileId);
                       const sheetData = selectedFile?.sheets?.[selectedSheet];
                       
                       if (!sheetData?.Tables) return null;
                       
                       return (
                         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                           {Object.entries(sheetData.Tables).map(([tableName, tableInfo]) => {
                             if (tableInfo && typeof tableInfo === 'object' && 'data' in tableInfo) {
                               return renderTable(
                                 (tableInfo as any).data,
                                 tableName,
                                 (tableInfo as any).dimensions
                               );
                             }
                             return null;
                           })}
                         </div>
                       );
                     })()}

                     {viewMode === 'cards' && (() => {
                       const selectedFile = Object.values(excelData.files).find((file) => file.file_id === selectedFileId);
                       const sheetData = selectedFile?.sheets?.[selectedSheet];
                       
                       if (!sheetData?.Tables) return null;
                       
                       return (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {Object.entries(sheetData.Tables).map(([tableName, tableInfo]) => (
                             <Card key={tableName} className="hover:shadow-lg transition-shadow">
                               <CardHeader className="pb-3">
                                 <CardTitle className="text-base flex items-center gap-2">
                                   <Database className="h-4 w-4 text-gray-400" />
                                   {tableName}
                                 </CardTitle>
                               </CardHeader>
                               <CardContent>
                                 <div className="space-y-2">
                                   <div className="flex justify-between text-sm">
                                     <span className="text-gray-500">Rows</span>
                                     <span className="font-medium">{(tableInfo as any).dimensions?.rows || 0}</span>
                                   </div>
                                   <div className="flex justify-between text-sm">
                                     <span className="text-gray-500">Columns</span>
                                     <span className="font-medium">{(tableInfo as any).dimensions?.columns || 0}</span>
                                   </div>
                                 </div>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   className="w-full mt-4"
                                   onClick={() => setViewMode('explorer')}
                                 >
                                   <Eye className="h-4 w-4 mr-1.5" />
                                   View Data
                                 </Button>
                               </CardContent>
                             </Card>
                           ))}
                         </div>
                       );
                     })()}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedFileId ? 'Select a sheet to explore' : 'Select a file to get started'}
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  {selectedFileId 
                    ? 'Choose a sheet from the sidebar to view its data'
                    : 'Choose a file from the sidebar to view extracted data'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}