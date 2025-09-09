import { doRangesOverlap, validateNewRange, generateRangeId } from '../utils/rangeValidation';
import { SpreadsheetRange } from '../types/spreadsheet';

describe('doRangesOverlap', () => {
  const createRange = (rowStart: number, rowEnd: number, colStart: number, colEnd: number, sheetIndex = 0): SpreadsheetRange => ({
    id: 'test',
    name: 'Test Range',
    rowStart,
    rowEnd,
    colStart,
    colEnd,
    sheetIndex
  });

  test('should return false for non-overlapping ranges', () => {
    const range1 = createRange(0, 2, 0, 2);
    const range2 = createRange(3, 5, 3, 5);
    expect(doRangesOverlap(range1, range2)).toBe(false);
  });

  test('should return true for overlapping ranges', () => {
    const range1 = createRange(0, 3, 0, 3);
    const range2 = createRange(2, 5, 2, 5);
    expect(doRangesOverlap(range1, range2)).toBe(true);
  });

  test('should return false for ranges on different sheets', () => {
    const range1 = createRange(0, 3, 0, 3, 0);
    const range2 = createRange(2, 5, 2, 5, 1);
    expect(doRangesOverlap(range1, range2)).toBe(false);
  });

  test('should return false for ranges overlapping only in rows', () => {
    const range1 = createRange(0, 3, 0, 2);
    const range2 = createRange(2, 5, 3, 5);
    expect(doRangesOverlap(range1, range2)).toBe(false);
  });

  test('should return false for ranges overlapping only in columns', () => {
    const range1 = createRange(0, 2, 0, 3);
    const range2 = createRange(3, 5, 2, 5);
    expect(doRangesOverlap(range1, range2)).toBe(false);
  });

  test('should return true for identical ranges', () => {
    const range1 = createRange(0, 3, 0, 3);
    const range2 = createRange(0, 3, 0, 3);
    expect(doRangesOverlap(range1, range2)).toBe(true);
  });

  test('should return true for nested ranges', () => {
    const range1 = createRange(0, 5, 0, 5);
    const range2 = createRange(2, 3, 2, 3);
    expect(doRangesOverlap(range1, range2)).toBe(true);
  });
});

describe('validateNewRange', () => {
  const existingRanges: SpreadsheetRange[] = [
    {
      id: '1',
      name: 'Range 1',
      rowStart: 2,
      rowEnd: 10,
      colStart: 3,
      colEnd: 13,
      sheetIndex: 1
    },
    {
      id: '2',
      name: 'Range 2',
      rowStart: 15,
      rowEnd: 20,
      colStart: 5,
      colEnd: 10,
      sheetIndex: 1
    }
  ];

  test('should validate non-overlapping range as valid', () => {
    const newRange = {
      name: 'New Range',
      rowStart: 0,
      rowEnd: 1,
      colStart: 0,
      colEnd: 1,
      sheetIndex: 1
    };

    const result = validateNewRange(newRange, existingRanges);
    expect(result.isValid).toBe(true);
    expect(result.conflictingRanges).toEqual([]);
  });

  test('should reject overlapping range', () => {
    const newRange = {
      name: 'Overlapping Range',
      rowStart: 5,
      rowEnd: 15,
      colStart: 8,
      colEnd: 18,
      sheetIndex: 1
    };

    const result = validateNewRange(newRange, existingRanges);
    expect(result.isValid).toBe(false);
    expect(result.conflictingRanges).toHaveLength(1);
    expect(result.conflictingRanges[0].name).toBe('Range 1');
  });

  test('should reject invalid bounds (start > end)', () => {
    const newRange = {
      name: 'Invalid Range',
      rowStart: 5,
      rowEnd: 3,
      colStart: 0,
      colEnd: 1,
      sheetIndex: 1
    };

    const result = validateNewRange(newRange, existingRanges);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Invalid range');
  });

  test('should reject negative values', () => {
    const newRange = {
      name: 'Negative Range',
      rowStart: -1,
      rowEnd: 1,
      colStart: 0,
      colEnd: 1,
      sheetIndex: 1
    };

    const result = validateNewRange(newRange, existingRanges);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('non-negative');
  });

  test('should allow range on different sheet', () => {
    const newRange = {
      name: 'Different Sheet Range',
      rowStart: 2,
      rowEnd: 10,
      colStart: 3,
      colEnd: 13,
      sheetIndex: 0 // Different sheet
    };

    const result = validateNewRange(newRange, existingRanges);
    expect(result.isValid).toBe(true);
    expect(result.conflictingRanges).toEqual([]);
  });
});

describe('generateRangeId', () => {
  test('should generate unique IDs', () => {
    const id1 = generateRangeId();
    const id2 = generateRangeId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^range_\d+_[a-z0-9]+$/);
    expect(id2).toMatch(/^range_\d+_[a-z0-9]+$/);
  });
});