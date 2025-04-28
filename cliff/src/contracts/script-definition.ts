import { z } from 'zod';

export const ScriptDefinitionSchema = z.object({
    name: z.string(),
    description: z.string(),
    command: z.string().array(),
    arguments: z
        .record(
            z.object({
                required: z.boolean().default(false),
                type: z.enum(['string', 'number']),
                description: z.string().optional(),
            }),
        )
        .optional(),
    options: z
        .record(
            z.object({
                type: z.enum(['string', 'number', 'boolean']),
                description: z.string().optional(),
            }),
        )
        .optional(),
});

export type ScriptDefinition = z.infer<typeof ScriptDefinitionSchema>;
