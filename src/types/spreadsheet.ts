export interface SpreadsheetRange {
  id: string;
  name: string;
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
  sheetIndex: number;
  color?: string;
}

export interface SpreadsheetSheet {
  name: string;
  index: number;
  data?: any[][];
  ranges: SpreadsheetRange[];
}

export interface SpreadsheetData {
  name: string;
  sheets: SpreadsheetSheet[];
}

export interface RangeValidationResult {
  isValid: boolean;
  conflictingRanges?: SpreadsheetRange[];
  message?: string;
}