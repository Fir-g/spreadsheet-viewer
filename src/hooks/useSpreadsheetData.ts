import { useState, useCallback } from 'react';
import { SpreadsheetData, SpreadsheetRange, SpreadsheetSheet } from '../types/spreadsheet';
import { validateNewRange, generateRangeId } from '../utils/rangeValidation';

const DEFAULT_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export function useSpreadsheetData() {
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>({
    name: 'xyz',
    sheets: [
      { name: 'x-2', index: 0, ranges: [] },
      { 
        name: 'x-3', 
        index: 1, 
        ranges: [{
          id: 'demo_range_1',
          name: 'Demo Range',
          rowStart: 2,
          rowEnd: 10,
          colStart: 3,
          colEnd: 13,
          sheetIndex: 1,
          color: '#3B82F6'
        }]
      },
      { name: 'x-4', index: 2, ranges: [] },
      { name: 'x-5', index: 3, ranges: [] },
    ]
  });

  const addRange = useCallback((range: Omit<SpreadsheetRange, 'id'>) => {
    const allRanges = spreadsheetData.sheets.flatMap(sheet => sheet.ranges);
    const validation = validateNewRange(range, allRanges);
    
    if (!validation.isValid) {
      return { success: false, message: validation.message, conflictingRanges: validation.conflictingRanges };
    }

    const newRange: SpreadsheetRange = {
      ...range,
      id: generateRangeId(),
      color: range.color || DEFAULT_COLORS[allRanges.length % DEFAULT_COLORS.length]
    };

    setSpreadsheetData(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet => 
        sheet.index === range.sheetIndex 
          ? { ...sheet, ranges: [...sheet.ranges, newRange] }
          : sheet
      )
    }));

    return { success: true, range: newRange };
  }, [spreadsheetData]);

  const removeRange = useCallback((rangeId: string, sheetIndex: number) => {
    setSpreadsheetData(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet => 
        sheet.index === sheetIndex
          ? { ...sheet, ranges: sheet.ranges.filter(r => r.id !== rangeId) }
          : sheet
      )
    }));
  }, []);

  const updateRange = useCallback((rangeId: string, updates: Partial<SpreadsheetRange>) => {
    setSpreadsheetData(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet => ({
        ...sheet,
        ranges: sheet.ranges.map(range => 
          range.id === rangeId ? { ...range, ...updates } : range
        )
      }))
    }));
  }, []);

  const saveToJSON = useCallback(() => {
    return JSON.stringify(spreadsheetData, null, 2);
  }, [spreadsheetData]);

  const loadFromJSON = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      setSpreadsheetData(data);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Invalid JSON format' };
    }
  }, []);

  const loadFromSpreadsheet = useCallback((data: SpreadsheetData): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      try {
        setSpreadsheetData(data);
        resolve({ success: true });
      } catch (error) {
        resolve({ success: false, message: 'Failed to load spreadsheet data' });
      }
    });
  }, []);

  return {
    spreadsheetData,
    addRange,
    removeRange,
    updateRange,
    saveToJSON,
    loadFromJSON,
    loadFromSpreadsheet,
    setSpreadsheetData
  };
}