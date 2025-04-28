import { Argument, Command, Option } from 'commander';
import type { ScriptDefinition } from '../contracts/script-definition';
import type { PassThroughRunner } from '../contracts/runner';

type Deps = {
    runner: PassThroughRunner;
};
export const convertScriptToCommand = (script: ScriptDefinition, { runner }: Deps): Command => {
    const command = new Command(script.name).description(script.description).action(async (...all) => {
        const command: Command = all[all.length - 1];
        const args = command.args;
        const options = command.opts();

        const opts = Object.entries(options).reduce((acc: string[], [key, value]) => {
            if (typeof value === 'boolean') {
                acc.push(`--${key}`);
                return acc;
            }
            acc.push(`--${key} ${value}`);
            return acc;
        }, []);
        await runner([...script.command, ...args, ...opts]);
    });

    if (script.arguments) {
        Object.entries(script.arguments).forEach(([name, { type, description, required }]) => {
            const wrapChars = required ? '<>' : '[]';
            const argument = new Argument(`${wrapChars[0]}${name}${wrapChars[1]}`, description);
            if (type === 'number') {
                argument.argParser(parseFloat);
            }
            command.addArgument(argument);
        });
    }

    if (script.options) {
        Object.entries(script.options).forEach(([name, { type, description }]) => {
            const option = new Option(`--${name}` + (type === 'boolean' ? '' : ' <value>'), description);
            if (type === 'number') {
                option.argParser(parseFloat);
            }
            command.addOption(option);
        });
    }

    return command;
};
