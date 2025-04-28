import type { BufferedRunner } from '../contracts/runner';

export const createBufferedRunner = (): BufferedRunner => async (command) => {
    const proc = Bun.spawn(command);
    const returnCode = await proc.exited;
    const out = new Response(proc.stdout);
    const error = new Response(proc.stderr);
    return [returnCode === 0, (await out.text()).trim(), (await error.text()).trim()];
};
