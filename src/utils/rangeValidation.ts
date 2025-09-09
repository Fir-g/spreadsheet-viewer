import { SpreadsheetRange } from '../types/spreadsheet';

export function doRangesOverlap(range1: SpreadsheetRange, range2: SpreadsheetRange): boolean {
  // Ranges can only overlap if they're on the same sheet
  if (range1.sheetIndex !== range2.sheetIndex) {
    return false;
  }

  // Check if ranges overlap in both dimensions (rows AND columns)
  const rowOverlap = !(range1.rowEnd < range2.rowStart || range2.rowEnd < range1.rowStart);
  const colOverlap = !(range1.colEnd < range2.colStart || range2.colEnd < range1.colStart);

  return rowOverlap && colOverlap;
}

export function validateNewRange(
  newRange: Omit<SpreadsheetRange, 'id'>, 
  existingRanges: SpreadsheetRange[]
): { isValid: boolean; conflictingRanges: SpreadsheetRange[]; message?: string } {
  // Create a temporary range with ID for validation
  const tempRange: SpreadsheetRange = { ...newRange, id: 'temp' };
  
  // Validate range bounds
  if (newRange.rowStart > newRange.rowEnd || newRange.colStart > newRange.colEnd) {
    return {
      isValid: false,
      conflictingRanges: [],
      message: 'Invalid range: start values must be less than or equal to end values'
    };
  }

  if (newRange.rowStart < 0 || newRange.colStart < 0) {
    return {
      isValid: false,
      conflictingRanges: [],
      message: 'Invalid range: row and column values must be non-negative'
    };
  }

  // Check for overlaps with existing ranges
  const conflictingRanges = existingRanges.filter(existingRange => 
    doRangesOverlap(tempRange, existingRange)
  );

  if (conflictingRanges.length > 0) {
    return {
      isValid: false,
      conflictingRanges,
      message: `Range overlaps with existing range(s): ${conflictingRanges.map(r => r.name).join(', ')}`
    };
  }

  return { isValid: true, conflictingRanges: [] };
}

export function generateRangeId(): string {
  return `range_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}