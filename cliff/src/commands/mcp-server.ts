import { Command } from 'commander';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import packageJson from '../../package.json';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { ScriptDefinition } from '../contracts/script-definition';
import { createBufferedRunner } from '../core/create-buffered-runner';
import { convertScriptToMcpTool } from '../converters/script-to-mcptool';

type Deps = {
    scripts: ScriptDefinition[];
};
export const createMcpServerCommand = ({ scripts }: Deps): Command => {
    const command = new Command('serve').description('Start the Model Context Protocol Server.').action(async () => {
        const runner = createBufferedRunner();
        const mcpServer = new McpServer({
            name: 'CLIffhanger MCP Server',
            version: packageJson.version,
        });

        scripts.forEach((script) => {
            const tool = convertScriptToMcpTool(script, { runner });
            mcpServer.tool(tool.name, tool.description, tool.inputSchema, tool.handler);
        });
        const stdioServer = new StdioServerTransport();
        await mcpServer.connect(stdioServer);
    });
    return command;
};
