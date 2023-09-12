import { Command } from "@oclif/core";
export default class Approve extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        index: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
}
