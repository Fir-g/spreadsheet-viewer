import React from 'react';
import { Trash2 } from 'lucide-react';
import { SpreadsheetRange } from '../types/spreadsheet';

interface RangeListProps {
  ranges: SpreadsheetRange[];
  sheetNames: Record<number, string>;
  onRemoveRange: (rangeId: string, sheetIndex: number) => void;
}

export function RangeList({ ranges, sheetNames, onRemoveRange }: RangeListProps) {
  if (ranges.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No ranges defined yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Ranges</h3>
      {ranges.map((range) => (
        <div
          key={range.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: range.color }}
                />
                <h4 className="font-medium text-gray-900">{range.name}</h4>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Sheet: {sheetNames[range.sheetIndex]}</div>
                <div>
                  Rows: {range.rowStart} - {range.rowEnd} ({range.rowEnd - range.rowStart + 1} rows)
                </div>
                <div>
                  Columns: {range.colStart} - {range.colEnd} ({range.colEnd - range.colStart + 1} cols)
                </div>
              </div>
            </div>
            <button
              onClick={() => onRemoveRange(range.id, range.sheetIndex)}
              className="text-red-500 hover:text-red-700 transition-colors p-1"
              title="Remove range"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}