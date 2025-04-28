import type { PassThroughRunner } from '../contracts/runner';

export const createPassThroughRunner = (): PassThroughRunner => async (command) => {
    const proc = Bun.spawn(command, {
        stdout: 'inherit',
        stderr: 'inherit',
    });
    const returnCode = await proc.exited;
    return returnCode === 0;
};
