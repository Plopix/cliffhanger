import { Argument, Command } from 'commander';
import packageJson from '../package.json';
import colors from 'picocolors';
import { createMcpServerCommand } from './commands/mcp-server';
import os from 'os';
import { ScriptDefinitionSchema } from './contracts/script-definition';
import { createPassThroughRunner } from './core/create-passthrough-runner';
import { convertScriptToCommand } from './converters/script-to-command';

const helpStyling = {
    styleTitle: (str: string) => colors.bold(str),
    styleCommandText: (str: string) => colors.cyan(str),
    styleCommandDescription: (str: string) => colors.magenta(str),
    styleDescriptionText: (str: string) => colors.italic(str),
    styleOptionText: (str: string) => colors.green(str),
    styleArgumentText: (str: string) => colors.yellow(str),
    styleSubcommandText: (str: string) => colors.cyan(str),
};

const genericCommandOption = (command: Command) => {
    command.configureHelp(helpStyling);
    command.allowExcessArguments(false);
    command.allowUnknownOption(false);
};

export const logo = `
┌─────────────────────┐
│ ● ● ●      >_       │
│                     │
│     o               │
│    /|\\   ─────────  │
│    / \\              │
└─────────────────────┘

  ${colors.bold('CLI')}ffhanger - ${colors.yellowBright(packageJson.version)}\n`;
const program = new Command();

genericCommandOption(program);
program
    .name('cliff')
    .description('A CLI that runs your scripts and also exposes as tools through a built-in, extensible MCP server.')
    .version(packageJson.version)
    .addHelpText('beforeAll', colors.blueBright(logo))
    .addHelpText('afterAll', colors.dim('\nRun $ cliff <command> --help for more information on a specific command.\n'))
    .action(async () => {
        program.help();
    });

//@todo: create the file if it does not exist

const scripts = ScriptDefinitionSchema.array().parse(await Bun.file(`${os.homedir()}/.cliffhanger/tools.json`).json());

// Let's add the MCP server command (the main command)
const mcpServerCommand = createMcpServerCommand({ scripts });
genericCommandOption(mcpServerCommand);
program.addCommand(mcpServerCommand);

const scriptsGroup = new Command('run');
scriptsGroup.description('The define scripts you can run');
genericCommandOption(scriptsGroup);
program.addCommand(scriptsGroup);

// and expose all the tools as commands as well
const runner = createPassThroughRunner();
scripts.forEach((script) => {
    const command = convertScriptToCommand(script, { runner });
    genericCommandOption(command);
    scriptsGroup.addCommand(command);
    scriptsGroup.addArgument(new Argument(`[${command.name()}]`, command.description()));
});

try {
    await program.parseAsync(process.argv);
} catch (exception) {
    if (exception instanceof Error) {
        console.error(`[${colors.bold(exception.name)}] ${exception.message} `);
    } else if (typeof exception === 'string') {
        console.error(exception);
    } else if (exception instanceof Object && 'message' in exception) {
        console.error(exception.message);
    } else {
        console.error(`Unknown error.`);
    }
    console.debug(exception);
}
