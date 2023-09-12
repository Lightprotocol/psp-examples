"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
class Balance extends core_1.Command {
    async run() {
        this.log(`Multisig balance: 1 SOL.`);
    }
}
exports.default = Balance;
Balance.description = "Multisig balance.";
Balance.examples = [
    `$ oex balance
Multisig balance is 1 SOL.`,
];
