import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { assert } from "chai";
import {
  Account,
  Action,
  airdropSol,
  confirmConfig,
  Provider as LightProvider,
  TestRelayer,
  TransactionParameters,
  User,
  Utxo,
} from "@lightprotocol/zk.js";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Connection,
} from "@solana/web3.js";
import { IDL } from "../target/types/multisig";
import { buildEddsa, buildPoseidonOpt } from "circomlibjs";
import { MultiSig } from "../src";
import { StorageUtils } from "../src/storageClient";
import { Approval, MultiSigClient, printUtxo } from "../src";
import Squads, {
  DEFAULT_MULTISIG_PROGRAM_ID,
  getAuthorityPDA,
  Wallet,
} from "@sqds/sdk";

let circomlibjs = require("circomlibjs");

const path = require("path");
const verifierProgramId = new PublicKey(
  "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
);

const RPC_URL = "http://127.0.0.1:8899";

describe("Test multisig", () => {
  process.env.ANCHOR_PROVIDER_URL = RPC_URL;
  process.env.ANCHOR_WALLET = process.env.HOME + "/.config/solana/id.json";

  const provider = anchor.AnchorProvider.local(RPC_URL, confirmConfig);
  anchor.setProvider(provider);

  it("Poseidon Signature Poc", async () => {
    let eddsa = await buildEddsa();
    // @ts-ignore
    const prvKey = Buffer.from(
      "0001020304050607080900010203040506070809000102030405060708090001",
      "hex"
    );

    const pubKey = eddsa.prv2pub(prvKey);
    console.log("pubKey ", pubKey);

    const poseidon = await buildPoseidonOpt();
    const hash = poseidon([
      new Uint8Array(31).fill(2),
      new Uint8Array(31).fill(2),
      new Uint8Array(31).fill(2),
    ]);
    const signature = eddsa.signPoseidon(prvKey, hash);
    // 64 bytes
    const pSignature = eddsa.packSignature(signature);
    const uSignature = eddsa.unpackSignature(pSignature);
    assert(eddsa.verifyPoseidon(hash, uSignature, pubKey));
  });

  it("MultiSig Creation and serialization functional", async () => {
    const poseidon = await buildPoseidonOpt();
    let eddsa = await buildEddsa();

    const keypair = new Account({
      poseidon,
      seed: new Uint8Array(32).fill(1).toString(),
      eddsa,
    });
    await keypair.getEddsaPublicKey();
    const keypair1 = new Account({
      poseidon,
      seed: new Uint8Array(32).fill(12).toString(),
      eddsa,
    });
    await keypair1.getEddsaPublicKey();

    const multiSig = await MultiSig.createNewMultiSig({
      poseidon,
      signers: [keypair, keypair1],
      threshold: 2,
    });
    let bytes = await multiSig.toBytes();
    let multiSig1 = MultiSig.fromBytes(poseidon, bytes);
    MultiSig.equal(multiSig, multiSig1);
  });

  it("Encrypt MultiSig Creation and serialization functional", async () => {
    const poseidon = await buildPoseidonOpt();
    let eddsa = await buildEddsa();

    const keypair = new Account({
      poseidon,
      seed: new Uint8Array(32).fill(1).toString(),
      eddsa,
    });
    await keypair.getEddsaPublicKey();
    const keypair1 = new Account({
      poseidon,
      seed: new Uint8Array(32).fill(12).toString(),
      eddsa,
    });
    await keypair1.getEddsaPublicKey();

    const multiSig = await MultiSig.createNewMultiSig({
      poseidon,
      signers: [keypair, keypair1],
      threshold: 2,
    });
    let bytes = await multiSig.toBytes();
    let multiSig1 = MultiSig.fromBytes(poseidon, bytes);
    MultiSig.equal(multiSig, multiSig1);

    let encBytes = await StorageUtils.encryptTo(
      [
        keypair.encryptionKeypair.publicKey,
        keypair1.encryptionKeypair.publicKey,
      ],
      Uint8Array.from(bytes)
    );

    let decryptedBytes = await StorageUtils.decryptMultipleRecipients(
      keypair1,
      encBytes
    );
    let decryptedBytes1 = await StorageUtils.decryptMultipleRecipients(
      keypair,
      encBytes
    );

    MultiSig.equal(
      MultiSig.fromBytes(poseidon, Buffer.from(decryptedBytes)),
      multiSig1
    );
    MultiSig.equal(
      MultiSig.fromBytes(poseidon, Buffer.from(decryptedBytes1)),
      multiSig1
    );
  });

  it.only("Approval Creation and serialization functional", async () => {
    const poseidon = await buildPoseidonOpt();
    let eddsa = await buildEddsa();

    const keypair = new Account({
      poseidon,
      seed: new Uint8Array(32).fill(1).toString(),
      eddsa,
    });
    const publicKey = await keypair.getEddsaPublicKey();

    let txHash = poseidon(["1"]);
    const signature = eddsa.packSignature(
      eddsa.signPoseidon(keypair.poseidonEddsaKeypair.privateKey, txHash)
    );

    let approval = new Approval({
      publicKey: publicKey,
      signerIndex: 0,
      signature,
    });
    let bytes = await approval.toBytes();
    let approval1 = Approval.fromBytes(bytes);
    assert.exists(approval1);

    assert.equal(approval.signature.toString(), approval1.signature.toString());
    assert.equal(approval.publicKey.toString(), approval1.publicKey.toString());
  });

  it("Fetches squads multisig", async () => {
    const walletKeypair = Keypair.generate();
    const squads = Squads.devnet(new Wallet(walletKeypair));

    const squadsPublicKey = new PublicKey(
      "2RQbvCWz7RNMGodHMzVrwwzkdLw36FAR1quk4sVJtgWs"
    );

    const multisigAccount = await squads.getMultisig(squadsPublicKey);
    console.log(multisigAccount);
  });

  it("Creates squads multisig & transfer sol", async () => {
    const walletKeypair = Keypair.generate();
    const squads = Squads.localnet(new Wallet(walletKeypair));

    const createSquad = async (members: PublicKey[], threshold: number) => {
      // random key so no collision
      const createKey = new Keypair().publicKey;
      const name = "Test Squad";
      const description = "This is a test squad";

      try {
        const multisigAccount = await squads.createMultisig(
          threshold,
          createKey,
          members,
          name,
          description
        );
        console.log(
          "Successfully created a new multisig at",
          multisigAccount.publicKey.toBase58()
        );
        console.log("Multisig account:", JSON.stringify(multisigAccount));
        const [vault] = await getAuthorityPDA(
          multisigAccount.publicKey,
          new BN(1),
          DEFAULT_MULTISIG_PROGRAM_ID
        );
        console.log("Default Vault address:", vault.toBase58());
        return {
          multisigPublicKey: multisigAccount.publicKey,
          vaultPublicKey: vault,
        };
      } catch (e) {
        console.log("Error:", e);
        throw e;
      }
    };

    // airdrop to fund the wallet - may fail occasionally since it defaults to public devnet
    await airdropSol({
      connection: squads.connection,
      lamports: LAMPORTS_PER_SOL,
      recipientPublicKey: walletKeypair.publicKey,
    });

    const payerBalance = await squads.connection.getBalance(
      walletKeypair.publicKey,
      "confirmed"
    );
    // validate airdrop
    console.log(payerBalance);

    const otherMembersBesidesWallet = [Keypair.generate(), Keypair.generate()];

    const initMembers = [
      walletKeypair.publicKey,
      ...otherMembersBesidesWallet.map((kp) => kp.publicKey),
    ];
    const initThreshold = 2;
    const { multisigPublicKey, vaultPublicKey } = await createSquad(
      initMembers,
      initThreshold
    );

    // airdrop 1 SOL to the vault
    await airdropSol({
      connection: squads.connection,
      lamports: LAMPORTS_PER_SOL,
      recipientPublicKey: walletKeypair.publicKey,
    });

    // wallet that will get SOL
    const recipientWallet = Keypair.generate().publicKey;

    // create the multisig transaction - use default authority Vault (1)
    const multisigTransaction = await squads.createTransaction(
      multisigPublicKey,
      1
    );

    const transferSolIx = SystemProgram.transfer({
      fromPubkey: vaultPublicKey,
      toPubkey: recipientWallet,
      lamports: LAMPORTS_PER_SOL / 2, // send .5 SOL
    });

    // add the instruction to the transaction
    const ixRes = await squads.addInstruction(
      multisigTransaction.publicKey,
      transferSolIx
    );
    console.log("Instruction added to transaction:", JSON.stringify(ixRes));

    // activate the transaction so all members can vote on it
    await squads.activateTransaction(multisigTransaction.publicKey);

    // vote on the transaction
    await squads.approveTransaction(multisigTransaction.publicKey);

    const firstTxState = await squads.getTransaction(
      multisigTransaction.publicKey
    );
    console.log("Transaction state:", firstTxState.status);

    // still need one more approval from another member, so we'll use the other member's wallet
    const otherMemberWallet = new Wallet(otherMembersBesidesWallet[0]);
    // make sure there are lamports in the wallet
    await airdropSol({
      connection: squads.connection,
      lamports: LAMPORTS_PER_SOL,
      recipientPublicKey: otherMemberWallet.publicKey,
    });

    const otherMemberSquads = Squads.devnet(otherMemberWallet);
    await otherMemberSquads.approveTransaction(multisigTransaction.publicKey);

    // now you can also check the transaction state, as it should be "executeReady" as the 2/3 threshold has been met
    const transaction = await squads.getTransaction(
      multisigTransaction.publicKey
    );
    console.log("Transaction state:", transaction.status);

    // finally, we have the last member wallet execute it if we like
    const executorMemberWallet = new Wallet(otherMembersBesidesWallet[1]);
    const executorMemberSquads = Squads.devnet(executorMemberWallet);
    // make sure there are lamports in the wallet
    await airdropSol({
      connection: squads.connection,
      lamports: LAMPORTS_PER_SOL,
      recipientPublicKey: executorMemberWallet.publicKey,
    });

    // execute the transaction
    await executorMemberSquads.executeTransaction(
      multisigTransaction.publicKey
    );
    const postExecuteState = await squads.getTransaction(
      multisigTransaction.publicKey
    );
    console.log("Transaction state:", postExecuteState.status);
    // now we should be able to see that the recipient wallet has a token
    const receipientAccountValue = await squads.connection.getBalance(
      recipientWallet,
      "processed"
    );
    console.log(
      "Recipient token account balance:",
      receipientAccountValue / LAMPORTS_PER_SOL
    );
  });

  it("Test Withdrawal Multisig", async () => {
    const poseidon = await buildPoseidonOpt();
    let eddsa = await buildEddsa();

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
    let lightProvider = await LightProvider.init({
      wallet,
      url: RPC_URL,
      relayer,
      confirmConfig,
    });
    lightProvider.addVerifierProgramPublickeyToLookUpTable(
      TransactionParameters.getVerifierProgramId(IDL)
    );

    const user: User = await User.init({ provider: lightProvider });

    const keypair = new Account({
      poseidon,
      seed: new Uint8Array(32).fill(1).toString(),
      eddsa,
    });

    const signers = [user.account, keypair];

    const client = await MultiSigClient.createMultiSigParameters(
      2,
      user.account,
      signers,
      poseidon,
      eddsa,
      lightProvider
    );

    console.log("------------------------------------------");
    console.log("\t Created Multisig ");
    console.log("------------------------------------------");
    console.log("The creator of the multisig creates a shared encryption key.");
    console.log(
      "The shared encryption key is encrypted to the encryption publickeys of all signers individually."
    );
    console.log(
      "The shared encryption key is used to encrypt all subsequent transactions."
    );
    console.log(
      "Together with the encrypted shared key,\n parameter data is encrypted to a shared encryption key and stored in a compressed account on Solana."
    );

    client.multiSigParams.print();
    console.log("------------------------------------------");
    console.log("\n\n");

    const withdrawalAmount = 1_000_000_0;
    let outputUtxo = client.createUtxo({ solAmount: new BN(withdrawalAmount) });

    // Deposit to multisig
    console.log("------------------------------------------");
    console.log("\t Depositing to Multisig ");
    console.log("------------------------------------------");
    console.log(
      "A normal light protocol deposit transaction creates a multisig utxo."
    );
    console.log("Every light transaction has input and output utxos.");
    console.log(
      "During transaction execution input utxos are invalidated, \n while output utxos are inserted into the merkle tree"
    );
    console.log("This is the multisig output utxo");
    console.log(printUtxo(outputUtxo, poseidon, 0, "ouput"));

    await deposit(outputUtxo, user);
    console.log("DEPOSITED");
    console.log("------------------------------------------");
    console.log("\n\n");

    const inputUtxos = [outputUtxo];
    const outputUtxos = [];

    await client.createMultiSigTransaction({
      inputUtxos,
      outputUtxos,
      relayer,
      action: Action.UNSHIELD,
    });
    console.log("------------------------------------------");
    console.log("\t Created Multisig Transaction ");
    console.log("------------------------------------------");
    console.log(
      "The multisig transaction is encrypted to the shared encryption key and stored in a compressed account on Solana."
    );
    //    console.log(client.queuedTransactions[0]);
    const approvedTransaction = await client.approve(0);

    console.log("------------------------------------------");
    console.log("\tSigner 2 Client");
    console.log("------------------------------------------");
    console.log(
      " Signer 2 fetches the multisig configuration, transaction and the approval from Solana."
    );

    // creates a client object with the second signer
    const client1 = new MultiSigClient({
      provider: lightProvider,
      multiSigParams: client.multiSigParams,
      signer: keypair,
      queuedTransactions: [approvedTransaction],
      eddsa,
      poseidon,
    });
    // approves the multisig transaction
    await client1.approve(0);

    console.log("\n\n------------------------------------------");
    console.log("\t Executing Multisig Transaction ");
    console.log("------------------------------------------");

    await client1.execute(0);
    console.log("------------------------------------------\n");
  });

  async function deposit(utxo: Utxo, user: User) {
    let tx = await user.storeAppUtxo({
      appUtxo: utxo,
      action: Action.SHIELD,
    });
    console.log("store program utxo transaction hash ", tx.txHash);
  }
});
