import { Command } from "@oclif/core";
export default class Transaction extends Command {
    static description: string;
    static examples: string[];
    run(): Promise<void>;
}
