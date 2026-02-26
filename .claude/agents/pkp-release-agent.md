# PKP Release Agent

## What is a Claude Agent?

A Claude Agent is an autonomous AI assistant that can:
- Execute multi-step tasks independently
- Use tools (Bash, Read, Write, etc.) to accomplish goals
- Make decisions based on context and results
- Handle errors and adapt its approach

## Agent Definition

```yaml
name: pkp-release-agent
description: Automates PKP application (OJS/OMP/OPS) setup and release workflows
capabilities:
  - Clone and configure PKP applications
  - Set up databases with dataset injection
  - Update configuration files
  - Run tests and validation
```

## How This Agent Works

### 1. Task Reception
The agent receives a task like:
```
"Set up OJS 3.4.0 with database from datasets"
```

### 2. Planning Phase
The agent breaks down the task:
1. Determine application (ojs), branch (stable-3_4_0), node version
2. Clone repository to correct directory structure
3. Install dependencies (composer, npm)
4. Download and import database
5. Update config.inc.php with credentials
6. Verify installation

### 3. Execution Phase
The agent executes each step using tools:

```python
# Pseudocode of agent logic
def setup_pkp_app(app, branch, node_version):
    # Step 1: Determine paths
    app_dir = f"~/projects/github-actions/pkp-github-actions/{app}-{branch}"
    db_name = f"{app}-dataset-{branch}"

    # Step 2: Clone if needed
    if not exists(app_dir):
        bash(f"git clone https://github.com/pkp/{app}.git {app_dir}")

    # Step 3: Checkout branch
    bash(f"cd {app_dir} && git checkout {branch}")

    # Step 4: Install dependencies
    bash(f"cd {app_dir} && composer install && npm install && npm run build")

    # Step 5: Setup database
    bash(f"mysql -e 'CREATE DATABASE {db_name}'")
    bash(f"wget datasets/{app}/{branch}/database.sql")
    bash(f"mysql {db_name} < database.sql")

    # Step 6: Update config
    update_config(f"{app_dir}/config.inc.php", db_name)

    # Step 7: Verify
    verify_installation(app_dir, db_name)
```

### 4. Error Handling
The agent handles errors gracefully:
- If clone fails → check network, retry
- If npm fails → try different node version
- If database import fails → check credentials, permissions

## Example Agent Invocation

Using Claude Code's Task tool:

```javascript
// Launch the PKP release agent
Task({
  subagent_type: "general-purpose",
  description: "Setup OJS 3.4.0",
  prompt: `
    Set up OJS stable-3_4_0 installation:
    1. Directory: ~/projects/github-actions/pkp-github-actions/ojs-stable-3_4_0
    2. Database: ojs-dataset-stable-3_4_0
    3. Node version: 22
    4. Import data from pkp/datasets
    5. Update config.inc.php with database credentials
  `
})
```

## Creating Your Own Agent

To create a custom agent for PKP tasks:

1. **Define the scope**: What tasks should it handle?
2. **List required tools**: Bash, Read, Write, Grep, etc.
3. **Define decision logic**: How should it handle different scenarios?
4. **Add error recovery**: What to do when things fail?

### Example: Custom PKP Test Agent

```yaml
name: pkp-test-agent
description: Runs PKP application tests
tools:
  - Bash
  - Read
  - Grep
workflow:
  1. Detect test type (cypress, phpunit, lint)
  2. Ensure dependencies are installed
  3. Run appropriate test command
  4. Parse and report results
  5. Suggest fixes for failures
```

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Autonomy** | Agent works independently after receiving task |
| **Tool Use** | Agent uses available tools to accomplish goals |
| **Context Awareness** | Agent understands codebase and environment |
| **Adaptability** | Agent adjusts approach based on results |
| **Reporting** | Agent summarizes results for user |
