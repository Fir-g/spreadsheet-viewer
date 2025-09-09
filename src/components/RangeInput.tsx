import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SpreadsheetRange } from '../types/spreadsheet';

interface RangeInputProps {
  onAddRange: (range: Omit<SpreadsheetRange, 'id'>) => { success: boolean; message?: string; conflictingRanges?: SpreadsheetRange[] };
  sheets: Array<{ name: string; index: number }>;
}

export function RangeInput({ onAddRange, sheets }: RangeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rowStart: '',
    rowEnd: '',
    colStart: '',
    colEnd: '',
    sheetIndex: 0,
    color: '#3B82F6'
  });
  const [error, setError] = useState<string>('');

  const resetForm = () => {
    setFormData({
      name: '',
      rowStart: '',
      rowEnd: '',
      colStart: '',
      colEnd: '',
      sheetIndex: 0,
      color: '#3B82F6'
    });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const range = {
      name: formData.name,
      rowStart: parseInt(formData.rowStart),
      rowEnd: parseInt(formData.rowEnd),
      colStart: parseInt(formData.colStart),
      colEnd: parseInt(formData.colEnd),
      sheetIndex: formData.sheetIndex,
      color: formData.color
    };

    const result = onAddRange(range);
    
    if (result.success) {
      resetForm();
      setIsOpen(false);
    } else {
      setError(result.message || 'Failed to add range');
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus size={20} />
        New Range
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Add New Range</h3>
        <button
          onClick={() => { setIsOpen(false); resetForm(); }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Range Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter range name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sheet
          </label>
          <select
            value={formData.sheetIndex}
            onChange={(e) => handleInputChange('sheetIndex', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sheets.map((sheet) => (
              <option key={sheet.index} value={sheet.index}>
                {sheet.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Row Start
            </label>
            <input
              type="number"
              value={formData.rowStart}
              onChange={(e) => handleInputChange('rowStart', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Row End
            </label>
            <input
              type="number"
              value={formData.rowEnd}
              onChange={(e) => handleInputChange('rowEnd', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Column Start
            </label>
            <input
              type="number"
              value={formData.colStart}
              onChange={(e) => handleInputChange('colStart', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Column End
            </label>
            <input
              type="number"
              value={formData.colEnd}
              onChange={(e) => handleInputChange('colEnd', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Range
          </button>
          <button
            type="button"
            onClick={() => { setIsOpen(false); resetForm(); }}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}