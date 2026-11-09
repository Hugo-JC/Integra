#!/usr/bin/env node
import { runCli } from '../src/installer.mjs';

const exitCode = await runCli(process.argv.slice(2), {
  cwd: process.cwd(),
  resourcesDir: new URL('../resources/', import.meta.url),
});
process.exitCode = exitCode;
