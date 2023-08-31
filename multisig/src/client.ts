import { BN, Program, utils } from "@coral-xyz/anchor";
import {
  Action,
  confirmConfig,
  Provider,
  REGISTERED_POOL_PDA_SOL,
  Relayer,
  SolMerkleTree,
  Transaction,
  VerifierProgramTwo,
  TransactionParameters,
  Account,
  Utxo,
  ADMIN_AUTH_KEYPAIR,
  merkleTreeProgramId,
  MerkleTreeConfig,
  verifierProgramTwoProgramId,
  IDL_VERIFIER_PROGRAM_TWO,
  updateMerkleTreeForTest,
} from "@lightprotocol/zk.js";
import { MultiSig } from "./multisigParams";
import { Scalar } from "ffjavascript";
// import boxen from 'boxen';
import {
  Keypair as SolanaKeypair,
  SystemProgram,
  PublicKey,
} from "@solana/web3.js";
// import { MERKLE_TREE_KEY } from "light-sdk";
// import { MockVerifier } from "./verifier";
const path = require("path");
import { IDL, Multisig as MultisigProgram } from "../target/types/multisig";

import { verifierProgramId, MAX_SIGNERS } from "./constants";
import { QueuedTransaction, Approval } from "./transaction";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

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
export class MultiSigClient {
  signer: Account;
  multiSigParams: MultiSig;
  poseidon: any;
  eddsa: any;
  queuedTransactions: QueuedTransaction[];
  provider: Provider;
  verifier: Program<MultisigProgram>;
  constructor({
    multiSigParams,
    signer,
    poseidon,
    queuedTransactions,
    eddsa,
    provider,
  }: {
    multiSigParams: MultiSig;
    signer: Account;
    poseidon: any;
    queuedTransactions?: QueuedTransaction[];
    eddsa: any;
    provider: Provider;
  }) {
    this.multiSigParams = multiSigParams;
    this.signer = signer;
    this.poseidon = poseidon;
    this.eddsa = eddsa;
    if (queuedTransactions) {
      this.queuedTransactions = queuedTransactions;
    } else {
      this.queuedTransactions = [];
    }
    this.provider = provider;
    this.verifier = new Program(IDL, verifierProgramId);
  }

  // load call to load multisig

  // getMultiSig

  // TODO: need to enforce correct order in signatures relative to instructionDataHash
  // getApprovals

  // getQueuedTransactions()

  async approve(index: number) {
    // let tx = new Transaction({
    //   provider: this.provider,
    //   shuffleEnabled: false,
    //   params: this.queuedTransactions[index].transactionParams,
    //   appParams: { mock: "1231" },
    // });
    // await tx.compile();

    Transaction.getMerkleProofs(
      this.provider,
      this.queuedTransactions[index].transactionParams.inputUtxos
    );
    const integrityHash = await this.queuedTransactions[
      index
    ].transactionParams.getTxIntegrityHash(this.poseidon);

    const connectingHash = Transaction.getTransactionHash(
      this.queuedTransactions[index].transactionParams,
      this.poseidon
    );

    const publicKey = await this.signer.getEddsaPublicKey();
    const signature = await this.signer.signEddsa(
      this.poseidon.F.e(Scalar.e(connectingHash))
    );
    const approval = new Approval({
      publicKey,
      signature,
    });
    this.queuedTransactions[index].approvals.push(approval);
    console.log("\n\n------------------------------------------");
    console.log("\t Approved Multisig Transaction ");
    console.log("------------------------------------------");
    console.log(
      "The Approval is encrypted to the shared encryption key and stored in a (compressed) account on Solana.\n"
    );
    console.log(
      "Signer: ",
      utils.bytes.hex.encode(
        Buffer.from(
          Array.from([
            ...this.queuedTransactions[index].approvals[
              this.queuedTransactions[index].approvals.length - 1
            ].publicKey[0],
            ...this.queuedTransactions[index].approvals[
              this.queuedTransactions[index].approvals.length - 1
            ].publicKey[1],
          ]).flat()
        )
      )
    );
    console.log("Shielded transaction hash: ", connectingHash.toString());
    console.log(
      "Signature: ",
      utils.bytes.hex.encode(
        Buffer.from(
          this.queuedTransactions[index].approvals[
            this.queuedTransactions[index].approvals.length - 1
          ].signature
        )
      )
    );
    console.log("------------------------------------------\n");

    return this.queuedTransactions[index];
  }

