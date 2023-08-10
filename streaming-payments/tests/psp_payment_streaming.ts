import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { assert } from "chai";
import {
  Account,
  Action,
  airdropSol,
  confirmConfig,
  ConfirmOptions,
  IDL_VERIFIER_PROGRAM_TWO,
  MerkleTreeConfig,
  ProgramUtxoBalance,
  Provider as LightProvider,
  TestRelayer,
  Transaction,
  TransactionParameters,
  User,
  Utxo,
  MerkleTree,
} from "@lightprotocol/zk.js";
import {
  Keypair as SolanaKeypair,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";

import { buildPoseidonOpt } from "circomlibjs";
import { IDL } from "../target/types/psp_payment_streaming";

const path = require("path");

const verifierProgramId = new PublicKey(
  "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
);
let POSEIDON;

const RPC_URL = "http://127.0.0.1:8899";

describe("Streaming Payments tests", () => {
  process.env.ANCHOR_PROVIDER_URL = RPC_URL;
  process.env.ANCHOR_WALLET = process.env.HOME + "/.config/solana/id.json";

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local(RPC_URL, confirmConfig);
  anchor.setProvider(provider);

  before(async () => {
    POSEIDON = await buildPoseidonOpt();
  });

  it("Create and Spend Program Utxo", async () => {
    const wallet = Keypair.generate();
    await airdropSol({
      connection: provider.connection,
      lamports: 1e9,
      recipientPublicKey: wallet.publicKey,
    });

    const relayerRecipientSol = SolanaKeypair.generate().publicKey;
    await airdropSol({
      connection: provider.connection,
      lamports: 1e9,
      recipientPublicKey: relayerRecipientSol,
    });
    let relayer = new TestRelayer({
      relayerPubkey: wallet.publicKey,
      relayerRecipientSol: relayerRecipientSol,
      relayerFee: new BN(100_000),
      payer: wallet,
    });

    // The light provider is a connection and wallet abstraction.
    // The wallet is used to derive the seed for your shielded keypair with a signature.
    const lightProvider = await LightProvider.init({
      wallet,
      url: RPC_URL,
      relayer,
      confirmConfig,
    });
    const lightUser: User = await User.init({ provider: lightProvider });

    const outputUtxoSol = new Utxo({
      poseidon: POSEIDON,
      assets: [SystemProgram.programId],
      account: lightUser.account,
      amounts: [new BN(1_000_000)],
      appData: { endSlot: new BN(1), rate: new BN(1) },
      appDataIdl: IDL,
      verifierAddress: verifierProgramId,
      assetLookupTable: lightProvider.lookUpTables.assetLookupTable,
      verifierProgramLookupTable:
        lightProvider.lookUpTables.verifierProgramLookupTable,
    });

    const testInputsShield = {
      utxo: outputUtxoSol,
      action: Action.SHIELD,
    };

    await lightUser.storeAppUtxo({
      appUtxo: testInputsShield.utxo,
      action: testInputsShield.action,
    });
    const programUtxoBalance: Map<string, ProgramUtxoBalance> =
      await lightUser.syncStorage(IDL);
    const shieldedUtxoCommitmentHash =
      testInputsShield.utxo.getCommitment(POSEIDON);
    const inputUtxo = programUtxoBalance
      .get(verifierProgramId.toBase58())
      .tokenBalances.get(testInputsShield.utxo.assets[1].toBase58())
      .utxos.get(shieldedUtxoCommitmentHash);

    Utxo.equal(POSEIDON, inputUtxo, testInputsShield.utxo, true);

    const circuitPath = path.join("build-circuit");
    const appParams = {
      inputs: {
        endSlot: new BN(1),
        rate: new BN(1),
        currentSlotPrivate: new BN(1),
        diff: new BN(0),
        currentSlot: new BN(1),
        remainingAmount: new BN(0),
        isOutUtxo: [new BN(0), new BN(0), new BN(0), new BN(0)],
      },
      path: circuitPath,
      verifierIdl: IDL,
    };

    const txParams = new TransactionParameters({
      inputUtxos: [inputUtxo],
      transactionMerkleTreePubkey: MerkleTreeConfig.getTransactionMerkleTreePda(
        new BN(0)
      ),
      eventMerkleTreePubkey: MerkleTreeConfig.getEventMerkleTreePda(new BN(0)),
      recipientSol: SolanaKeypair.generate().publicKey,
      action: Action.UNSHIELD,
      poseidon: POSEIDON,
      relayer: relayer,
      verifierIdl: IDL_VERIFIER_PROGRAM_TWO,
    });

    let tx = new Transaction({
      provider: lightProvider,
      params: txParams,
      appParams,
    });

    await tx.compileAndProve();
    await tx.sendAndConfirmTransaction();
  });

  it("Payment streaming", async () => {
    const circuitPath = path.join("build-circuit");
    const wallet = Keypair.generate(); // ADMIN_AUTH_KEYPAIR;
    await airdropSol({
      connection: provider.connection,
      lamports: 1e10,
      recipientPublicKey: wallet.publicKey,
    });

    const relayerRecipientSol = SolanaKeypair.generate().publicKey;
    await airdropSol({
      connection: provider.connection,
      lamports: 1e10,
      recipientPublicKey: relayerRecipientSol,
    });

    let relayer = new TestRelayer({
      relayerPubkey: wallet.publicKey,
      relayerRecipientSol: relayerRecipientSol,
      relayerFee: new BN(100_000),
      payer: wallet,
    });

    // The light provider is a connection and wallet abstraction.
    // The wallet is used to derive the seed for your shielded keypair with a signature.
    const lightProvider = await LightProvider.init({
      wallet,
      url: RPC_URL,
      relayer,
      confirmConfig,
    });
    const lightUser: User = await User.init({ provider: lightProvider });

    // lightUser account give account aes key
    class PaymentStreamClient {
      idl: anchor.Idl;
      endSlot?: BN;
      streamInitUtxo?: Utxo;
      latestStreamUtxo?: Utxo;
      poseidon: any;
      circuitPath: string;

      constructor(
        idl: anchor.Idl,
        poseidon: any,
        circuitPath: string,
        streamInitUtxo?: Utxo,
        latestStreamUtxo?: Utxo
      ) {
        this.idl = idl;
        this.streamInitUtxo = streamInitUtxo;
        this.endSlot = streamInitUtxo?.appData.endSlot;
        this.latestStreamUtxo = latestStreamUtxo;
        this.poseidon = poseidon;
        this.circuitPath = circuitPath;
      }
      /**
       * Creates a streamProgramUtxo
       * @param amount
       * @param timeInSlots
       * @param currentSlot
       * @param account
       */
      setupSolStream(
        amount: BN,
        timeInSlots: BN,
        currentSlot: BN,
        account: Account
      ) {
        if (this.streamInitUtxo)
          throw new Error("This stream client is already initialized");

        const endSlot = currentSlot.add(timeInSlots);
        this.endSlot = endSlot;
        const rate = amount.div(timeInSlots);
        const appData = {
          endSlot,
          rate,
        };
        const streamInitUtxo = new Utxo({
          poseidon: this.poseidon,
          assets: [SystemProgram.programId],
          account: account,
          amounts: [amount],
          appData: appData,
          appDataIdl: this.idl,
          verifierAddress: TransactionParameters.getVerifierProgramId(this.idl),
          assetLookupTable: lightProvider.lookUpTables.assetLookupTable,
          verifierProgramLookupTable:
            lightProvider.lookUpTables.verifierProgramLookupTable,
        });

        this.streamInitUtxo = streamInitUtxo;
        this.latestStreamUtxo = streamInitUtxo;
        return streamInitUtxo;
      }

      collectStream(currentSlot: BN, action: Action, merkleTree: MerkleTree) {
        if (!this.streamInitUtxo)
          throw new Error(
            "Streaming client is not initialized with streamInitUtxo"
          );
        if (currentSlot.gte(this.streamInitUtxo?.appData.endSlot)) {
          const currentSlotPrivate = this.streamInitUtxo.appData.endSlot;
          const diff = currentSlot.sub(currentSlotPrivate);
          const programParameters: ProgramParameters = {
            inputs: {
              currentSlotPrivate,
              currentSlot,
              diff,
              remainingAmount: new BN(0),
              isOutUtxo: new Array(4).fill(0),
              ...this.streamInitUtxo.appData,
            },
            verifierIdl: IDL,
            path: circuitPath,
          };

          const index = merkleTree.indexOf(
            this.latestStreamUtxo?.getCommitment(this.poseidon)
          );
          this.latestStreamUtxo.index = index;
          const inUtxo = this.latestStreamUtxo;
          if (action === Action.TRANSFER) {
            const outUtxo = new Utxo({
              assets: inUtxo.assets,
              amounts: [
                inUtxo.amounts[0].sub(new BN(100_000)),
                inUtxo.amounts[1],
              ],
              account: inUtxo.account,
              poseidon: this.poseidon,
              assetLookupTable: lightProvider.lookUpTables.assetLookupTable,
              verifierProgramLookupTable:
                lightProvider.lookUpTables.verifierProgramLookupTable,
            });
            return { programParameters, inUtxo, outUtxo, action };
          }
          return { programParameters, inUtxo, action };
        } else {
          const remainingAmount = this.streamInitUtxo.appData?.endSlot
            .sub(currentSlot)
            .mul(this.streamInitUtxo.appData?.rate);
          const programParameters: ProgramParameters = {
            inputs: {
              currentSlotPrivate: currentSlot,
              currentSlot,
              diff: new BN(0),
              remainingAmount: new BN(0),
              isOutUtxo: [1, 0, 0, 0],
              endSlot: this.endSlot,
              ...this.streamInitUtxo.appData,
            },
            verifierIdl: IDL,
            path: circuitPath,
          };
          const inUtxo = this.latestStreamUtxo;
          const outUtxo = new Utxo({
            poseidon: this.poseidon,
            assets: [SystemProgram.programId],
            account: inUtxo.account,
            amounts: [remainingAmount],
            appData: this.streamInitUtxo.appData,
            appDataIdl: this.idl,
            verifierAddress: TransactionParameters.getVerifierProgramId(
              this.idl
            ),
            assetLookupTable: lightProvider.lookUpTables.assetLookupTable,
            verifierProgramLookupTable:
              lightProvider.lookUpTables.verifierProgramLookupTable,
          });
          return { programParameters, outUtxo, inUtxo };
        }
      }
    }

    type ProgramParameters = {
      verifierIdl: anchor.Idl;
      inputs: any; // object of proof and other inputs
      path: string;
    };
    let client: PaymentStreamClient = new PaymentStreamClient(
      IDL,
      POSEIDON,
      circuitPath
    );
    const currentSlot = await provider.connection.getSlot("confirmed");
    const duration = 1;
    const streamInitUtxo = client.setupSolStream(
      new BN(1e9),
      new BN(duration),
      new BN(currentSlot),
      lightUser.account
    );

    const testInputsSol1 = {
      utxo: streamInitUtxo,
      action: Action.SHIELD,
      poseidon: POSEIDON,
    };

    // console.log("storing streamInitUtxo");
    await lightUser.storeAppUtxo({
      appUtxo: testInputsSol1.utxo,
      action: testInputsSol1.action,
    });
    await lightUser.syncStorage(IDL);
    const commitment = testInputsSol1.utxo.getCommitment(
      testInputsSol1.poseidon
    );

    const utxo = (await lightUser.getUtxo(commitment))!;
    assert.equal(utxo.status, "ready");
    Utxo.equal(POSEIDON, utxo.utxo, testInputsSol1.utxo, true);
    const currentSlot1 = await provider.connection.getSlot("confirmed");

    await lightUser.getBalance();
    let merkleTree = lightUser.provider.solMerkleTree.merkleTree;

    const { programParameters, inUtxo, outUtxo, action } = client.collectStream(
      new BN(currentSlot1),
      Action.TRANSFER,
      merkleTree
    );

    await lightUser.executeAppUtxo({
      appUtxo: inUtxo,
      programParameters,
      action,
      confirmOptions: ConfirmOptions.spendable,
    });
    const balance = await lightUser.getBalance();
    console.log(
      "totalSolBalance: ",
      balance.totalSolBalance.toNumber() * 1e-9,
      "SOL"
    );
    assert.equal(
      outUtxo.amounts[0].toString(),
      balance.totalSolBalance.toString()
    );
    console.log("inUtxo commitment: ", inUtxo.getCommitment(POSEIDON));

    const spentCommitment = testInputsSol1.utxo.getCommitment(
      testInputsSol1.poseidon
    );
    const utxoSpent = (await lightUser.getUtxo(spentCommitment, true, IDL))!;
    assert.equal(utxoSpent.status, "spent");
  });
});
