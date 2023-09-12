"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printUtxo = exports.MultiSigClient = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const zk_js_1 = require("@lightprotocol/zk.js");
const multisigParams_1 = require("./multisigParams");
const ffjavascript_1 = require("ffjavascript");
// import boxen from 'boxen';
const web3_js_1 = require("@solana/web3.js");
// import { MERKLE_TREE_KEY } from "light-sdk";
// import { MockVerifier } from "./verifier";
const path = require("path");
const multisig_1 = require("./types/multisig");
const constants_1 = require("./constants");
const transaction_1 = require("./transaction");
/**
 * Data:
 * - input Utxos 4 * 128 = 512
 * - output Utxos 4 * 128 = 512
 * - encryptedUtxos up to 512
 * - recipientSpl 32
 * - recipientSol 32
 * - relayerPubkey 32
 * - relayerFee 8
 */
class MultiSigClient {
    constructor({ multiSigParams, signer, poseidon, queuedTransactions, eddsa, provider, }) {
        this.multiSigParams = multiSigParams;
        this.signer = signer;
        this.poseidon = poseidon;
        this.eddsa = eddsa;
        if (queuedTransactions) {
            this.queuedTransactions = queuedTransactions;
        }
        else {
            this.queuedTransactions = [];
        }
        this.provider = provider;
        this.verifier = new anchor_1.Program(multisig_1.IDL, constants_1.verifierProgramId);
    }
    // load call to load multisig
    // getMultiSig
    // TODO: need to enforce correct order in signatures relative to instructionDataHash
    // getApprovals
    // getQueuedTransactions()
    async approve(index) {
        // let tx = new Transaction({
        //   provider: this.provider,
        //   shuffleEnabled: false,
        //   params: this.queuedTransactions[index].transactionParams,
        //   appParams: { mock: "1231" },
        // });
        // await tx.compile();
        zk_js_1.Transaction.getMerkleProofs(this.provider, this.queuedTransactions[index].transactionParams.inputUtxos);
        const integrityHash = await this.queuedTransactions[index].transactionParams.getTxIntegrityHash(this.poseidon);
        const connectingHash = zk_js_1.Transaction.getTransactionHash(this.queuedTransactions[index].transactionParams, this.poseidon);
        const publicKey = await this.signer.getEddsaPublicKey();
        const signature = await this.signer.signEddsa(this.poseidon.F.e(ffjavascript_1.Scalar.e(connectingHash)));
        const approval = new transaction_1.Approval({
            signerIndex: index,
            publicKey,
            signature,
        });
        this.queuedTransactions[index].approvals.push(approval);
        console.log("\n\n------------------------------------------");
        console.log("\t Approved Multisig Transaction ");
        console.log("------------------------------------------");
        console.log("The Approval is encrypted to the shared encryption key and stored in a (compressed) account on Solana.\n");
        console.log("Signer: ", anchor_1.utils.bytes.hex.encode(Buffer.from(Array.from([
            ...this.queuedTransactions[index].approvals[this.queuedTransactions[index].approvals.length - 1].publicKey[0],
            ...this.queuedTransactions[index].approvals[this.queuedTransactions[index].approvals.length - 1].publicKey[1],
        ]).flat())));
        console.log("Shielded transaction hash: ", connectingHash.toString());
        console.log("Signature: ", anchor_1.utils.bytes.hex.encode(Buffer.from(this.queuedTransactions[index].approvals[this.queuedTransactions[index].approvals.length - 1].signature)));
        console.log("------------------------------------------\n");
        return this.queuedTransactions[index];
    }
    // approve and broadcast
    static async createMultiSigParameters(threshold, signer, signers, poseidon, eddsa, provider) {
        const multisig = await multisigParams_1.MultisigParams.createNewMultiSig({
            poseidon,
            signers,
            threshold,
        });
        return new MultiSigClient({
            multiSigParams: multisig,
            signer,
            poseidon,
            provider,
            eddsa,
        });
    }
    createUtxo({ splAsset, splAmount, solAmount, }) {
        const appData = {
            threshold: this.multiSigParams.threshold,
            nrSigners: this.multiSigParams.nrSigners,
            publicKeyX: this.multiSigParams.publicKeyX.map((s) => new anchor_1.BN(this.poseidon.F.toString(s)) //.toArrayLike(Buffer, "be", 32)
            ),
            publicKeyY: this.multiSigParams.publicKeyY.map((s) => new anchor_1.BN(this.poseidon.F.toString(s)) //.toArrayLike(Buffer, "be", 32)
            ),
        };
        if (splAmount && splAsset) {
            let realSolAmount = new anchor_1.BN(0);
            if (solAmount) {
                realSolAmount = solAmount;
            }
            return new zk_js_1.Utxo({
                poseidon: this.poseidon,
                assets: [web3_js_1.SystemProgram.programId, splAsset],
                account: this.multiSigParams.account,
                amounts: [realSolAmount, splAmount],
                appData,
                appDataIdl: multisig_1.IDL,
                verifierAddress: constants_1.verifierProgramId,
                assetLookupTable: this.provider.lookUpTables.assetLookupTable,
                verifierProgramLookupTable: this.provider.lookUpTables.verifierProgramLookupTable,
            });
        }
        else if (solAmount) {
            return new zk_js_1.Utxo({
                poseidon: this.poseidon,
                assets: [web3_js_1.SystemProgram.programId],
                account: this.multiSigParams.account,
                amounts: [solAmount],
                appData,
                appDataIdl: multisig_1.IDL,
                verifierAddress: constants_1.verifierProgramId,
                assetLookupTable: this.provider.lookUpTables.assetLookupTable,
                verifierProgramLookupTable: this.provider.lookUpTables.verifierProgramLookupTable,
            });
        }
        else {
            throw new Error("Provided invalid params to create multisig createUtxo");
        }
    }
    // creates a transaction and queues it internally
    async createMultiSigTransaction({ inputUtxos, outputUtxos, relayer, recipientSpl = web3_js_1.Keypair.generate().publicKey, recipientSol = web3_js_1.Keypair.generate().publicKey, sender = web3_js_1.Keypair.generate().publicKey, action, }) {
        let encryptedUtxos = [];
        for (let utxo of outputUtxos) {
            let encryptedUtxo = await utxo.encrypt(this.poseidon);
            encryptedUtxos.push(encryptedUtxo);
        }
        const txParams = new zk_js_1.TransactionParameters({
            inputUtxos,
            outputUtxos,
            transactionMerkleTreePubkey: zk_js_1.MerkleTreeConfig.getTransactionMerkleTreePda(new anchor_1.BN(0)),
            eventMerkleTreePubkey: zk_js_1.MerkleTreeConfig.getEventMerkleTreePda(new anchor_1.BN(0)),
            recipientSol,
            recipientSpl,
            action,
            poseidon: this.poseidon,
            relayer,
            verifierIdl: zk_js_1.IDL_VERIFIER_PROGRAM_TWO,
            encryptedUtxos: new Uint8Array([
                ...encryptedUtxos.flat(),
                ...new Array(512 - encryptedUtxos.flat().length).fill(1),
            ]),
        });
        this.queuedTransactions.push(new transaction_1.QueuedTransaction(txParams));
        return txParams;
    }
    // TODO: implement serialize deserialize for transaction params
    // TODO: implement Create and Broadcast
    async createAppParams(index) {
        const keypairDummy = new zk_js_1.Account({
            poseidon: this.poseidon,
            seed: new Uint8Array(32).fill(3).toString(),
            eddsa: this.eddsa,
        });
        let pubkeyDummy = await keypairDummy.getEddsaPublicKey();
        pubkeyDummy[0] = new Uint8Array(32).fill(0);
        pubkeyDummy[1] = new Uint8Array(32).fill(0);
        const signatureDummy = new Uint8Array(64).fill(0); //await keypairDummy.signEddsa("123");
        for (let i = this.queuedTransactions[index].approvals.length; i < constants_1.MAX_SIGNERS; i++) {
            this.queuedTransactions[index].approvals.push(new transaction_1.Approval({
                signerIndex: index,
                publicKey: pubkeyDummy,
                signature: signatureDummy,
            }));
        }
        const circuitPath = path.join("build-circuit");
        const appParams = {
            inputs: {
                isAppInUtxo: undefined,
                threshold: this.multiSigParams.threshold.toString(),
                nrSigners: this.multiSigParams.nrSigners.toString(),
                signerPubkeysX: this.queuedTransactions[index].approvals.map((approval) => this.poseidon.F.toObject(approval.publicKey[0]).toString()),
                signerPubkeysY: this.queuedTransactions[index].approvals.map((approval) => this.poseidon.F.toObject(approval.publicKey[1]).toString()),
                enabled: [1, 1, ...new Array(constants_1.MAX_SIGNERS - 2).fill(0)],
                signatures: this.queuedTransactions[index].approvals.map((approval) => this.eddsa.unpackSignature(approval.signature).S),
                r8x: this.queuedTransactions[index].approvals.map((approval) => this.poseidon.F.toObject(this.eddsa.unpackSignature(approval.signature).R8[0])),
                r8y: this.queuedTransactions[index].approvals.map((approval) => this.poseidon.F.toObject(this.eddsa.unpackSignature(approval.signature).R8[1])),
            },
            verifierIdl: multisig_1.IDL,
            path: circuitPath,
        };
        return appParams;
    }
    static getAppInUtxoIndices(appUtxos) {
        let isAppInUtxo = [];
        for (const i in appUtxos) {
            let array = new Array(4).fill(new anchor_1.BN(0));
            if (appUtxos[i].appData) {
                array[i] = new anchor_1.BN(1);
                isAppInUtxo.push(array);
            }
        }
        return isAppInUtxo;
    }
    async execute(index) {
        const appParams = await this.createAppParams(index);
        let params = this.queuedTransactions[0].transactionParams;
        appParams.inputs.isAppInUtxo = MultiSigClient.getAppInUtxoIndices(params.inputUtxos);
        let tx = new zk_js_1.Transaction({
            provider: this.provider,
            shuffleEnabled: false,
            params,
            appParams,
        });
        await tx.compileAndProve();
        await tx.sendAndConfirmTransaction();
        // await tx.checkBalances();
        // await updateMerkleTreeForTest(ADMIN_AUTH_KEYPAIR, this.provider.url);
    }
}
exports.MultiSigClient = MultiSigClient;
const printUtxo = (utxo, poseidon, index, input) => {
    let string = `-------------- ${input} Utxo ${index} --------------\n`;
    string += `Amount sol: ${utxo.amounts[0]} \n`;
    string += `Amount spl: ${utxo.amounts[1]}, mint spl: ${utxo.assets[1].toBase58()}\n`;
    string += `Shielded pubkey: ${utxo.account.pubkey.toString("hex")}\n`;
    string += `Commitment: ${utxo.getCommitment(poseidon)}\n`;
    string += `Verifier pubkey: ${utxo.verifierAddress.toBase58()}\n`;
    string += `Instruction hash: ${utxo.appDataHash.toString()}\n`;
    string += "------------------------------------------";
    return string;
};
exports.printUtxo = printUtxo;
