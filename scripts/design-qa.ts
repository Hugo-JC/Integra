import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditSourceFiles } from "../src/modules/refinement/source-audit.js";

const ignored = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage", ".turbo"]);
const extensions = new Set([".tsx", ".jsx", ".css", ".scss", ".sass", ".less"]);

interface Options { root: string; json: boolean; strict: boolean; help: boolean }

function parseArgs(args: readonly string[]): Options {
  let root = "src";
  let positionalSeen = false;
  let json = false;
  let strict = false;
  let help = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!;
    if (arg === "--help" || arg === "-h") { help = true; continue; }
    if (arg === "--json") { json = true; continue; }
    if (arg === "--strict") { strict = true; continue; }
    if (arg === "--root") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) throw new TypeError("--root requires a path.");
      if (positionalSeen || root !== "src") throw new TypeError("Specify the scan root only once.");
      root = value;
      positionalSeen = true;
      index += 1;
      continue;
    }
    if (arg.startsWith("-")) throw new TypeError("Unknown option: " + arg);
    if (positionalSeen) throw new TypeError("Only one scan root may be supplied.");
    root = arg;
    positionalSeen = true;
  }
  return { root, json, strict, help };
}

function collectFiles(directory: string, root: string, result: Array<{ file: string; content: string }>): void {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) collectFiles(absolute, root, result);
    } else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) {
      result.push({
        file: path.relative(root, absolute),
        content: fs.readFileSync(absolute, "utf8"),
      });
    }
  }
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write([
      "Integra Design QA — static source signals",
      "",
      "Usage:",
      "  npm run design:qa -- [path] [--json] [--strict]",
      "  npm run design:qa -- --root src --json",
      "",
      "Options:",
      "  --root <path>  Directory to scan (default: src)",
      "  --json         Emit the versioned JSON report",
      "  --strict       Exit with code 2 when P1 static signals exist",
      "  --help         Show this help",
      "",
      "All findings are heuristics. A clean report is not a visual, runtime or WCAG pass.",
      "",
    ].join("\n"));
    return;
  }

  const root = path.resolve(process.cwd(), options.root);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error("Scan root is not a directory: " + root);
  }

  const files: Array<{ file: string; content: string }> = [];
  collectFiles(root, root, files);
  const projectRoot = process.cwd();
  const reportFiles = files.map((file) => ({
    file: path.relative(projectRoot, path.resolve(root, file.file)),
    content: file.content,
  }));
  const report = auditSourceFiles(reportFiles, projectRoot);

  if (options.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    const counts = report.summary.findingsBySeverity;
    process.stdout.write(
      "Integra Design QA · " + report.summary.scannedFiles +
      " files · P1 " + counts.P1 + " · P2 " + counts.P2 + " · P3 " + counts.P3 + "\n",
    );
    for (const finding of report.findings) {
      process.stdout.write(
        "[" + finding.severity + " · " + finding.verificationStatus + "] " +
        finding.location.file + ":" + finding.location.line + " " + finding.ruleId +
        " — " + finding.message + "\n  → " + finding.recommendation + "\n",
      );
    }
    process.stdout.write("\nNot run: " + report.summary.checksNotRun.join(", ") + "\n");
  }

  if (options.strict && report.findings.some((item) => item.severity === "P1")) {
    process.exitCode = 2;
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(
    "Design QA failed: " + (error instanceof Error ? error.message : String(error)) + "\n",
  );
  process.exitCode = 1;
}

export { parseArgs as parseDesignQaArgs };