  // approve and broadcast

  static async createMultiSigParameters(
    threshold: number,
    // user: User,
    signer: Account,
    signers: Account[],
    poseidon: any | undefined,
    eddsa: any | undefined,
    provider: Provider
  ) {
    const multisig = await MultiSig.createNewMultiSig({
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

  createUtxo({
    splAsset,
    splAmount,
    solAmount,
  }: {
    splAsset?: PublicKey;
    splAmount?: BN;
    solAmount?: BN;
  }) {
    const appData = {
      threshold: this.multiSigParams.threshold,
      nrSigners: this.multiSigParams.nrSigners,
      publicKeyX: this.multiSigParams.publicKeyX.map(
        (s) => new BN(this.poseidon.F.toString(s))
      ),
      publicKeyY: this.multiSigParams.publicKeyY.map(
        (s) => new BN(this.poseidon.F.toString(s))
      ),
    };

    console.log("appData: ", appData);

    if (splAmount && splAsset) {
      var realSolAmount = new BN(0);
      if (solAmount) {
        realSolAmount = solAmount;
      }
      return new Utxo({
        poseidon: this.poseidon,
        assets: [SystemProgram.programId, splAsset],
        account: this.multiSigParams.account,
        amounts: [realSolAmount, splAmount],
        appData,
        appDataIdl: IDL,
        verifierAddress: verifierProgramId,
        assetLookupTable: this.provider.lookUpTables.assetLookupTable,
        verifierProgramLookupTable:
          this.provider.lookUpTables.verifierProgramLookupTable,
      });
    } else if (solAmount) {
      return new Utxo({
        poseidon: this.poseidon,
        assets: [SystemProgram.programId, SystemProgram.programId],
        account: this.multiSigParams.account,
        amounts: [solAmount, new BN(0)],
        appData,
        appDataIdl: IDL,
        verifierAddress: verifierProgramId,
        assetLookupTable: this.provider.lookUpTables.assetLookupTable,
        verifierProgramLookupTable:
          this.provider.lookUpTables.verifierProgramLookupTable,
      });
    } else {
      throw new Error("Provided invalid params to create multisig createUtxo");
    }
  }

  // creates a transaction and queues it internally
  async createMultiSigTransaction({
    inputUtxos,
    outputUtxos,
    relayer,
    recipientSpl = SolanaKeypair.generate().publicKey,
    recipientSol = SolanaKeypair.generate().publicKey,
    sender = SolanaKeypair.generate().publicKey,
    action,
  }: {
    sender?: PublicKey;
    recipientSpl?: PublicKey;
    recipientSol?: PublicKey;
    inputUtxos: Utxo[];
    outputUtxos: Utxo[];
    relayer: Relayer;
    action: Action;
  }) {
    let encryptedUtxos = [];
    for (let utxo of outputUtxos) {
      let encryptedUtxo = await utxo.encrypt(this.poseidon);
      encryptedUtxos.push(encryptedUtxo);
    }

    const txParams = new TransactionParameters({
      inputUtxos,
      outputUtxos,
      transactionMerkleTreePubkey: MerkleTreeConfig.getTransactionMerkleTreePda(
        new BN(0)
      ),
      eventMerkleTreePubkey: MerkleTreeConfig.getEventMerkleTreePda(new BN(0)),
      recipientSol,
      recipientSpl,
      action,
      poseidon: this.poseidon,
      relayer,
      verifierIdl: IDL_VERIFIER_PROGRAM_TWO,
      encryptedUtxos: new Uint8Array([
        ...encryptedUtxos.flat(),
        ...new Array(512 - encryptedUtxos.flat().length).fill(1),
      ]),
    });

    this.queuedTransactions.push(new QueuedTransaction(txParams));
    return txParams;
  }

  // TODO: implement serialize deserialize for transaction params
  // TODO: implement Create and Broadcast

  async createAppParams(index: number) {
    const keypairDummy = new Account({
      poseidon: this.poseidon,
      seed: new Uint8Array(32).fill(3).toString(),
      eddsa: this.eddsa,
    });
    var pubkeyDummy = await keypairDummy.getEddsaPublicKey();
    pubkeyDummy[0] = new Uint8Array(32).fill(0);
    const signatureDummy = await keypairDummy.signEddsa("123124");

    // TODO: need to enforce correct order in signatures
    // fill signatures up with dummy signatures
    for (
      var i = this.queuedTransactions[index].approvals.length;
      i < MAX_SIGNERS;
      i++
    ) {
      this.queuedTransactions[index].approvals.push(
        new Approval({
          publicKey: pubkeyDummy,
          signature: signatureDummy,
        })
      );
    }

    const circuitPath = path.join("build-circuit");
    const appParams = {
      inputs: {
        threshold: this.multiSigParams.threshold.toString(),
        nrSigners: this.multiSigParams.nrSigners.toString(),
        isMultiSigUtxo: [1, 0, 0, 0], // TODO: make variable
        enabled: [1, 1, ...new Array(MAX_SIGNERS - 2).fill(0)], // TODO: make variable
        signerPubkeysX: this.queuedTransactions[index].approvals.map(
          (approval) => this.poseidon.F.toObject(approval.publicKey[0])
        ),
        signerPubkeysY: this.queuedTransactions[index].approvals.map(
          (approval) => this.poseidon.F.toObject(approval.publicKey[1])
        ),
        R8x: this.queuedTransactions[index].approvals.map((approval) =>
          this.poseidon.F.toObject(
            this.eddsa.unpackSignature(approval.signature).R8[0]
          )
        ),
        R8y: this.queuedTransactions[index].approvals.map((approval) =>
          this.poseidon.F.toObject(
            this.eddsa.unpackSignature(approval.signature).R8[1]
          )
        ),
        signatures: this.queuedTransactions[index].approvals.map(
          (approval) => this.eddsa.unpackSignature(approval.signature).S
        ),
      },
      verifierIdl: IDL,
      path: circuitPath,
    };
    return appParams;
  }

  async execute(index: number) {
    const appParams = await this.createAppParams(index);
    const params = this.queuedTransactions[0].transactionParams;

    // TODO: remove payer and send to relayer instead
    let tx = new Transaction({
      provider: this.provider,
      shuffleEnabled: false,
      params,
      appParams,
    });
    // TODO: remove when we have relayer only for testing
    // txParams.payer = ADMIN_AUTH_KEYPAIR;

    await tx.compileAndProve();
    await tx.sendAndConfirmTransaction();

    // await tx.compile();
    // await tx.provider.provider.connection.confirmTransaction(
    //   await tx.provider.provider.connection.requestAirdrop(
    //     tx.params.accounts.authority,
    //     1_000_000_000
    //   ),
    //   "confirmed"
    // );
    // await tx.getProof();
    // await tx.getAppProof();
    // await tx.sendAndConfirmTransaction();

    // await tx.checkBalances();
    await updateMerkleTreeForTest(ADMIN_AUTH_KEYPAIR, this.provider.url);
  }
}

export const printUtxo = (
  utxo: Utxo,
  poseidon: any,
  index: number,
  input: string
) => {
  let string = `-------------- ${input} Utxo ${index} --------------\n`;
  string += `Amount sol: ${utxo.amounts[0]} \n`;
  string += `Amount spl: ${
    utxo.amounts[1]
  }, mint spl: ${utxo.assets[1].toBase58()}\n`;
  string += `Shielded pubkey: ${utxo.account.pubkey.toString("hex")}\n`;
  string += `Commitment: ${utxo.getCommitment(poseidon)}\n`;
  string += `Verifier pubkey: ${utxo.verifierAddress.toBase58()}\n`;
  string += `Instruction hash: ${utxo.appDataHash.toString()}\n`;
  string += "------------------------------------------";
  return string;
};
