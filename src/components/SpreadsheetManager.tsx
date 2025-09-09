import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useSpreadsheetData } from '../hooks/useSpreadsheetData';
import { RangeInput } from './RangeInput';
import { RangeList } from './RangeList';
import { FileUpload } from './FileUpload';
import { SpreadsheetViewer } from './SpreadsheetViewer';

export function SpreadsheetManager() {
  const {
    spreadsheetData,
    addRange,
    removeRange,
    saveToJSON,
    loadFromSpreadsheet
  } = useSpreadsheetData();

  const allRanges = spreadsheetData.sheets.flatMap(sheet => sheet.ranges);
  const sheetNames = Object.fromEntries(
    spreadsheetData.sheets.map(sheet => [sheet.index, sheet.name])
  );

  const handleAddRange = (range: Parameters<typeof addRange>[0]) => {
    const result = addRange(range);
    if (result.success) {
      toast.success(`Range "${range.name}" added successfully!`);
    } else {
      toast.error(result.message || 'Failed to add range');
    }
    return result;
  };

  const handleRemoveRange = (rangeId: string, sheetIndex: number) => {
    removeRange(rangeId, sheetIndex);
    toast.success('Range removed successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Spreadsheet Range Manager</h1>
          <p className="text-gray-600 mt-2">
            Manage and visualize selected ranges across multiple spreadsheet sheets
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left panel - Controls */}
          <div className="xl:col-span-1 space-y-6">
            <RangeInput 
              onAddRange={handleAddRange}
              sheets={spreadsheetData.sheets.map(s => ({ name: s.name, index: s.index }))}
            />
            
            <FileUpload 
              onLoadFile={loadFromSpreadsheet}
              onSaveFile={saveToJSON}
              currentData={spreadsheetData}
            />
            
            <RangeList 
              ranges={allRanges}
              sheetNames={sheetNames}
              onRemoveRange={handleRemoveRange}
            />
          </div>

          {/* Right panel - Spreadsheet viewer */}
          <div className="xl:col-span-2">
            <SpreadsheetViewer data={spreadsheetData} />
          </div>
        </div>
      </div>
    </div>
  );
}