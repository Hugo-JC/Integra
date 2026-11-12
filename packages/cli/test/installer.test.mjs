import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildDistribution } from '../../../scripts/build-distribution.mjs';
import { runCli } from '../src/installer.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'integra-fixture-'));
  const resources = join(root, 'resources');
  const project = join(root, 'project');
  await mkdir(join(root, 'packages', 'cli'), { recursive: true });
  await writeFile(join(root, 'packages', 'cli', 'package.json'), JSON.stringify({ name: 'integra-cli', version: '0.2.0' }));
  await mkdir(project);
  for (const directory of ['.agents/skills/integra', '.agents/skills/integra-design-direction', 'docs', 'presets', 'data', 'references', 'rules', 'commands', 'schemas', 'licenses']) {
    await mkdir(join(root, directory), { recursive: true });
  }
  await writeFile(join(root, '.agents/skills/integra/SKILL.md'), '---\nname: integra\ndescription: Main workflow.\n---\nSee [context](../../../docs/context.md).\n');
  await writeFile(join(root, '.agents/skills/integra-design-direction/SKILL.md'), '---\nname: integra-design-direction\ndescription: Design direction.\n---\nUse the context file.\n');
  await writeFile(join(root, 'docs/context.md'), '# Shared context\n');
  await writeFile(join(root, 'presets/example.json'), '{"ok":true}\n');
  await buildDistribution({ root, outDir: resources });
  t.after(async () => rm(root, { recursive: true, force: true }));
  const output = [];
  const errors = [];
  const cli = (...args) => runCli(args, {
    cwd: project,
    resourcesDir: resources,
    stdout: (line) => output.push(line),
    stderr: (line) => errors.push(line),
  });
  return { root, project, resources, output, errors, cli };
}

test('bundler closes skill links and emits integrity hashes', async (t) => {
  const f = await fixture(t);
  const bundle = JSON.parse(await readFile(join(f.resources, 'bundle.json'), 'utf8'));
  assert.equal(bundle.skills.integra.files.length, 1);
  assert.equal(bundle.packageVersion, '0.2.0');
  assert.ok(bundle.sharedFiles.includes('docs/context.md'));
  assert.match(bundle.files.find((entry) => entry.path === 'docs/context.md').sha256, /^[a-f0-9]{64}$/);
});

test('init installs all skills, linked context and a lifecycle manifest', async (t) => {
  const f = await fixture(t);
  assert.equal(await f.cli('init'), 0);
  assert.ok(await readFile(join(f.project, '.agents/skills/integra/SKILL.md'), 'utf8'));
  assert.ok(await readFile(join(f.project, 'docs/context.md'), 'utf8'));
  const state = JSON.parse(await readFile(join(f.project, '.integra/install-manifest.json'), 'utf8'));
  assert.deepEqual(Object.keys(state.skills).sort(), ['integra', 'integra-design-direction']);
  assert.equal(state.managedFiles['docs/context.md'].owners.length, 2);
});

test('add refuses to overwrite an untracked conflicting file', async (t) => {
  const f = await fixture(t);
  await mkdir(join(f.project, '.agents/skills/integra'), { recursive: true });
  await writeFile(join(f.project, '.agents/skills/integra/SKILL.md'), 'user-owned');
  assert.equal(await f.cli('add', 'integra'), 1);
  assert.equal(await readFile(join(f.project, '.agents/skills/integra/SKILL.md'), 'utf8'), 'user-owned');
  assert.match(f.errors.join('\n'), /not managed by Integra/);
});

test('target traversal is rejected before any write', async (t) => {
  const f = await fixture(t);
  assert.equal(await f.cli('init', '--target', '../outside'), 1);
  assert.equal(f.errors.length, 1);
});

