import { parseArgs } from "node:util";
import { handleCommand, showHelp } from "./src/cli/commands.js";

const parseCliArgs = () => {
	try {
		const { values } = parseArgs({
			options: {
				includes: {
					type: "string",
					short: "i",
					default: undefined,
				},
				excludes: {
					type: "string",
					short: "e",
					default: undefined,
				},
				file: {
					type: "string",
					default: undefined,
				},
				help: {
					type: "boolean",
					default: false,
				},
			},
			strict: true,
			allowPositionals: false,
		});

		return {
			includes: values.includes,
			excludes: values.excludes,
			file: values.file,
			help: values.help,
		};
	} catch (error) {
		console.error(`Invalid arguments: ${error?.message ?? "Unknown error"}`);
		console.log("Use --help for usage information");
		process.exit(1);
	}
};

// Main CLI function
const main = async () => {
	const options = parseCliArgs();

	if (options.help || (!options.includes && !options.file)) {
		showHelp();
		process.exit(0);
	}

	await handleCommand(options);
};

main().catch((error) => {
	console.error(`Unexpected error: ${error?.message ?? "Unknown error"}`);
	process.exit(1);
});
