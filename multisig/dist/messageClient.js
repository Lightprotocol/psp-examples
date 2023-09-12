"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageClient = exports.newNonce = void 0;
const tslib_1 = require("tslib");
const anchor_1 = require("@coral-xyz/anchor");
const zk_js_1 = require("@lightprotocol/zk.js");
const tweetnacl_1 = tslib_1.__importDefault(require("tweetnacl"));
const newNonce = () => tweetnacl_1.default.randomBytes(tweetnacl_1.default.box.nonceLength);
exports.newNonce = newNonce;
class MessageClient {
    constructor(user) {
        this.user = user;
    }
    async encryptAndStoreForRecipient(message, recipient) {
        const buf = this.str2buf(message);
        const nonce = (0, exports.newNonce)();
        const ciphertext = tweetnacl_1.default.box(buf, nonce, recipient, zk_js_1.CONSTANT_SECRET_AUTHKEY);
        const res = Uint8Array.from([...nonce, ...ciphertext]);
        return this.store(Buffer.from(res));
    }
    async storeString(message) {
        const buf = this.str2buf(message);
        return this.store(buf);
    }
    async store(message, anonymousSender = false) {
        let res = await this.user.storeData(message, zk_js_1.ConfirmOptions.spendable, !anonymousSender);
        console.log("store program utxo transaction hash ", res.txHash);
        return res.txHash;
    }
    async getMessages() {
        let transactions = await this.user.provider.relayer.getIndexedTransactions(this.user.provider.connection);
        for (let tx of transactions) {
            if (tx.message != undefined) {
                let decryptedMessage = this.decryptMessage(tx.message);
                if (decryptedMessage == null) {
                    decryptedMessage = anchor_1.utils.bytes.utf8.decode(tx.message);
                }
                console.log(decryptedMessage);
            }
        }
    }
    decryptMessage(message) {
        const cleartext = tweetnacl_1.default.box.open(Uint8Array.from(message).slice(tweetnacl_1.default.box.nonceLength), Uint8Array.from(message).slice(0, tweetnacl_1.default.box.nonceLength), tweetnacl_1.default.box.keyPair.fromSecretKey(zk_js_1.CONSTANT_SECRET_AUTHKEY).publicKey, this.user.account.encryptionKeypair.secretKey);
        if (cleartext == null) {
            return null;
        }
        return anchor_1.utils.bytes.utf8.decode(Buffer.from(cleartext));
    }
    str2buf(message) {
        return Buffer.from(anchor_1.utils.bytes.utf8.encode(message));
    }
}
exports.MessageClient = MessageClient;
