import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";
import {
  Utxo,
  Provider as LightProvider,
  confirmConfig,
  Action,
  TestRelayer,
  User,
  airdropSol,
  ProgramParameters,
  FIELD_SIZE,
  Relayer,
  Account,
  sendVersionedTransactions
} from "@lightprotocol/zk.js";
import {
  SystemProgram,
  PublicKey,
  Keypair,
} from "@solana/web3.js";

import { buildPoseidonOpt } from "circomlibjs";
import { BN } from "@coral-xyz/anchor";
import { IDL, RockPaperScissors } from "../target/types/rock_paper_scissors";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
const path = require("path");

const verifierProgramId = new PublicKey(
  "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
);

let POSEIDON: any, RELAYER: TestRelayer;
const RPC_URL = "http://127.0.0.1:8899";
const GAME_AMOUNT = new BN(1_000_000_000);
const BN_ONE = new BN(1);
const BN_ZERO = new BN(0);
const STANDARD_SEED = bs58.encode(new Array(32).fill(1));
let STANDARD_ACCOUNT: Account;

enum Choice {
  ROCK = 0,
  PAPER = 1,
  SCISSORS = 2,
}

enum Winner {
  PLAYER1 = "PLAYER1",
  PLAYER2 = "PLAYER2",
  DRAW = "DRAW",
}

type GameParameters = {
  gameCommitmentHash?: BN;
  choice: Choice;
  slot: BN;
  player2CommitmentHash: BN;
  gameAmount: BN;
  userPubkey: BN;
}

class Game {
  gameParameters: GameParameters;
  programUtxo: Utxo;
  pda: PublicKey;

  constructor(gameParameters: GameParameters, programUtxo: Utxo, pda: PublicKey) {
    this.gameParameters = gameParameters;
    this.programUtxo = programUtxo;
    this.pda = pda;
  }

  static generateGameCommitmentHash(provider: LightProvider, gameParameters: GameParameters) {
      
    return new BN(provider.poseidon.F.toString(provider.poseidon([
      gameParameters.choice,
      gameParameters.slot,
      gameParameters.player2CommitmentHash,
      gameParameters.gameAmount,
    ])));
  }

  static async create(choice: Choice, gameAmount: BN, lightProvider: LightProvider, account: Account) {
    const slot = await lightProvider.connection.getSlot();
    const gameParameters: GameParameters = {
      choice,
      slot: new BN(slot),
      gameAmount,
      player2CommitmentHash: BN_ZERO,
      userPubkey: BN_ZERO,      
    };
    gameParameters.gameCommitmentHash = Game.generateGameCommitmentHash(lightProvider, gameParameters);   
    const programUtxo = new Utxo({
      poseidon: POSEIDON,
      assets: [SystemProgram.programId],
      account:STANDARD_ACCOUNT,
      amounts: [gameParameters.gameAmount],
      appData: { gameCommitmentHash: gameParameters.gameCommitmentHash, userPubkey: gameParameters.userPubkey },
      appDataIdl: IDL,
      verifierAddress: verifierProgramId,
      assetLookupTable: lightProvider.lookUpTables.assetLookupTable,
      verifierProgramLookupTable: lightProvider.lookUpTables.verifierProgramLookupTable
    });

    // TODO: add gameCommitmentHash seeds
    let seed = gameParameters.gameCommitmentHash.toArray("le", 32);
    console.log("start game, seed: ", seed);
    const pda = findProgramAddressSync(
        [
            // anchor.utils.bytes.utf8.encode("game_pda"),
            Buffer.from(seed)
        ],
        new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS")
    )[0];
    
    console.log("pda found: ", pda.toString());

    // TODO: create game onchain by creating a pda with the game commitment hash
    return new Game(gameParameters, programUtxo, pda);
  }

