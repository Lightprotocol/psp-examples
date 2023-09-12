"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Multisig = void 0;
const tslib_1 = require("tslib");
const client_1 = require("./client");
const anchor = tslib_1.__importStar(require("@coral-xyz/anchor"));
const anchor_1 = require("@coral-xyz/anchor");
const multisig_1 = require("./types/multisig");
const zk_js_1 = require("@lightprotocol/zk.js");
const web3_js_1 = require("@solana/web3.js");
const circomlibjs_1 = require("circomlibjs");
class Multisig {
    constructor(client) {
        this.client = client;
    }
    static async createMultiSig() {
        const RPC_URL = "http://127.0.0.1:8899";
        process.env.ANCHOR_PROVIDER_URL = RPC_URL;
        process.env.ANCHOR_WALLET = process.env.HOME + "/.config/solana/id.json";
        const provider = anchor.AnchorProvider.local(RPC_URL, zk_js_1.confirmConfig);
        anchor.setProvider(provider);
        const poseidon = await (0, circomlibjs_1.buildPoseidonOpt)();
        let eddsa = await (0, circomlibjs_1.buildEddsa)();
        const wallet = web3_js_1.Keypair.generate();
        await (0, zk_js_1.airdropSol)({
            connection: provider.connection,
            lamports: 1e10,
            recipientPublicKey: wallet.publicKey,
        });
        let relayer = new zk_js_1.TestRelayer({
            relayerPubkey: wallet.publicKey,
            relayerRecipientSol: wallet.publicKey,
            relayerFee: new anchor_1.BN(100000),
            payer: wallet,
        });
        let lightProvider = await zk_js_1.Provider.init({
            wallet,
            url: RPC_URL,
            relayer,
            confirmConfig: zk_js_1.confirmConfig,
        });
        lightProvider.addVerifierProgramPublickeyToLookUpTable(zk_js_1.TransactionParameters.getVerifierProgramId(multisig_1.IDL));
        const user = await zk_js_1.User.init({ provider: lightProvider });
        const keypair = new zk_js_1.Account({
            poseidon,
            seed: new Uint8Array(32).fill(1).toString(),
            eddsa,
        });
        const signers = [user.account, keypair];
        const client = await client_1.MultiSigClient.createMultiSigParameters(2, user.account, signers, poseidon, eddsa, lightProvider);
        const multisig = new Multisig(client);
        return multisig;
    }
    async create() {
        console.log("multisig::create");
    }
    toString() {
        return this.client.multiSigParams.debugString();
    }
    async add() {
        console.log("multisig::add");
    }
    async approve() {
        console.log("multisig::approve");
    }
    async execute() {
        console.log("multisig::execute");
    }
}
exports.Multisig = Multisig;
