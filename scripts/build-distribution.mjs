import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, lstat, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INCLUDED_ROOTS = ['.agents/skills', 'docs', 'presets', 'data', 'references', 'rules', 'commands', 'schemas', 'licenses'];
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const toPosix = (value) => value.split(sep).join('/');

function safeRelative(value) {
  if (typeof value !== 'string' || !value || value.includes('\0') || value.startsWith('/') || /^[a-z]:/i.test(value)) {
    throw new Error('Unsafe package path: ' + String(value));
  }
  const parts = value.replace(/\\/g, '/').split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) throw new Error('Unsafe package path: ' + value);
  return parts.join('/');
}

async function walkFiles(root, relativeDir) {
  const absolute = join(root, ...relativeDir.split('/'));
  const info = await lstat(absolute);
  if (info.isSymbolicLink() || !info.isDirectory()) throw new Error('Expected a real directory: ' + relativeDir);
  const entries = await readdir(absolute, { withFileTypes: true });
  const result = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = safeRelative(relativeDir + '/' + entry.name);
    const full = join(root, ...rel.split('/'));
    const child = await lstat(full);
    if (child.isSymbolicLink()) throw new Error('Symlinks are not allowed in distribution resources: ' + rel);
    if (child.isDirectory()) result.push(...await walkFiles(root, rel));
    else if (child.isFile()) result.push(rel);
    else throw new Error('Unsupported filesystem entry: ' + rel);
  }
  return result;
}

function validateSkillFrontmatter(content, directory) {
  const match = content.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(directory + ': SKILL.md has no YAML frontmatter.');
  const name = match[1].match(/^name:\s*["']?([a-z0-9-]+)["']?\s*$/m)?.[1];
  const description = match[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (name !== directory) throw new Error(directory + ': frontmatter name must match its directory.');
  if (!description || description.length > 1024) throw new Error(directory + ': invalid skill description.');
}

function localMarkdownLinks(content) {
  const fence = String.fromCharCode(96).repeat(3);
  const markdown = content.split(fence).filter((_, index) => index % 2 === 0).join(' ').replace(/~~~[\s\S]*?~~~/g, '');
  return [...markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((match) => {
    const raw = match[1].trim();
    return raw.match(/^<([^>]+)>/)?.[1] ?? raw.split(/\s+/)[0];
  });
}

export async function buildDistribution({ root = ROOT, outDir = resolve(ROOT, 'packages/cli/resources') } = {}) {
  root = resolve(root);
  outDir = resolve(outDir);
  const cliPackagePath = join(root, 'packages', 'cli', 'package.json');
  const cliPackage = JSON.parse(await readFile(cliPackagePath, 'utf8'));
  if (typeof cliPackage.version !== 'string' || !/^\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z.-]+)?$/.test(cliPackage.version)) {
    throw new Error('packages/cli/package.json must contain a valid semantic version.');
  }
  const included = new Set();
  for (const directory of INCLUDED_ROOTS) {
    const absolute = join(root, ...directory.split('/'));
    const info = await lstat(absolute);
    if (info.isSymbolicLink() || !info.isDirectory()) throw new Error(directory + ' must be a real directory.');
    for (const path of await walkFiles(root, directory)) included.add(path);
  }

  const skillRoot = join(root, '.agents', 'skills');
  const skillDirs = (await readdir(skillRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (!skillDirs.length) throw new Error('No Agent Skills found in .agents/skills.');

  const skills = {};
  for (const name of skillDirs) {
    const skillFiles = [...included].filter((path) => path.startsWith('.agents/skills/' + name + '/')).sort();
    const skillPath = '.agents/skills/' + name + '/SKILL.md';
    if (!skillFiles.includes(skillPath)) throw new Error(name + ': SKILL.md is missing.');
    const content = await readFile(join(root, ...skillPath.split('/')), 'utf8');
    validateSkillFrontmatter(content, name);
    for (const destination of localMarkdownLinks(content)) {
      if (!destination || destination.startsWith('#') || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(destination)) continue;
      const decoded = decodeURIComponent(destination.split(/[?#]/, 1)[0]);
      if (!decoded || decoded.startsWith('/')) throw new Error(name + ': unsafe local resource link: ' + destination);
      const resolved = resolve(dirname(join(root, ...skillPath.split('/'))), decoded);
      const relativePath = toPosix(relative(root, resolved));
      const safe = safeRelative(relativePath);
      if (!included.has(safe)) throw new Error(name + ': linked resource is not included in the bundle: ' + destination);
    }
    skills[name] = { files: skillFiles };
  }

  const sharedFiles = [...included].filter((path) => !path.startsWith('.agents/skills/')).sort();
  const paths = [...included].sort();
  let totalBytes = 0;
  const fileEntries = [];
  for (const path of paths) {
    const content = await readFile(join(root, ...path.split('/')));
    if (content.byteLength > MAX_FILE_BYTES) throw new Error('Distribution file exceeds 10 MB: ' + path);
    totalBytes += content.byteLength;
    if (totalBytes > MAX_TOTAL_BYTES) throw new Error('Distribution bundle exceeds 50 MB.');
    fileEntries.push({ path, size: content.byteLength, sha256: sha256(content) });
  }

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  for (const path of paths) {
    const destination = join(outDir, ...path.split('/'));
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(join(root, ...path.split('/')), destination);
  }
  const bundle = {
    schemaVersion: '1.0.0',
    packageVersion: cliPackage.version,
    source: 'Hugo-JC/Integra',
    skills,
    sharedFiles,
    files: fileEntries,
    capabilities: { skills: true, linkedContext: true, repositoryRuntimeScripts: false, runtimeModules: false, scriptsExecutedDuringInstall: false },
    thirdPartyLicenses: [{ name: 'Impeccable', license: 'Apache-2.0', licenseFile: 'licenses/IMPECCABLE-APACHE-2.0.txt', noticesFile: 'docs/third-party-notices.md' }],
  };
  await writeFile(join(outDir, 'bundle.json'), JSON.stringify(bundle, null, 2) + '\n', 'utf8');
  return { skillCount: skillDirs.length, fileCount: paths.length, totalBytes };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await buildDistribution();
    console.log('Integra distribution bundle built: ' + result.skillCount + ' skills, ' + result.fileCount + ' files, ' + result.totalBytes + ' bytes.');
  } catch (error) {
    console.error('Distribution build failed: ' + (error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  }
}
