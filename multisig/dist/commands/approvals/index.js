"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
class Approvals extends core_1.Command {
    async run() {
        const { flags } = await this.parse(Approvals);
        this.log(`List of approvals for transaction ${flags.transaction}.`);
    }
}
exports.default = Approvals;
Approvals.description = "List of approvals.";
Approvals.examples = [
    `$ oex approvals --transaction 1
List of approvals for transaction 1.`,
];
Approvals.flags = {
    transaction: core_1.Flags.string({
        char: "t",
        description: "Number of transaction",
        required: true,
    }),
};
