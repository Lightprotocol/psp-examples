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
  Provider,
  FIELD_SIZE,
  Relayer,
  Account
} from "@lightprotocol/zk.js";
import {
  SystemProgram,
  PublicKey,
  Keypair,
} from "@solana/web3.js";

import { buildPoseidonOpt } from "circomlibjs";
import { BN } from "@coral-xyz/anchor";
import { IDL } from "../target/types/rock_paper_scissors";
import { program } from "@coral-xyz/anchor/dist/cjs/native/system";
const path = require("path");

const verifierProgramId = new PublicKey(
  "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
);
var POSEIDON: any, RELAYER: TestRelayer;

const RPC_URL = "http://127.0.0.1:8899";

const GAME_AMOUNT = new BN(1_000_000_000);
const BN_ONE = new BN(1);
const BN_ZERO = new BN(0);

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
}



class Game {
  gameParameters: GameParameters;
  programUtxo: Utxo;
  constructor(gameParameters: GameParameters, programUtxo: Utxo) {
    this.gameParameters = gameParameters;
    this.programUtxo = programUtxo;
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
      player2CommitmentHash: BN_ZERO
    };
    gameParameters.gameCommitmentHash = Game.generateGameCommitmentHash(lightProvider, gameParameters);
    const programUtxo = new Utxo({
      poseidon: POSEIDON,
      assets: [SystemProgram.programId],
      account,
      amounts: [gameParameters.gameAmount],
      appData: { gameCommitmentHash: gameParameters.gameCommitmentHash },
      appDataIdl: IDL,
      verifierAddress: verifierProgramId,
      assetLookupTable: lightProvider.lookUpTables.assetLookupTable,
      verifierProgramLookupTable: lightProvider.lookUpTables.verifierProgramLookupTable
    });
    // TODO: create game onchain by creating a pda with the game commitment hash
    return new Game(gameParameters, programUtxo);
  }

  static async join(gameCommitmentHash: BN, choice: Choice, gameAmount: BN, lightProvider: LightProvider, account: Account) {
    // TODO: fetch pda from chain with getAllProgramAccounts
    // sort program accounts by joinable
    // join game
    // if none available, create game
    
    const slot = await lightProvider.connection.getSlot();
    const gameParameters: GameParameters = {
      choice,
      slot: new BN(slot),
      gameAmount,
      player2CommitmentHash: gameCommitmentHash
    };
    gameParameters.gameCommitmentHash = Game.generateGameCommitmentHash(lightProvider, gameParameters);

    const programUtxo = new Utxo({
      poseidon: lightProvider.poseidon,
      assets: [SystemProgram.programId],
      account,
      amounts: [gameAmount],
      appData: { gameCommitmentHash: gameParameters.gameCommitmentHash },
      appDataIdl: IDL,
      verifierAddress: verifierProgramId,
      assetLookupTable: lightProvider.lookUpTables.assetLookupTable,
      verifierProgramLookupTable: lightProvider.lookUpTables.verifierProgramLookupTable
    });
    return new Game(gameParameters, programUtxo);
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
  constructor(user: User) {
    this.user = user;
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
    lightProvider.addVerifierProgramPublickeyToLookUpTable(TransactionParameters.getVerifierProgramId(IDL));
    return new Player(await User.init({ provider: lightProvider }));
  }

  async createGame(choice: Choice, gameAmount: BN, action: Action = Action.SHIELD) {
    if (this.game) {
      throw new Error("A game is already in progress.");
    }
    this.game = await Game.create(choice, gameAmount, this.user.provider, this.user.account);
    // TODO: merge with create pda for commitment hash
    const txHash = await this.user.storeAppUtxo({
      appUtxo: this.game.programUtxo,
      action,
    });
    return {game: this.game, txHash };
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
    return {game: this.game, txHash };
  }

  async execute(gameParametersPlayer2:GameParameters, player2PublicKey: string, player2ProgramUtxo:Utxo) {
    const player2Account = Account.fromPubkey(player2PublicKey, this.user.provider.poseidon);
    // TODO: check game is ready to execute

    const circuitPath = path.join("build-circuit");

    const winner = this.game.getWinner(gameParametersPlayer2.choice);
    // We use getBalance to sync the current merkle tree
    await this.user.getBalance();
    const merkleTree = this.user.provider.solMerkleTree.merkleTree;
    const utxoIndexPlayer1 = merkleTree.indexOf(this.game.programUtxo.getCommitment(this.user.provider.poseidon));
    this.game.programUtxo.index = utxoIndexPlayer1;

    const utxoIndexPlayer2 = merkleTree.indexOf(player2ProgramUtxo.getCommitment(this.user.provider.poseidon));
    player2ProgramUtxo.index = utxoIndexPlayer2;

    const programParameters: ProgramParameters = {
      inputs: {
        publicGameCommitment0: this.game.gameParameters.gameCommitmentHash, publicGameCommitment1: gameParametersPlayer2.gameCommitmentHash,
        gameCommitmentHash: [this.game.gameParameters.gameCommitmentHash, gameParametersPlayer2.gameCommitmentHash],
        choice: [this.game.gameParameters.choice, gameParametersPlayer2.choice],
        slot: [this.game.gameParameters.slot, gameParametersPlayer2.slot],
        gameAmount: GAME_AMOUNT,
        opponentPubkey: player2Account.pubkey,
        isPlayer2OutUtxo:[
          [BN_ZERO, BN_ONE, BN_ZERO, BN_ZERO],
        ],
        ...winner
      },
      verifierIdl: IDL,
      path: circuitPath
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
      account: player2Account,
      amounts: [amounts[1]],
      assetLookupTable: this.user.provider.lookUpTables.assetLookupTable,
      verifierProgramLookupTable: this.user.provider.lookUpTables.verifierProgramLookupTable,
      blinding: player2Account.pubkey.add(player2Account.pubkey).mod(FIELD_SIZE)
    });  
    // TODO: find a better way to pay for relayer fees
    let payerUtxo = this.user.getAllUtxos( );    

    let { txHash } = await this.user.executeAppUtxo({
      appUtxos: [this.game.programUtxo, player2ProgramUtxo],
      inUtxos: [payerUtxo[0]],
      outUtxos: [player1OutUtxo, player2OutUtxo],
      programParameters,
      action: Action.TRANSFER,
      addOutUtxos: true
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
    console.log("Created game by player 1:", res.txHash," choice: ", res.game.gameParameters.choice);
    let resJoin = await player2.join(res.game.gameParameters.gameCommitmentHash, Choice.ROCK, GAME_AMOUNT);
    console.log("Joined game with player 2:", resJoin.txHash," choice: ", resJoin.game.gameParameters.choice);

    let gameRes = await player1.execute(resJoin.game.gameParameters, player2.user.account.getPublicKey(), resJoin.game.programUtxo);
    console.log("Game result: ", gameRes.gameResult);
    assert.equal(gameRes.gameResult, Winner.DRAW);
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
    console.log("Created game by player 1:", res.txHash," choice: ", res.game.gameParameters.choice);
    let resJoin = await player2.join(res.game.gameParameters.gameCommitmentHash, Choice.ROCK, GAME_AMOUNT);
    console.log("Joined game with player 2:", resJoin.txHash," choice: ", resJoin.game.gameParameters.choice);

    let gameRes = await player1.execute(resJoin.game.gameParameters, player2.user.account.getPublicKey(), resJoin.game.programUtxo);
    console.log("Game result: ", gameRes.gameResult);
    assert.equal(gameRes.gameResult, Winner.PLAYER2);
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
    console.log("Created game by player 1:", res.txHash," choice: ", res.game.gameParameters.choice);
    let resJoin = await player2.join(res.game.gameParameters.gameCommitmentHash, Choice.ROCK, GAME_AMOUNT);
    console.log("Joined game with player 2:", resJoin.txHash," choice: ", resJoin.game.gameParameters.choice);

    let gameRes = await player1.execute(resJoin.game.gameParameters, player2.user.account.getPublicKey(), resJoin.game.programUtxo);
    console.log("Game result: ", gameRes.gameResult);
    assert.equal(gameRes.gameResult, Winner.PLAYER1);
  });
});
