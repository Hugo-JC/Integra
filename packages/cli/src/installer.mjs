import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { lstat, mkdir, readFile, rename, rm, unlink, writeFile } from 'node:fs/promises';

const STATE_PATH = '.integra/install-manifest.json';
const STATE_SCHEMA = '1.0.0';
const DEFAULT_TARGET = '.agents/skills';
const MAX_BUNDLE_BYTES = 50 * 1024 * 1024;
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const toPosix = (value) => value.split(sep).join('/');

function safeRelative(value) {
  if (typeof value !== 'string' || !value || value.includes('\0')) throw new Error('Invalid relative path.');
  const normalized = value.replace(/\\/g, '/');
  if (normalized.startsWith('/') || /^[a-z]:/i.test(normalized)) throw new Error('Absolute paths are not allowed: ' + value);
  const segments = normalized.split('/');
  if (segments.some((part) => !part || part === '.' || part === '..')) throw new Error('Path traversal is not allowed: ' + value);
  return segments.join('/');
}

function resolveInside(root, relativePath) {
  const safe = safeRelative(relativePath);
  const absolute = resolve(root, ...safe.split('/'));
  const rel = relative(root, absolute);
  if (!rel || rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) throw new Error('Path escapes the project root: ' + relativePath);
  return absolute;
}

async function assertNoSymlinks(root, relativePath) {
  const parts = safeRelative(relativePath).split('/');
  let current = root;
  for (let index = 0; index < parts.length; index += 1) {
    current = join(current, parts[index]);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink()) throw new Error('Symlink path component is not allowed: ' + toPosix(relative(root, current)));
      if (index < parts.length - 1 && !info.isDirectory()) throw new Error('A parent path is not a directory: ' + toPosix(relative(root, current)));
    } catch (error) {
      if (error?.code === 'ENOENT') break;
      throw error;
    }
  }
}

async function ensureDirectory(root, relativePath) {
  const safe = safeRelative(relativePath);
  let current = root;
  for (const part of safe.split('/')) {
    current = join(current, part);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink() || !info.isDirectory()) throw new Error('Unsafe directory path: ' + toPosix(relative(root, current)));
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      await mkdir(current);
    }
  }
}

async function fileHash(path) {
  try {
    const info = await lstat(path);
    if (info.isSymbolicLink() || !info.isFile()) throw new Error('Expected a regular file: ' + path);
    return sha256(await readFile(path));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function atomicWrite(root, relativePath, content) {
  const destination = resolveInside(root, relativePath);
  const parentRel = dirname(relativePath).split(sep).join('/');
  if (parentRel !== '.') await ensureDirectory(root, parentRel);
  await assertNoSymlinks(root, relativePath);
  const temporary = join(dirname(destination), '.' + randomUUID() + '.integra-tmp');
  try {
    await writeFile(temporary, content, { flag: 'wx', mode: 0o644 });
    await rename(temporary, destination);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => {});
    throw error;
  }
}

async function loadBundle(resourcesDir) {
  const root = resourcesDir instanceof URL ? fileURLToPath(resourcesDir) : resolve(resourcesDir);
  const raw = JSON.parse(await readFile(join(root, 'bundle.json'), 'utf8'));
  if (raw.schemaVersion !== '1.0.0' || !raw.skills || !Array.isArray(raw.files) || !Array.isArray(raw.sharedFiles)) {
    throw new Error('Unsupported or invalid Integra resource bundle.');
  }
  const fileMap = new Map();
  let total = 0;
  for (const entry of raw.files) {
    const path = safeRelative(entry.path);
    if (fileMap.has(path) || !/^[a-f0-9]{64}$/.test(entry.sha256) || !Number.isInteger(entry.size) || entry.size < 0) {
      throw new Error('Invalid bundle file record: ' + path);
    }
    await assertNoSymlinks(root, path);
    const absolute = resolveInside(root, path);
    const content = await readFile(absolute);
    total += content.byteLength;
    if (total > MAX_BUNDLE_BYTES || content.byteLength !== entry.size || sha256(content) !== entry.sha256) {
      throw new Error('Bundle integrity check failed: ' + path);
    }
    fileMap.set(path, { path, content, sha256: entry.sha256 });
  }
  const skills = {};
  for (const [name, entry] of Object.entries(raw.skills)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || !Array.isArray(entry.files) || !entry.files.length) {
      throw new Error('Invalid skill entry in bundle: ' + name);
    }
    skills[name] = { files: entry.files.map(safeRelative) };
    for (const path of skills[name].files) {
      if (!path.startsWith('.agents/skills/' + name + '/') || !fileMap.has(path)) {
        throw new Error('Skill resource is missing or outside its directory: ' + name + ' (' + path + ')');
      }
    }
  }
  const sharedFiles = raw.sharedFiles.map(safeRelative);
  if (sharedFiles.some((path) => !fileMap.has(path) || path.startsWith('.agents/skills/'))) {
    throw new Error('Bundle contains an invalid shared resource path.');
  }
  return { root, raw, skills, sharedFiles, fileMap };
}

