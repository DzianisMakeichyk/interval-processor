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
		const errorMsg = error?.message ?? "Unknown error";

		// Check if the error might be related to negative intervals in arguments
		if (errorMsg.includes("argument is ambiguous") && process.argv.some((arg) => arg.includes("-") && /^-\d/.test(arg))) {
			console.error(`${errorMsg}`);
			console.log("");
			console.log("💡 TIP: When using negative intervals with short flags, the argument parser may");
			console.log("   interpret negative numbers as option flags. Try using long form options:");
			console.log("");
			console.log('   Instead of: node cli.js -i "-10-2" -e "-1-1"');
			console.log('   Use:        node cli.js --includes="-10-2" --excludes="-1-1"');
			console.log("");
		} else {
			console.error(`Invalid arguments: ${errorMsg}`);
		}
		console.log("Use --help for usage information");
		process.exit(1);
	}
};

// Main CLI function
const main = async () => {
	const options = parseCliArgs();

	if (options.help || ((options.includes === undefined || options.includes === null) && !options.file)) {
		showHelp();
		process.exit(0);
	}

	await handleCommand(options);
};

main().catch((error) => {
	console.error(`Unexpected error: ${error?.message ?? "Unknown error"}`);
	process.exit(1);
});
