import { describe, expect, it } from 'vitest';
import { parseVisualIntelligenceGenerateArgs } from '../src/cli/visual-intelligence.js';

describe('Visual Intelligence CLI argument parser', () => {
  it('requires an artifact and primary task', () => {
    expect(() => parseVisualIntelligenceGenerateArgs([])).toThrow(/--artifact/);
    expect(() => parseVisualIntelligenceGenerateArgs(['--artifact', 'direction.json'])).toThrow(/--task/);
  });
  it('uses a safe run-output default and supports stdout', () => {
    expect(parseVisualIntelligenceGenerateArgs(['--artifact', 'direction.json', '--task', 'Improve task clarity']))
      .toMatchObject({ artifactPath: 'direction.json', primaryTask: 'Improve task clarity',
        outputPath: '.integra/runs/visual-intelligence/bundle.json', tags: [], assetTypes: [], stdout: false, help: false });
    expect(parseVisualIntelligenceGenerateArgs(['--artifact', 'direction.json', '--task', 'Improve task clarity', '--stdout']).stdout).toBe(true);
  });
  it('parses mode, niche, query and repeated retrieval filters', () => {
    expect(parseVisualIntelligenceGenerateArgs([
      '--artifact', 'direction.json', '--task', 'Manage projects', '--mode', 'operate',
      '--niche-id', 'saas-developer-ai', '--query', 'project table filters',
      '--tag', 'keyboard', '--tag', 'dense-ui', '--asset-type', 'icon', '--asset-type', 'illustration', '--limit', '12',
    ])).toMatchObject({ mode: 'operate', nicheId: 'saas-developer-ai', query: 'project table filters',
      tags: ['keyboard', 'dense-ui'], assetTypes: ['icon', 'illustration'], limit: 12 });
  });
  it('rejects unknown, duplicate scalar, missing and conflicting options', () => {
    const base = ['--artifact', 'direction.json', '--task', 'Manage projects'];
    expect(() => parseVisualIntelligenceGenerateArgs([...base, '--unknown'])).toThrow(/Unknown option/);
    expect(() => parseVisualIntelligenceGenerateArgs([...base, '--mode', 'read', '--mode', 'operate'])).toThrow(/more than once/);
    expect(() => parseVisualIntelligenceGenerateArgs(['--artifact'])).toThrow(/requires a non-empty value/);
    expect(() => parseVisualIntelligenceGenerateArgs([...base, '--stdout', '--out', 'bundle.json'])).toThrow(/either --stdout or --out/);
  });
  it('rejects unsupported modes and invalid limits', () => {
    const base = ['--artifact', 'direction.json', '--task', 'Manage projects'];
    expect(() => parseVisualIntelligenceGenerateArgs([...base, '--mode', 'unknown'])).toThrow(/--mode must be/);
    expect(() => parseVisualIntelligenceGenerateArgs([...base, '--limit', '0'])).toThrow(/between 1 and 5/);
    expect(() => parseVisualIntelligenceGenerateArgs([...base, '--limit', '1.5'])).toThrow(/between 1 and 20/);
  });
  it('allows help without generation arguments', () => {
    expect(parseVisualIntelligenceGenerateArgs(['--help'])).toMatchObject({ help: true });
  });
});
