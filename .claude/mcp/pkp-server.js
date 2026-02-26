#!/usr/bin/env node

/**
 * PKP MCP Server
 *
 * ## What is MCP (Model Context Protocol)?
 *
 * MCP is a protocol that allows Claude to interact with external services.
 * An MCP server exposes "tools" that Claude can call to perform actions.
 *
 * Think of it as an API that Claude can use during conversations.
 *
 * ## How MCP Works:
 *
 * 1. You create a server that implements the MCP protocol
 * 2. The server exposes tools (functions) with defined parameters
 * 3. Claude Code connects to your server
 * 4. When relevant, Claude calls your tools to get data or perform actions
 *
 * ## This Example:
 *
 * This MCP server provides tools for PKP application management:
 * - list_installations: List all PKP installations
 * - get_installation_info: Get details about a specific installation
 * - setup_pkp_app: Set up a new PKP application
 * - run_tests: Run tests for an installation
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const { execSync, exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const PROJECT_FOLDER = process.env.HOME + "/projects/github-actions/pkp-github-actions";

/**
 * Create the MCP server
 */
const server = new Server(
  {
    name: "pkp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Define available tools
 *
 * Each tool has:
 * - name: Unique identifier
 * - description: What it does (Claude uses this to decide when to call it)
 * - inputSchema: JSON Schema defining parameters
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_pkp_installations",
        description: "List all PKP application installations (OJS, OMP, OPS) in the project folder",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_installation_info",
        description: "Get detailed information about a PKP installation including database, config, and git status",
        inputSchema: {
          type: "object",
          properties: {
            installation: {
              type: "string",
              description: "Installation directory name (e.g., ojs-stable-3_4_0)",
            },
          },
          required: ["installation"],
        },
      },
      {
        name: "setup_pkp_app",
        description: "Set up a new PKP application with database and configuration",
        inputSchema: {
          type: "object",
          properties: {
            app: {
              type: "string",
              enum: ["ojs", "omp", "ops"],
              description: "PKP application name",
            },
            branch: {
              type: "string",
              description: "Git branch (e.g., stable-3_4_0, stable-3_5_0, main)",
            },
            node_version: {
              type: "string",
              description: "Node.js version to use",
              default: "22",
            },
          },
          required: ["app", "branch"],
        },
      },
      {
        name: "run_pkp_tests",
        description: "Run tests for a PKP installation",
        inputSchema: {
          type: "object",
          properties: {
            installation: {
              type: "string",
              description: "Installation directory name",
            },
            test_type: {
              type: "string",
              enum: ["cypress", "phpunit", "lint", "all"],
              description: "Type of tests to run",
              default: "all",
            },
          },
          required: ["installation"],
        },
      },
      {
        name: "get_database_info",
        description: "Get information about a PKP database",
        inputSchema: {
          type: "object",
          properties: {
            database_name: {
              type: "string",
              description: "Database name (e.g., ojs-dataset-stable-3_4_0)",
            },
          },
          required: ["database_name"],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 *
 * When Claude calls a tool, this handler executes the actual logic
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_pkp_installations":
        return listInstallations();

      case "get_installation_info":
        return getInstallationInfo(args.installation);

      case "setup_pkp_app":
        return setupPkpApp(args.app, args.branch, args.node_version || "22");

      case "run_pkp_tests":
        return runTests(args.installation, args.test_type || "all");

      case "get_database_info":
        return getDatabaseInfo(args.database_name);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
});

/**
 * Tool Implementations
 */

function listInstallations() {
  const installations = [];

  if (fs.existsSync(PROJECT_FOLDER)) {
    const entries = fs.readdirSync(PROJECT_FOLDER, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && /^(ojs|omp|ops)-/.test(entry.name)) {
        const appDir = path.join(PROJECT_FOLDER, entry.name);
        const hasConfig = fs.existsSync(path.join(appDir, "config.inc.php"));
        const hasGit = fs.existsSync(path.join(appDir, ".git"));

        installations.push({
          name: entry.name,
          path: appDir,
          configured: hasConfig,
          hasGit: hasGit,
        });
      }
    }
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ installations }, null, 2),
      },
    ],
  };
}

function getInstallationInfo(installation) {
  const appDir = path.join(PROJECT_FOLDER, installation);

  if (!fs.existsSync(appDir)) {
    throw new Error(`Installation not found: ${installation}`);
  }

  const info = {
    name: installation,
    path: appDir,
    config: {},
    git: {},
  };

  // Read config.inc.php
  const configPath = path.join(appDir, "config.inc.php");
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, "utf-8");
    const dbMatch = configContent.match(/^name = (.+)$/m);
    const hostMatch = configContent.match(/^host = (.+)$/m);
    const userMatch = configContent.match(/^username = (.+)$/m);

    info.config = {
      database: dbMatch ? dbMatch[1] : "unknown",
      host: hostMatch ? hostMatch[1] : "unknown",
      username: userMatch ? userMatch[1] : "unknown",
    };
  }

  // Get git info
  try {
    info.git.branch = execSync(`cd ${appDir} && git branch --show-current`, { encoding: "utf-8" }).trim();
    info.git.lastCommit = execSync(`cd ${appDir} && git log -1 --format="%h %s"`, { encoding: "utf-8" }).trim();
  } catch (e) {
    info.git.error = "Not a git repository";
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(info, null, 2),
      },
    ],
  };
}

function setupPkpApp(app, branch, nodeVersion) {
  const scriptPath = process.env.HOME + "/scripts/release-pkp-github-action.sh";

  // Build the command
  const command = `source ${scriptPath} --base=pkp --issue="mcp" --remote=main --comment="setup" --install=1 --release=0 --check_repo=1 --check_data=1 --git_push=0 --node_version=${nodeVersion} --branch=${branch} --app=${app}`;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          status: "initiated",
          message: `Setup initiated for ${app} ${branch}`,
          command: command,
          directory: `${PROJECT_FOLDER}/${app}-${branch}`,
          database: `${app}-dataset-${branch}`,
          note: "Run this command in your terminal to complete setup",
        }, null, 2),
      },
    ],
  };
}

function runTests(installation, testType) {
  const appDir = path.join(PROJECT_FOLDER, installation);

  if (!fs.existsSync(appDir)) {
    throw new Error(`Installation not found: ${installation}`);
  }

  const commands = {
    cypress: `cd ${appDir} && npx cypress run --headless --browser chrome`,
    phpunit: `cd ${appDir} && php lib/pkp/lib/vendor/phpunit/phpunit/phpunit --configuration lib/pkp/tests/phpunit.xml --testdox`,
    lint: `cd ${appDir} && npm run lint`,
  };

  const testsToRun = testType === "all" ? Object.keys(commands) : [testType];

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          installation: installation,
          testType: testType,
          commands: testsToRun.map(t => ({
            type: t,
            command: commands[t],
          })),
          note: "Run these commands in your terminal",
        }, null, 2),
      },
    ],
  };
}

function getDatabaseInfo(databaseName) {
  try {
    const tableCount = execSync(
      `mysql -u root -pSP1SQL-cb -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${databaseName}'"`,
      { encoding: "utf-8" }
    ).trim();

    const tables = execSync(
      `mysql -u root -pSP1SQL-cb -N -e "SELECT table_name FROM information_schema.tables WHERE table_schema = '${databaseName}' LIMIT 10"`,
      { encoding: "utf-8" }
    ).trim().split("\n");

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            database: databaseName,
            tableCount: parseInt(tableCount),
            sampleTables: tables,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(`Database not found or access denied: ${databaseName}`);
  }
}

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PKP MCP Server running...");
}

main().catch(console.error);
