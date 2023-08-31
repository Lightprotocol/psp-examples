import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";
import {
  TransactionParameters,
  Provider as LightProvider,
  confirmConfig,
  TestRelayer,
  User,
  airdropSol,
} from "@lightprotocol/zk.js";
import { Keypair } from "@solana/web3.js";

import { buildPoseidonOpt } from "circomlibjs";
import { BN } from "@coral-xyz/anchor";
import { IDL } from "../target/types/private_compressed_account";
import { PoseidonCompressedAccount } from "../sdk";

var POSEIDON;

const RPC_URL = "http://127.0.0.1:8899";

describe("Test private-compressed-account", () => {
  process.env.ANCHOR_PROVIDER_URL = RPC_URL;
  process.env.ANCHOR_WALLET = process.env.HOME + "/.config/solana/id.json";

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local(RPC_URL, confirmConfig);
  anchor.setProvider(provider);

  before(async () => {
    POSEIDON = await buildPoseidonOpt();
  });

  it.skip("Functional Test Merkle Tree Update & Inclusion Circuits", async () => {
    const compressedAccount = new PoseidonCompressedAccount(POSEIDON, IDL, 0);
    let insertValue = "12";
    let leafHash = POSEIDON.F.toString(POSEIDON([insertValue]));
    await compressedAccount.generateUpdateProof({ leafHash });
    for (let i = 0; i < 100; i++) {
      console.log("i ", i);
      let insertValue1 = (i + 1).toString();
      let leafHash = POSEIDON.F.toString(POSEIDON([insertValue1]));
      console.time("fullProveAndParse");
      await compressedAccount.generateUpdateProof({ leafHash });
      console.timeEnd("fullProveAndParse");
    }
  });

  it("Functional Test Inclusion Gt Circuit", async () => {
    const compressedAccount = new PoseidonCompressedAccount(POSEIDON, IDL, 0);
    let insertValue = "12";
    let leafHash = POSEIDON.F.toString(POSEIDON([insertValue]));
    await compressedAccount.generateUpdateProof({ leafHash });

    await compressedAccount.generateInclusionProof({
      leafInput: insertValue,
      referenceValue: new BN("12"),
    });
    await compressedAccount.generateInclusionProof({
      leafInput: insertValue,
      referenceValue: new BN("11"),
    });

    let throwed = false;
    try {
      await compressedAccount.generateInclusionProof({
        leafInput: insertValue,
        referenceValue: new BN("13"),
      });
    } catch (error) {
      console.error("error ", error);
      throwed = true;
    }
    assert(throwed, "Should throw error");
  });

  it("Create and Spend Program Utxo ", async () => {
    const wallet = Keypair.generate();
    await airdropSol({
      connection: provider.connection,
      lamports: 1e10,
      recipientPublicKey: wallet.publicKey,
    });

    let relayer = new TestRelayer({
      relayerPubkey: wallet.publicKey,
      relayerRecipientSol: wallet.publicKey,
      relayerFee: new BN(100000),
      payer: wallet,
    });

    // The light provider is a connection and wallet abstraction.
    // The wallet is used to derive the seed for your shielded keypair with a signature.
    var lightProvider = await LightProvider.init({
      wallet,
      url: RPC_URL,
      relayer,
      confirmConfig,
    });
    lightProvider.addVerifierProgramPublickeyToLookUpTable(
      TransactionParameters.getVerifierProgramId(IDL)
    );

    const user: User = await User.init({ provider: lightProvider });
    // User needs a shielded sol balance to pay for the transaction fees.
    await user.shield({ token: "SOL", publicAmountSol: "1" });

    const compressedAccount = new PoseidonCompressedAccount(
      POSEIDON,
      IDL,
      0,
      user
    );

    try {
      await compressedAccount.initMerkleTreeAccount();
    } catch (error) {
      console.error("error ", error);
      throw error;
    }
    console.log("merkle tree account initialized ");

    let insertValue = "12";
    let { txHash } = await compressedAccount.insertLeaf(insertValue);
    console.log("transaction hash ", txHash);
    for (let i = 0; i < 10; i++) {
      console.log("i ", i);
      let insertValue1 = (i + 1).toString();
      let { txHash } = await compressedAccount.insertLeaf(insertValue1);
      console.log("transaction hash ", txHash);
      let hash = await compressedAccount.verifyInclusionGte({
        leafInput: insertValue,
        referenceValue: new BN("0"),
      });
    }
  });
});
