export interface PilotPrepareOptions {
  scenario: string;
  outputPath: string;
  help: boolean;
}

export function parsePilotPrepareArgs(args: readonly string[]): PilotPrepareOptions {
  let scenario = "DL-001";
  let outputPath = ".integra/runs/pilots/DL-001";
  let help = false;
  let scenarioSeen = false;
  let outputSeen = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!;
    if (argument === "--help" || argument === "-h") {
      help = true;
      continue;
    }
    if (argument === "--scenario" || argument === "--out") {
      const value = args[index + 1];
      if (!value || value.startsWith("--") || !value.trim()) {
        throw new TypeError("Option " + argument + " requires a non-empty value.");
      }
      if (argument === "--scenario") {
        if (scenarioSeen) throw new TypeError("Option --scenario was provided more than once.");
        scenario = value.trim();
        scenarioSeen = true;
      } else {
        if (outputSeen) throw new TypeError("Option --out was provided more than once.");
        outputPath = value.trim();
        outputSeen = true;
      }
      index += 1;
      continue;
    }
    throw new TypeError("Unknown option: " + argument);
  }

  if (!help && scenario !== "DL-001") {
    throw new TypeError("Pilot pack generation is currently supported only for DL-001.");
  }

  return { scenario, outputPath, help };
}
