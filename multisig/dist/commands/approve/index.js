"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
class Approve extends core_1.Command {
    async run() {
        const { flags } = await this.parse(Approve);
        this.log(`Approve ${flags.index}.`);
    }
}
exports.default = Approve;
Approve.description = "Approve transaction.";
Approve.examples = [
    `$ oex approve --index 0
Aprrove 0.`,
];
Approve.flags = {
    index: core_1.Flags.string({
        char: "a",
        description: "Index of approval",
        required: true,
    }),
};
