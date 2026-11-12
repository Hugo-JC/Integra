import path from "node:path";
import ts from "typescript";

export type SourceAuditSeverity = "P1" | "P2" | "P3";

export interface SourceAuditInputFile {
  file: string;
  content: string;
}

export interface SourceAuditFinding {
  id: string;
  ruleId: string;
  severity: SourceAuditSeverity;
  confidence: "high" | "medium";
  verificationStatus: "heuristic";
  location: { file: string; line: number; column: number };
  criterion?: string;
  message: string;
  impact: string;
  recommendation: string;
  evidence: { kind: "source-static"; excerpt: string };
}

export interface SourceAuditReport {
  schemaVersion: "1.0.0";
  summary: {
    scannedFiles: number;
    scannedSourceFiles: number;
    scannedStyleFiles: number;
    findingsBySeverity: Record<SourceAuditSeverity, number>;
    checksRun: string[];
    checksNotRun: string[];
  };
  findings: SourceAuditFinding[];
  limitations: string[];
}

interface RuleDefinition {
  ruleId: string;
  severity: SourceAuditSeverity;
  confidence: "high" | "medium";
  criterion?: string;
  message: string;
  impact: string;
  recommendation: string;
}

const RULES = {
  parseError: {
    ruleId: "source.parse-error",
    severity: "P1",
    confidence: "high",
    message: "The TypeScript JSX parser found a syntax error in this source file.",
    impact: "Static analysis of this file may be incomplete until the syntax error is resolved.",
    recommendation: "Fix the reported parser error, then run the project typecheck/build and repeat the audit.",
  },
  missingImageAlt: {
    ruleId: "a11y.image-alt",
    severity: "P1",
    confidence: "high",
    criterion: "WCAG 2.2 SC 1.1.1",
    message: "An image element has no explicit alt attribute.",
    impact: "A meaningful image may have no text alternative for people using assistive technology.",
    recommendation: "Add concise alt text for informative images, or alt=\"\" when the image is decorative.",
  },
  emptyInteractiveName: {
    ruleId: "a11y.interactive-name",
    severity: "P1",
    confidence: "medium",
    criterion: "WCAG 2.2 SC 4.1.2",
    message: "A native interactive control has no statically identifiable accessible name.",
    impact: "Assistive technology may announce an unnamed control or fail to communicate its purpose.",
    recommendation: "Provide visible text, an associated label, aria-label, or aria-labelledby that resolves to meaningful content.",
  },
  unlabeledFormControl: {
    ruleId: "a11y.form-label",
    severity: "P1",
    confidence: "medium",
    criterion: "WCAG 2.2 SC 3.3.2",
    message: "A form control has no statically identifiable label or accessible name.",
    impact: "People may not understand what information the field expects.",
    recommendation: "Associate a visible label with the control or provide an appropriate programmatic accessible name.",
  },
  clickableNonSemantic: {
    ruleId: "a11y.interactive-semantics",
    severity: "P1",
    confidence: "high",
    criterion: "WCAG 2.2 SC 2.1.1",
    message: "A non-native element handles click without complete keyboard semantics.",
    impact: "The interaction may not be operable through a keyboard.",
    recommendation: "Prefer a native button or link. For a justified custom widget, provide the correct role, tabIndex and equivalent keyboard behavior.",
  },
  hiddenFocus: {
    ruleId: "a11y.visible-focus",
    severity: "P1",
    confidence: "medium",
    criterion: "WCAG 2.2 SC 2.4.7",
    message: "The source removes the focus outline without a detectable replacement in the same source file.",
    impact: "Keyboard users may lose a visible indication of their current position.",
    recommendation: "Preserve the browser outline or provide a clear :focus-visible / focus-visible utility treatment.",
  },
  reducedMotion: {
    ruleId: "a11y.reduced-motion-signal",
    severity: "P2",
    confidence: "medium",
    criterion: "WCAG 2.2 SC 2.3.3 (AAA, where applicable)",
    message: "The stylesheet defines animation but has no reduced-motion media query.",
    impact: "Non-essential movement may not respect the motion preferences of some users.",
    recommendation: "Review the motion purpose and add a prefers-reduced-motion alternative where the animation is non-essential or interaction-triggered.",
  },
  hardcodedColor: {
    ruleId: "design.hardcoded-color",
    severity: "P3",
    confidence: "medium",
    message: "A literal hex color utility appears in JSX classes.",
    impact: "Repeated literal colors can drift from semantic tokens and make theme changes harder.",
    recommendation: "Prefer an existing semantic token; retain a literal only when it is a deliberate, documented exception.",
  },
} satisfies Record<string, RuleDefinition>;

