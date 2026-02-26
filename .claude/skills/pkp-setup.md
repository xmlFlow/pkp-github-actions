# PKP Setup Skill

## What is a Claude Skill?

A Skill is a **predefined prompt template** that users can invoke with a slash command.
Skills are simpler than agents - they provide structured instructions for specific tasks.

## Skill Definition

Create this file at `.claude/skills/pkp-setup.md`:

```markdown
---
name: pkp-setup
description: Set up a PKP application (OJS/OMP/OPS) with database from datasets
arguments:
  - name: app
    description: Application name (ojs, omp, ops)
    required: true
  - name: branch
    description: Branch name (e.g., stable-3_4_0, stable-3_5_0, main)
    required: true
  - name: node_version
    description: Node.js version to use
    default: "22"
---

# PKP Setup Skill

Set up {{app}} on branch {{branch}} with Node.js {{node_version}}.

## Steps to Execute:

1. **Create directory structure**:
   ```
   ~/projects/github-actions/pkp-github-actions/{{app}}-{{branch}}/
   ```

2. **Clone and checkout**:
   - Clone from https://github.com/pkp/{{app}}.git
   - Checkout branch: {{branch}}
   - Initialize submodules

3. **Install dependencies**:
   - Run composer install
   - Use Node.js {{node_version}}
   - Run npm install && npm run build

4. **Database setup**:
   - Database name: {{app}}-dataset-{{branch}}
   - Username: {{app}}-dataset-{{branch}}
   - Password: {{app}}-dataset-{{branch}}
   - Import from: https://raw.githubusercontent.com/pkp/datasets/main/{{app}}/{{branch}}/mysql/database.sql

5. **Configure**:
   - Download config.inc.php from datasets
   - Update database credentials in config.inc.php

6. **Verify**:
   - Check database tables exist
   - Confirm config.inc.php has correct values
```

## How to Use Skills

### Method 1: Slash Command
```
/pkp-setup ojs stable-3_4_0
```

### Method 2: Natural Language
```
"Run the pkp-setup skill for OMP on stable-3_5_0 with node 20"
```

### Method 3: Skill Tool
```javascript
Skill({
  skill: "pkp-setup",
  args: "ojs stable-3_4_0 --node_version=22"
})
```

## Creating Skills in Claude Code

### Step 1: Create the skill file

Location: `.claude/skills/<skill-name>.md`

### Step 2: Define metadata (YAML frontmatter)

```yaml
---
name: skill-name
description: What the skill does
arguments:
  - name: arg1
    description: First argument
    required: true
  - name: arg2
    description: Second argument
    default: "default-value"
---
```

### Step 3: Write the prompt template

Use `{{argument_name}}` for variable substitution.

## More PKP Skill Examples

### pkp-test Skill

```markdown
---
name: pkp-test
description: Run tests for a PKP application
arguments:
  - name: app
    required: true
  - name: test_type
    description: Type of test (cypress, phpunit, lint)
    default: "all"
---

Run {{test_type}} tests for {{app}}.

For cypress:
- npx cypress run --config specPattern="cypress/tests/**/*.cy.js"

For phpunit:
- php lib/pkp/lib/vendor/phpunit/phpunit/phpunit --configuration lib/pkp/tests/phpunit.xml

For lint:
- npm run lint
```

### pkp-upgrade Skill

```markdown
---
name: pkp-upgrade
description: Test upgrade path between PKP versions
arguments:
  - name: app
    required: true
  - name: from_version
    required: true
  - name: to_version
    required: true
---

Test upgrade from {{from_version}} to {{to_version}} for {{app}}.

1. Set up {{app}}-{{from_version}} with dataset
2. Run upgrade script to {{to_version}}
3. Verify data integrity
4. Run smoke tests
```

## Skill vs Agent Comparison

| Feature | Skill | Agent |
|---------|-------|-------|
| Complexity | Simple, single-purpose | Complex, multi-step |
| Invocation | Slash command | Task tool |
| Autonomy | Follows template | Makes decisions |
| Error Handling | Basic | Adaptive |
| Use Case | Repetitive tasks | Complex workflows |