  static async join(gameCommitmentHash: BN, choice: Choice, gameAmount: BN, lightProvider: LightProvider, account: Account) {
    const slot = await lightProvider.connection.getSlot();
    const gameParameters: GameParameters = {
      choice,
      slot: new BN(slot),
      gameAmount,
      player2CommitmentHash: gameCommitmentHash,
      userPubkey: account.pubkey
    };
    gameParameters.gameCommitmentHash = Game.generateGameCommitmentHash(lightProvider, gameParameters);

    const programUtxo = new Utxo({
      poseidon: lightProvider.poseidon,
      assets: [SystemProgram.programId],
      account:STANDARD_ACCOUNT,
      amounts: [gameAmount],
      appData: { gameCommitmentHash: gameParameters.gameCommitmentHash, userPubkey: account.pubkey },
      appDataIdl: IDL,
      verifierAddress: verifierProgramId,
      assetLookupTable: lightProvider.lookUpTables.assetLookupTable,
      verifierProgramLookupTable: lightProvider.lookUpTables.verifierProgramLookupTable
    });

    let seed = gameCommitmentHash.toArray("le", 32);
    const pda = findProgramAddressSync([
        Buffer.from(seed)
    ], new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"))[0];
    return new Game(gameParameters, programUtxo, pda);
  }

  getWinner(opponentChoice: Choice): {winner: Winner, isWin: BN[], isDraw: BN, isLoss: BN}  {
    const { choice } = this.gameParameters;
    if (choice === opponentChoice) {
      return {winner: Winner.DRAW, isWin: [BN_ZERO, BN_ZERO, BN_ZERO], isDraw: BN_ONE, isLoss: BN_ZERO};
    }
    if (choice === Choice.ROCK && opponentChoice === Choice.SCISSORS) {
      return {winner: Winner.PLAYER1, isWin: [BN_ONE, BN_ZERO, BN_ZERO], isDraw: BN_ZERO, isLoss: BN_ZERO};
    }
    if (choice === Choice.PAPER && opponentChoice === Choice.ROCK) {
      return {winner: Winner.PLAYER1, isWin: [BN_ZERO, BN_ONE, BN_ZERO], isDraw: BN_ZERO, isLoss: BN_ZERO};
    }
    if (choice === Choice.SCISSORS && opponentChoice === Choice.PAPER) {
      return {winner: Winner.PLAYER1, isWin: [BN_ZERO, BN_ZERO, BN_ONE], isDraw: BN_ZERO, isLoss: BN_ZERO};
    }
    return{ winner: Winner.PLAYER2, isWin: [BN_ZERO, BN_ZERO, BN_ZERO], isDraw: BN_ZERO, isLoss: BN_ONE};
  }
}

class Player {
  user: User;
  game?: Game;
  pspInstance: anchor.Program<RockPaperScissors>;

