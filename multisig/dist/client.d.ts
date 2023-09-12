/// <reference types="bn.js" />
import { BN, Program } from "@coral-xyz/anchor";
import { Action, Provider, Relayer, TransactionParameters, Account, Utxo } from "@lightprotocol/zk.js";
import { MultisigParams } from "./multisigParams";
import { PublicKey } from "@solana/web3.js";
import { Multisig as MultisigProgram } from "./types/multisig";
import { QueuedTransaction } from "./transaction";
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
export declare class MultiSigClient {
    signer: Account;
    multiSigParams: MultisigParams;
    poseidon: any;
    eddsa: any;
    queuedTransactions: QueuedTransaction[];
    provider: Provider;
    verifier: Program<MultisigProgram>;
    constructor({ multiSigParams, signer, poseidon, queuedTransactions, eddsa, provider, }: {
        multiSigParams: MultisigParams;
        signer: Account;
        poseidon: any;
        queuedTransactions?: QueuedTransaction[];
        eddsa: any;
        provider: Provider;
    });
    approve(index: number): Promise<QueuedTransaction>;
    static createMultiSigParameters(threshold: number, signer: Account, signers: Account[], poseidon: any | undefined, eddsa: any | undefined, provider: Provider): Promise<MultiSigClient>;
    createUtxo({ splAsset, splAmount, solAmount, }: {
        splAsset?: PublicKey;
        splAmount?: BN;
        solAmount?: BN;
    }): Utxo;
    createMultiSigTransaction({ inputUtxos, outputUtxos, relayer, recipientSpl, recipientSol, sender, action, }: {
        sender?: PublicKey;
        recipientSpl?: PublicKey;
        recipientSol?: PublicKey;
        inputUtxos: Utxo[];
        outputUtxos: Utxo[];
        relayer: Relayer;
        action: Action;
    }): Promise<TransactionParameters>;
    createAppParams(index: number): Promise<{
        inputs: {
            isAppInUtxo: any;
            threshold: string;
            nrSigners: string;
            signerPubkeysX: any[];
            signerPubkeysY: any[];
            enabled: any[];
            signatures: any[];
            r8x: any[];
            r8y: any[];
        };
        verifierIdl: MultisigProgram;
        path: any;
    }>;
    static getAppInUtxoIndices(appUtxos: Utxo[]): number[];
    execute(index: number): Promise<void>;
}
export declare const printUtxo: (utxo: Utxo, poseidon: any, index: number, input: string) => string;
