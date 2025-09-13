import { useState, useRef, useEffect, DragEvent } from "react";
import { Upload, Search, Filter, FileText, Download, Trash2, Eye, Loader2, AlertCircle, CheckCircle, X, FileUp, Cloud, FolderPlus, Plus, ChevronDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';
import { handleAuthError } from "../utils/api";

interface FileMetadata {
  type: string;
  description: string;
  xlsx_metadata?: {
    sheets: Array<{
      sheet_name: string;
      data_range: {
        start: number;
        end: number;
        header: number;
      };
    }>;
  };
}

interface FileUploadComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectUuid?: string;
  onUploadSuccess?: () => void;
}

export default function EnhancedFileUpload({ 
  open, 
  onOpenChange, 
  projectUuid, 
  onUploadSuccess 
}: FileUploadComponentProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<Record<number, FileMetadata>>({});
  const [showValidation, setShowValidation] = useState(false);
  const [excelSheetNames, setExcelSheetNames] = useState<Record<number, string[]>>({});
  const [readingSheets, setReadingSheets] = useState<Record<number, boolean>>({});
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  // Document types for different file formats
  const PDF_DOCUMENT_TYPES = ["DDQ", "LPA", "PPM"];
  const XLSX_DOCUMENT_TYPES = ["Summary", "Cashflows"];

  const ALLOWED_TYPES = ['.pdf', '.xlsx'];
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const validateFiles = (fileList: FileList): string | null => {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return `File "${file.name}" is not a supported format. Only PDF and XLSX files are allowed.`;
      }
      
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_TYPES.includes(fileExtension)) {
        return `File "${file.name}" has an unsupported extension. Only .pdf and .xlsx files are allowed.`;
      }

      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        return `File "${file.name}" is too large. Maximum file size is 50MB.`;
      }
    }
    return null;
  };

  const getFileTypeFromExtension = (filename: string): "pdf" | "xlsx" => {
    const extension = filename.split(".").pop()?.toLowerCase();
    return extension === "xlsx" ? "xlsx" : "pdf";
  };

  const getExcelSheets = async (file: File): Promise<string[]> => {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetNames = workbook.SheetNames;
            
            if (sheetNames.length === 0) {
              console.warn('No sheets found in Excel file');
              resolve(["Sheet1"]);
            } else {
              console.log(`Found ${sheetNames.length} sheets:`, sheetNames);
              resolve(sheetNames);
            }
          } catch (error) {
            console.error('Error reading Excel file:', error);
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error('Error in getExcelSheets:', error);
      throw error;
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const validationError = validateFiles(fileList);
    if (validationError) {
      setUploadError(validationError);
      toast({
        title: "Invalid Files",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    const filesArray = Array.from(fileList);
    setSelectedFiles(filesArray);
    setUploadError(null);
    setShowValidation(false);

    // Initialize metadata for each file and read Excel sheets
    const initializeFileMetadata = async () => {
      const initialMetadata: Record<number, FileMetadata> = {};
      const sheetNamesMap: Record<number, string[]> = {};
      
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const fileType = getFileTypeFromExtension(file.name);
        
        initialMetadata[i] = {
          type: "",
          description: "",
          ...(fileType === "xlsx" && {
            xlsx_metadata: {
              sheets: [
                {
                  sheet_name: "",
                  data_range: {
                    start: 0,
                    end: 0,
                    header: 0,
                  },
                },
              ],
            },
          }),
        };

        // Read Excel sheets for XLSX files
        if (fileType === "xlsx") {
          setReadingSheets(prev => ({ ...prev, [i]: true }));
          try {
            const sheetNames = await getExcelSheets(file);
            sheetNamesMap[i] = sheetNames;
            
            // Auto-select the first sheet if available
            if (sheetNames.length > 0) {
              initialMetadata[i].xlsx_metadata!.sheets[0].sheet_name = sheetNames[0];
            }
          } catch (error) {
            console.error(`Error reading sheets for file ${file.name}:`, error);
            throw error;
          } finally {
            setReadingSheets(prev => ({ ...prev, [i]: false }));
          }
        }
      }
      
      setFileMetadata(initialMetadata);
      setExcelSheetNames(sheetNamesMap);
    };

    initializeFileMetadata();
  };

  const updateFileMetadata = (fileIndex: number, field: string, value: any) => {
    setFileMetadata((prev) => ({
      ...prev,
      [fileIndex]: {
        ...prev[fileIndex],
        [field]: value,
      },
    }));
  };

  const getAvailableDocumentTypes = (fileType: "pdf" | "xlsx") => {
    return fileType === "xlsx" ? XLSX_DOCUMENT_TYPES : PDF_DOCUMENT_TYPES;
  };

  const toggleDropdown = (fileIndex: number) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [fileIndex]: !prev[fileIndex]
    }));
  };

  const selectDocumentType = (fileIndex: number, type: string) => {
    updateFileMetadata(fileIndex, 'type', type);
    setOpenDropdowns(prev => ({
      ...prev,
      [fileIndex]: false
    }));
  };

  const goToNextFile = () => {
    if (currentFileIndex < selectedFiles.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    }
  };

  const goToPreviousFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  const goToFile = (index: number) => {
    setCurrentFileIndex(index);
  };

  const isCurrentFileValid = () => {
    const currentFile = selectedFiles[currentFileIndex];
    const metadata = fileMetadata[currentFileIndex];
    return metadata?.type && metadata.type.trim() !== '';
  };

  const areAllFilesValid = () => {
    if (selectedFiles.length === 0) return false;
    return selectedFiles.every((_, index) => {
      const metadata = fileMetadata[index];
      return metadata?.type && metadata.type.trim() !== '';
    });
  };

  const getFileCompletionStatus = (index: number) => {
    const metadata = fileMetadata[index];
    return metadata?.type && metadata.type.trim() !== '';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const removeSelectedFile = (indexToRemove: number) => {
    const newFiles = selectedFiles.filter(
      (_, index) => index !== indexToRemove
    );
    setSelectedFiles(newFiles);

    // Reindex metadata and sheet names
    const newMetadata: Record<number, FileMetadata> = {};
    const newSheetNames: Record<number, string[]> = {};
    const newReadingSheets: Record<number, boolean> = {};
    
    newFiles.forEach((file, newIndex) => {
      const oldIndex = selectedFiles.findIndex((f) => f === file);
      if (oldIndex !== -1) {
        if (fileMetadata[oldIndex]) {
          newMetadata[newIndex] = fileMetadata[oldIndex];
        }
        if (excelSheetNames[oldIndex]) {
          newSheetNames[newIndex] = excelSheetNames[oldIndex];
        }
        if (readingSheets[oldIndex]) {
          newReadingSheets[newIndex] = readingSheets[oldIndex];
        }
      }
    });
    
    setFileMetadata(newMetadata);
    setExcelSheetNames(newSheetNames);
    setReadingSheets(newReadingSheets);

    // Update file input
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      newFiles.forEach((file) => dt.items.add(file));
      fileInputRef.current.files = dt.files;
    }
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection({ target: { files } } as any);
    }
  };

  const validateForm = (): string | null => {
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const metadata = fileMetadata[i];
      const fileType = getFileTypeFromExtension(file.name);

      // Type is always required
      if (!metadata?.type) {
        return `File "${file.name}": Document type is required`;
      }

      // For XLSX files, additional validations
      if (fileType === "xlsx") {
        const sheet = metadata.xlsx_metadata?.sheets[0];
        if (!sheet?.sheet_name?.trim()) {
          return `File "${file.name}": Sheet name is required`;
        }
      }
    }
    return null;
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setFileMetadata({});
    setExcelSheetNames({});
    setReadingSheets({});
    setOpenDropdowns({});
    setCurrentFileIndex(0);
    setUploadError(null);
    setShowValidation(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFiles = async () => {
    setShowValidation(true);

    if (selectedFiles.length === 0 || !projectUuid) {
      setUploadError("Please select files to upload");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const getBackendUrl = (): string => {
        const envUrl = import.meta.env.VITE_BACKEND_URL;
        if (envUrl) {
          if (
            window.location.protocol === "https:" &&
            envUrl.startsWith("https:")
          ) {
            return envUrl.replace("https:", "https:");
          }
          return envUrl;
        }
        return window.location.protocol === "https:"
          ? "https://52.66.225.78:8000"
          : "https://kubera-backend.thetailoredai.co";
      };
      const baseUrl = getBackendUrl();

      // Upload files individually
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const metadata = fileMetadata[i];
        const fileType = getFileTypeFromExtension(file.name);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("document_type", metadata.type.toLowerCase());
        formData.append("project_id", projectUuid);

        if (metadata.description?.trim()) {
          formData.append("description", metadata.description.trim());
        }

        const response = await fetch(
          `${baseUrl}/ingest/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();

          // Handle authentication errors
          if (handleAuthError(errorData, response)) {
            throw new Error("Authentication failed");
          }

          if (errorData.detail && Array.isArray(errorData.detail)) {
            const errorMessages = errorData.detail
              .map((err: any) => {
                if (typeof err === "string") return err;
                if (err.msg) return err.msg;
                if (err.message) return err.message;
                return JSON.stringify(err);
              })
              .join(", ");
            throw new Error(
              `Failed to upload "${file.name}": ${errorMessages}`
            );
          } else if (errorData.detail) {
            throw new Error(
              `Failed to upload "${file.name}": ${errorData.detail}`
            );
          } else if (errorData.message) {
            throw new Error(
              `Failed to upload "${file.name}": ${errorData.message}`
            );
          } else {
            throw new Error(
              `Failed to upload "${file.name}" with status ${response.status}`
            );
          }
        }
      }

      onOpenChange(false);
      resetForm();

      toast({
        title: "Upload Successful",
        description: `${selectedFiles.length} file(s) uploaded successfully.`,
        variant: "default",
      });

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      // Handle authentication errors in catch block too
      if (handleAuthError(error)) {
        setUploadError("Authentication failed");
        toast({
          title: "Authentication Failed",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        return;
      }
      
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setUploadError(errorMessage);

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      style={{ 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      {/* Upload spinner overlay */}
      {uploading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm mx-4">
            <div className="relative mb-4">
              <Cloud className="h-12 w-12 text-black" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-black" />
              </div>
            </div>
            <div className="text-gray-800 font-semibold text-lg mb-2">Uploading files...</div>
            <div className="text-gray-600 text-sm text-center">Please wait while we process your documents</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div className="bg-black h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl mx-2 sm:mx-4">
        {/* Header */}
        <div className="bg-black px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-white relative">
          <button
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          
          <div className="flex items-center space-x-3 sm:space-x-4 pr-12">
            <div className="bg-white/20 p-2 sm:p-3 rounded-xl flex-shrink-0">
              <FolderPlus className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 truncate">Upload Documents</h3>
              <p className="text-gray-300 text-sm sm:text-base">Add PDF and Excel files to your project</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(95vh-200px)] pb-24">
          {/* Main Upload Area */}
          <div 
            className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center mb-6 sm:mb-8 transition-all duration-300 ${
              isDragOver 
                ? 'border-black bg-gray-50 scale-[1.02] shadow-lg' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isDragOver ? (
              <div className="animate-bounce">
                <div className="bg-black rounded-full p-4 sm:p-6 mx-auto mb-4 sm:mb-6 w-fit">
                  <FileUp className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-2 sm:mb-3">Drop files here!</h4>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Release to upload your documents</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-100 rounded-full p-6 sm:p-8 mx-auto mb-4 sm:mb-6 w-fit border-2 border-gray-200">
                  <Upload className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-700" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Drag & drop your files here
                </h4>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  or click below to browse and select files
                </p>
                
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploading}
                  className="bg-black hover:bg-gray-800 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Choose Files
                </button>
                
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  accept=".pdf,.xlsx"
                  style={{ display: "none" }}
                  onChange={handleFileSelection}
                />
              </>
            )}
            
            {/* File format info */}
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-gray-500">
                <FileText className="h-4 w-4 text-red-500" />
                <span className="text-xs sm:text-sm font-medium">PDF Documents</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <FileText className="h-4 w-4 text-green-500" />
                <span className="text-xs sm:text-sm font-medium">Excel Files</span>
              </div>
              <div className="text-xs text-gray-400">
                Max 50MB per file
              </div>
            </div>
          </div>

          {/* File Configuration Carousel */}
          {selectedFiles.length > 0 && (
            <div className="space-y-6">
              {/* Carousel Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900">Configure Your Files</h4>
                <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {currentFileIndex + 1} of {selectedFiles.length}
                </div>
              </div>

              {/* File Progress Indicators */}
              {selectedFiles.length > 1 && (
                <div className="flex justify-center space-x-2 mb-6">
                  {selectedFiles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToFile(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentFileIndex
                          ? 'bg-black scale-125'
                          : getFileCompletionStatus(index)
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Current File Configuration */}
              {selectedFiles[currentFileIndex] && (() => {
                const file = selectedFiles[currentFileIndex];
                const fileType = getFileTypeFromExtension(file.name);
                const availableTypes = getAvailableDocumentTypes(fileType);
                const selectedType = fileMetadata[currentFileIndex]?.type || '';
                const description = fileMetadata[currentFileIndex]?.description || '';

                return (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6">
                    {/* File Header */}
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0 pr-2">
                        <div className="flex-shrink-0">
                          <div className={`p-2 sm:p-3 rounded-xl ${
                            fileType === 'pdf' ? 'bg-red-100' : 'bg-green-100'
                          }`}>
                            <FileText className={`h-5 w-5 sm:h-6 sm:w-6 ${
                              fileType === 'pdf' ? 'text-red-600' : 'text-green-600'
                            }`} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 truncate" title={file.name}>{file.name}</h5>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                            <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                            <span className="uppercase font-medium">{fileType}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSelectedFile(currentFileIndex)}
                        className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        disabled={uploading}
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>

                    {/* Configuration Fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Document Type Selection */}
                      <div className="relative dropdown-container">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          Document Type <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => toggleDropdown(currentFileIndex)}
                          disabled={uploading}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all flex items-center justify-between ${
                            showValidation && !selectedType ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-gray-300 focus:border-black hover:border-gray-400'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <span className={`truncate ${selectedType ? 'text-gray-900' : 'text-gray-500'}`}>
                            {selectedType || 'Select document type'}
                          </span>
                          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${openDropdowns[currentFileIndex] ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {openDropdowns[currentFileIndex] && (
                          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {availableTypes.map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => selectDocumentType(currentFileIndex, type)}
                                className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors"
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {showValidation && !selectedType && (
                          <p className="text-red-500 text-xs mt-1">Document type is required</p>
                        )}
                      </div>

                      {/* Description Input */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          Description <span className="text-gray-500">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => updateFileMetadata(currentFileIndex, 'description', e.target.value)}
                          placeholder="Enter a brief description..."
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                          disabled={uploading}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Carousel Navigation */}
              {selectedFiles.length > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                  <button
                    onClick={goToPreviousFile}
                    disabled={currentFileIndex === 0 || uploading}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <ChevronDown className="h-4 w-4 rotate-90" />
                    <span>Previous</span>
                  </button>
                  
                  <div className="text-xs sm:text-sm text-gray-500 order-first sm:order-none">
                    {getFileCompletionStatus(currentFileIndex) ? (
                      <span className="text-green-600 font-medium">✓ Complete</span>
                    ) : (
                      <span className="text-amber-600 font-medium">⚠ Incomplete</span>
                    )}
                  </div>
                  
                  <button
                    onClick={goToNextFile}
                    disabled={currentFileIndex === selectedFiles.length - 1 || uploading}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <span>Next</span>
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                  </button>
                </div>
              )}

              {/* Validation Warning */}
              {!isCurrentFileValid() && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs sm:text-sm text-amber-800">
                      <p className="font-medium mb-1">Complete Required Information</p>
                      <p>Please select a document type for this file before uploading.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {uploadError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-red-700">
                  <p className="font-semibold mb-1 text-sm sm:text-base">Upload Error</p>
                  <pre className="text-xs sm:text-sm whitespace-pre-wrap overflow-x-auto">{uploadError}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-600">
              {selectedFiles.length > 0 ? (
                <span className="font-medium">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} ready to upload
                  {!areAllFilesValid() && (
                    <span className="text-amber-600 ml-2">
                      • Complete document types to enable upload
                    </span>
                  )}
                </span>
              ) : (
                <span>No files selected</span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
              <button 
                onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}
                disabled={uploading}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={uploadFiles}
                disabled={!areAllFilesValid() || uploading}
                className={`w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all transform shadow-lg text-sm sm:text-base ${
                  areAllFilesValid() && !uploading
                    ? 'bg-black hover:bg-gray-800 text-white hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="hidden sm:inline">Uploading...</span>
                    <span className="sm:hidden">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}</span>
                    <span className="sm:hidden">Upload {selectedFiles.length}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}