import { describe, expect, it } from 'vitest';
import {
  getCommandManifest,
  listCommands,
  resolveCommand,
  validateCommandManifest,
} from '../src/modules/commands/manifest.js';

describe('Integra command manifest', () => {
  it('validates the canonical manifest and referenced skills', () => {
    const result = validateCommandManifest();
    expect(result.valid, result.errors.join('\\n')).toBe(true);
  });

  it('defines one orchestrator, workflows and modifiers as separate kinds', () => {
    expect(listCommands('orchestrator')).toHaveLength(1);
    expect(listCommands('workflow').length).toBeGreaterThan(0);
    expect(listCommands('modifier').length).toBeGreaterThan(0);
  });

  it('rejects duplicate command ids and invocations', () => {
    const manifest = structuredClone(getCommandManifest());
    manifest.commands.push({ ...manifest.commands[1], id: manifest.commands[0].id });
    const result = validateCommandManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('Duplicate command id'))).toBe(true);
    expect(result.errors.some((error) => error.includes('Duplicate invocation'))).toBe(true);
  });

  it('rejects missing skill references', () => {
    const manifest = structuredClone(getCommandManifest());
    manifest.commands[1].skills = ['skill-that-does-not-exist'];
    const result = validateCommandManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('missing or unsafe skill'))).toBe(true);
  });

  it('resolves exact namespaced invocations and preserves arguments', () => {
    const result = resolveCommand('/integra:direction mobile dashboard');
    expect(result?.command.id).toBe('direction');
    expect(result?.args).toEqual(['mobile', 'dashboard']);
  });

  it('does not guess commands from natural language or unknown aliases', () => {
    expect(resolveCommand('please improve my dashboard')).toBeNull();
    expect(resolveCommand('/direction')).toBeNull();
    expect(resolveCommand('')).toBeNull();
  });
});
