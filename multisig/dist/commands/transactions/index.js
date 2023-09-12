"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
class Transaction extends core_1.Command {
    async run() {
        this.log(`Transactions.`);
    }
}
exports.default = Transaction;
Transaction.description = "List of transactions.";
Transaction.examples = [
    `$ oex transactions
List of transactions.`,
];
