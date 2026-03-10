#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { Command } from 'commander';
import { parse } from 'dotenv';

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
      const parsedEnv = parse(fileContents);
      for (const [key, value] of Object.entries(parsedEnv)) {
        const args = ['secret', 'set', key, '--body', value];
        args.push('-R', repo);

        runGhCommand(args);
        count += 1;
        console.log(`Set ${key}`);
      }

      console.log(`Done. Uploaded ${count} secret(s) to ${repo}.`);
    });

  program.parse(process.argv);
}

main();
