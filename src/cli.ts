#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { Command } from 'commander';

function runGhCommand(args: string[]): void {
  const result = spawnSync('gh', args, { stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function isGhInstalled(): boolean {
  const result = spawnSync('gh', ['--version'], { stdio: 'ignore' });
  return !result.error && result.status === 0;
}

function trimWhitespace(value: string): string {
  return value.replace(/^\s+/, '').replace(/\s+$/, '');
}

function parseEnvLine(rawLine: string): { key: string; value: string } | null {
  let line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;

  if (line.trim().length === 0) {
    return null;
  }

  if (/^\s*#/.test(line)) {
    return null;
  }

  if (line.startsWith('export ')) {
    line = line.slice('export '.length);
  }

  if (!line.includes('=')) {
    return null;
  }

  const eqIndex = line.indexOf('=');
  let key = trimWhitespace(line.slice(0, eqIndex));
  let value = trimWhitespace(line.slice(eqIndex + 1));

  if (!key) {
    return null;
  }

  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  } else if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

function main(): void {
  const program = new Command();

  program
    .name('gh-secrets-from-env')
    .description('Upload key/value pairs from an env file to GitHub Actions repository secrets')
    .argument('<envFile>', 'Env file path')
    .argument('<repo>', 'Target GitHub repository in owner/repo format')
    .action((envFile: string, repo: string) => {
      const resolvedEnvFile = envFile;

      if (!isGhInstalled()) {
        console.error('Error: GitHub CLI (gh) is not installed.');
        process.exit(1);
      }

      let fileContents: string;
      try {
        fileContents = readFileSync(resolvedEnvFile, 'utf8');
      } catch {
        console.error(`Error: Env file not found: ${resolvedEnvFile}`);
        process.exit(1);
      }

      console.log(`Uploading secrets from ${resolvedEnvFile} to ${repo}...`);

      let count = 0;
      for (const rawLine of fileContents.split('\n')) {
        const parsed = parseEnvLine(rawLine);
        if (!parsed) {
          continue;
        }

        const args = ['secret', 'set', parsed.key, '--body', parsed.value];
        args.push('-R', repo);

        runGhCommand(args);
        count += 1;
        console.log(`Set ${parsed.key}`);
      }

      console.log(`Done. Uploaded ${count} secret(s) to ${repo}.`);
    });

  program.parse(process.argv);
}

main();
