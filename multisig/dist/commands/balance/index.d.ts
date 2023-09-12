import { Command } from "@oclif/core";
export default class Balance extends Command {
    static description: string;
    static examples: string[];
    run(): Promise<void>;
}
