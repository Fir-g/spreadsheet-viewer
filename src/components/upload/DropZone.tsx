import { DragEvent, useRef } from "react";
import { Upload, FileUp, Plus, FileText } from "lucide-react";

interface DropZoneProps {
  isDragOver: boolean;
  uploading: boolean;
  onDragEnter: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DropZone = ({
  isDragOver,
  uploading,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
}: DropZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center mb-6 sm:mb-8 transition-all duration-300 ${
        isDragOver 
          ? 'border-black bg-gray-50 scale-[1.02] shadow-lg' 
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
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
            onChange={onFileSelect}
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
  );
};