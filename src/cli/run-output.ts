import { randomUUID } from 'node:crypto';
import { lstat, mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

function isInside(root: string, target: string): boolean {
  const rel = relative(root, target);
  return Boolean(rel) && rel !== '..' && !rel.startsWith('..' + sep) && !isAbsolute(rel);
}

/** Resolves an output path that must remain under the workspace's .integra/runs directory. */
export function resolveRunOutputPath(cwd: string, requestedPath: string): string {
  if (typeof requestedPath !== 'string' || !requestedPath.trim()) {
    throw new TypeError('A non-empty run output path is required.');
  }
  const workspaceRoot = resolve(cwd);
  const runRoot = resolve(workspaceRoot, '.integra', 'runs');
  const target = resolve(workspaceRoot, requestedPath);
  if (!isInside(runRoot, target)) {
    throw new TypeError('Generated files must stay inside .integra/runs/.');
  }
  return target;
}

async function ensureSafeDirectory(workspaceRoot: string, targetDirectory: string): Promise<void> {
  const workspaceInfo = await lstat(workspaceRoot);
  if (workspaceInfo.isSymbolicLink() || !workspaceInfo.isDirectory()) {
    throw new Error('Workspace root must be a real directory.');
  }

  const relativeDirectory = relative(workspaceRoot, targetDirectory);
  if (!relativeDirectory || relativeDirectory === '..' ||
      relativeDirectory.startsWith('..' + sep) || isAbsolute(relativeDirectory)) {
    throw new TypeError('Run output directory escapes the workspace.');
  }

  let current = workspaceRoot;
  for (const segment of relativeDirectory.split(sep)) {
    current = join(current, segment);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink() || !info.isDirectory()) {
        throw new Error('Run output path contains a symlink or non-directory component: ' + current);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      await mkdir(current);
      const created = await lstat(current);
      if (created.isSymbolicLink() || !created.isDirectory()) {
        throw new Error('Could not create a safe run output directory: ' + current);
      }
    }
  }
}

/**
 * Writes generated data atomically inside .integra/runs. Protected input paths
 * cannot be overwritten, and symlinked output directories or targets are rejected.
 */
export async function writeRunOutput(
  cwd: string,
  requestedPath: string,
  content: string,
  protectedPaths: string[] = [],
): Promise<string> {
  const workspaceRoot = resolve(cwd);
  const target = resolveRunOutputPath(workspaceRoot, requestedPath);
  const protectedTargets = protectedPaths.map((path) => resolve(workspaceRoot, path));
  if (protectedTargets.includes(target)) {
    throw new Error('Run output cannot overwrite one of its input files.');
  }

  const parent = dirname(target);
  await ensureSafeDirectory(workspaceRoot, parent);

  try {
    const existing = await lstat(target);
    if (existing.isSymbolicLink() || !existing.isFile()) {
      throw new Error('Run output target must be a regular file: ' + target);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }

  const temporary = join(parent, '.' + basename(target) + '.' + randomUUID() + '.tmp');
  try {
    await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    await rename(temporary, target);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => {});
    throw error;
  }
  return target;
}
