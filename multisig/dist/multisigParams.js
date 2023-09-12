"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultisigParams = void 0;
const tslib_1 = require("tslib");
const anchor_1 = require("@coral-xyz/anchor");
const multisig_1 = require("./types/multisig");
const zk_js_1 = require("@lightprotocol/zk.js");
const tweetnacl_1 = tslib_1.__importDefault(require("tweetnacl"));
const constants_1 = require("./constants");
const chai_1 = require("chai");
const bs58 = require("bs58");
// add encrypt to primitive, nonces are H(base_nonce||pubkey), H(base_nonce||pubkey), H(base_nonce||pubkey), etc.
// if only one recipient use nonce directly
// fields [base_nonce], [encryptedAes1,..., encryptedAesN ], [aesCiphertext],
// standardized, the first 32 bytes are the pubkey,
// encrypt to aes
class MultisigParams {
    constructor({ poseidon, threshold, nrSigners, publicKeyX, publicKeyY, signersEncryptionPublicKeys, seed, priorMultiSigSlot, priorMultiSigHash, priorMultiSigSeed, }) {
        this.threshold = new anchor_1.BN(threshold);
        this.publicKeyX = publicKeyX;
        this.publicKeyY = publicKeyY;
        this.nrSigners = new anchor_1.BN(nrSigners);
        this.signersEncryptionPublicKeys = signersEncryptionPublicKeys;
        this.appDataHash = MultisigParams.getHash(poseidon, MultisigParams.toArray(poseidon, threshold, nrSigners, publicKeyX, publicKeyY));
        this.seed = seed;
        this.account = new zk_js_1.Account({ poseidon, seed: bs58.encode(seed) });
        this.priorMultiSigSlot = priorMultiSigSlot;
        this.priorMultiSigHash = priorMultiSigHash;
        this.priorMultiSigSeed = priorMultiSigSeed;
    }
    static async createNewMultiSig({ poseidon, signers, threshold, randomSeed = tweetnacl_1.default.randomBytes(32), }) {
        if (signers.length > constants_1.MAX_SIGNERS) {
            throw new Error(`Too many signers ${signers.length} > 6`);
        }
        const nrSigners = signers.length;
        if (threshold > signers.length) {
            throw new Error(`Not enough signers ${signers.length} for threshold ${threshold}`);
        }
        if (poseidon === undefined) {
            throw new Error("Poseidon instance not defined");
        }
        const dummyAccount = new zk_js_1.Account({
            poseidon,
            seed: new Uint8Array(32).fill(3).toString(),
        });
        dummyAccount.poseidonEddsaKeypair = {
            publicKey: [new Uint8Array(32).fill(0), new Uint8Array(32).fill(0)],
            privateKey: new Uint8Array(32).fill(0),
        };
        let publicKeyX = [];
        let publicKeyY = [];
        for (let signer of signers) {
            const pubkey = await signer.getEddsaPublicKey();
            publicKeyX.push(pubkey[0]);
            publicKeyY.push(pubkey[1]);
        }
        while (constants_1.MAX_SIGNERS > signers.length) {
            signers.push(dummyAccount);
            // const pubkey = new Uint8Array(32).fill(0)
            publicKeyX.push(new Uint8Array(32).fill(0));
            publicKeyY.push(new Uint8Array(32).fill(0));
        }
        const signersEncryptionPublicKeys = signers.map((signer) => signer.encryptionKeypair.publicKey);
        return new MultisigParams({
            poseidon,
            threshold,
            nrSigners,
            publicKeyX,
            publicKeyY,
            signersEncryptionPublicKeys,
            seed: randomSeed,
            priorMultiSigSlot: new anchor_1.BN(0),
            priorMultiSigHash: new Uint8Array(32).fill(0),
            priorMultiSigSeed: new Uint8Array(32).fill(0),
        });
    }
    async toBytes() {
        let coder = new anchor_1.BorshAccountsCoder(multisig_1.IDL);
        return await coder.encode("createMultiSig", this);
    }
    static fromBytes(poseidon, bytes) {
        let coder = new anchor_1.BorshAccountsCoder(multisig_1.IDL);
        let decoded = coder.decode("createMultiSig", bytes);
        return new MultisigParams({ poseidon, ...decoded });
    }
    print() {
        console.log("----------------- MultiSig Parameters -----------------");
        console.log("threshold: ", this.threshold.toString());
        console.log("Number of Signers: ", this.nrSigners.toString());
        console.log(`Shielded pubkey: ${this.appDataHash}`);
        console.log("Shared encryption public key: <encryption-key>");
        console.log("Shared encryption private key: <encryption-key>");
        for (var i = 0; i < this.publicKeyX.length; i++) {
            if (i < this.nrSigners.toNumber()) {
                console.log(`Signer: ${i}`, anchor_1.utils.bytes.hex.encode(Buffer.from(Array.from([...this.publicKeyX[i], ...this.publicKeyY[i]]).flat())));
            }
        }
    }
    debugString() {
        let log = "----------------- MultiSig Parameters -----------------\n";
        log += "threshold: " + this.threshold.toString() + "\n";
        log += "Number of Signers: " + this.nrSigners.toString() + "\n";
        log += "Shielded pubkey: " + this.appDataHash + "\n";
        for (var i = 0; i < this.publicKeyX.length; i++) {
            if (i < this.nrSigners.toNumber()) {
                log +=
                    "Signer: " +
                        i +
                        anchor_1.utils.bytes.hex.encode(Buffer.from(Array.from([...this.publicKeyX[i], ...this.publicKeyY[i]]).flat())) +
                        "\n";
            }
        }
        return log;
    }
    static toArray(poseidon, threshold, nrSigners, publicKeyX, publicKeyY) {
        return [
            new anchor_1.BN(threshold),
            new anchor_1.BN(nrSigners),
            ...publicKeyX.map((s) => new anchor_1.BN(poseidon.F.toString(s)).toArrayLike(Buffer, "le", 32)),
            ...publicKeyY.map((s) => new anchor_1.BN(poseidon.F.toString(s)).toArrayLike(Buffer, "be", 32)),
        ];
    }
    static getHash(poseidon, array) {
        return poseidon.F.toString(poseidon(array));
    }
    static equal(multiSig1, multiSig2) {
        multiSig1.publicKeyX.map((key, i) => chai_1.assert.equal(key.toString(), multiSig2.publicKeyX[i].toString(), `invalid publicKeyX key ${i}`));
        multiSig1.publicKeyY.map((key, i) => chai_1.assert.equal(key.toString(), multiSig2.publicKeyY[i].toString(), `invalid publicKeyY key ${i}`));
        multiSig1.signersEncryptionPublicKeys.map((key, i) => chai_1.assert.equal(key.toString(), multiSig2.signersEncryptionPublicKeys[i].toString(), `invalid encryoption key ${i}`));
        chai_1.assert.equal(multiSig1.priorMultiSigSlot.toString(), multiSig2.priorMultiSigSlot.toString(), "invalid priorMultiSigSlot");
        chai_1.assert.equal(multiSig1.priorMultiSigHash.toString(), multiSig2.priorMultiSigHash.toString(), "invalid priorMultiSigHash");
        chai_1.assert.equal(multiSig1.priorMultiSigSeed.toString(), multiSig2.priorMultiSigSeed.toString(), "invalid priorMultiSigSeed");
        chai_1.assert.equal(multiSig1.threshold.toString(), multiSig2.threshold.toString(), "invalid threshold");
        chai_1.assert.equal(multiSig1.nrSigners.toString(), multiSig2.nrSigners.toString(), "invalid nrSigners");
        chai_1.assert.equal(multiSig1.seed.toString(), multiSig2.seed.toString(), "invalid seed");
        chai_1.assert.equal(multiSig1.appDataHash.toString(), multiSig2.appDataHash.toString(), "invalid appDataHash");
    }
}
exports.MultisigParams = MultisigParams;
