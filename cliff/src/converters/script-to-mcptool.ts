import type { ScriptDefinition } from '../contracts/script-definition';
import type { BufferedRunner } from '../contracts/runner';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z, type ZodSchema } from 'zod';

type Deps = {
    runner: BufferedRunner;
};

type MCPToolDefinition = {
    name: string;
    description: string;
    inputSchema: Record<string, ZodSchema>;
    handler: (args: Record<string, unknown>) => Promise<CallToolResult>;
};
const createInputSchema = (
    args?: ScriptDefinition['arguments'],
    options?: ScriptDefinition['options'],
): MCPToolDefinition['inputSchema'] => {
    const schema: Record<string, ZodSchema> = {};
    if (args) {
        for (const [name, argDef] of Object.entries(args)) {
            let fieldSchema: ZodSchema;

            if (argDef.type === 'string') {
                fieldSchema = z.string();
            } else if (argDef.type === 'number') {
                fieldSchema = z.number();
            } else {
                // This shouldn't happen based on the schema but handle it anyway
                throw new Error(`Unsupported argument type: ${argDef.type}`);
            }

            if (!argDef.required) {
                fieldSchema = fieldSchema.optional();
            }

            schema[name] = fieldSchema;
        }
    }
    if (options) {
        for (const [name, optDef] of Object.entries(options)) {
            let fieldSchema: ZodSchema;

            if (optDef.type === 'string') {
                fieldSchema = z.string();
            } else if (optDef.type === 'number') {
                fieldSchema = z.number();
            } else if (optDef.type === 'boolean') {
                fieldSchema = z.boolean();
            } else {
                throw new Error(`Unsupported option type: ${optDef.type}`);
            }
            fieldSchema = fieldSchema.optional();
            schema[name] = fieldSchema;
        }
    }
    return schema;
};

export const convertScriptToMcpTool = (script: ScriptDefinition, { runner }: Deps): MCPToolDefinition => {
    return {
        name: script.name,
        description: script.description,
        inputSchema: createInputSchema(script.arguments, script.options),
        handler: async (args) => {
            const scriptArgs: string[] = [];
            const scriptOptions: string[] = [];
            if (script.arguments) {
                Object.entries(script.arguments).forEach(([name]) => {
                    if (args[name] !== undefined) {
                        scriptArgs.push(String(args[name]));
                    }
                });
            }

            if (script.options) {
                Object.entries(script.options).forEach(([name, def]) => {
                    if (args[name] !== undefined) {
                        if (def.type === 'boolean' && args[name] === true) {
                            scriptOptions.push(`--${name}`);
                        } else {
                            scriptOptions.push(`--${name} ${String(args[name])}`);
                        }
                    }
                });
            }
            const [isError, output, error] = await runner([...script.command, ...scriptArgs, ...scriptOptions]);
            return {
                isError,
                content: [
                    { type: 'text', text: output },
                    { type: 'text', text: error },
                ],
            };
        },
    };
};
