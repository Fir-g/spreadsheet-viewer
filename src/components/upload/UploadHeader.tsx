import { X, FolderPlus } from "lucide-react";

interface UploadHeaderProps {
  onClose: () => void;
}

export const UploadHeader = ({ onClose }: UploadHeaderProps) => {
  return (
    <div className="bg-black px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-white relative">
      <button
        onClick={onClose}
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
  );
};