function emptyState(bundle, targetDir) {
  return {
    schemaVersion: STATE_SCHEMA,
    packageVersion: bundle.raw.packageVersion,
    source: bundle.raw.source,
    targetDir,
    updatedAt: new Date().toISOString(),
    skills: {},
    managedFiles: {},
  };
}

async function readState(cwd, bundle, targetDir = null) {
  const stateAbsolute = resolveInside(cwd, STATE_PATH);
  await assertNoSymlinks(cwd, STATE_PATH);
  try {
    const parsed = JSON.parse(await readFile(stateAbsolute, 'utf8'));
    if (parsed.schemaVersion !== STATE_SCHEMA || !parsed.skills || !parsed.managedFiles) {
      throw new Error('Unsupported installer manifest. Back it up and inspect it before continuing.');
    }
    if (targetDir && parsed.targetDir !== targetDir) throw new Error('Integra is already installed at "' + parsed.targetDir + '". Use that same --target path.');
    for (const [path, entry] of Object.entries(parsed.managedFiles)) {
      safeRelative(path);
      safeRelative(entry.sourcePath);
      if (!Array.isArray(entry.owners) || !/^[a-f0-9]{64}$/.test(entry.sha256)) throw new Error('Invalid managed-file record: ' + path);
    }
    return parsed;
  } catch (error) {
    if (error?.code === 'ENOENT') return emptyState(bundle, targetDir ?? DEFAULT_TARGET);
    throw error;
  }
}

async function saveState(cwd, state) {
  state.updatedAt = new Date().toISOString();
  await atomicWrite(cwd, STATE_PATH, JSON.stringify(state, null, 2) + '\n');
}

function destinationFor(sourcePath, skillName, targetDir) {
  const prefix = '.agents/skills/' + skillName + '/';
  if (sourcePath.startsWith(prefix)) return safeRelative(targetDir + '/' + skillName + '/' + sourcePath.slice(prefix.length));
  return safeRelative(sourcePath);
}

function expectedFilesFor(bundle, skillName, targetDir) {
  const sourcePaths = [...bundle.skills[skillName].files, ...bundle.sharedFiles];
  const seen = new Set();
  return sourcePaths.map((sourcePath) => {
    const destination = destinationFor(sourcePath, skillName, targetDir);
    if (seen.has(destination)) throw new Error('Duplicate destination in resource bundle: ' + destination);
    seen.add(destination);
    const entry = bundle.fileMap.get(sourcePath);
    if (!entry) throw new Error('Missing bundle resource: ' + sourcePath);
    return { path: destination, sourcePath, sha256: entry.sha256, content: entry.content };
  });
}

async function installOne(cwd, state, bundle, name, targetDir, io, dryRun) {
  if (!bundle.skills[name]) {
    io.error('Unknown skill: ' + name);
    return false;
  }
  const expected = expectedFilesFor(bundle, name, targetDir);
  const planned = [];
  const external = [];
  const conflicts = [];
  for (const file of expected) {
    await assertNoSymlinks(cwd, file.path);
    const current = await fileHash(resolveInside(cwd, file.path));
    const managed = state.managedFiles[file.path];
    if (managed) {
      if (current !== managed.sha256) conflicts.push(file.path + ' has local changes; preserved.');
      else if (managed.sha256 !== file.sha256) conflicts.push(file.path + ' has a newer bundled version; run integra update.');
      else planned.push({ ...file, action: 'managed' });
    } else if (current !== null) {
      if (current === file.sha256) external.push(file);
      else conflicts.push(file.path + ' already exists and is not managed by Integra.');
    } else planned.push({ ...file, action: 'write' });
  }
  if (conflicts.length) {
    io.error('Skipped ' + name + ' to protect existing files:');
    conflicts.forEach((item) => io.error('  - ' + item));
    return false;
  }
  if (dryRun) {
    io.log('Would install ' + name + ' (' + planned.filter((item) => item.action === 'write').length +
      ' new files, ' + external.length + ' identical user-owned files).');
    return true;
  }

  const created = [];
  const nextState = structuredClone(state);
  try {
    for (const file of planned) {
      if (file.action === 'write') {
        await atomicWrite(cwd, file.path, file.content);
        created.push(file.path);
        nextState.managedFiles[file.path] = { sourcePath: file.sourcePath, sha256: file.sha256, owners: [name] };
      } else {
        const entry = nextState.managedFiles[file.path];
        if (!entry.owners.includes(name)) entry.owners.push(name);
      }
    }
    const expectedHashes = Object.fromEntries(expected.map((file) => [file.path, file.sha256]));
    nextState.skills[name] = {
      packageVersion: bundle.raw.packageVersion,
      installedAt: nextState.skills[name]?.installedAt ?? new Date().toISOString(),
      expectedHashes,
      externalFiles: external.map((file) => file.path),
    };
    await saveState(cwd, nextState);
    Object.assign(state, nextState);
    io.log('Installed ' + name + ': ' + planned.filter((item) => item.action === 'write').length +
      ' files written, ' + external.length + ' identical user-owned files left untouched.');
    return true;
  } catch (error) {
    for (const path of created.reverse()) {
      const entry = nextState.managedFiles[path];
      if (await fileHash(resolveInside(cwd, path)) === entry?.sha256) await unlink(resolveInside(cwd, path)).catch(() => {});
    }
    throw error;
  }
}

