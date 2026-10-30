import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";
import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const addFormats: FormatsPlugin = createRequire(import.meta.url)("ajv-formats");
const here = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(
  readFileSync(resolve(here, "../../schemas/report.schema.json"), "utf8"),
);
const report = JSON.parse(
  readFileSync(
    resolve(here, "../../fixtures/reports/example-inconclusive.json"),
    "utf8",
  ),
);
const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  allowUnionTypes: true,
});
addFormats(ajv);
const validate = ajv.compile(schema);

describe("report JSON Schema", () => {
  it("accepts the example inconclusive report", () => {
    expect(validate(report)).toBe(true);
  });

  it("rejects a report that claims to pass without required fields", () => {
    expect(validate({ schemaVersion: "1.0.0", status: "passed" })).toBe(false);
  });

  it("rejects a path that attempts to escape the artifact root", () => {
    const unsafe = {
      ...report,
      artifacts: [{ id: "evil", kind: "source", path: "../secret.txt" }],
    };
    expect(validate(unsafe)).toBe(false);
  });
});
