import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateDirectionConsumptionReport } from "../src/cli/direction-consumption.js";

const HELP = [
  "Integra Direction Consumption Report Validator",
  "",
  "Usage:",
  "  npm run direction:consumption:validate -- --artifact direction.json --report consumption-report.json",
  "",
  "Validates report JSON Schema and exact decision/recommendation coverage.",
  "A passed report is self-reported by the agent; it is not independent implementation QA.",
  "",
].join("\n");

function parseArgs(args: readonly string[]): { artifact?: string; report?: string; help: boolean } {
  let artifact: string | undefined;
  let report: string | undefined;
  let help = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!;
    if (argument === "--help" || argument === "-h") { help = true; continue; }
    if (argument !== "--artifact" && argument !== "--report") {
      throw new TypeError("Unknown option: " + argument);
    }
    const value = args[index + 1];
    if (!value || value.startsWith("--") || !value.trim()) {
      throw new TypeError("Option " + argument + " requires a non-empty path.");
    }
    if (argument === "--artifact") {
      if (artifact !== undefined) throw new TypeError("Option --artifact was provided more than once.");
      artifact = value;
    } else {
      if (report !== undefined) throw new TypeError("Option --report was provided more than once.");
      report = value;
    }
    index += 1;
  }
  if (!help && (!artifact || !report)) {
    throw new TypeError("Both --artifact and --report are required.");
  }
  return { artifact, report, help };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(HELP);
    return;
  }

  const [artifactText, reportText] = await Promise.all([
    readFile(resolve(options.artifact!), "utf8"),
    readFile(resolve(options.report!), "utf8"),
  ]);
  const result = validateDirectionConsumptionReport(
    JSON.parse(artifactText) as unknown,
    JSON.parse(reportText) as unknown,
  );
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  if (result.status !== "passed") process.exitCode = 1;
}

main().catch((error: unknown) => {
  process.stderr.write(
    "Direction consumption validation failed: " +
    (error instanceof Error ? error.message : String(error)) + "\n",
  );
  process.exitCode = 1;
});
