export type Multisig = {
    "version": "0.1.0";
    "name": "multisig";
    "constants": [
        {
            "name": "NR_CHECKED_INPUTS";
            "type": {
                "defined": "usize";
            };
            "value": "2";
        },
        {
            "name": "PROGRAM_ID";
            "type": "string";
            "value": "\"Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS\"";
        },
        {
            "name": "VERIFYINGKEY_MULTISIG";
            "type": {
                "defined": "Groth16Verifyingkey";
            };
            "value": "Groth16Verifyingkey { nr_pubinputs : 2 , vk_alpha_g1 : [45 , 77 , 154 , 167 , 227 , 2 , 217 , 223 , 65 , 116 , 157 , 85 , 7 , 148 , 157 , 5 , 219 , 234 , 51 , 251 , 177 , 108 , 100 , 59 , 34 , 245 , 153 , 162 , 190 , 109 , 242 , 226 , 20 , 190 , 221 , 80 , 60 , 55 , 206 , 176 , 97 , 216 , 236 , 96 , 32 , 159 , 227 , 69 , 206 , 137 , 131 , 10 , 25 , 35 , 3 , 1 , 240 , 118 , 202 , 255 , 0 , 77 , 25 , 38] , vk_beta_g2 : [9 , 103 , 3 , 47 , 203 , 247 , 118 , 209 , 175 , 201 , 133 , 248 , 136 , 119 , 241 , 130 , 211 , 132 , 128 , 166 , 83 , 242 , 222 , 202 , 169 , 121 , 76 , 188 , 59 , 243 , 6 , 12 , 14 , 24 , 120 , 71 , 173 , 76 , 121 , 131 , 116 , 208 , 214 , 115 , 43 , 245 , 1 , 132 , 125 , 214 , 139 , 192 , 224 , 113 , 36 , 30 , 2 , 19 , 188 , 127 , 193 , 61 , 183 , 171 , 48 , 76 , 251 , 209 , 224 , 138 , 112 , 74 , 153 , 245 , 232 , 71 , 217 , 63 , 140 , 60 , 170 , 253 , 222 , 196 , 107 , 122 , 13 , 55 , 157 , 166 , 154 , 77 , 17 , 35 , 70 , 167 , 23 , 57 , 193 , 177 , 164 , 87 , 168 , 199 , 49 , 49 , 35 , 210 , 77 , 47 , 145 , 146 , 248 , 150 , 183 , 198 , 62 , 234 , 5 , 169 , 213 , 127 , 6 , 84 , 122 , 208 , 206 , 200] , vk_gamme_g2 : [25 , 142 , 147 , 147 , 146 , 13 , 72 , 58 , 114 , 96 , 191 , 183 , 49 , 251 , 93 , 37 , 241 , 170 , 73 , 51 , 53 , 169 , 231 , 18 , 151 , 228 , 133 , 183 , 174 , 243 , 18 , 194 , 24 , 0 , 222 , 239 , 18 , 31 , 30 , 118 , 66 , 106 , 0 , 102 , 94 , 92 , 68 , 121 , 103 , 67 , 34 , 212 , 247 , 94 , 218 , 221 , 70 , 222 , 189 , 92 , 217 , 146 , 246 , 237 , 9 , 6 , 137 , 208 , 88 , 95 , 240 , 117 , 236 , 158 , 153 , 173 , 105 , 12 , 51 , 149 , 188 , 75 , 49 , 51 , 112 , 179 , 142 , 243 , 85 , 172 , 218 , 220 , 209 , 34 , 151 , 91 , 18 , 200 , 94 , 165 , 219 , 140 , 109 , 235 , 74 , 171 , 113 , 128 , 141 , 203 , 64 , 143 , 227 , 209 , 231 , 105 , 12 , 67 , 211 , 123 , 76 , 230 , 204 , 1 , 102 , 250 , 125 , 170] , vk_delta_g2 : [37 , 11 , 11 , 154 , 240 , 184 , 185 , 90 , 251 , 215 , 52 , 95 , 46 , 87 , 220 , 123 , 57 , 88 , 127 , 237 , 228 , 123 , 243 , 0 , 102 , 2 , 25 , 165 , 11 , 42 , 171 , 120 , 32 , 49 , 142 , 64 , 251 , 220 , 167 , 81 , 102 , 72 , 31 , 60 , 3 , 50 , 45 , 4 , 123 , 42 , 30 , 115 , 52 , 40 , 80 , 35 , 114 , 30 , 219 , 142 , 52 , 203 , 116 , 175 , 7 , 67 , 18 , 161 , 208 , 127 , 43 , 82 , 195 , 46 , 249 , 235 , 50 , 210 , 240 , 173 , 134 , 31 , 6 , 167 , 111 , 74 , 20 , 87 , 211 , 108 , 120 , 11 , 87 , 209 , 6 , 205 , 33 , 36 , 244 , 61 , 103 , 199 , 207 , 216 , 104 , 239 , 130 , 30 , 60 , 21 , 26 , 123 , 201 , 113 , 155 , 122 , 150 , 103 , 14 , 89 , 111 , 43 , 92 , 69 , 226 , 226 , 115 , 44] , vk_ic : & [[45 , 173 , 94 , 3 , 31 , 248 , 26 , 51 , 146 , 122 , 250 , 203 , 94 , 210 , 117 , 111 , 209 , 47 , 66 , 28 , 201 , 197 , 204 , 18 , 222 , 49 , 87 , 109 , 149 , 178 , 150 , 105 , 21 , 14 , 199 , 114 , 188 , 80 , 65 , 168 , 10 , 236 , 77 , 101 , 91 , 68 , 21 , 55 , 196 , 153 , 29 , 79 , 240 , 151 , 143 , 230 , 134 , 107 , 230 , 144 , 54 , 160 , 54 , 238] , [14 , 151 , 85 , 177 , 236 , 15 , 226 , 134 , 180 , 70 , 9 , 196 , 119 , 84 , 67 , 3 , 20 , 30 , 76 , 176 , 114 , 215 , 251 , 125 , 29 , 128 , 166 , 64 , 64 , 162 , 106 , 62 , 1 , 146 , 189 , 185 , 101 , 51 , 250 , 112 , 27 , 81 , 237 , 48 , 154 , 101 , 204 , 107 , 154 , 54 , 18 , 120 , 85 , 111 , 173 , 180 , 108 , 122 , 23 , 141 , 16 , 156 , 24 , 184] , [8 , 158 , 233 , 76 , 128 , 27 , 207 , 146 , 119 , 128 , 213 , 40 , 130 , 245 , 100 , 25 , 203 , 85 , 117 , 212 , 33 , 183 , 0 , 155 , 231 , 17 , 229 , 95 , 209 , 188 , 144 , 105 , 23 , 144 , 112 , 33 , 217 , 195 , 219 , 69 , 162 , 173 , 206 , 215 , 125 , 62 , 185 , 202 , 220 , 202 , 250 , 232 , 142 , 28 , 1 , 89 , 162 , 91 , 243 , 213 , 241 , 159 , 161 , 182]] , }";
        }
    ];
    "instructions": [
        {
            "name": "lightInstructionFirst";
            "docs": [
                "This instruction is the first step of a shieled transaction.",
                "It creates and initializes a verifier state account to save state of a verification during",
                "computation verifying the zero-knowledge proof (ZKP). Additionally, it stores other data",
                "such as leaves, amounts, recipients, nullifiers, etc. to execute the protocol logic",
                "in the last transaction after successful ZKP verification. light_verifier_sdk::light_instruction::LightInstruction2"
            ];
            "accounts": [
                {
                    "name": "signingAddress";
                    "isMut": true;
                    "isSigner": true;
                    "docs": [
                        "First transaction, therefore the signing address is not checked but saved to be checked in future instructions."
                    ];
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "verifierState";
                    "isMut": true;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "inputs";
                    "type": "bytes";
                }
            ];
        },
        {
            "name": "lightInstructionSecond";
            "accounts": [
                {
                    "name": "signingAddress";
                    "isMut": true;
                    "isSigner": true;
                    "docs": [
                        "First transaction, therefore the signing address is not checked but saved to be checked in future instructions."
                    ];
                },
                {
                    "name": "verifierState";
                    "isMut": true;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "inputs";
                    "type": "bytes";
                }
            ];
        },
        {
            "name": "lightInstructionThird";
            "docs": [
                "This instruction is the third step of a shielded transaction.",
                "The proof is verified with the parameters saved in the first transaction.",
                "At successful verification protocol logic is executed."
            ];
            "accounts": [
                {
                    "name": "signingAddress";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "verifierState";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "programMerkleTree";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "transactionMerkleTree";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "authority";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "senderSpl";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "recipientSpl";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "senderSol";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "recipientSol";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "relayerRecipientSol";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenAuthority";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "registeredVerifierPda";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "verifierProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "logWrapper";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventMerkleTree";
                    "isMut": true;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "inputs";
                    "type": "bytes";
                }
            ];
        },
        {
            "name": "closeVerifierState";
            "docs": [
                "Close the verifier state to reclaim rent in case the proofdata is wrong and does not verify."
            ];
            "accounts": [
                {
                    "name": "signingAddress";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "verifierState";
                    "isMut": true;
                    "isSigner": false;
                }
            ];
            "args": [];
        }
    ];
    "accounts": [
        {
            "name": "u256";
            "docs": [
                "* This file is auto-generated by the Light cli.\n * DO NOT EDIT MANUALLY.\n * THE FILE WILL BE OVERWRITTEN EVERY TIME THE LIGHT CLI BUILD IS RUN."
            ];
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "x";
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "instructionDataLightInstructionSecond";
            "type": {
                "kind": "struct";
                "fields": [];
            };
        },
        {
            "name": "utxo";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "amounts";
                        "type": {
                            "array": [
                                "u64",
                                2
                            ];
                        };
                    },
                    {
                        "name": "splAssetIndex";
                        "type": "u64";
                    },
                    {
                        "name": "verifierAddressIndex";
                        "type": "u64";
                    },
                    {
                        "name": "blinding";
                        "type": "u256";
                    },
                    {
                        "name": "appDataHash";
                        "type": "u256";
                    },
                    {
                        "name": "accountShieldedPublicKey";
                        "type": "u256";
                    },
                    {
                        "name": "accountEncryptionPublicKey";
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    },
                    {
                        "name": "threshold";
                        "type": "u256";
                    },
                    {
                        "name": "nrSigners";
                        "type": "u256";
                    },
                    {
                        "name": "publicKeyX";
                        "type": {
                            "array": [
                                "u256",
                                7
                            ];
                        };
                    },
                    {
                        "name": "publicKeyY";
                        "type": {
                            "array": [
                                "u256",
                                7
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "utxoAppData";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "threshold";
                        "type": "u256";
                    },
                    {
                        "name": "nrSigners";
                        "type": "u256";
                    },
                    {
                        "name": "publicKeyX";
                        "type": {
                            "array": [
                                "u256",
                                7
                            ];
                        };
                    },
                    {
                        "name": "publicKeyY";
                        "type": {
                            "array": [
                                "u256",
                                7
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "instructionDataLightInstructionFirst";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "publicAmountSpl";
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    },
                    {
                        "name": "inputNullifier";
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        "u8",
                                        32
                                    ];
                                },
                                4
                            ];
                        };
                    },
                    {
                        "name": "outputCommitment";
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        "u8",
                                        32
                                    ];
                                },
                                4
                            ];
                        };
                    },
                    {
                        "name": "publicAmountSol";
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    },
                    {
                        "name": "transactionHash";
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    },
                    {
                        "name": "rootIndex";
                        "type": "u64";
                    },
                    {
                        "name": "relayerFee";
                        "type": "u64";
                    },
                    {
                        "name": "encryptedUtxos";
                        "type": "bytes";
                    }
                ];
            };
        },
        {
            "name": "instructionDataLightInstructionThird";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "proofAApp";
                        "type": {
                            "array": [
                                "u8",
                                64
                            ];
                        };
                    },
                    {
                        "name": "proofBApp";
                        "type": {
                            "array": [
                                "u8",
                                128
                            ];
                        };
                    },
                    {
                        "name": "proofCApp";
                        "type": {
                            "array": [
                                "u8",
                                64
                            ];
                        };
                    },
                    {
                        "name": "proofA";
                        "type": {
                            "array": [
                                "u8",
                                64
                            ];
                        };
                    },
                    {
                        "name": "proofB";
                        "type": {
                            "array": [
                                "u8",
                                128
                            ];
                        };
                    },
                    {
                        "name": "proofC";
                        "type": {
                            "array": [
                                "u8",
                                64
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "createMultiSig";
            "docs": [
                "encrypted multisig parameters",
                "space = 8 (discriminator) + 7 * 32 + 32 + 458 = 722",
                "nonces are Sha3(base_nonce||counter), aes256 iv: counter = 8"
            ];
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "seed";
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    },
                    {
                        "name": "publicKeyX";
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        "u8",
                                        32
                                    ];
                                },
                                7
                            ];
                        };
                    },
                    {
                        "name": "publicKeyY";
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        "u8",
                                        32
                                    ];
                                },
                                7
                            ];
                        };
                    },
                    {
                        "name": "threshold";
                        "type": "u8";
                    },
                    {
                        "name": "nrSigners";
                        "type": "u8";
                    },
                    {
                        "name": "signersEncryptionPublicKeys";
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        "u8",
                                        32
                                    ];
                                },
                                7
                            ];
                        };
                    },
                    {
                        "name": "priorMultiSigSlot";
                        "type": "u64";
                    },
                    {
                        "name": "priorMultiSigHash";
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    },
                    {
                        "name": "priorMultiSigSeed";
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "approveTransaction";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "signerIndex";
                        "type": "u8";
                    },
                    {
                        "name": "signature";
                        "type": {
                            "array": [
                                "u8",
                                64
                            ];
                        };
                    },
                    {
                        "name": "publicKey";
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        {
                                            "array": [
                                                "u8",
                                                32
                                            ];
                                        },
                                        7
                                    ];
                                },
                                2
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "zKmultisigProofInputs";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "publicAppVerifier";
                        "type": "u8";
                    },
                    {
                        "name": "transactionHash";
                        "type": "u8";
                    },
                    {
                        "name": "isAppInUtxo";
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        "u8",
                                        4
                                    ];
                                },
                                1
                            ];
                        };
                    },
                    {
                        "name": "txIntegrityHash";
                        "type": "u8";
                    },
                    {
                        "name": "inAmount";
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        "u8",
                                        2
                                    ];
                                },
                                4
                            ];
                        };
                    },
                    {
                        "name": "inPublicKey";
                        "type": {
                            "array": [
                                "u8",
                                4
                            ];
                        };
                    },
                    {
                        "name": "inBlinding";
                        "type": {
                            "array": [
                                "u8",
                                4
                            ];
                        };
                    },
                    {
                        "name": "inAppDataHash";
                        "type": {
                            "array": [
                                "u8",
                                4
                            ];
                        };
                    },
                    {
                        "name": "inPoolType";
                        "type": {
                            "array": [
                                "u8",
                                4
                            ];
                        };
                    },
                    {
                        "name": "inVerifierPubkey";
                        "type": {
                            "array": [
                                "u8",
                                4
                            ];
                        };
                    },
                    {
                        "name": "inIndices";
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        {
                                            "array": [
                                                "u8",
                                                3
                                            ];
                                        },
                                        2
                                    ];
                                },
                                4
                            ];
                        };
                    },
                    {
                        "name": "outputCommitment";
                        "type": {
                            "array": [
                                "u8",
                                4
                            ];
                        };
                    },
                    {
                        "name": "outAmount";
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        "u8",
                                        2
                                    ];
                                },
                                4
                            ];
                        };
                    },
                    {
                        "name": "outPubkey";
                        "type": {
                            "array": [
                                "u8",
                                4
                            ];
                        };
                    },
                    {
                        "name": "outBlinding";
                        "type": {
                            "array": [
                                "u8",
                                4
                            ];
                        };
                    },
                    {
                        "name": "outAppDataHash";
                        "type": {
                            "array": [
                                "u8",
                                4
                            ];
                        };
                    },
                    {
                        "name": "outIndices";
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        {
                                            "array": [
                                                "u8",
                                                3
                                            ];
                                        },
                                        2
                                    ];
                                },
                                4
                            ];
                        };
                    },
                    {
                        "name": "outPoolType";
                        "type": {
                            "array": [
                                "u8",
                                4
                            ];
                        };
                    },
                    {
                        "name": "outVerifierPubkey";
                        "type": {
                            "array": [
                                "u8",
                                4
                            ];
                        };
                    },
                    {
                        "name": "assetPubkeys";
                        "type": {
                            "array": [
                                "u8",
                                3
                            ];
                        };
                    },
                    {
                        "name": "transactionVersion";
                        "type": "u8";
                    },
                    {
                        "name": "threshold";
                        "type": "u8";
                    },
                    {
                        "name": "nrSigners";
                        "type": "u8";
                    },
                    {
                        "name": "signerPubkeysX";
                        "type": {
                            "array": [
                                "u8",
                                7
                            ];
                        };
                    },
                    {
                        "name": "signerPubkeysY";
                        "type": {
                            "array": [
                                "u8",
                                7
                            ];
                        };
                    },
                    {
                        "name": "enabled";
                        "type": {
                            "array": [
                                "u8",
                                7
                            ];
                        };
                    },
                    {
                        "name": "signatures";
                        "type": {
                            "array": [
                                "u8",
                                7
                            ];
                        };
                    },
                    {
                        "name": "r8x";
                        "type": {
                            "array": [
                                "u8",
                                7
                            ];
                        };
                    },
                    {
                        "name": "r8y";
                        "type": {
                            "array": [
                                "u8",
                                7
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "zKmultisigPublicInputs";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "publicAppVerifier";
                        "type": "u8";
                    },
                    {
                        "name": "transactionHash";
                        "type": "u8";
                    }
                ];
            };
        },
        {
            "name": "instructionDataLightInstructionMultisigSecond";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "publicAppVerifier";
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    },
                    {
                        "name": "transactionHash";
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    }
                ];
            };
        }
    ];
};
export declare const IDL: Multisig;