async function commandInstall(command, names, cwd, state, bundle, targetDir, io, dryRun) {
  const selected = names.length ? [...new Set(names)] : command === 'init' ? Object.keys(bundle.skills) : [];
  if (!selected.length) {
    io.error('Specify at least one skill name. Run "integra list" to see available skills.');
    return 1;
  }
  let failed = false;
  for (const name of selected) if (!await installOne(cwd, state, bundle, name, targetDir, io, dryRun)) failed = true;
  return failed ? 1 : 0;
}

async function updateInstalled(cwd, state, bundle, io, dryRun) {
  if (!Object.keys(state.skills).length) {
    io.error('No Integra skills are recorded in this project.');
    return 1;
  }
  const nextState = structuredClone(state);
  let updated = 0;
  let conflicts = 0;
  for (const path of Object.keys(nextState.managedFiles)) {
    const record = nextState.managedFiles[path];
    const bundled = bundle.fileMap.get(record.sourcePath);
    if (!bundled) {
      io.error('Resource no longer exists in this bundle; preserved: ' + path);
      conflicts += 1;
      continue;
    }
    await assertNoSymlinks(cwd, path);
    const absolute = resolveInside(cwd, path);
    const current = await fileHash(absolute);
    if (current !== null && current !== record.sha256) {
      io.error('Preserved local modification: ' + path);
      conflicts += 1;
      continue;
    }
    if (current === bundled.sha256) {
      record.sha256 = bundled.sha256;
      continue;
    }
    if (dryRun) {
      io.log('Would update ' + path);
      updated += 1;
      continue;
    }
    await atomicWrite(cwd, path, bundled.content);
    record.sha256 = bundled.sha256;
    updated += 1;
  }
  if (!dryRun) {
    for (const skill of Object.values(nextState.skills)) {
      skill.packageVersion = bundle.raw.packageVersion;
      for (const [path, record] of Object.entries(nextState.managedFiles)) {
        if (skill.expectedHashes[path] !== undefined) skill.expectedHashes[path] = record.sha256;
      }
    }
    nextState.packageVersion = bundle.raw.packageVersion;
    await saveState(cwd, nextState);
    Object.assign(state, nextState);
  }
  io.log((dryRun ? 'Update preview: ' : 'Update complete: ') + updated + ' file(s) ' +
    (dryRun ? 'would change' : 'updated') + ', ' + conflicts + ' conflict(s).');
  return conflicts ? 1 : 0;
}

async function removeSkills(cwd, state, names, io, dryRun) {
  if (!names.length) {
    io.error('Specify one or more skill names to remove.');
    return 1;
  }
  const nextState = structuredClone(state);
  let removed = 0;
  let preserved = 0;
  for (const name of [...new Set(names)]) {
    const skill = nextState.skills[name];
    if (!skill) {
      io.error('Skill is not managed by this installation: ' + name);
      preserved += 1;
      continue;
    }
    for (const path of Object.keys(skill.expectedHashes)) {
      const managed = nextState.managedFiles[path];
      if (!managed) continue;
      managed.owners = managed.owners.filter((owner) => owner !== name);
      if (managed.owners.length) continue;
      await assertNoSymlinks(cwd, path);
      const absolute = resolveInside(cwd, path);
      const current = await fileHash(absolute);
      if (current === managed.sha256 && !dryRun) {
        await unlink(absolute);
        removed += 1;
      } else if (current === managed.sha256 && dryRun) removed += 1;
      else if (current !== null) {
        io.error('Preserved modified or replaced file: ' + path);
        preserved += 1;
      }
      delete nextState.managedFiles[path];
    }
    delete nextState.skills[name];
    io.log((dryRun ? 'Would remove ' : 'Removed ') + name + '.');
  }
  if (!dryRun) {
    await saveState(cwd, nextState);
    Object.assign(state, nextState);
  }
  io.log('Removal summary: ' + removed + ' managed file(s) ' + (dryRun ? 'would be removed' : 'removed') +
    ', ' + preserved + ' file(s) preserved.');
  return preserved ? 1 : 0;
}

