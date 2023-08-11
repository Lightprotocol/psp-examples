# Rock-Paper-Scissors Game

This is a TypeScript implementation of the classic game Rock-Paper-Scissors. The game is built on the Solana blockchain using the Anchor framework. It uses Light Protocol for privacy-preserving transactions.


## Game Logic

The game logic is encapsulated in the Game and Player classes.

- Game class: This class represents a single game of Rock-Paper-Scissors. It includes methods for creating a game, joining a game, and determining the winner of a game.

- Player class: This class represents a player in the game. It includes methods for initializing a player, creating a game, joining a game, executing a game, and closing a game PDA.

## Game Flow

1. Player 1 creates a game by choosing Rock, Paper, or Scissors and the amount of Solana tokens to bet.

2. Player 2 joins the game by providing the game commitment hash, their choice (Rock, Paper, or Scissors), and the same amount of Solana tokens.

3. The game is executed, and the winner is determined based on the classic Rock-Paper-Scissors rules.

4. The game is closed, and the winner receives the total bet amount.

## Test Cases

The code includes test cases for the three possible outcomes of a game: Player 1 wins, Player 2 wins, or a draw.

## Prerequisites

Before running the code, ensure that you have the following installed on your machine:
– node.js, yarn
- circom
- rust
- cargo-expand (```cargo install cargo-expand```)
- solana-cli >= 1.16.4

## Setup

1. Install the required dependencies using npm or yarn:
```bash
yarn install
```

2. Build circuits:
```
yarn build
```

3. Execute the test suite using the following command:
```bash
yarn test
```

## Contributing

Contributions are welcome. Please open an issue or submit a pull request on GitHub.