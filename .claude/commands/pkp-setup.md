---
description: Set up a PKP application (OJS/OMP/OPS) with database from datasets
allowed-tools: Bash, Read, Write, Grep
---

# PKP Setup Command

Set up a PKP application with the following parameters from user input:
- **app**: Application name (ojs, omp, or ops)
- **branch**: Git branch (e.g., stable-3_4_0, stable-3_5_0, main)
- **node_version**: Node.js version (default: 22)

## Execution Steps

1. Parse user arguments to determine app, branch, and node_version

2. Run the release script:
```bash
source ~/.nvm/nvm.sh && nvm use {node_version} && source /home/withanage/scripts/release-pkp-github-action.sh \
  --base=pkp \
  --issue="claude" \
  --remote=main \
  --comment="setup" \
  --install=1 \
  --release=0 \
  --check_repo=1 \
  --check_data=1 \
  --git_push=0 \
  --node_version={node_version} \
  --branch={branch} \
  --app={app}
```

3. Verify the installation:
   - Check directory exists: `~/projects/github-actions/pkp-github-actions/{app}-{branch}/`
   - Check database: `{app}-dataset-{branch}`
   - Check config.inc.php has correct credentials

4. Report results to user with:
   - Installation path
   - Database name
   - Config status
   - Any errors encountered
