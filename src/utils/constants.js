export const REGEX_PATTERNS = {
  // Basic interval format: optional negative sign, digits, dash, optional negative sign, digits
  INTERVAL_FORMAT: /^-?\d+\s*-\s*-?\d+$/,
  // Interval parsing: capture groups for start and end numbers
  INTERVAL_PARSE: /^(-?\d+)\s*-\s*(-?\d+)$/,
  // Check if string is only whitespace
  WHITESPACE_ONLY: /^\s*$/,
  // JSON file extension
  JSON_FILE: /\.json$/i
};

// Error message templates
export const ERROR_MESSAGES = {
  INVALID_FORMAT: (str) => `Invalid format: "${str}". Expected: "start-end" (e.g., "10-100")`,
  CANNOT_PARSE: (str) => `Cannot parse interval: "${str}"`,
  NUMBERS_TOO_LARGE: (str) => `Numbers too large in interval: "${str}"`,
  START_GREATER_THAN_END: (start, end) => `Start (${start}) cannot be greater than end (${end})`,
  EMPTY_INTERVAL: () => 'Empty interval string',
  INVALID_NUMBERS: (str) => `Invalid numbers in interval: "${str}"`,
  INVALID_INTERVAL_FORMAT: (str) => `Invalid interval format: "${str}". Expected format: "start-end"`,
  PARSING_ERROR: (index, message) => `Error parsing interval ${index + 1}: ${message}`,
  MISSING_INCLUDES: (context) => `${context} must contain "includes" field`,
  INVALID_TYPE: (field, context, expected) => `${context}.${field} must be ${expected}`,
  INVALID_FILE_EXTENSION: (file) => `File must have .json extension, got: ${file}`,
  EMPTY_ARRAY: (context) => `${context} cannot be empty`,
  INVALID_ITEM: (context, index, message) => `${context}[${index}]: ${message}`
};


