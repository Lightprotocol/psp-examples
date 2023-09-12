import { MultiSigClient } from "./client";
export declare class Multisig {
    client: MultiSigClient;
    constructor(client: MultiSigClient);
    static createMultiSig(): Promise<Multisig>;
    create(): Promise<void>;
    toString(): string;
    add(): Promise<void>;
    approve(): Promise<void>;
    execute(): Promise<void>;
}
