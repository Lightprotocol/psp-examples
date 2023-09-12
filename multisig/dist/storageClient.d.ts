import { Account } from "@lightprotocol/zk.js";
export declare class StorageUtils {
    account: Account;
    constructor(account: Account);
    /**
     * @description 1. Generate random Aes key
     * @description 2. encrypt aes key to every account
     * @description 3. encrypt message to aes key
     * @param {Account[]} recipients recipients the message is encrypted to with a shared aes key
     * @param {Uint8Array} message which will be encrypted with aes
     * @returns {Uint8Array} with the layout [baseNonce(32), aesKeyCipherTexts(48 * x), aesNonce(16), aesCipherText]
     */
    static encryptTo(recipientPublicKeys: Uint8Array[], message: Uint8Array, baseNonce?: Uint8Array, aesSecretKey?: Uint8Array): Promise<Uint8Array>;
    /**
     * @description Decrypts a byte array with the layout [baseNonce(32), aesKeyCipherTexts(48 * x), aesNonce(16), aesCipherText]
     * @param {Account[]} recipients recipients the message is encrypted to with a shared aes key
     * @param {Uint8Array} message
     */
    static decryptMultipleRecipients(account: Account, ciphertext: Uint8Array): Promise<Uint8Array>;
}