test('symlink targets are rejected', async (t) => {
  const f = await fixture(t);
  const outside = join(f.root, 'outside');
  await mkdir(outside);
  await symlink(outside, join(f.project, '.agents'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal(await f.cli('add', 'integra'), 1);
  assert.match(f.errors.join('\n'), /Symlink|Unsafe directory/);
});

test('update preserves local modifications', async (t) => {
  const f = await fixture(t);
  assert.equal(await f.cli('init', 'integra'), 0);
  const skillPath = join(f.project, '.agents/skills/integra/SKILL.md');
  await writeFile(skillPath, 'locally edited');
  assert.equal(await f.cli('update'), 1);
  assert.equal(await readFile(skillPath, 'utf8'), 'locally edited');
  assert.match(f.errors.join('\n'), /Preserved local modification/);
});

test('remove deletes only unchanged installer-managed files', async (t) => {
  const f = await fixture(t);
  assert.equal(await f.cli('init', 'integra'), 0);
  const skillPath = join(f.project, '.agents/skills/integra/SKILL.md');
  await writeFile(skillPath, 'user edit after install');
  assert.equal(await f.cli('remove', 'integra'), 1);
  assert.equal(await readFile(skillPath, 'utf8'), 'user edit after install');
  await assert.rejects(lstat(join(f.project, 'docs/context.md')));
});

test('doctor reports modified files', async (t) => {
  const f = await fixture(t);
  assert.equal(await f.cli('init', 'integra'), 0);
  await writeFile(join(f.project, 'docs/context.md'), 'tampered');
  assert.equal(await f.cli('doctor'), 1);
  assert.match(f.errors.join('\n'), /Locally modified/);
});

test('doctor reports a healthy installation and list shows installed skills', async (t) => {
  const f = await fixture(t);
  assert.equal(await f.cli('init', 'integra'), 0);
  assert.equal(await f.cli('doctor'), 0);
  assert.equal(await f.cli('list'), 0);
  assert.ok(f.output.some((line) => line.includes('[installed] integra')));
});

test('bundle tampering is rejected before installation', async (t) => {
  const f = await fixture(t);
  await writeFile(join(f.resources, 'docs/context.md'), 'tampered bundle');
  assert.equal(await f.cli('init', 'integra'), 1);
  assert.match(f.errors.join('\n'), /Bundle integrity check failed/);
});

test('lifecycle commands reuse a custom target recorded at init', async (t) => {
  const f = await fixture(t);
  assert.equal(await f.cli('init', 'integra', '--target', '.claude/skills'), 0);
  assert.ok(await readFile(join(f.project, '.claude/skills/integra/SKILL.md'), 'utf8'));
  assert.equal(await f.cli('doctor'), 0);
  assert.equal(await f.cli('update'), 0);
  assert.equal(await f.cli('remove', 'integra'), 0);
  await assert.rejects(lstat(join(f.project, '.claude/skills/integra/SKILL.md')));
});

test('removing one skill keeps shared context referenced by another skill', async (t) => {
  const f = await fixture(t);
  assert.equal(await f.cli('init'), 0);
  assert.equal(await f.cli('remove', 'integra'), 0);
  assert.ok(await readFile(join(f.project, 'docs/context.md'), 'utf8'));
  const state = JSON.parse(await readFile(join(f.project, '.integra/install-manifest.json'), 'utf8'));
  assert.deepEqual(Object.keys(state.skills), ['integra-design-direction']);
  assert.deepEqual(state.managedFiles['docs/context.md'].owners, ['integra-design-direction']);
});

test('update refreshes a changed bundled file from a newer bundle version', async (t) => {
  const f = await fixture(t);
  assert.equal(await f.cli('init', 'integra'), 0);
  const contextPath = join(f.resources, 'docs/context.md');
  const updatedContent = '# Updated shared context\n';
  await writeFile(contextPath, updatedContent);
  const manifestPath = join(f.resources, 'bundle.json');
  const bundle = JSON.parse(await readFile(manifestPath, 'utf8'));
  const { createHash } = await import('node:crypto');
  const bytes = Buffer.from(updatedContent);
  const entry = bundle.files.find((item) => item.path === 'docs/context.md');
  entry.size = bytes.byteLength;
  entry.sha256 = createHash('sha256').update(bytes).digest('hex');
  bundle.packageVersion = '0.2.0';
  await writeFile(manifestPath, JSON.stringify(bundle, null, 2) + '\n');
  assert.equal(await f.cli('update'), 0, f.errors.join('\\n'));
  assert.equal(await readFile(join(f.project, 'docs/context.md'), 'utf8'), updatedContent);
});
