# gh-secrets-from-env

Upload key/value pairs from an env file into GitHub Actions repository secrets using the GitHub CLI.

## File in this repo

- `src/cli.ts`: Commander-based TypeScript CLI that reads an env file and runs `gh secret set` for each valid `KEY=VALUE` entry.

## Prerequisites

1. [Node.js](https://nodejs.org/) installed
2. [GitHub CLI](https://cli.github.com/) installed (`gh` command available)
3. Logged in with GitHub CLI:
   ```bash
   gh auth login
   ```
4. Permission to manage secrets in the target repository

## Run Without Installing

```bash
npx @ieportals/gh-secrets-from-env ENV_FILE REPO
```

- Runs from npm without local install.
- For pnpm users after publish:
  ```bash
  pnpm dlx @ieportals/gh-secrets-from-env ENV_FILE REPO
  ```
- `ENV_FILE` is required.
- `REPO` is required.

## Local Development

```bash
npm install
npm run build
node dist/cli.js ENV_FILE REPO
```

## Target repository

```bash
npx @ieportals/gh-secrets-from-env .env.production owner/repo
```

## Accepted env file format

The CLI supports lines like:

```env
# comments are ignored
API_KEY=abc123
DATABASE_URL="postgres://user:pass@host/db"
export REDIS_URL=redis://localhost:6379
```

Parsing behavior:

- Empty lines are ignored
- Lines starting with `#` are ignored
- Lines without `=` are ignored
- Leading `export ` is removed
- Surrounding whitespace is trimmed
- Single or double quotes around values are removed

## Example

```bash
npx @ieportals/gh-secrets-from-env .env.test owner/repo
```

Output will include each key as it is uploaded and a final count.

## Troubleshooting

- `Error: GitHub CLI (gh) is not installed.`
  - Install GitHub CLI and re-run.
- `Error: Env file not found: ...`
  - Check the file path.
- `gh` permission/auth errors
  - Run `gh auth status` and ensure you have repo admin/secret permissions.
