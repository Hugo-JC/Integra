import { describe, expect, it } from 'vitest';
import ts from 'typescript';

describe('design QA heuristics', () => {
  it('recognizes TSX source for deterministic static inspection', () => {
    const code = 'const Demo = () => <img src="/chart.svg" />;';
    const source = ts.createSourceFile('fixture.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const tags: string[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isJsxSelfClosingElement(node)) tags.push(node.tagName.getText());
      ts.forEachChild(node, visit);
    };
    visit(source);
    expect(tags).toContain('img');
    const result = ts.transpileModule(code, {
      fileName: 'fixture.tsx',
      compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2022 },
      reportDiagnostics: true,
    });
    expect(result.diagnostics ?? []).toHaveLength(0);
  });
});
