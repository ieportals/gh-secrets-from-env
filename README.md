# upload-github-secrets

Upload key/value pairs from an env file into GitHub Actions repository secrets using the GitHub CLI.

## File in this repo

- `upload-github-secrets.sh`: Reads an env file line by line and runs `gh secret set` for each valid `KEY=VALUE` entry.

## Prerequisites

1. [GitHub CLI](https://cli.github.com/) installed (`gh` command available)
2. Logged in with GitHub CLI:
   ```bash
   gh auth login
   ```
3. Permission to manage secrets in the target repository

## Usage

```bash
./upload-github-secrets.sh [ENV_FILE] [REPO]
```

- `ENV_FILE` is optional.
- Default is `.env.test`.
- `REPO` is optional.
- No default hardcoded repo.

## Target repository

You can override the target repo in either of these ways:

1. CLI argument (highest priority):

```bash
./upload-github-secrets.sh .env.production owner/repo
```

2. Environment variable:

```bash
GITHUB_REPO=owner/repo ./upload-github-secrets.sh .env.production
```

If no repo is provided, the script calls `gh secret set` without `-R` and uses GitHub CLI's default repository context.

## Accepted env file format

The script supports lines like:

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
./upload-github-secrets.sh .env.test
```

```bash
./upload-github-secrets.sh .env.test owner/repo
```

Output will include each key as it is uploaded and a final count.

## Troubleshooting

- `Error: GitHub CLI (gh) is not installed.`
  - Install GitHub CLI and re-run.
- `Error: Env file not found: ...`
  - Check the file path.
- `gh` permission/auth errors
  - Run `gh auth status` and ensure you have repo admin/secret permissions.
