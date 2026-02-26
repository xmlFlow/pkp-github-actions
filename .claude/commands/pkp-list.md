---
description: List all PKP installations and their status
allowed-tools: Bash, Read, Grep
---

# PKP List Command

List all PKP application installations in the project folder.

## Execution Steps

1. List directories matching pattern `{app}-{branch}`:
```bash
ls -la ~/projects/github-actions/pkp-github-actions/ | grep -E "^d.*(ojs|omp|ops)-"
```

2. For each installation, check:
   - Has config.inc.php (configured)
   - Database exists
   - Git branch

3. Show databases:
```bash
mysql -u root -pSP1SQL-cb -e "SHOW DATABASES LIKE '%-dataset-%';"
```

4. Present results in a table format:

| Installation | Config | Database | Branch |
|--------------|--------|----------|--------|
| ojs-stable-3_4_0 | Yes | ojs-dataset-stable-3_4_0 | stable-3_4_0 |
