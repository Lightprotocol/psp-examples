"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageUtils = void 0;
const tslib_1 = require("tslib");
const zk_js_1 = require("@lightprotocol/zk.js");
const tweetnacl_1 = tslib_1.__importDefault(require("tweetnacl"));
const { blake2b } = require("@noble/hashes/blake2b");
const b2params24 = { dkLen: 24 };
const b2params16 = { dkLen: 16 };
const bs58 = require("bs58");
// add encrypt to primitive, nonces are H(base_nonce||pubkey), H(base_nonce||pubkey), H(base_nonce||pubkey), etc.
// if only one recipient use nonce directly
// fields [base_nonce], [encryptedAes1,..., encryptedAesN ], [aesCiphertext],
// standardized, the first 32 bytes are the pubkey,
// encrypt to aes
class StorageUtils {
    constructor(account) {
        this.account = account;
    }
    /**
     * @description 1. Generate random Aes key
     * @description 2. encrypt aes key to every account
     * @description 3. encrypt message to aes key
     * @param {Account[]} recipients recipients the message is encrypted to with a shared aes key
     * @param {Uint8Array} message which will be encrypted with aes
     * @returns {Uint8Array} with the layout [baseNonce(32), aesKeyCipherTexts(48 * x), aesNonce(16), aesCipherText]
     */
    static async encryptTo(recipientPublicKeys, message, baseNonce, aesSecretKey) {
        if (!aesSecretKey) {
            aesSecretKey = tweetnacl_1.default.randomBytes(32);
        }
        if (!baseNonce) {
            baseNonce = tweetnacl_1.default.randomBytes(32);
        }
        let i = 0;
        let encryptedAesKeys = [];
        for (var [index, publicKey] of recipientPublicKeys.entries()) {
            let nonce = blake2b
                .create(b2params24)
                .update(bs58.encode(baseNonce) + index.toString())
                .digest();
            encryptedAesKeys.push(zk_js_1.Account.encryptNacl(publicKey, aesSecretKey, zk_js_1.CONSTANT_SECRET_AUTHKEY, nonce, true));
            i = index;
        }
        let iv = blake2b
            .create(b2params16)
            .update(bs58.encode(baseNonce) + (i + 1).toString())
            .digest();
        const aesCiphertext = await zk_js_1.Account.encryptAes(aesSecretKey, message, iv);
        return Uint8Array.from([
            ...baseNonce,
            ...encryptedAesKeys.map((x) => Array.from(x)).flat(),
            ...aesCiphertext,
        ]);
    }
    /**
     * @description Decrypts a byte array with the layout [baseNonce(32), aesKeyCipherTexts(48 * x), aesNonce(16), aesCipherText]
     * @param {Account[]} recipients recipients the message is encrypted to with a shared aes key
     * @param {Uint8Array} message
     */
    static async decryptMultipleRecipients(account, ciphertext) {
        const baseNonce = ciphertext.slice(0, 32);
        const ciphertextPublicKeys = ciphertext.slice(32);
        let recipientCount = 0;
        const publicKeyCiphertextLength = 48;
        let encryptedAesKey;
        // Iterate over ciphertext until we find aes iv to determine the number of users the aes secret key is encrypted to
        for (var i = 0; i < ciphertextPublicKeys.length / publicKeyCiphertextLength; i++) {
            const nonce = blake2b
                .create(b2params24)
                .update(bs58.encode(baseNonce) + i.toString())
                .digest();
            const nonce16 = blake2b
                .create(b2params16)
                .update(bs58.encode(baseNonce) + i.toString())
                .digest();
            const encryptedAesKeyCandidate = ciphertextPublicKeys.slice(i * publicKeyCiphertextLength, (i + 1) * publicKeyCiphertextLength);
            const decryptedAesKeyCandidate = account.decryptNacl(encryptedAesKeyCandidate, nonce, tweetnacl_1.default.box.keyPair.fromSecretKey(zk_js_1.CONSTANT_SECRET_AUTHKEY).publicKey);
            if (decryptedAesKeyCandidate) {
                encryptedAesKey = decryptedAesKeyCandidate;
            }
            // check whether we found the aes iv which means we tried to decrypt all publickeys
            if (nonce16.toString() ===
                ciphertextPublicKeys
                    .slice(i * publicKeyCiphertextLength, i * publicKeyCiphertextLength + 16)
                    .toString()) {
                break;
            }
            recipientCount++;
        }
        if (!encryptedAesKey) {
            throw new Error("Failed to decrypt the AES key with the provided secret key");
        }
        const startAesCiphertext = recipientCount * publicKeyCiphertextLength;
        const ciphertextAes = ciphertextPublicKeys.slice(startAesCiphertext);
        return await zk_js_1.Account.decryptAes(encryptedAesKey, ciphertextAes);
    }
}
exports.StorageUtils = StorageUtils;
