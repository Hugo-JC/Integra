import { describe, expect, it } from "vitest";
import { Ajv2020 } from "ajv/dist/2020.js";
import reportSchema from "../schemas/design-qa-report.schema.json" with { type: "json" };
import { auditSourceFiles } from "../src/modules/refinement/source-audit.js";

const root = "/workspace";

describe("evidence-aware static Design QA", () => {
  it("detects actionable accessibility signals with locations and heuristic provenance", () => {
    const report = auditSourceFiles([
      {
        file: "src/Card.tsx",
        content: [
          "export function Card() {",
          "  return <section>",
          '    <img src="/chart.svg" />',
          '    <button><svg aria-hidden="true" /></button>',
          '    <input id="email" />',
          '    <label htmlFor="email">Email</label>',
          "    <div onClick={() => {}}>Open</div>",
          "  </section>;",
          "}",
        ].join("\n"),
      },
      {
        file: "src/motion.css",
        content: ".hero { animation: enter 300ms ease; }\n@keyframes enter { from { opacity: 0 } to { opacity: 1 } }",
      },
    ], root);

    expect(report.summary.scannedSourceFiles).toBe(1);
    expect(report.summary.scannedStyleFiles).toBe(1);
    expect(report.findings.map((item) => item.ruleId)).toEqual([
      "a11y.image-alt",
      "a11y.interactive-name",
      "a11y.interactive-semantics",
      "a11y.reduced-motion-signal",
    ]);
    expect(report.findings[0]).toMatchObject({
      severity: "P1",
      confidence: "high",
      verificationStatus: "heuristic",
      criterion: "WCAG 2.2 SC 1.1.1",
      location: { file: "src/Card.tsx", line: 3, column: 5 },
      evidence: { kind: "source-static" },
    });
    expect(report.summary.findingsBySeverity).toEqual({ P1: 3, P2: 1, P3: 0 });
  });

  it("does not flag static accessible names, labelled controls or reduced-motion alternatives", () => {
    const report = auditSourceFiles([
      {
        file: "src/Accessible.tsx",
        content: [
          '<button aria-label="Close"><svg /></button>',
          '<a href="/docs">Read documentation</a>',
          '<label htmlFor="name">Name</label>',
          '<input id="name" />',
          '<div role="button" tabIndex={0} onClick={run} onKeyDown={run}>Run</div>',
          '<button className="outline-none focus-visible:ring-2">Save</button>',
        ].join("\n"),
      },
      {
        file: "src/motion.css",
        content: "@keyframes fade { from { opacity: 0 } to { opacity: 1 } }\n@media (prefers-reduced-motion: reduce) { .hero { animation: none; } }",
      },
    ], root);

    expect(report.findings).toHaveLength(0);
  });

  it("marks focus removal and literal utility colors as review signals, not proven defects", () => {
    const report = auditSourceFiles([
      {
        file: "src/Buttons.tsx",
        content: '<button className="outline-none bg-[#123456]">Continue</button>',
      },
    ], root);

    expect(report.findings.map((item) => item.ruleId)).toEqual([
      "a11y.visible-focus",
      "design.hardcoded-color",
    ]);
    expect(report.findings.every((item) => item.verificationStatus === "heuristic")).toBe(true);
    expect(report.findings[0]?.confidence).toBe("medium");
    expect(report.summary.checksNotRun).toContain("browser-keyboard-operation");
    expect(report.limitations.join(" ")).toContain("not that the interface passed");
  });

  it("sorts files and findings deterministically", () => {
    const report = auditSourceFiles([
      { file: "src/Z.tsx", content: '<img src="z.png" />' },
      { file: "src/A.tsx", content: '<img src="a.png" />' },
    ], root);

    expect(report.findings.map((item) => item.location.file)).toEqual([
      "src/A.tsx",
      "src/Z.tsx",
    ]);
    expect(report.findings[0]?.id).toBe("a11y.image-alt:src/A.tsx:1:1");
  });

  it("produces an AJV-valid stable report contract", () => {
    const report = auditSourceFiles([
      { file: "src/App.tsx", content: '<img src="hero.png" />' },
    ], root);
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    const validate = ajv.compile(reportSchema);

    expect(validate(report), JSON.stringify(validate.errors)).toBe(true);
  });

  it("does not guess when accessible names are supplied dynamically", () => {
    const report = auditSourceFiles([
      {
        file: "src/Dynamic.tsx",
        content: [
          "export function Dynamic({ label }: { label: string }) {",
          "  return <button>{label}</button>;",
          "}",
        ].join("\n"),
      },
    ], root);

    expect(report.findings).toHaveLength(0);
  });

  it("reports JSX parser errors as static signals", () => {
    const report = auditSourceFiles([
      { file: "src/Broken.tsx", content: "export const Broken = () => <section><div></section>;" },
    ], root);

    expect(report.findings.some((item) => item.ruleId === "source.parse-error")).toBe(true);
    expect(report.summary.findingsBySeverity.P1).toBeGreaterThan(0);
  });

  it("does not emit findings for files outside supported source/style extensions", () => {
    const report = auditSourceFiles([
      { file: "README.md", content: '<img src="fake.png" />' },
      { file: "src/image.svg", content: '<img src="fake.png" />' },
    ], root);
    expect(report.summary.scannedFiles).toBe(2);
    expect(report.findings).toHaveLength(0);
  });
});
