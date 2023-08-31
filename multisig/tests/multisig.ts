import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";
import {
  Utxo,
  TransactionParameters,
  Provider as LightProvider,
  confirmConfig,
  Action,
  TestRelayer,
  User,
  ProgramUtxoBalance,
  airdropSol,
  ProgramParameters,
  KEYPAIR_PRIVKEY,
  Account,
  ADMIN_AUTH_KEYPAIR,
  Transaction,
  merkleTreeProgramId,
  verifierProgramStorageProgramId,
  MerkleTreeConfig,
  IDL_VERIFIER_PROGRAM_ZERO,
  userTokenAccount,
  AUTHORITY,
  updateMerkleTreeForTest,
  SolMerkleTree,
  MerkleTree,
} from "@lightprotocol/zk.js";
import {
  SystemProgram,
  PublicKey,
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

import { BN } from "@coral-xyz/anchor";
import { IDL } from "../target/types/multisig";

let circomlibjs = require("circomlibjs");

import { buildPoseidonOpt, buildBabyjub, buildEddsa } from "circomlibjs";
import { MultiSig } from "../src";
import { StorageUtils } from "../src/storageClient";
import { Approval } from "../src/transaction";
import { MultiSigClient, printUtxo } from "../src/client";
import { MessageClient } from "../src/messageClient";
import Squads, {
  DEFAULT_MULTISIG_PROGRAM_ID,
  getAuthorityPDA,
} from "@sqds/sdk";
import { Wallet } from "@sqds/sdk";

const path = require("path");

const verifierProgramId = new PublicKey(
  "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
);
var POSEIDON;
let KEYPAIR: Account;

const RPC_URL = "http://127.0.0.1:8899";

describe("Test multisig", () => {
  const provider = setupAnchor();

  before(async () => {
    POSEIDON = await buildPoseidonOpt();
    KEYPAIR = new Account({
      poseidon: POSEIDON,
      seed: KEYPAIR_PRIVKEY.toString(),
    });
  });

  it.skip("Poseidon Signature Poc", async () => {
    let eddsa = await buildEddsa();
    // @ts-ignore
    const babyJub = await circomlibjs.buildBabyjub();
    const F = babyJub.F;
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

  it.skip("MultiSig Creation and serialization functional", async () => {
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

  it.skip("Encrypt MultiSig Creation and serialization functional", async () => {
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

    let storageUtils = new StorageUtils(keypair1);
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

  it.skip("Approval Creation and serialization functional", async () => {
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
      signature,
    });
    let bytes = await approval.toBytes();
    let approval1 = Approval.fromBytes(bytes);
    assert.equal(approval.signature.toString(), approval1.signature.toString());
    assert.equal(approval.publicKey.toString(), approval1.publicKey.toString());
  });

  // TODO: Implement Verifier that stores compressed account state (Michal)
  // TODO: Add deposit
  // TODO: get Squad and do cpi deposit from squad to verifierZero
  it.skip("MultiSigParams de/serialization", async () => {
    const poseidon = await buildPoseidonOpt();
    let eddsa = await buildEddsa();
    const babyJub = await buildBabyjub();
    const F = babyJub.F;

    const relayer = new TestRelayer({
      relayerPubkey: ADMIN_AUTH_KEYPAIR.publicKey,
      relayerRecipientSol: ADMIN_AUTH_KEYPAIR.publicKey,
      relayerFee: new BN(100_000),
      payer: ADMIN_AUTH_KEYPAIR,
    });

    let lightProvider = await LightProvider.init({
      wallet: ADMIN_AUTH_KEYPAIR,
      url: RPC_URL,
      relayer,
      confirmConfig: confirmConfig,
    });
    lightProvider.addVerifierProgramPublickeyToLookUpTable(
      TransactionParameters.getVerifierProgramId(IDL)
    );
    const user: User = await User.init({ provider: lightProvider });

    // {
    //   solMerkleTree: new SolMerkleTree({ poseidon, pubkey: MERKLE_TREE_KEY }),
    //   lookUpTable: LOOK_UP_TABLE,
    //   provider,
    // };
    const relayerRecipientPubKey = Keypair.generate().publicKey;
    await lightProvider.provider.connection.confirmTransaction(
      await lightProvider.provider.connection.requestAirdrop(
        relayerRecipientPubKey,
        1_000_000_000
      ),
      "confirmed"
    );

    const relayerRecipient = new TestRelayer({
      relayerPubkey: ADMIN_AUTH_KEYPAIR.publicKey,
      relayerRecipientSol: relayerRecipientPubKey,
      relayerFee: new BN(100_000),
      payer: ADMIN_AUTH_KEYPAIR,
    });

    const keypair = new Account({
      poseidon,
      seed: new Uint8Array(32).fill(1).toString(),
      eddsa,
    });
    const keypair1 = new Account({
      poseidon,
      seed: new Uint8Array(32).fill(12).toString(),
      eddsa,
    });

    const signers = Array.from([
      await keypair.getEddsaPublicKey(),
      await keypair1.getEddsaPublicKey(),
    ]);

    // Create multisig with
    // - threshold 2
    // - nrSigners 2
    // const client = await MultiSigClient.createMultiSigParameters(
    //   new BN(2),
    //   keypair, // is used to instantiate the MultiSigClient
    //   signers.map((signer) => {
    //     return [Array.from(signer[0]), Array.from(signer[1])];
    //   }),
    //   poseidon,
    //   eddsa,
    //   lightProvider
    // );

    // console.log(
    //   "client serialize ",
    //   MultiSigParams.struct.serialize(client.multiSigParams)
    // );
    // console.log(
    //   "client deserialize",
    //   MultiSigParams.struct.deserialize(
    //     MultiSigParams.struct.serialize(client.multiSigParams)
    //   )
    // );
  });

  it.skip("Fetches squads multisig", async () => {
    const walletKeypair = Keypair.generate();
    const squads = Squads.devnet(new Wallet(walletKeypair));

    const squadsPublicKey = new PublicKey(
      "2RQbvCWz7RNMGodHMzVrwwzkdLw36FAR1quk4sVJtgWs"
    );

    const multisigAccount = await squads.getMultisig(squadsPublicKey);
    console.log(multisigAccount);
  });

  it.skip("Creates squads multisig & transfer sol", async () => {
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
    await airdrop(squads.connection, walletKeypair.publicKey, LAMPORTS_PER_SOL);
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
    await airdrop(squads.connection, vaultPublicKey, LAMPORTS_PER_SOL);

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
    await airdrop(
      squads.connection,
      otherMemberWallet.publicKey,
      LAMPORTS_PER_SOL
    );
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
    await airdrop(
      squads.connection,
      executorMemberWallet.publicKey,
      LAMPORTS_PER_SOL
    );

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

  it.skip("Encrypt/decrypt message", async () => {
    const authorityPda = Transaction.getSignerAuthorityPda(
      merkleTreeProgramId,
      verifierProgramStorageProgramId
    );
    const authorityBalance =
      (await provider.connection.getBalance(authorityPda)) / 1e9;
    console.log(`authorityPda balance: ${authorityBalance} SOL`);

    const wallet = await createWalletAndAirdropSol(provider, 1e10);
    const relayer = new TestRelayer({
      relayerPubkey: wallet.publicKey,
      relayerRecipientSol: wallet.publicKey,
      relayerFee: new BN(100_000),
      payer: wallet,
    });

    let lightProvider = await LightProvider.init({
      wallet,
      url: RPC_URL,
      relayer,
      confirmConfig: confirmConfig,
    });
    lightProvider.addVerifierProgramPublickeyToLookUpTable(
      TransactionParameters.getVerifierProgramId(IDL)
    );
    const user: User = await User.init({ provider: lightProvider });

    let messageClient = new MessageClient(user);

    let seed = new Uint8Array(32).fill(1);
    let encodedSeed = bs58.encode(seed);
    let recipient = (await User.init({
      provider: lightProvider,
      seed: encodedSeed,
    })) as User;

    await messageClient.encryptAndStoreForRecipient(
      "foobaz",
      recipient.account.encryptionKeypair.publicKey
    );

    const recipientMessageClient = new MessageClient(recipient);
    await recipientMessageClient.getMessages();
  });

  it.only("Test Withdrawal Multisig", async () => {
    const poseidon = await buildPoseidonOpt();
    let eddsa = await buildEddsa();
    const babyJub = await buildBabyjub();
    const F = babyJub.F;

    await airdropSol({
      connection: provider.connection,
      lamports: LAMPORTS_PER_SOL,
      recipientPublicKey: ADMIN_AUTH_KEYPAIR.publicKey,
    });

    const relayer = new TestRelayer({
      relayerPubkey: ADMIN_AUTH_KEYPAIR.publicKey,
      relayerRecipientSol: ADMIN_AUTH_KEYPAIR.publicKey,
      relayerFee: new BN(100_000),
      payer: ADMIN_AUTH_KEYPAIR,
    });
    let lightProvider = await LightProvider.init({
      wallet: ADMIN_AUTH_KEYPAIR,
      url: RPC_URL,
      relayer,
      confirmConfig: confirmConfig,
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
    const keypair1 = new Account({
      poseidon,
      seed: new Uint8Array(32).fill(12).toString(),
      eddsa,
    });

    // const signers = Array.from([
    //   await keypair.getEddsaPublicKey(),
    //   await keypair1.getEddsaPublicKey(),
    // ]);

    const signers = [keypair, keypair1];
    // Create multisig with
    // - threshold 2
    // - nrSigners 2
    const client = await MultiSigClient.createMultiSigParameters(
      2,
      keypair, // is used to instantiate the MultiSigClient
      signers,
      poseidon,
      eddsa,
      lightProvider
    );
    console.log("client ");

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
    var outputUtxo = client.createUtxo({ solAmount: new BN(withdrawalAmount) });

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
    // console.log("This is the multisig output utxo");
    // console.log(printUtxo(outputUtxo, 0, "ouput"));

    await deposit(provider, outputUtxo, lightProvider, user);
    console.log("------------------------------------------");
    console.log("\n\n");

    // const recentBlockhash = (
    //   await provider.provider.connection.getRecentBlockhash("confirmed")
    // ).blockhash;
    // const txMsg = new TransactionMessage({
    //   payerKey: signer.publicKey,
    //   instructions: [
    //     ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
    //     depositIx[0],
    //   ],
    //   recentBlockhash: recentBlockhash,
    // });

    // const lookupTableAccount =
    //   await provider.provider.connection.getAccountInfo(
    //     relayer.accounts.lookUpTable,
    //     "confirmed",
    //   );

    // const unpackedLookupTableAccount = AddressLookupTableAccount.deserialize(
    //   lookupTableAccount.data,
    // );

    // const compiledTx = txMsg.compileToV0Message([
    //   {
    //     state: unpackedLookupTableAccount,
    //     key: relayer.accounts.lookUpTable,
    //     isActive: () => {
    //       return true;
    //     },
    //   },
    // ]);

    // compiledTx.addressTableLookups[0].accountKey =
    //   relayer.accounts.lookUpTable;

    // const tx = new VersionedTransaction(compiledTx);
    // let serializedTx = tx.serialize();

    // TODO: get deposit instruction
    // TODO: hack executeTransaction to send a versioned transaction instead of a regular one
    // let txState = await squads.createTransaction(msPDA, 1);
    // await squads.addInstruction(txState.publicKey, depositIx[0]);
    // await squads.activateTransaction(txState.publicKey);
    // await squads.approveTransaction(txState.publicKey);

    // txState = await squads.getTransaction(txState.publicKey);
    // await squads.executeTransaction(txState.publicKey);
    // squads._executeTransaction(transactionPDA, payer)

    // await updateMerkleTreeForTest(ADMIN_AUTH_KEYPAIR, lightProvider.url);
    lightProvider.solMerkleTree!.merkleTree = new MerkleTree(18, poseidon, [
      outputUtxo.getCommitment(poseidon),
    ]);

    // lightProvider.solMerkleTree = await SolMerkleTree.build({
    //   pubkey: MERKLE_TREE_KEY,
    //   poseidon,
    // });

    const inputUtxos = [
      outputUtxo,
      // new Utxo({ provider }),
      // new Utxo({ poseidon }),
      // new Utxo({ poseidon }),
    ];
    const outputUtxos = [
      // new Utxo({ poseidon }),
      // new Utxo({ poseidon }),
      // new Utxo({ poseidon }),
      // new Utxo({ poseidon }),
    ];
    // // creates a transaction and queues it in the
    let recipientFee = Keypair.generate().publicKey;

    // signer 1 creates a multisig transaction
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
    console.log(client.queuedTransactions[0]);
    // console.log(
    //   "Serialized multisig transaction length ",
    //   client.queuedTransactions[0].toBytes().length.toString()
    // );
    // console.log("(We can probably optimize here.)");

    // await user.getUtxoInbox();
    // await user.provider.latestMerkleTree();

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
      signer: keypair1,
      queuedTransactions: [approvedTransaction],
      eddsa,
      poseidon,
    });
    // approves the multi sig transaction
    await client1.approve(0);

    console.log("\n\n------------------------------------------");
    console.log("\t Executing Multisig Transaction ");
    console.log("------------------------------------------");
    // console.log(
    //   `Signer 2 executes the multisig shielded transaction, in this case a withdrawal of ${withdrawalAmount} to ${recipientFee.toBase58()}\n`
    // );

    // executes the approved transaction
    await client1.execute(0);
    console.log("------------------------------------------\n");
  });

  async function deposit(
    provider,
    utxo,
    lightProvider: LightProvider,
    user: User
  ) {
    // let txParams = new TransactionParameters({
    //   poseidon: lightProvider.poseidon,
    //   outputUtxos: [utxo],
    //   merkleTreePubkey: MERKLE_TREE_KEY,
    //   sender: userTokenAccount,
    //   senderFee: ADMIN_AUTH_KEYPAIR.publicKey,
    //   verifier: new VerifierZero(),
    //   lookUpTable: lightProvider.lookUpTable,
    //   action: Action.SHIELD,
    // });

    const txParams = new TransactionParameters({
      outputUtxos: [utxo],
      senderSol: ADMIN_AUTH_KEYPAIR.publicKey,
      transactionMerkleTreePubkey: MerkleTreeConfig.getTransactionMerkleTreePda(
        new BN(0)
      ),
      eventMerkleTreePubkey: MerkleTreeConfig.getEventMerkleTreePda(new BN(0)),
      action: Action.SHIELD,
      poseidon: lightProvider.poseidon,
      verifierIdl: IDL_VERIFIER_PROGRAM_ZERO,
    });

    console.log("wallet.publicKey ", lightProvider.wallet.publicKey.toBase58());

    console.log(
      "signingAddress: ",
      txParams.accounts.signingAddress.toBase58()
    );

    console.log(
      "relayerPubkey: ",
      txParams.relayer.accounts.relayerPubkey.toBase58()
    );

    user.storeAppUtxo(utxo);

    // let tx = new Transaction({
    //   provider: lightProvider,
    //   shuffleEnabled: false,
    //   params: txParams,
    // });

    // await tx.compileAndProve();
    // return await tx.getInstructions();
    // try {
    //   let res = await tx.sendAndConfirmTransaction();
    //   // console.log(res);
    // } catch (e) {
    //   console.log(e);
    //   console.log("AUTHORITY: ", AUTHORITY.toBase58());
    // }

    console.log("------------------------------------------\n");
    console.log("Updating Merkle Tree");
    console.log("------------------------------------------\n");
    console.log(
      "After any shielded transaction (deposit, transfer, or withdrawal)\n new utxos are queued and still need to be inserted into the merkle tree"
    );
    console.log(
      "The merkle tree insert is a decoupled process which is executed by a relayer."
    );
    console.log(
      "In case of a lot of traffic merkle tree updates can be batched to up to 32 leaves at once."
    );

    // await updateMerkleTreeForTest(ADMIN_AUTH_KEYPAIR, provider.connection);
    console.log("\n\tUpdate Successful");
    console.log("------------------------------------------\n");
  }
});

function setupAnchor(): anchor.AnchorProvider {
  process.env.ANCHOR_PROVIDER_URL = RPC_URL;
  process.env.ANCHOR_WALLET = process.env.HOME + "/.config/solana/id.json";

  const provider = anchor.AnchorProvider.local(RPC_URL, confirmConfig);
  anchor.setProvider(provider);
  return provider;
}

async function createWalletAndAirdropSol(
  provider: anchor.AnchorProvider,
  amount: number
): Promise<Keypair> {
  const wallet = Keypair.generate();
  await airdropSol({
    connection: provider.connection,
    lamports: amount,
    recipientPublicKey: wallet.publicKey,
  });
  return wallet;
}

const airdrop = async (
  connection: Connection,
  address: PublicKey,
  amount: number
) => {
  const airdropSig = await connection.requestAirdrop(address, amount);
  console.log("Airdrop sig", airdropSig);
  await connection.confirmTransaction(airdropSig, "confirmed");

  return airdropSig;
};

// creates a multisig with 1 signer and a single member using the immediate function
const createSquadExample = async () => {
  const walletKeypair = Keypair.generate();

  const squads = Squads.devnet(new Wallet(walletKeypair));
  // random key so no collision
  const createKey = new Keypair().publicKey;
  const threshold = 1;
  const members = [walletKeypair.publicKey];
  const name = "Test Squad";
  const description = "This is a test squad";

  try {
    // airdrop to fund the wallet - may fail occasionally since it defaults to public devnet
    const sig = await airdrop(
      squads.connection,
      walletKeypair.publicKey,
      LAMPORTS_PER_SOL
    );

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
  } catch (e) {
    console.log("Error:", e);
  }
};
