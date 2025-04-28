export type BufferedRunner = (command: string[]) => Promise<[boolean, string, string]>;
export type PassThroughRunner = (command: string[]) => Promise<boolean>;
