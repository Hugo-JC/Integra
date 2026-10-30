import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { DirectionContextInput } from '../src/contracts/direction-context.js';
import {
  extractDirectionContext,
  generateDirectionFromInput,
  parseDirectionGenerateArgs,
  parseDirectionValidateArgs,
} from '../src/cli/direction.js';

const fixture = JSON.parse(
  readFileSync(resolve(process.cwd(), 'fixtures/brief-data/DL-001.json'), 'utf8'),
) as { directionContext: DirectionContextInput };

describe('Direction CLI command boundary', () => {
  it('uses safe defaults and an ignored run output path', () => {
    expect(parseDirectionGenerateArgs([])).toEqual({
      scenario: 'DL-001',
      inputPath: 'fixtures/brief-data/DL-001.json',
      outputPath: '.integra/runs/direction/DL-001.json',
      stdout: false,
      help: false,
    });
  });

  it('parses explicit generation and stdout options', () => {
    expect(parseDirectionGenerateArgs([
      '--scenario', 'DL-001', '--input', 'brief.json', '--stdout',
    ])).toMatchObject({
      scenario: 'DL-001',
      inputPath: 'brief.json',
      stdout: true,
    });
  });

  it('rejects unknown, duplicate and conflicting options', () => {
    expect(() => parseDirectionGenerateArgs(['--unknown'])).toThrow(/Unknown option/);
    expect(() => parseDirectionGenerateArgs(['--input', 'a.json', '--input', 'b.json']))
      .toThrow(/more than once/);
    expect(() => parseDirectionGenerateArgs(['--stdout', '--out', 'out.json']))
      .toThrow(/either --stdout or --out/);
    expect(() => parseDirectionGenerateArgs(['--scenario']))
      .toThrow(/requires a value/);
  });

  it('requires an input path for artifact validation', () => {
    expect(() => parseDirectionValidateArgs([])).toThrow(/Missing required option/);
    expect(parseDirectionValidateArgs(['--input', 'artifact.json'])).toEqual({
      inputPath: 'artifact.json',
      help: false,
    });
  });

  it('accepts both fixture envelopes and direct context objects', () => {
    expect(extractDirectionContext(fixture)).toEqual(fixture.directionContext);
    expect(extractDirectionContext(fixture.directionContext)).toEqual(fixture.directionContext);
  });

  it('generates and validates the current DL-001 artifact through the command boundary', () => {
    const result = generateDirectionFromInput(fixture, 'DL-001');
    expect(result.validation.status).toBe('passed');
    expect(Object.keys(result.generation.artifact.sections)).toHaveLength(8);
    expect(result.generation.diagnostics).toHaveLength(0);
  });

  it('does not silently accept malformed or unsupported scenario input', () => {
    expect(() => generateDirectionFromInput({ directionContext: { surprise: true } }, 'DL-001'))
      .toThrow(/Direction context is invalid/);
    expect(() => generateDirectionFromInput(fixture, 'DL-002'))
      .toThrow(/only for DL-001/);
  });
});
