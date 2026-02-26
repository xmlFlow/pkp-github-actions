# Claude Code Extensibility - Quick Start

## 3 Ways to Extend Claude Code

### 1. Skills (Slash Commands)
**Location:** `.claude/commands/`

Simple templates invoked with `/command`:
```
/pkp-setup ojs stable-3_4_0
/pkp-list
/pkp-test ojs-stable-3_4_0
```

### 2. Agents
**Location:** `.claude/agents/`

Autonomous AI workers for complex multi-step tasks.
Invoked via Task tool internally.

### 3. MCP (Model Context Protocol)
**Location:** `.claude/mcp/`

External server providing tools Claude can call.
Setup: `cd .claude/mcp && npm install`

## File Structure
```
.claude/
├── QUICKSTART.md      ← You are here
├── CONCEPTS.md        ← Full documentation
├── commands/          ← Slash commands
├── agents/            ← Agent definitions
├── mcp/               ← MCP server
└── skills/            ← Skill templates
```

## Try Now
```
/pkp-list
```
