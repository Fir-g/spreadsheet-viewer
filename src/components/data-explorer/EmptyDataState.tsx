import { Database } from "lucide-react";

interface EmptyDataStateProps {
  selectedFileId: string;
}

export const EmptyDataState = ({ selectedFileId }: EmptyDataStateProps) => {
  return (
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
  );
};