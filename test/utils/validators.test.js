import { describe, test, expect } from '@jest/globals';
import {
  validateIntervalFormat,
  validateIntervalString,
  validateFileInput,
  isFilePath,
  validateCliArgs
} from '../../src/utils/validators.js';

describe('Validator Utilities', () => {
  describe('validateIntervalFormat', () => {
    test('validates correct basic interval', () => {
      const result = validateIntervalFormat('10-100');

      expect(result.valid).toBe(true);
    });

    test('validates negative intervals', () => {
      const result = validateIntervalFormat('-100--10');

      expect(result.valid).toBe(true);
    });

    test('validates single point interval', () => {
      const result = validateIntervalFormat('50-50');

      expect(result.valid).toBe(true);
    });

    test('validates with whitespace', () => {
      const result = validateIntervalFormat(' 10 - 100 ');

      expect(result.valid).toBe(true);
    });

    test('validates large numbers', () => {
      const result = validateIntervalFormat('1000000-2000000');

      expect(result.valid).toBe(true);
    });

    test('accepts empty string as valid', () => {
      const result = validateIntervalFormat('');

      expect(result.valid).toBe(true);
    });

    test('accepts null and undefined as valid', () => {
      expect(validateIntervalFormat(null).valid).toBe(true);
      expect(validateIntervalFormat(undefined).valid).toBe(true);
    });

    test('rejects invalid format', () => {
      const result = validateIntervalFormat('invalid');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid format');
    });

    test('rejects single number', () => {
      const result = validateIntervalFormat('10');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid format');
    });

    test('rejects incomplete intervals', () => {
      expect(validateIntervalFormat('10-').valid).toBe(false);
      expect(validateIntervalFormat('-100').valid).toBe(false);
    });

    test('rejects non-numeric values', () => {
      const result = validateIntervalFormat('abc-def');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid format');
    });

    test('rejects start > end', () => {
      const result = validateIntervalFormat('100-10');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Start (100) cannot be greater than end (10)');
    });

    test('handles integer overflow', () => {
      const result = validateIntervalFormat('999999999999999999999-1000000000000000000000');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Numbers too large');
    });

    test('provides detailed error messages', () => {
      const result = validateIntervalFormat('invalid-format');

      expect(result.error).toContain('"invalid-format"');
    });
  });

  describe('validateIntervalString', () => {
    test('validates multiple correct intervals', () => {
      const result = validateIntervalString('10-100,200-300,400-500');

      expect(result.valid).toBe(true);
    });

    test('validates single interval', () => {
      const result = validateIntervalString('10-100');

      expect(result.valid).toBe(true);
    });

    test('accepts empty string', () => {
      const result = validateIntervalString('');

      expect(result.valid).toBe(true);
    });

    test('accepts whitespace-only string', () => {
      const result = validateIntervalString('   ');

      expect(result.valid).toBe(true);
    });

    test('handles null and undefined', () => {
      expect(validateIntervalString(null).valid).toBe(true);
      expect(validateIntervalString(undefined).valid).toBe(true);
    });

    test('validates with extra whitespace', () => {
      const result = validateIntervalString(' 10-100 , 200-300 , ');

      expect(result.valid).toBe(true);
    });

    test('rejects invalid interval in sequence', () => {
      const result = validateIntervalString('10-100,invalid,200-300');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Interval 2');
    });

    test('rejects all invalid intervals', () => {
      const result = validateIntervalString('invalid1,invalid2');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Interval 1');
    });

    test('provides specific interval number in error', () => {
      const result = validateIntervalString('10-100,200-300,bad-interval,400-500');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Interval 3');
    });

    test('handles empty intervals in sequence', () => {
      const result = validateIntervalString('10-100,,200-300');

      expect(result.valid).toBe(true);
    });
  });

  describe('validateFileInput', () => {
    describe('Single Object Format', () => {
      test('validates correct single object with arrays and strings', () => {
        // Test with arrays
        const dataWithArrays = {
          includes: ['10-100', '200-300'],
          excludes: ['20-30']
        };
        expect(validateFileInput(dataWithArrays).valid).toBe(true);

        // Test with strings
        const dataWithStrings = {
          includes: '10-100,200-300',
          excludes: '20-30'
        };
        expect(validateFileInput(dataWithStrings).valid).toBe(true);
      });

      test('validates object without excludes', () => {
        const data = {
          includes: ['10-100']
        };
        const result = validateFileInput(data);

        expect(result.valid).toBe(true);
      });

      test('validates object with empty excludes', () => {
        const data = {
          includes: ['10-100'],
          excludes: []
        };
        const result = validateFileInput(data);
        
        expect(result.valid).toBe(true);
      });

      test('rejects object without includes', () => {
        const data = {
          excludes: ['20-30']
        };
        const result = validateFileInput(data);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('must contain "includes" field');
      });

      test('rejects object with invalid includes type', () => {
        const data = {
          includes: 123,
          excludes: ['20-30']
        };
        const result = validateFileInput(data);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('includes must be a string or array of strings');
      });

      test('rejects object with invalid excludes type', () => {
        const data = {
          includes: ['10-100'],
          excludes: 123
        };
        const result = validateFileInput(data);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('excludes must be a string or array of strings');
      });

      test('rejects object with invalid interval format in includes', () => {
        const data = {
          includes: ['invalid-interval'],
          excludes: ['20-30']
        };
        const result = validateFileInput(data);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid includes');
      });

      test('rejects object with invalid interval format in excludes', () => {
        const data = {
          includes: ['10-100'],
          excludes: ['invalid-interval']
        };
        const result = validateFileInput(data);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid excludes');
      });
    });

    describe('Array of Objects Format', () => {
      test('validates correct array of objects', () => {
        const data = [
          {
            includes: ['10-100'],
            excludes: ['20-30']
          },
          {
            includes: ['200-300'],
            excludes: []
          }
        ];
        const result = validateFileInput(data);

        expect(result.valid).toBe(true);
      });

      test('validates array with mixed string and array formats', () => {
        const data = [
          {
            includes: '10-100,200-300',
            excludes: '20-30'
          },
          {
            includes: ['400-500'],
            excludes: ['450-460']
          }
        ];
        const result = validateFileInput(data);

        expect(result.valid).toBe(true);
      });

      test('validates array with single object', () => {
        const data = [
          {
            includes: ['10-100'],
            excludes: ['20-30']
          }
        ];
        const result = validateFileInput(data);

        expect(result.valid).toBe(true);
      });

      test('rejects empty array', () => {
        const data = [];
        const result = validateFileInput(data);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Input array cannot be empty');
      });

      test('rejects array with invalid object', () => {
        const data = [
          {
            includes: ['10-100']
          },
          {
            excludes: ['20-30'] // Missing includes
          }
        ];
        const result = validateFileInput(data);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Array[2]: Array item 2 must contain');
      });

      test('rejects array with non-object item', () => {
        const data = [
          'not an object'
        ];
        const result = validateFileInput(data);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Array[1]: Array item 1 must be an object');
      });

      test('rejects array with null item', () => {
        const data = [
          null
        ];
        const result = validateFileInput(data);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Array[1]: Array item 1 must be an object');
      });

      test('provides correct item number in error', () => {
        const data = [
          { includes: ['10-100'] }, // Valid
          { includes: ['200-300'] }, // Valid
          { excludes: ['20-30'] }    // Invalid - no includes
        ];
        const result = validateFileInput(data);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Array[3]:');
      });
    });

    describe('General Input Validation', () => {
      test('rejects null input', () => {
        const result = validateFileInput(null);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('valid JSON');
      });

      test('rejects undefined input', () => {
        const result = validateFileInput(undefined);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('valid JSON');
      });

      test('rejects string input', () => {
        const result = validateFileInput('string');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('valid JSON');
      });

      test('rejects number input', () => {
        const result = validateFileInput(123);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('valid JSON');
      });

      test('rejects boolean input', () => {
        const result = validateFileInput(true);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('valid JSON');
      });
    });
  });

  describe('isFilePath', () => {
    test('detects json file paths', () => {
      expect(isFilePath('input.json')).toBe(true);
      expect(isFilePath('/path/to/file.json')).toBe(true);
      expect(isFilePath('../data.json')).toBe(true);
    });

    test('rejects non-json paths', () => {
      expect(isFilePath('file.txt')).toBe(false);
      expect(isFilePath('file')).toBe(false);
      expect(isFilePath('/path/to/file')).toBe(false);
    });

    test('handles null and undefined', () => {
      expect(isFilePath(null)).toBe(false);
      expect(isFilePath(undefined)).toBe(false);
    });

    test('handles empty string', () => {
      expect(isFilePath('')).toBe(false);
    });
  });

  describe('validateCliArgs', () => {
    test('validates correct direct arguments', () => {
      const result = validateCliArgs('10-100', '20-30', null);

      expect(result.valid).toBe(true);
    });

    test('validates arguments without excludes', () => {
      const result = validateCliArgs('10-100', '', null);

      expect(result.valid).toBe(true);
      
      const result2 = validateCliArgs('10-100', null, null);

      expect(result2.valid).toBe(true);
    });

    test('validates file mode', () => {
      const result = validateCliArgs(null, null, 'input.json');

      expect(result.valid).toBe(true);
    });

    test('rejects missing includes without file', () => {
      const result = validateCliArgs('', '', null);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Must provide includes parameter or file');
    });

    test('rejects invalid includes format', () => {
      const result = validateCliArgs('invalid-format', '', null);

      expect(result.valid).toBe(false);
    });

    test('rejects invalid excludes format', () => {
      const result = validateCliArgs('10-100', 'invalid-format', null);

      expect(result.valid).toBe(false);
    });

    test('rejects non-json file extension', () => {
      const result = validateCliArgs(null, null, 'file.txt');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('File must have .json extension');
    });

    test('accepts file without content validation', () => {
      const result = validateCliArgs(null, null, 'valid.json');

      expect(result.valid).toBe(true);
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    test('handles deeply nested invalid intervals', () => {
      const result = validateIntervalString('10-100,200-300,invalid1,400-500,invalid2,600-700');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Interval 3'); // First error
    });

    test('handles whitespace-only interval strings', () => {
      const result = validateIntervalString('10-100,   ,200-300');

      expect(result.valid).toBe(true);
    });

    test('validates complex array scenarios', () => {
      const data = [
        {
          includes: ['10-100', '200-300', '400-500'],
          excludes: ['50-60', '250-260', '450-460']
        },
        {
          includes: '1000-2000,3000-4000',
          excludes: '1500-1600'
        },
        {
          includes: ['5000-6000']
          // No excludes property
        }
      ];
      const result = validateFileInput(data);

      expect(result.valid).toBe(true);
    });

    test('provides clear error context for arrays', () => {
      const data = [
        { includes: ['10-100'] },
        { includes: ['invalid-interval'] },
        { includes: ['300-400'] }
      ];
      const result = validateFileInput(data);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Array[2]: Array item 2: Invalid includes');
    });
  });
});
