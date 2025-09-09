import React, { useEffect, useRef, useState } from 'react';
import { SpreadsheetData } from '../types/spreadsheet';

interface SpreadsheetViewerProps {
  data: SpreadsheetData;
}

// Simple spreadsheet viewer since fortune-sheet has complex setup requirements
export function SpreadsheetViewer({ data }: SpreadsheetViewerProps) {
  // Initialize with the first available sheet index, defaulting to 0
  const [activeSheetIndex, setActiveSheetIndex] = useState(() => {
    if (!data?.sheets || data.sheets.length === 0) return 0;
    // Try to find sheet with index 1 first (x-3 with demo data), otherwise use first sheet
    const hasSheetAtIndex1 = data.sheets.some(sheet => sheet.index === 1);
    return hasSheetAtIndex1 ? 1 : data.sheets[0].index;
  });

  // Safety check for data and sheets
  if (!data || !data.sheets || data.sheets.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-center text-gray-500">
          No spreadsheet data available
        </div>
      </div>
    );
  }

  // Find the active sheet, fallback to first sheet if not found
  const activeSheet = data.sheets.find(sheet => sheet.index === activeSheetIndex) || data.sheets[0];

  // Generate sample data for visualization
  const getDisplayData = () => {
    // Use actual data if available, otherwise generate sample data
    if (activeSheet?.data && activeSheet.data.length > 0) {
      return activeSheet.data;
    }
    
    // Generate sample data for visualization
    return Array.from({ length: 20 }, (_, i) =>
      Array.from({ length: 15 }, (_, j) => `${String.fromCharCode(65 + j)}${i + 1}`)
    );
  };

  const displayData = getDisplayData();
  const maxCols = Math.max(15, displayData[0]?.length || 15);

  const getCellStyle = (row: number, col: number) => {
    if (!activeSheet?.ranges) return {};
    
    const range = activeSheet.ranges.find(r => 
      row >= r.rowStart && row <= r.rowEnd && 
      col >= r.colStart && col <= r.colEnd
    );

    if (range) {
      return {
        backgroundColor: range.color + '20', // Add transparency
        border: `2px solid ${range.color}`,
      };
    }

    return {};
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{data.name}</h2>
        
        {/* Sheet tabs */}
        <div className="flex space-x-1">
          {data.sheets.map((sheet) => (
            <button
              key={sheet.index}
              onClick={() => setActiveSheetIndex(sheet.index)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeSheetIndex === sheet.index
                  ? 'bg-white text-blue-600 border border-gray-200 border-b-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sheet.name}
              {sheet.ranges && sheet.ranges.length > 0 && (
                <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {sheet.ranges.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="overflow-auto max-h-96 border border-gray-200 rounded">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="w-12 h-8 text-xs font-medium text-gray-500 border-r border-gray-200"></th>
                {Array.from({ length: maxCols }, (_, i) => (
                  <th key={i} className="w-16 h-8 text-xs font-medium text-gray-500 border-r border-gray-200">
                    {String.fromCharCode(65 + i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="w-12 h-8 text-xs text-gray-500 bg-gray-50 border-r border-b border-gray-200 text-center">
                    {rowIndex + 1}
                  </td>
                  {Array.from({ length: maxCols }, (_, colIndex) => (
                    <td
                      key={colIndex}
                      className="w-16 h-8 text-xs text-gray-700 border-r border-b border-gray-200 text-center relative"
                      style={getCellStyle(rowIndex, colIndex)}
                    >
                      {row[colIndex] || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Range legend */}
        {activeSheet?.ranges && activeSheet.ranges.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Active Ranges</h4>
            <div className="flex flex-wrap gap-2">
              {activeSheet.ranges.map((range) => (
                <div key={range.id} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: range.color }}
                  />
                  <span className="text-gray-700">{range.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}