function listSkills(state, bundle, io) {
  io.log('Available Integra skills:');
  for (const name of Object.keys(bundle.skills).sort()) io.log('  ' + (state.skills[name] ? '[installed] ' : '[available] ') + name);
  io.log('Shared context files: ' + bundle.sharedFiles.length);
}

async function doctor(cwd, state, bundle, io) {
  const issues = [];
  for (const [name, skill] of Object.entries(state.skills)) {
    for (const [path, expected] of Object.entries(skill.expectedHashes ?? {})) {
      const managed = state.managedFiles[path];
      await assertNoSymlinks(cwd, path);
      const current = await fileHash(resolveInside(cwd, path));
      if (current === null) issues.push('Missing: ' + path);
      else if (managed && current !== managed.sha256) issues.push('Locally modified: ' + path);
      else if (!managed && current !== expected) issues.push('External file changed: ' + path);
    }
    if (!bundle.skills[name]) issues.push('Installed skill is absent from this bundle: ' + name);
  }
  for (const [path, record] of Object.entries(state.managedFiles)) {
    if (!record.owners.length) issues.push('Managed file has no owners: ' + path);
  }
  if (issues.length) {
    io.error('Integra doctor found ' + issues.length + ' issue(s):');
    issues.forEach((issue) => io.error('  - ' + issue));
    return 1;
  }
  io.log('Integra installation is healthy: ' + Object.keys(state.skills).length +
    ' skill(s), ' + Object.keys(state.managedFiles).length + ' managed file(s).');
  if (bundle.raw.capabilities?.repositoryRuntimeScripts === false) {
    io.log('Note: repository npm scripts and runtime modules are not installed in this project.');
  }
  return 0;
}

function parseArguments(args) {
  const [command = 'help', ...rest] = args;
  const options = { target: DEFAULT_TARGET, targetSpecified: false, dryRun: false, names: [] };
  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value === '--target') {
      if (!rest[index + 1]) throw new Error('--target requires a relative directory path.');
      options.target = safeRelative(rest[++index]);
      options.targetSpecified = true;
    } else if (value === '--dry-run') options.dryRun = true;
    else if (value === '--help' || value === '-h') return { command: 'help', ...options };
    else if (value.startsWith('-')) throw new Error('Unknown option: ' + value);
    else options.names.push(value);
  }
  return { command, ...options };
}

function printHelp(io) {
  io.log('Integra CLI 0.1.0');
  io.log('');
  io.log('Commands:');
  io.log('  integra init [--target .agents/skills] [--dry-run]   Install all skills');
  io.log('  integra add <skill...> [--target PATH]              Install selected skills');
  io.log('  integra list [--target PATH]                        List available and installed skills');
  io.log('  integra doctor [--target PATH]                      Verify installation integrity');
  io.log('  integra update [--dry-run]                          Update managed files safely');
  io.log('  integra remove <skill...> [--dry-run]               Remove selected managed skills');
  io.log('');
  io.log('The installer never executes bundled scripts or overwrites unmanaged files.');
}

export async function runCli(args, {
  cwd = process.cwd(),
  resourcesDir = new URL('../resources/', import.meta.url),
  stdout = console.log,
  stderr = console.error,
} = {}) {
  const io = { log: stdout, error: stderr };
  try {
    const parsed = parseArguments(args);
    if (['help', '--help', '-h'].includes(parsed.command)) {
      printHelp(io);
      return 0;
    }
    if (!['init', 'add', 'list', 'doctor', 'update', 'remove'].includes(parsed.command)) throw new Error('Unknown command: ' + parsed.command);
    const bundle = await loadBundle(resourcesDir);
    const projectRoot = resolve(cwd);
    const state = await readState(projectRoot, bundle, parsed.targetSpecified ? parsed.target : null);
    const targetDir = state.targetDir;
    if (parsed.command === 'list') {
      listSkills(state, bundle, io);
      return 0;
    }
    if (parsed.command === 'doctor') return await doctor(projectRoot, state, bundle, io);
    if (parsed.command === 'init' || parsed.command === 'add') {
      if (parsed.command === 'add' && !parsed.names.length) throw new Error('Usage: integra add <skill...>');
      return await commandInstall(parsed.command, parsed.names, projectRoot, state, bundle, targetDir, io, parsed.dryRun);
    }
    if (parsed.command === 'update') return await updateInstalled(projectRoot, state, bundle, io, parsed.dryRun);
    if (parsed.command === 'remove') return await removeSkills(projectRoot, state, parsed.names, io, parsed.dryRun);
    return 0;
  } catch (error) {
    io.error('Integra CLI error: ' + (error instanceof Error ? error.message : String(error)));
    return 1;
  }
}
