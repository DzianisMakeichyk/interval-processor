const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	green: "\x1b[32m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
	gray: "\x1b[90m",
};

/**
 * Format a message with green color for success indicators.
 * @param {string} message - Message to format
 * @returns {string} Formatted message with green color
 */
export const formatSuccess = (message) => `${colors.green}${message}${colors.reset}`;

/**
 * Format a message with red color and "Error:" prefix.
 * @param {string} message - Error message to format
 * @returns {string} Formatted error message with red color
 */
export const formatError = (message) => `${colors.red}Error: ${message}${colors.reset}`;

/**
 * Format a message with cyan color for informational content.
 * @param {string} message - Info message to format
 * @returns {string} Formatted message with cyan color
 */
export const formatInfo = (message) => `${colors.cyan}${message}${colors.reset}`;

/**
 * Format output message without color (plain text).
 * @param {string} message - Message to format
 * @returns {string} Unmodified message
 */
export const formatOutput = (message) => message;

/**
 * Format a message with bright/bold styling for highlights.
 * @param {string} message - Message to highlight
 * @returns {string} Formatted message with bright styling
 */
export const formatHighlight = (message) => `${colors.bright}${message}${colors.reset}`;

/**
 * Format a message with gray color for muted/secondary content.
 * @param {string} message - Message to mute
 * @returns {string} Formatted message with gray color
 */
export const formatMuted = (message) => `${colors.gray}${message}${colors.reset}`;
