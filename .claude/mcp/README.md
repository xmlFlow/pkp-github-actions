# MCP (Model Context Protocol) Guide

## What is MCP?

MCP (Model Context Protocol) is a way to extend Claude's capabilities by connecting it to external tools and services. Think of it as creating a custom API that Claude can use.

## Key Concepts

### 1. MCP Server
A program that exposes "tools" Claude can call. The server:
- Runs as a separate process
- Communicates with Claude via stdio or HTTP
- Defines tools with names, descriptions, and parameters
- Executes tool calls and returns results

### 2. Tools
Functions that Claude can invoke:
```javascript
{
  name: "list_pkp_installations",
  description: "List all PKP application installations",
  inputSchema: {
    type: "object",
    properties: {
      filter: { type: "string", description: "Filter by app name" }
    }
  }
}
```

### 3. Resources
Data sources Claude can read from (files, databases, APIs).

### 4. Prompts
Pre-defined prompt templates the server can provide.

## Setting Up the PKP MCP Server

### Step 1: Install dependencies

```bash
cd ~/projects/github-actions/pkp-github-actions/.claude/mcp
npm init -y
npm install @modelcontextprotocol/sdk
```

### Step 2: Make executable

```bash
chmod +x pkp-server.js
```

### Step 3: Configure Claude Code

Add to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "pkp-server": {
      "command": "node",
      "args": ["/home/withanage/projects/github-actions/pkp-github-actions/.claude/mcp/pkp-server.js"],
      "env": {}
    }
  }
}
```

### Step 4: Restart Claude Code

The MCP server will start automatically and Claude will have access to the tools.

## How Claude Uses MCP Tools

When you ask Claude something like:
> "List all my PKP installations"

Claude:
1. Recognizes this relates to the `list_pkp_installations` tool
2. Calls the tool via MCP protocol
3. Receives the result (list of installations)
4. Formats and presents the result to you

## Tool Examples

### list_pkp_installations
```
Claude: Let me check your PKP installations.
[Calls list_pkp_installations tool]

Result:
- ojs-stable-3_4_0 (configured)
- ojs-stable-3_5_0 (configured)
- omp-stable-3_5_0 (configured)
- ops-stable-3_5_0 (configured)
```

### get_installation_info
```
Claude: I'll get the details for ojs-stable-3_4_0.
[Calls get_installation_info with installation="ojs-stable-3_4_0"]

Result:
{
  "name": "ojs-stable-3_4_0",
  "config": {
    "database": "ojs-dataset-stable-3_4_0",
    "host": "localhost"
  },
  "git": {
    "branch": "ojs-stable-3_4_0-i-2025"
  }
}
```

### setup_pkp_app
```
Claude: I'll set up OMP on stable-3_4_0.
[Calls setup_pkp_app with app="omp", branch="stable-3_4_0"]

Result: Setup command prepared for omp-stable-3_4_0
```

## Creating Your Own MCP Server

### Basic Structure

```javascript
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");

// Create server
const server = new Server({
  name: "my-server",
  version: "1.0.0"
}, {
  capabilities: { tools: {} }
});

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "my_tool",
      description: "Does something useful",
      inputSchema: {
        type: "object",
        properties: {
          param1: { type: "string" }
        }
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "my_tool") {
    // Do something
    return {
      content: [{ type: "text", text: "Result" }]
    };
  }
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);
```

## MCP vs Agents vs Skills

| Feature | MCP | Agent | Skill |
|---------|-----|-------|-------|
| **What it is** | External tool server | Autonomous AI worker | Prompt template |
| **Runs where** | Separate process | Within Claude | Within Claude |
| **Persistence** | Always running | Per-task | Per-invocation |
| **Complexity** | Medium | High | Low |
| **Use case** | External integrations | Complex workflows | Simple commands |

## Advanced MCP Features

### Resources (Read-only data)

```javascript
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "pkp://installations",
      name: "PKP Installations",
      mimeType: "application/json"
    }
  ]
}));
```

### Prompts (Pre-defined templates)

```javascript
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: "setup-guide",
      description: "Step-by-step PKP setup guide"
    }
  ]
}));
```

## Debugging MCP Servers

### Check if server runs
```bash
node pkp-server.js
# Should output: "PKP MCP Server running..."
```

### View Claude Code MCP logs
```bash
tail -f ~/.claude/logs/mcp.log
```

### Test tool manually
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node pkp-server.js
```

## Resources

- [MCP Specification](https://modelcontextprotocol.io/docs)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [Claude Code MCP Guide](https://docs.anthropic.com/claude-code/mcp)