const CHECKS_RUN = [
  "jsx-tsx-parser-diagnostics",
  "jsx-image-alt-attribute",
  "jsx-native-interactive-accessible-name",
  "jsx-form-label-association",
  "jsx-clickable-nonsemantic-keyboard-signals",
  "jsx-focus-outline-replacement",
  "css-reduced-motion-signal",
  "jsx-literal-hex-utility",
];

const CHECKS_NOT_RUN = [
  "rendered-visual-layout",
  "browser-keyboard-operation",
  "screen-reader-announcements",
  "runtime-accessible-name-computation",
  "composited-runtime-contrast",
  "responsive-reflow-and-overflow",
  "loading-empty-error-success-runtime-states",
  "runtime-performance-and-console-errors",
];

function lineAndColumn(source: ts.SourceFile, position: number): { line: number; column: number } {
  const value = source.getLineAndCharacterOfPosition(position);
  return { line: value.line + 1, column: value.character + 1 };
}

function staticAttribute(node: ts.JsxOpeningLikeElement, name: string): string | undefined {
  const attr = node.attributes.properties.find((item) =>
    ts.isJsxAttribute(item) && item.name.getText() === name,
  );
  if (!attr || !ts.isJsxAttribute(attr)) return undefined;
  if (!attr.initializer) return "";
  if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text;
  if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression &&
      (ts.isStringLiteral(attr.initializer.expression) ||
       ts.isNoSubstitutionTemplateLiteral(attr.initializer.expression))) {
    return attr.initializer.expression.text;
  }
  return undefined;
}

function hasAttribute(node: ts.JsxOpeningLikeElement, name: string): boolean {
  return node.attributes.properties.some((item) =>
    ts.isJsxAttribute(item) && item.name.getText() === name,
  );
}

type StaticPresence = true | false | null;

function hasStaticText(node: ts.JsxElement | ts.JsxSelfClosingElement): StaticPresence {
  if (ts.isJsxSelfClosingElement(node)) return false;
  let unknown = false;
  for (const child of node.children) {
    if (ts.isJsxText(child) && child.getText().trim().length > 0) return true;
    if ((ts.isStringLiteral(child) || ts.isNoSubstitutionTemplateLiteral(child)) && child.text.trim()) return true;
    if (ts.isJsxExpression(child) && child.expression) {
      if ((ts.isStringLiteral(child.expression) || ts.isNoSubstitutionTemplateLiteral(child.expression)) &&
          child.expression.text.trim()) return true;
      unknown = true;
    }
    if (ts.isJsxElement(child)) {
      const nested = hasStaticText(child);
      if (nested === true) return true;
      if (nested === null) unknown = true;
    }
  }
  return unknown ? null : false;
}

function hasAccessibleName(
  node: ts.JsxOpeningLikeElement,
  element: ts.JsxElement | ts.JsxSelfClosingElement,
): StaticPresence {
  let unknown = false;
  for (const name of ["aria-label", "aria-labelledby", "title"]) {
    if (!hasAttribute(node, name)) continue;
    const value = staticAttribute(node, name);
    if (value?.trim()) return true;
    if (value === undefined) unknown = true;
  }
  const text = hasStaticText(element);
  if (text === true) return true;
  if (text === null) unknown = true;
  return unknown ? null : false;
}

function tagName(node: ts.JsxOpeningLikeElement): string {
  return node.tagName.getText();
}

function staticId(node: ts.JsxOpeningLikeElement): string | undefined {
  return staticAttribute(node, "id");
}

