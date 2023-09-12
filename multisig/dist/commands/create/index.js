"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const multisig_1 = require("../../multisig");
class Create extends core_1.Command {
    // static args = {
    //   person: Args.string({
    //     description: "Person to say create multisig to",
    //     required: true,
    //   }),
    // };
    async run() {
        const { flags } = await this.parse(Create);
        this.log(`Create multisig with signers: ${flags.signers}.`);
        const multisig = await multisig_1.Multisig.createMultiSig();
        await multisig.create();
        this.log(multisig.toString());
    }
}
exports.default = Create;
Create.description = "Create multisig.";
Create.examples = [
    `$ oex create multisig --owners 1,2,3 (./src/commands/create/index.ts)
`,
];
Create.flags = {
    signers: core_1.Flags.string({
        char: "s",
        description: "Comma separated array of signers",
        required: true,
    }),
};
