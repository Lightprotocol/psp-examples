"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueuedTransaction = exports.Approval = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const zk_js_1 = require("@lightprotocol/zk.js");
const multisig_1 = require("./types/multisig");
const client_1 = require("./client");
class Approval {
    constructor({ signerIndex, publicKey, signature, }) {
        this.publicKey = publicKey;
        this.signature = signature;
    }
    async toBytes() {
        const coder = new anchor_1.BorshAccountsCoder(multisig_1.IDL);
        return coder.encode("approveTransaction", this);
    }
    static fromBytes(bytes) {
        const coder = new anchor_1.BorshAccountsCoder(multisig_1.IDL);
        let decoded = coder.decode("approveTransaction", bytes);
        return new Approval({
            signerIndex: decoded.signerIndex,
            publicKey: decoded.publicKey,
            signature: decoded.signature,
        });
    }
}
exports.Approval = Approval;
class QueuedTransaction {
    constructor(transactionParams) {
        this.transactionParams = transactionParams;
        this.approvals = [];
    }
    addApproval(approval) {
        this.approvals.push(approval);
    }
    async print(poseidon) {
        let print = "";
        console.log(`-------------- Input Utxos --------------\n`);
        for (var utxo in this.transactionParams.inputUtxos) {
            console.log((0, client_1.printUtxo)(this.transactionParams.inputUtxos[utxo], poseidon, Number(utxo) + 1, "input"));
        }
        console.log("\n\n");
        console.log(`-------------- Output Utxos --------------\n`);
        for (var utxo in this.transactionParams.outputUtxos) {
            console.log((0, client_1.printUtxo)(this.transactionParams.outputUtxos[utxo], poseidon, Number(utxo) + 1, "output"));
        }
        console.log("\n\n");
        print += "-------------- Public Transaction Parameters --------------\n";
        print +=
            "recipient spl " +
                this.transactionParams.accounts.recipientSpl.toBase58() +
                "\n";
        print +=
            "recipient sol " +
                this.transactionParams.accounts.recipientSol.toBase58() +
                "\n";
        print +=
            "relayer " +
                this.transactionParams.relayer.accounts.relayerPubkey.toBase58() +
                "\n";
        print +=
            "relayer fee " +
                this.transactionParams.relayer.relayerFee
                    .div(new anchor_1.BN(1000000000))
                    .toString() +
                "\n";
        print +=
            "encrypted utxos length " +
                this.transactionParams.encryptedUtxos.length +
                "\n";
        print += "------------------------------------------";
        console.log(print);
        let provider = await zk_js_1.Provider.loadMock();
        let tx = new zk_js_1.Transaction({
            provider: provider,
            params: this.transactionParams,
        });
        const connectingHash = zk_js_1.Transaction.getTransactionHash(this.transactionParams, provider.poseidon);
        console.log(`-------------- Shielded Transaction Hash --------------\n`);
        console.log(connectingHash.toString());
        console.log("------------------------------------------");
    }
}
exports.QueuedTransaction = QueuedTransaction;
