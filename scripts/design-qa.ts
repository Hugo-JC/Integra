import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

type Finding = { file: string; line: number; rule: string; severity: 'major' | 'minor'; message: string; recommendation: string };
const root = path.resolve(process.argv.find((arg) => !arg.startsWith('-') && arg.endsWith('/')) ?? 'src');
const json = process.argv.includes('--json');
const strict = process.argv.includes('--strict');
const ignored = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage']);
const files: string[] = [];
function collect(dir: string): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) { if (!ignored.has(entry.name)) collect(path.join(dir, entry.name)); }
    else if (/\.(tsx|jsx)$/.test(entry.name)) files.push(path.join(dir, entry.name));
  }
}
function textOf(node: ts.Node): string {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return '';
}
function hasAttr(node: ts.JsxOpeningLikeElement, name: string): boolean {
  return node.attributes.properties.some((item) => ts.isJsxAttribute(item) && item.name.getText() === name);
}
function attr(node: ts.JsxOpeningLikeElement, name: string): string {
  const item = node.attributes.properties.find((candidate) => ts.isJsxAttribute(candidate) && candidate.name.getText() === name);
  return item && ts.isJsxAttribute(item) && item.initializer && ts.isStringLiteral(item.initializer) ? item.initializer.text : '';
}
const findings: Finding[] = [];
function scan(file: string): void {
  const source = fs.readFileSync(file, 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const add = (node: ts.Node, rule: string, severity: Finding['severity'], message: string, recommendation: string) => {
    const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
    findings.push({ file: path.relative(process.cwd(), file), line, rule, severity, message, recommendation });
  };
  const visit = (node: ts.Node): void => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText();
      const classes = attr(node, 'className') || attr(node, 'class');
      if (tag === 'img' && !hasAttr(node, 'alt')) {
        add(node, 'a11y.image-alt', 'major', 'Image has no alt attribute.', 'Add meaningful alt text or alt="" for decorative imagery.');
      }
      if (['div', 'span', 'li'].includes(tag) && hasAttr(node, 'onClick')) {
        const role = attr(node, 'role');
        const keyboard = hasAttr(node, 'onKeyDown') || hasAttr(node, 'onKeyUp');
        if (!['button', 'link'].includes(role) || !hasAttr(node, 'tabIndex') || !keyboard) {
          add(node, 'a11y.interactive-semantics', 'major', 'Clickable non-native element lacks complete keyboard semantics.', 'Prefer button/link; otherwise add role, tabIndex and keyboard interaction.');
        }
      }
      if (classes.includes('outline-none') && !/(focus-visible:|focus:)/.test(classes)) {
        add(node, 'a11y.visible-focus', 'major', 'Focus outline is removed without a visible replacement.', 'Add a clear focus-visible ring/border or preserve the browser outline.');
      }
      if (/(?:bg|text|border)-\[#(?:[\da-fA-F]{3}|[\da-fA-F]{6})\]/.test(classes)) {
        add(node, 'design.hardcoded-color', 'minor', 'Literal hex utility bypasses design tokens.', 'Prefer a semantic token; keep explicit brand exceptions documented.');
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  const syntaxDiagnostics = ts.transpileModule(source, {
    fileName: file,
    compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  }).diagnostics ?? [];
  if (syntaxDiagnostics.length) {
    for (const diagnostic of syntaxDiagnostics) {
      const pos = diagnostic.start ?? 0;
      findings.push({ file: path.relative(process.cwd(), file), line: ast.getLineAndCharacterOfPosition(pos).line + 1,
        rule: 'source.parse-error', severity: 'major', message: ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '),
        recommendation: 'Fix the syntax error before trusting static findings.' });
    }
  }
}
try {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error(`Directory not found: ${root}`);
  collect(root);
  files.sort().forEach(scan);
  const report = { scannedFiles: files.length, findings };
  if (json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Integra Design QA · ${files.length} files · ${findings.length} findings`);
    for (const item of findings) console.log(`[${item.severity}] ${item.file}:${item.line} ${item.rule} — ${item.message}\n  → ${item.recommendation}`);
  }
  if (findings.some((item) => item.severity === 'major') && strict) process.exitCode = 2;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
