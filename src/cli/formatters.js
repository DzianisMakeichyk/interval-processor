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

export const formatSuccess = (message) => `${colors.green}${message}${colors.reset}`;

export const formatError = (message) => `${colors.red}Error: ${message}${colors.reset}`;

export const formatInfo = (message) => `${colors.cyan}${message}${colors.reset}`;

export const formatOutput = (message) => message;

export const formatHighlight = (message) => `${colors.bright}${message}${colors.reset}`;

export const formatMuted = (message) => `${colors.gray}${message}${colors.reset}`;
