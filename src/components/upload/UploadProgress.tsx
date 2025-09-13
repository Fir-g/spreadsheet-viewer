import { Cloud, Loader2 } from "lucide-react";

interface UploadProgressProps {
  visible: boolean;
}

export const UploadProgress = ({ visible }: UploadProgressProps) => {
  if (!visible) return null;

  return (
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
  );
};