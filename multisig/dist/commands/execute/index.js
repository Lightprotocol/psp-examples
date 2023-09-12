"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
class Execute extends core_1.Command {
    async run() {
        const { flags } = await this.parse(Execute);
        this.log(`Execute transaction ${flags.transaction}.`);
    }
}
exports.default = Execute;
Execute.description = "Execute transaction.";
Execute.examples = [
    `$ oex execute --transaction 1
Execute transaction 1.`,
];
Execute.flags = {
    transaction: core_1.Flags.string({
        char: "t",
        description: "Number of transaction to execute",
        required: true,
    }),
};