function hasAssociatedLabel(
  node: ts.JsxOpeningLikeElement,
  ancestor: ts.Node | undefined,
  labelsByFor: Set<string>,
  hasDynamicLabelFor: boolean,
): StaticPresence {
  const id = staticId(node);
  if (id && labelsByFor.has(id)) return true;

  let current = ancestor;
  while (current) {
    if (ts.isJsxElement(current) && current.openingElement.tagName.getText() === "label") {
      return true;
    }
    current = current.parent;
  }
  return hasDynamicLabelFor ? null : false;
}

function normalizeFile(file: string, root: string): string {
  return path.relative(root, path.resolve(root, file)).split(path.sep).join("/");
}

export function auditSourceFiles(
  files: readonly SourceAuditInputFile[],
  root = process.cwd(),
): SourceAuditReport {
  const findings: SourceAuditFinding[] = [];
  const sortedFiles = [...files].sort((a, b) => a.file.localeCompare(b.file));
  const sourceFiles = sortedFiles.filter((file) => /\.(tsx|jsx)$/i.test(file.file));
  const styleFiles = sortedFiles.filter((file) => /\.(css|scss|sass|less)$/i.test(file.file));

  const add = (
    source: ts.SourceFile,
    file: string,
    node: ts.Node,
    rule: RuleDefinition,
    excerpt?: string,
  ) => {
    const position = lineAndColumn(source, node.getStart(source));
    const normalized = normalizeFile(file, root);
    findings.push({
      id: [rule.ruleId, normalized, position.line, position.column].join(":"),
      ruleId: rule.ruleId,
      severity: rule.severity,
      confidence: rule.confidence,
      verificationStatus: "heuristic",
      location: { file: normalized, ...position },
      ...(rule.criterion ? { criterion: rule.criterion } : {}),
      message: rule.message,
      impact: rule.impact,
      recommendation: rule.recommendation,
      evidence: {
        kind: "source-static",
        excerpt: (excerpt ?? node.getText(source)).replace(/\s+/g, " ").slice(0, 240),
      },
    });
  };

  for (const file of sourceFiles) {
    const source = ts.createSourceFile(file.file, file.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const labelsByFor = new Set<string>();
    let hasDynamicLabelFor = false;
    const focusReplacementPresent = /focus-visible\s*:\s*(?:outline|ring|border)|:focus-visible\b/i.test(file.content);

    const collectLabels = (node: ts.Node): void => {
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
          tagName(node) === "label") {
        const htmlFor = staticAttribute(node, "htmlFor");
        if (htmlFor) labelsByFor.add(htmlFor);
        else if (hasAttribute(node, "htmlFor")) hasDynamicLabelFor = true;
      }
      ts.forEachChild(node, collectLabels);
    };
    collectLabels(source);

    for (const diagnostic of source.parseDiagnostics) {
      const offset = diagnostic.start ?? 0;
      const position = lineAndColumn(source, offset);
      const normalized = normalizeFile(file.file, root);
      findings.push({
        id: [RULES.parseError.ruleId, normalized, position.line, position.column].join(":"),
        ruleId: RULES.parseError.ruleId,
        severity: RULES.parseError.severity,
        confidence: RULES.parseError.confidence,
        verificationStatus: "heuristic",
        location: { file: normalized, ...position },
        message: RULES.parseError.message + " " + ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
        impact: RULES.parseError.impact,
        recommendation: RULES.parseError.recommendation,
        evidence: {
          kind: "source-static",
          excerpt: file.content.slice(offset, offset + 180).replace(/\\s+/g, " "),
        },
      });
    }

    const visit = (node: ts.Node): void => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = tagName(node).toLowerCase();
        const element: ts.JsxElement | ts.JsxSelfClosingElement =
          ts.isJsxOpeningElement(node) && ts.isJsxElement(node.parent)
            ? node.parent
            : node as ts.JsxSelfClosingElement;
        const classes = staticAttribute(node, "className") ?? staticAttribute(node, "class") ?? "";

        if (tag === "img" && !hasAttribute(node, "alt")) {
          add(source, file.file, node, RULES.missingImageAlt);
        }

        if (["button", "a"].includes(tag)) {
          const isAnchor = tag === "a";
          const hasRequiredHref = !isAnchor || hasAttribute(node, "href");
          if (hasRequiredHref && hasAccessibleName(node, element) === false) {
            add(source, file.file, node, RULES.emptyInteractiveName);
          }
        }

        if (["input", "select", "textarea"].includes(tag)) {
          const type = (staticAttribute(node, "type") ?? "").toLowerCase();
          const hiddenInput = tag === "input" && type === "hidden";
          const name = hasAccessibleName(node, element);
          const label = hasAssociatedLabel(node, node.parent, labelsByFor, hasDynamicLabelFor);
          if (!hiddenInput && name === false && label === false) {
            add(source, file.file, node, RULES.unlabeledFormControl);
          }
        }

        if (["div", "span", "li"].includes(tag) && hasAttribute(node, "onClick")) {
          const role = (staticAttribute(node, "role") ?? "").toLowerCase();
          const nativeRole = role === "button" || role === "link";
          const hasKeyboardHandler = ["onKeyDown", "onKeyUp", "onKeyPress"].some((key) =>
            hasAttribute(node, key),
          );
          if (!nativeRole || !hasAttribute(node, "tabIndex") || !hasKeyboardHandler) {
            add(source, file.file, node, RULES.clickableNonSemantic);
          }
        }

        if (/\boutline-none\b/.test(classes) && !/(?:focus-visible:|focus:)/.test(classes) &&
            !focusReplacementPresent) {
          add(source, file.file, node, RULES.hiddenFocus, classes);
        }

        if (/(?:^|\s)(?:bg|text|border)-\[#(?:[\da-f]{3}|[\da-f]{6})\](?=\s|$)/i.test(classes)) {
          add(source, file.file, node, RULES.hardcodedColor, classes);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }

  for (const file of styleFiles) {
    const source = ts.createSourceFile(file.file, file.content, ts.ScriptTarget.Latest, false, ts.ScriptKind.Unknown);
    const hasMotion = /(?:@keyframes\b|\banimation(?:-name)?\s*:)/i.test(file.content);
    const hasReducedMotion = /@media[^{]*prefers-reduced-motion\s*:\s*reduce/i.test(file.content);
    if (hasMotion && !hasReducedMotion) {
      const match = /@keyframes\b|\banimation(?:-name)?\s*:/i.exec(file.content);
      if (match) {
        const position = lineAndColumn(source, match.index);
        const normalized = normalizeFile(file.file, root);
        findings.push({
          id: [RULES.reducedMotion.ruleId, normalized, position.line, position.column].join(":"),
          ruleId: RULES.reducedMotion.ruleId,
          severity: RULES.reducedMotion.severity,
          confidence: RULES.reducedMotion.confidence,
          verificationStatus: "heuristic",
          location: { file: normalized, ...position },
          criterion: RULES.reducedMotion.criterion,
          message: RULES.reducedMotion.message,
          impact: RULES.reducedMotion.impact,
          recommendation: RULES.reducedMotion.recommendation,
          evidence: { kind: "source-static", excerpt: file.content.slice(match.index, match.index + 180).replace(/\s+/g, " ") },
        });
      }
    }
  }

  findings.sort((a, b) =>
    a.location.file.localeCompare(b.location.file) ||
    a.location.line - b.location.line ||
    a.location.column - b.location.column ||
    a.ruleId.localeCompare(b.ruleId),
  );

  const findingsBySeverity: Record<SourceAuditSeverity, number> = { P1: 0, P2: 0, P3: 0 };
  for (const finding of findings) findingsBySeverity[finding.severity] += 1;

  return {
    schemaVersion: "1.0.0",
    summary: {
      scannedFiles: sortedFiles.length,
      scannedSourceFiles: sourceFiles.length,
      scannedStyleFiles: styleFiles.length,
      findingsBySeverity,
      checksRun: [...CHECKS_RUN],
      checksNotRun: [...CHECKS_NOT_RUN],
    },
    findings,
    limitations: [
      "Every source finding is a static heuristic; it does not prove the rendered behavior or a WCAG failure.",
      "Accessible names and label relationships are only detected when they are statically visible in the scanned files.",
      "CSS modules, generated styles, component abstractions and cross-file relationships can hide valid implementations or create false positives.",
      "This command does not launch a browser, inspect screenshots, operate a keyboard, query assistive technology or measure runtime contrast.",
      "A clean report means no configured static signal was found, not that the interface passed design QA or WCAG.",
    ],
  };
}
