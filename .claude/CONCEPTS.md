# Claude Code Concepts: Agents, Skills, and MCP

This guide explains the three main extensibility concepts in Claude Code, using your PKP project as examples.

## Quick Comparison

| Concept | What It Is | When to Use | Example |
|---------|------------|-------------|---------|
| **Agent** | Autonomous AI worker | Complex, multi-step tasks | "Set up OJS with full configuration" |
| **Skill** | Slash command template | Repetitive, simple tasks | `/pkp-setup ojs stable-3_4_0` |
| **MCP** | External tool server | Integration with external systems | Database queries, API calls |

---

## 1. Agents

### Concept
An **Agent** is an autonomous AI that can plan, execute, and adapt. It uses tools (Bash, Read, Write, etc.) to accomplish complex tasks.

### Your Example: PKP Release Agent
Location: `.claude/agents/pkp-release-agent.md`

**What it does:**
- Plans the setup process
- Clones repositories
- Installs dependencies
- Creates databases
- Handles errors
- Adapts to different scenarios

**How to invoke:**
```javascript
Task({
  subagent_type: "general-purpose",
  description: "Setup PKP app",
  prompt: "Set up OJS stable-3_4_0 with database from datasets"
})
```

**Key characteristics:**
- Works independently after receiving task
- Makes decisions based on context
- Can recover from errors
- Multi-step workflows

---

## 2. Skills

### Concept
A **Skill** is a predefined prompt template invoked via slash command. Skills are simpler than agents - they provide structured instructions for specific tasks.

### Your Example: PKP Setup Skill
Location: `.claude/skills/pkp-setup.md`

**What it does:**
- Provides step-by-step instructions
- Uses template variables ({{app}}, {{branch}})
- Standardizes common operations

**How to invoke:**
```
/pkp-setup ojs stable-3_4_0
```
or
```
"Run the pkp-setup skill for OMP stable-3_5_0"
```

**Key characteristics:**
- Simple, focused tasks
- Template-based
- Quick to invoke
- No complex decision-making

### Creating a Skill

1. Create `.claude/commands/pkp-setup.md`:
```markdown
---
description: Set up PKP application
arguments:
  - name: app
    required: true
  - name: branch
    required: true
---

Set up {{app}} on {{branch}}...
```

2. Use with `/pkp-setup ojs stable-3_4_0`

---

## 3. MCP (Model Context Protocol)

### Concept
**MCP** is a protocol for connecting Claude to external services. An MCP server runs as a separate process and exposes tools Claude can call.

### Your Example: PKP MCP Server
Location: `.claude/mcp/pkp-server.js`

**Tools it provides:**
- `list_pkp_installations` - List all installations
- `get_installation_info` - Get details about an installation
- `setup_pkp_app` - Set up a new application
- `run_pkp_tests` - Run tests
- `get_database_info` - Query database info

**How Claude uses it:**
```
You: "What PKP installations do I have?"

Claude: [Automatically calls list_pkp_installations tool]
        "You have 4 installations:
         - ojs-stable-3_4_0
         - ojs-stable-3_5_0
         - omp-stable-3_5_0
         - ops-stable-3_5_0"
```

**Key characteristics:**
- Runs as separate process
- Provides real-time data access
- Integrates with external systems (databases, APIs)
- Claude automatically decides when to use tools

### Setting Up MCP

1. Install dependencies:
```bash
cd .claude/mcp
npm install
```

2. Add to Claude Code settings (`~/.claude/settings.json`):
```json
{
  "mcpServers": {
    "pkp-server": {
      "command": "node",
      "args": ["/path/to/.claude/mcp/pkp-server.js"]
    }
  }
}
```

3. Restart Claude Code

---

## Choosing the Right Approach

### Use an Agent when:
- Task requires multiple steps
- Decisions need to be made during execution
- Error handling and adaptation needed
- Complex workflows

**Example:** "Set up a complete OJS installation, run tests, and fix any issues"

### Use a Skill when:
- Task is repetitive and standardized
- Simple, single-purpose operation
- Quick invocation needed
- No complex decision-making

**Example:** "Run the standard setup for OJS 3.4.0"

### Use MCP when:
- Need to access external data/systems
- Real-time information required
- Integration with databases, APIs, or files
- Want automatic tool selection by Claude

**Example:** "Show me the database tables for ojs-stable-3_4_0"

---

## File Structure

```
.claude/
├── agents/
│   └── pkp-release-agent.md    # Agent documentation
├── skills/
│   └── pkp-setup.md            # Skill definition
├── mcp/
│   ├── pkp-server.js           # MCP server code
│   ├── package.json            # Dependencies
│   └── README.md               # MCP documentation
└── CONCEPTS.md                 # This file
```

---

## Practical Examples for Your Project

### 1. Quick Setup (Skill)
```
/pkp-setup ojs stable-3_4_0
```

### 2. Complex Workflow (Agent)
```
"I need to set up OJS 3.4.0, OMP 3.4.0, and OPS 3.4.0 in parallel,
 run tests on all of them, and create a summary report"
```

### 3. Query Information (MCP)
```
"What's the database status for my ojs-stable-3_4_0 installation?"
"List all my PKP installations and their configurations"
```

---

## Next Steps

1. **Try the Skill:** Create `.claude/commands/pkp-setup.md` and test with `/pkp-setup`
2. **Set Up MCP:** Run `npm install` in `.claude/mcp/` and configure settings
3. **Explore Agents:** Ask Claude to perform complex multi-step PKP tasks

## Resources

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [Agent SDK Guide](https://github.com/anthropics/anthropic-cookbook/tree/main/misc/agent_sdk)
