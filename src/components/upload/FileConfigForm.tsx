import { FileText, X, ChevronDown } from "lucide-react";

interface FileConfigFormProps {
  file: File;
  fileType: "pdf" | "xlsx";
  selectedType: string;
  description: string;
  availableTypes: string[];
  isDropdownOpen: boolean;
  showValidation: boolean;
  uploading: boolean;
  onRemoveFile: () => void;
  onToggleDropdown: () => void;
  onSelectType: (type: string) => void;
  onUpdateDescription: (description: string) => void;
}

export const FileConfigForm = ({
  file,
  fileType,
  selectedType,
  description,
  availableTypes,
  isDropdownOpen,
  showValidation,
  uploading,
  onRemoveFile,
  onToggleDropdown,
  onSelectType,
  onUpdateDescription,
}: FileConfigFormProps) => {
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
            <h5 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 truncate" title={file.name}>
              {file.name}
            </h5>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
              <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              <span className="uppercase font-medium">{fileType}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onRemoveFile}
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
            onClick={onToggleDropdown}
            disabled={uploading}
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all flex items-center justify-between ${
              showValidation && !selectedType ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-gray-300 focus:border-black hover:border-gray-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className={`truncate ${selectedType ? 'text-gray-900' : 'text-gray-500'}`}>
              {selectedType || 'Select document type'}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {availableTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onSelectType(type)}
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
            onChange={(e) => onUpdateDescription(e.target.value)}
            placeholder="Enter a brief description..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
            disabled={uploading}
          />
        </div>
      </div>
    </div>
  );
};