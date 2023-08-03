# Private Streaming Payments Example Code

This README.md file explains the high-level perspective of the provided private streaming payments example code. 
The code demonstrates a private streaming payment system on the Solana blockchain using Light protocol.

## Prerequisites

Before running the code, ensure that you have the following installed on your machine:
– node.js, yarn
- circom
- rust
- cargo-expand (```cargo install cargo-expand```)
- solana-cli >=1.16.4

## Overview

The provided code demonstrates the setup and usage of a private streaming payments system on the Solana blockchain. 
The code uses Light protocol to achieve its functionality. 

1. **Light Circuit**: The custom Light circuit `./circuit/pspPaymentStreaming.light` is used for verification purposes in the private streaming payment system. 

2. **Test Setup**: The code performs an airdrop of Solana tokens to specific program addresses required for verification purposes.

3. **Create and Spend Program UTXO Test**: This test case demonstrates the process of creating and spending a program UTXO, which will be used for streaming payments. It initializes a light user and generates a shielded UTXO representing the payment. The shielded UTXO is then compiled and proved to be valid using zk-SNARKs. Finally, the UTXO is spent, and its status is verified.

4. **Payment Streaming Test**: This test case demonstrates the payment streaming functionality. It sets up a payment stream client, initializes the stream, and calculates the required parameters for streaming. The client then stores the initial UTXO, synchronizes the storage, and checks the commitment of the UTXO. After that, it collects the stream for the current slot and executes the UTXO action, effectively streaming the payment.

## How to Run the Code

1. Install the required dependencies using npm:

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

The tests will run and output the results, demonstrating the functionality of the private streaming payments system.

Please note that this code is a test suite and may require additional configuration or modifications to work with a specific Solana network or production environment. 
It is recommended to use the provided code as a reference and adapt it to suit your specific use case or requirements.

## Common errors

- __error: package `solana-program v1.16.5` cannot be built because it requires rustc 1.68.0 or newer, while the currently active rustc version is 1.65.0-dev__

  Please install [solana-cli 1.16.4](https://docs.solana.com/cli/install-solana-cli-tools) or newer.


- __error: no such command: `expand`__

  Please install cargo-expand: `cargo install cargo-expand`.
