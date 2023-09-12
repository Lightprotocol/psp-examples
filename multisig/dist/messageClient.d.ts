/// <reference types="node" />
import { SendVersionedTransactionsResult, User } from "@lightprotocol/zk.js";
export declare const newNonce: () => Uint8Array;
export declare class MessageClient {
    user: User;
    constructor(user: User);
    encryptAndStoreForRecipient(message: string, recipient: Uint8Array): Promise<SendVersionedTransactionsResult>;
    storeString(message: string): Promise<SendVersionedTransactionsResult>;
    store(message: Buffer, anonymousSender?: boolean): Promise<SendVersionedTransactionsResult>;
    getMessages(): Promise<void>;
    decryptMessage(message: Buffer): string | null;
    private str2buf;
}
