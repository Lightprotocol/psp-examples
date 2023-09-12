/// <reference types="node" />
import { TransactionParameters } from "@lightprotocol/zk.js";
export type QueuedTransactionsType = {
    transactionParams: TransactionParameters;
    approvals: {
        publicKey: Uint8Array[][];
        signature: Uint8Array[];
    };
};
export declare class Approval {
    signature: Uint8Array;
    signerIndex: number;
    publicKey: [Uint8Array, Uint8Array];
    constructor({ signerIndex, publicKey, signature, }: {
        signerIndex: number;
        publicKey: [Uint8Array, Uint8Array];
        signature: Uint8Array;
    });
    toBytes(): Promise<Buffer>;
    static fromBytes(bytes: Buffer): Approval;
}
export declare class QueuedTransaction {
    transactionParams: TransactionParameters;
    approvals: Approval[];
    constructor(transactionParams: TransactionParameters);
    addApproval(approval: Approval): void;
    print(poseidon: any): Promise<void>;
}