  constructor(user: User) {
    this.user = user;
    this.pspInstance = new anchor.Program(IDL, new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"), user.provider.provider);
  }

  static async init(provider: anchor.AnchorProvider, relayer: TestRelayer| Relayer) {
      const wallet = Keypair.generate();
      await airdropSol({
        connection: provider.connection,
        lamports: 1e11,
        recipientPublicKey: wallet.publicKey,
      });

    // The light provider is a connection and wallet abstraction.
    // The wallet is used to derive the seed for your shielded keypair with a signature.
    let lightProvider = await LightProvider.init({ wallet, url: RPC_URL, relayer, confirmConfig });
    // lightProvider.addVerifierProgramPublickeyToLookUpTable(TransactionParameters.getVerifierProgramId(IDL));
    return new Player(await User.init({ provider: lightProvider }));
  }

  async closeGame() {
    if (!this.game) {
      throw new Error("No game in progress.");
    }
    let tx = await this.pspInstance.methods.closeGame().accounts({
      gamePda: this.game.pda,
      signer: this.user.provider.wallet.publicKey,
    }).instruction();
    
    await sendVersionedTransactions([tx], this.user.provider.connection, this.user.provider.lookUpTables.versionedTransactionLookupTable, this.user.provider.wallet);
  }
  async createGame(choice: Choice, gameAmount: BN, action: Action = Action.SHIELD) {
    if (this.game) {
      throw new Error("A game is already in progress.");
    }
    this.game = await Game.create(choice, gameAmount, this.user.provider, this.user.account);

    const txHash = await this.user.storeAppUtxo({
      appUtxo: this.game.programUtxo,
      action,
    });
    
    const borshCoder = new anchor.BorshAccountsCoder(IDL);
    const serializationObject = {
      ...this.game.programUtxo,
      ...this.game.programUtxo.appData,
      accountEncryptionPublicKey: this.game.programUtxo.account.encryptionKeypair.publicKey,
      accountShieldedPublicKey: this.game.programUtxo.account.pubkey,
    };
    const utxoBytes = (await borshCoder.encode("utxo", serializationObject)).subarray(8);
    
    let tx = await this.pspInstance.methods.createGame(utxoBytes).accounts({
      gamePda: this.game.pda,
      signer: this.user.provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    }).instruction();
    
    let txHash2 = await sendVersionedTransactions([tx], this.user.provider.connection, this.user.provider.lookUpTables.versionedTransactionLookupTable, this.user.provider.wallet);
       
    return {game: this.game, txHashStoreAppUtxo: txHash, txHashCreateGame: txHash2 };
  }

  async join(gameCommitmentHash: BN,choice: Choice, gameAmount: BN, action: Action = Action.SHIELD) {
    if (this.game) {
      throw new Error("A game is already in progress.");
    }
    this.game = await Game.join(gameCommitmentHash, choice, gameAmount, this.user.provider, this.user.account);
    const txHash = await this.user.storeAppUtxo({
      appUtxo: this.game.programUtxo,
      action,
    });
    const gamePdaAccountInfo = await this.pspInstance.account.gamePda.fetch(this.game.pda);
    // @ts-ignore anchor type is not represented correctly
    if(gamePdaAccountInfo.isJoinable === false) {
      throw new Error("Game is not joinable");
    }
    
    const borshCoder = new anchor.BorshAccountsCoder(IDL);
    const serializationObject = {
      ...this.game.programUtxo,
      ...this.game.programUtxo.appData,
      accountEncryptionPublicKey: this.game.programUtxo.account.encryptionKeypair.publicKey,
      accountShieldedPublicKey: this.game.programUtxo.account.pubkey,
    };
    const utxoBytes = (await borshCoder.encode("utxo", serializationObject)).subarray(8);

    const tx = await this.pspInstance.methods.joinGame(utxoBytes, this.game.gameParameters.choice, this.game.gameParameters.slot).accounts({
      gamePda: this.game.pda,
      signer: this.user.provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    }).instruction();
    let txHash2 = await sendVersionedTransactions([tx], this.user.provider.connection, this.user.provider.lookUpTables.versionedTransactionLookupTable, this.user.provider.wallet);
    
    return {game: this.game, txHashStoreAppUtxo: txHash, txHashCreateGame: txHash2 };
  }

  async execute(testProgramUtxo?: Utxo) {
    const gamePdaAccountInfo = await this.pspInstance.account.gamePda.fetch(this.game.pda);
    // @ts-ignore anchor type is not represented correctly
    if(gamePdaAccountInfo.isJoinable === true) {
      throw new Error("Game is joinable not executable");
    }
    // @ts-ignore anchor type is not represented correctly
    const gameParametersPlayer2 = {
      // @ts-ignore anchor type is not represented correctly
      gameCommitmentHash: gamePdaAccountInfo.game.playerTwoProgramUtxo.gameCommitmentHash,
      // @ts-ignore anchor type is not represented correctly
      choice: gamePdaAccountInfo.game.playerTwoChoice,
      // @ts-ignore anchor type is not represented correctly
      slot: gamePdaAccountInfo.game.slot,
      // @ts-ignore anchor type is not represented correctly
      userPubkey: gamePdaAccountInfo.game.playerTwoProgramUtxo.userPubkey,
    }
    const player2ProgramUtxo = new Utxo({
      poseidon: this.user.provider.poseidon,
      assets: [SystemProgram.programId],
      account: STANDARD_ACCOUNT,
          // @ts-ignore anchor type is not represented correctly
      amounts: [gamePdaAccountInfo.game.playerTwoProgramUtxo.amounts[0]],
      appData: { gameCommitmentHash: gameParametersPlayer2.gameCommitmentHash, userPubkey: gameParametersPlayer2.userPubkey },
      appDataIdl: IDL,
      verifierAddress: new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"),
      assetLookupTable: this.user.provider.lookUpTables.assetLookupTable,
      verifierProgramLookupTable: this.user.provider.lookUpTables.verifierProgramLookupTable,
      blinding: gamePdaAccountInfo.game.playerTwoProgramUtxo.blinding
    });
    Utxo.equal(this.user.provider.poseidon, player2ProgramUtxo, testProgramUtxo, false);
    const circuitPath = path.join("build-circuit");
    // @ts-ignore anchor type is not represented correctly
    const winner = this.game.getWinner(gamePdaAccountInfo.game.playerTwoChoice);
    // We use getBalance to sync the current merkle tree
    await this.user.getBalance();
    const merkleTree = this.user.provider.solMerkleTree.merkleTree;
    const utxoIndexPlayer1 = merkleTree.indexOf(this.game.programUtxo.getCommitment(this.user.provider.poseidon));
    this.game.programUtxo.index = utxoIndexPlayer1;

    const utxoIndexPlayer2 = merkleTree.indexOf(player2ProgramUtxo.getCommitment(this.user.provider.poseidon));
    player2ProgramUtxo.index = utxoIndexPlayer2;

    const programParameters: ProgramParameters = {
      inputs: {
        publicGameCommitment0: this.game.gameParameters.gameCommitmentHash, publicGameCommitment1: player2ProgramUtxo.appData.gameCommitmentHash,
        gameCommitmentHash: [this.game.gameParameters.gameCommitmentHash, gameParametersPlayer2.gameCommitmentHash],
        choice: [this.game.gameParameters.choice, gameParametersPlayer2.choice],
        slot: [this.game.gameParameters.slot, gameParametersPlayer2.slot],
        gameAmount: GAME_AMOUNT,
        userPubkey: [this.game.gameParameters.userPubkey,player2ProgramUtxo.appData.userPubkey],
        isPlayer2OutUtxo:[
          [BN_ZERO, BN_ONE, BN_ZERO, BN_ZERO],
        ],
        ...winner
      },
      verifierIdl: IDL,
      path: circuitPath,
      accounts: {
        gamePda: this.game.pda,
      }
    };
    const amounts = this.getAmounts(winner.winner);
    const player1OutUtxo = new Utxo({
      poseidon: this.user.provider.poseidon,
      assets: [SystemProgram.programId],
      account: this.user.account,
      amounts: [amounts[0]],
      assetLookupTable: this.user.provider.lookUpTables.assetLookupTable,
      verifierProgramLookupTable: this.user.provider.lookUpTables.verifierProgramLookupTable,
    });
    const player2OutUtxo = new Utxo({
      poseidon: this.user.provider.poseidon,
      assets: [SystemProgram.programId],
      account: {
        pubkey: gameParametersPlayer2.userPubkey,
        encryptionKeypair: {
          publicKey: new Uint8Array(gamePdaAccountInfo.game.playerTwoProgramUtxo.accountEncryptionPublicKey)}
        } as Account,
      amounts: [amounts[1]],
      assetLookupTable: this.user.provider.lookUpTables.assetLookupTable,
      verifierProgramLookupTable: this.user.provider.lookUpTables.verifierProgramLookupTable,
      blinding: gameParametersPlayer2.userPubkey.add(gameParametersPlayer2.userPubkey).mod(FIELD_SIZE)
    });  

    let payerUtxo = this.user.getAllUtxos( );

    let { txHash } = await this.user.executeAppUtxo({
      appUtxos: [this.game.programUtxo, player2ProgramUtxo],
      inUtxos: [payerUtxo[0]],
      outUtxos: [player1OutUtxo, player2OutUtxo],
      programParameters,
      action: Action.TRANSFER,
      addOutUtxos: true,
      shuffleEnabled: false
    });

    return {txHash, gameResult: winner.winner};
  }

  getAmounts(winner: Winner) {
    if (winner === Winner.PLAYER1) {
      return [this.game.gameParameters.gameAmount.mul(new BN(2)), BN_ZERO];
    } else if (winner === Winner.PLAYER2) {
      return [BN_ZERO, this.game.gameParameters.gameAmount.mul(new BN(2))];
    }
    return [this.game.gameParameters.gameAmount, this.game.gameParameters.gameAmount];
  }
}

describe("Test rock-paper-scissors", () => {
  process.env.ANCHOR_PROVIDER_URL = RPC_URL;
  process.env.ANCHOR_WALLET = process.env.HOME + "/.config/solana/id.json";

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local(RPC_URL, confirmConfig);
  anchor.setProvider(provider);

  before(async () => {
    POSEIDON = await buildPoseidonOpt();
    STANDARD_ACCOUNT= new Account({poseidon: POSEIDON, seed: STANDARD_SEED});
    const relayerWallet = Keypair.generate();
    await airdropSol({
      connection: provider.connection,
      lamports: 1e11,
      recipientPublicKey: relayerWallet.publicKey,
    });
    RELAYER = new TestRelayer({
      relayerPubkey: relayerWallet.publicKey,
      relayerRecipientSol:  relayerWallet.publicKey,
      relayerFee: new BN(100000),
      payer: relayerWallet
    });
  });


  it("Test Game Draw", async () => {
    const player1 = await Player.init(provider, RELAYER);
    // shield additional sol to pay for relayer fees
    await player1.user.shield({
      publicAmountSol:10,
      token: "SOL"
    });
    const player2 = await Player.init(provider, RELAYER);

    let res = await player1.createGame(Choice.ROCK, GAME_AMOUNT);
    console.log("Player 1 created game");
    await player2.join(res.game.gameParameters.gameCommitmentHash, Choice.ROCK, GAME_AMOUNT);
    console.log("Player 2 joined game");
    let gameRes = await player1.execute(player2.game.programUtxo);
    console.log("Game result: ", gameRes.gameResult);
    assert.equal(gameRes.gameResult, Winner.DRAW);
    await player1.closeGame();
  });

  it("Test Game Loss", async () => {
    const player1 = await Player.init(provider, RELAYER);
    // shield additional sol to pay for relayer fees
    await player1.user.shield({
      publicAmountSol:10,
      token: "SOL"
    });
    const player2 = await Player.init(provider, RELAYER);

    let res = await player1.createGame(Choice.SCISSORS, GAME_AMOUNT);
    console.log("Player 1 created game");
    await player2.join(res.game.gameParameters.gameCommitmentHash, Choice.ROCK, GAME_AMOUNT);
    console.log("Player 2 joined game");
    let gameRes = await player1.execute(player2.game.programUtxo);
    console.log("Game result: ", gameRes.gameResult);
    assert.equal(gameRes.gameResult, Winner.PLAYER2);
    await player1.closeGame();
  });

  it("Test Game Win", async () => {
    const player1 = await Player.init(provider, RELAYER);
    // shield additional sol to pay for relayer fees
    await player1.user.shield({
      publicAmountSol:10,
      token: "SOL"
    });
    const player2 = await Player.init(provider, RELAYER);

    let res = await player1.createGame(Choice.PAPER, GAME_AMOUNT);
    console.log("Player 1 created game");
    await player2.join(res.game.gameParameters.gameCommitmentHash, Choice.ROCK, GAME_AMOUNT);
    console.log("Player 2 joined game");
    let gameRes = await player1.execute(player2.game.programUtxo);
    console.log("Game result: ", gameRes.gameResult);
    assert.equal(gameRes.gameResult, Winner.PLAYER1);
    await player1.closeGame();    
  });
});
