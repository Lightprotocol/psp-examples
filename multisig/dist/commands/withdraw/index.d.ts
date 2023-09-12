import { Command } from "@oclif/core";
export default class Withdraw extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        amount: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
}
