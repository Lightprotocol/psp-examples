/// <reference types="bn.js" />
/// <reference types="node" />
import { BN } from "@coral-xyz/anchor";
import { Account } from "@lightprotocol/zk.js";
export declare class MultisigParams {
    signersEncryptionPublicKeys: Array<Uint8Array>;
    threshold: BN;
    publicKeyX: Array<Uint8Array>;
    publicKeyY: Array<Uint8Array>;
    poseidon: any;
    nrSigners: BN;
    appDataHash?: string;
    seed: Uint8Array;
    account: Account;
    priorMultiSigSlot: BN;
    priorMultiSigHash: Uint8Array;
    priorMultiSigSeed: Uint8Array;
    constructor({ poseidon, threshold, nrSigners, publicKeyX, publicKeyY, signersEncryptionPublicKeys, seed, priorMultiSigSlot, priorMultiSigHash, priorMultiSigSeed, }: {
        poseidon: any;
        threshold: number;
        nrSigners: number;
        publicKeyX: Array<Uint8Array>;
        publicKeyY: Array<Uint8Array>;
        signersEncryptionPublicKeys: Array<Uint8Array>;
        seed: Uint8Array;
        priorMultiSigSlot: BN;
        priorMultiSigHash: Uint8Array;
        priorMultiSigSeed: Uint8Array;
    });
    static createNewMultiSig({ poseidon, signers, threshold, randomSeed, }: {
        poseidon: any;
        signers: Account[];
        threshold: number;
        randomSeed?: Uint8Array;
    }): Promise<MultisigParams>;
    toBytes(): Promise<Buffer>;
    static fromBytes(poseidon: any, bytes: Buffer): MultisigParams;
    print(): void;
    debugString(): string;
    static toArray(poseidon: any, threshold: any, nrSigners: any, publicKeyX: any, publicKeyY: any): any[];
    static getHash(poseidon: any, array: any): any;
    static equal(multiSig1: MultisigParams, multiSig2: MultisigParams): void;
}
