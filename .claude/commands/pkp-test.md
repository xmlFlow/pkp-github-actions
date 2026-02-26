---
description: Run tests for a PKP installation
allowed-tools: Bash, Read
---

# PKP Test Command

Run tests for a PKP installation.

## Arguments
- **installation**: Installation name (e.g., ojs-stable-3_4_0)
- **test_type**: Type of test (cypress, phpunit, lint, all) - default: all

## Execution Steps

1. Change to installation directory:
```bash
cd ~/projects/github-actions/pkp-github-actions/{installation}
```

2. Based on test_type, run:

### Lint
```bash
npm run lint
```

### PHPUnit
```bash
php lib/pkp/lib/vendor/phpunit/phpunit/phpunit --configuration lib/pkp/tests/phpunit.xml --testdox
```

### Cypress (data tests)
```bash
npx cypress run --headless --browser chrome --config '{"specPattern":["cypress/tests/data/**/*.cy.js"]}'
```

### Cypress (integration tests)
```bash
npx cypress run --headless --browser chrome --config '{"specPattern":["cypress/tests/integration/**/*.cy.js","lib/pkp/cypress/tests/integration/**/*.cy.js"]}'
```

3. Report results with pass/fail status and any error details
