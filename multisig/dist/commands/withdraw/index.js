"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
class Withdraw extends core_1.Command {
    async run() {
        const { flags } = await this.parse(Withdraw);
        this.log(`Withdrawal request for ${flags.amount} SOL.`);
    }
}
exports.default = Withdraw;
Withdraw.description = "Withdraw from multisig.";
Withdraw.examples = [
    `$ oex withdraw --amount 1
Create withdrawal request for 1 SOL.`,
];
Withdraw.flags = {
    amount: core_1.Flags.string({
        char: "a",
        description: "Amount of SOL to withdraw",
        required: true,
    }),
};
