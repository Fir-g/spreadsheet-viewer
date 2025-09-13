import { Button } from "@/components/ui/button";
import { Download, Grid3X3, TableIcon, LayoutGrid } from "lucide-react";

interface DataExplorerHeaderProps {
  viewMode: 'explorer' | 'table' | 'cards';
  onViewModeChange: (mode: 'explorer' | 'table' | 'cards') => void;
  onExport: () => void;
  canExport: boolean;
}

export const DataExplorerHeader = ({
  viewMode,
  onViewModeChange,
  onExport,
  canExport,
}: DataExplorerHeaderProps) => {
  return (
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
              onClick={() => onViewModeChange('explorer')}
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
              onClick={() => onViewModeChange('table')}
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
              onClick={() => onViewModeChange('cards')}
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
          
          {canExport && (
            <Button 
              onClick={onExport}
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
  );
};