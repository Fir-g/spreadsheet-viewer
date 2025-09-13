import { useState, useRef, useEffect, DragEvent } from "react";
import { Loader2, AlertCircle, Upload, ChevronDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { fileService } from '@/services';
import * as XLSX from 'xlsx';
import { UploadHeader, DropZone, FileConfigForm, UploadProgress } from "./upload";

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
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  // Document types for different file formats
  const PDF_DOCUMENT_TYPES = ["DDQ", "LPA", "PPM"];
  const XLSX_DOCUMENT_TYPES = ["Summary", "Cashflows"];

  const ALLOWED_TYPES = ['.pdf', '.xlsx'];

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

    const validation = fileService.validateFileList(fileList);
    if (!validation.isValid) {
      setUploadError(validation.error!);
      toast({
        title: "Invalid Files",
        description: validation.error!,
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
      // Upload files individually
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const metadata = fileMetadata[i];
        
        await fileService.uploadFile({
          file,
          document_type: metadata.type.toLowerCase(),
          project_id: projectUuid,
          description: metadata.description?.trim(),
        });
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
      <UploadProgress visible={uploading} />

      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl mx-2 sm:mx-4">
        <UploadHeader onClose={() => {
          onOpenChange(false);
          resetForm();
        }} />

        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(95vh-200px)] pb-24">
          <DropZone
            isDragOver={isDragOver}
            uploading={uploading}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onFileSelect={handleFileSelection}
          />

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
                  <FileConfigForm
                    file={file}
                    fileType={fileType}
                    selectedType={selectedType}
                    description={description}
                    availableTypes={availableTypes}
                    isDropdownOpen={openDropdowns[currentFileIndex] || false}
                    showValidation={showValidation}
                    uploading={uploading}
                    onRemoveFile={() => removeSelectedFile(currentFileIndex)}
                    onToggleDropdown={() => toggleDropdown(currentFileIndex)}
                    onSelectType={(type) => selectDocumentType(currentFileIndex, type)}
                    onUpdateDescription={(desc) => updateFileMetadata(currentFileIndex, 'description', desc)}
                  />
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