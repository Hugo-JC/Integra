import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";
import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const addFormats: FormatsPlugin = createRequire(import.meta.url)("ajv-formats");
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const catalog = JSON.parse(
  readFileSync(resolve(root, "scenarios/index.json"), "utf8"),
) as { scenarioManifests: string[] };
const schema = JSON.parse(
  readFileSync(resolve(root, "schemas/scenario.schema.json"), "utf8"),
);
const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  allowUnionTypes: true,
});
addFormats(ajv);
const validate = ajv.compile(schema);

describe("scenario catalog", () => {
  it("contains the five agreed scenarios", () => {
    expect(catalog.scenarioManifests).toHaveLength(5);
  });

  it("has unique IDs, valid manifests and weights summing to 100", () => {
    const ids = new Set<string>();
    for (const manifestPath of catalog.scenarioManifests) {
      const manifest = JSON.parse(
        readFileSync(resolve(root, manifestPath), "utf8"),
      );
      expect(validate(manifest), JSON.stringify(validate.errors)).toBe(true);
      expect(ids.has(manifest.id)).toBe(false);
      ids.add(manifest.id);
      expect(
        manifest.evaluation.criteria.reduce(
          (sum: number, item: { weight: number }) => sum + item.weight,
          0,
        ),
      ).toBe(100);
      expect(manifest.implementationStatus).toBe("fixture-ready");
    }
  });
});
