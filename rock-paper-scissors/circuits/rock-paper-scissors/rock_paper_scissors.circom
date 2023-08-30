/**
* This file is auto-generated by the Light cli.
* DO NOT EDIT MANUALLY.
* THE FILE WILL BE OVERWRITTEN EVERY TIME THE LIGHT CLI BUILD IS RUN.
*/
pragma circom 2.1.4;
include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/@lightprotocol/zk.js/circuit-lib/merkleProof.circom";
include "../../node_modules/@lightprotocol/zk.js/circuit-lib/keypair.circom";
include "../../node_modules/circomlib/circuits/gates.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";


template rock_paper_scissors( nAppUtxos, levels, nIns, nOuts, feeAsset, indexFeeAsset, indexPublicAsset, nAssets, nInAssets, nOutAssets) {


    assert( nIns * nAssets < 49);
    assert( nInAssets <= nAssets);
    assert( nOutAssets <= nAssets);

    signal input isAppInUtxo[nAppUtxos][nIns];
    signal input txIntegrityHash;
    signal input  inAmount[nIns][nInAssets];
    signal input  inPublicKey[nIns];
    signal input  inBlinding[nIns];
    signal input  inAppDataHash[nIns];
    signal  input inPoolType[nIns];
    signal  input inVerifierPubkey[nIns];
    signal  input inIndices[nIns][nInAssets][nAssets];

    // data for transaction outputsAccount
    signal  input outputCommitment[nOuts];
    signal  input outAmount[nOuts][nOutAssets];
    signal  input outPubkey[nOuts];
    signal  input outBlinding[nOuts];
    signal  input outAppDataHash[nOuts];
    signal  input outIndices[nOuts][nOutAssets][nAssets];
    signal  input outPoolType[nOuts];
    signal  input outVerifierPubkey[nOuts];

    signal  input assetPubkeys[nAssets];
    signal input transactionVersion;

    component inGetAsset[nIns][nInAssets][nAssets];

    component inCommitmentHasher[nIns];
    component inAmountsHasher[nIns];
    component inAssetsHasher[nIns];

    component sumIn[nIns][nInAssets][nAssets];
    component inAmountCheck[nIns][nInAssets];


    // enforce pooltypes of 0
    // add public input to distinguish between pool types
    inPoolType[0] === 0;
    inPoolType[0] === outPoolType[0];

    var sumIns[nAssets];
    for (var i = 0; i < nAssets; i++) {
    sumIns[i] = 0;
    }

    var assetsIns[nIns][nInAssets];
    for (var i = 0; i < nIns; i++) {
        for (var j = 0; j < nInAssets; j++) {
        assetsIns[i][j] = 0;
        }
    }

    // verify correctness of transaction s
    for (var tx = 0; tx < nIns; tx++) {

        // determine the asset type
        // and checks that the asset is included in assetPubkeys[nInAssets]
        // skips first asset since that is the feeAsset
        // iterates over remaining assets and adds the assetPubkey if index is 1
        // all other indices are zero
        inAssetsHasher[tx] = Poseidon(nInAssets);
        for (var a = 0; a < nInAssets; a++) {

            for (var i = 0; i < nAssets; i++) {
                inGetAsset[tx][a][i] = AND();
                inGetAsset[tx][a][i].a <== assetPubkeys[i];
                inGetAsset[tx][a][i].b <== inIndices[tx][a][i];
                assetsIns[tx][a] += inGetAsset[tx][a][i].out;
            }
            inAssetsHasher[tx].inputs[a] <== assetsIns[tx][a];
        }

        inAmountsHasher[tx] = Poseidon(nInAssets);
        var sumInAmount = 0;
        for (var a = 0; a < nInAssets; a++) {
            inAmountCheck[tx][a] = Num2Bits(64);
            inAmountCheck[tx][a].in <== inAmount[tx][a];
            inAmountsHasher[tx].inputs[a] <== inAmount[tx][a];
            sumInAmount += inAmount[tx][a];
        }

        inCommitmentHasher[tx] = Poseidon(8);
        inCommitmentHasher[tx].inputs[0] <== transactionVersion; // transaction version
        inCommitmentHasher[tx].inputs[1] <== inAmountsHasher[tx].out;
        inCommitmentHasher[tx].inputs[2] <== inPublicKey[tx];
        inCommitmentHasher[tx].inputs[3] <== inBlinding[tx];
        inCommitmentHasher[tx].inputs[4] <== inAssetsHasher[tx].out;
        inCommitmentHasher[tx].inputs[5] <== inAppDataHash[tx];
        inCommitmentHasher[tx].inputs[6] <== inPoolType[tx];
        inCommitmentHasher[tx].inputs[7] <== inVerifierPubkey[tx];




        // for (var i = 0; i < nInAssets; i++) {
        //     for (var j = 0; j < nAssets; j++) {
        //         sumIn[tx][i][j] = AND();
        //         sumIn[tx][i][j].a <== inAmount[tx][i];
        //         sumIn[tx][i][j].b <== inIndices[tx][i][j];
        //         sumIns[j] += sumIn[tx][i][j].out;
        //     }
        // }
    }

    component outGetAsset[nOuts][nOutAssets][nAssets];
    component outCommitmentHasher[nOuts];
    component outAmountCheck[nOuts][nOutAssets];
    component sumOut[nOuts][nOutAssets][nAssets];
    component outAmountsHasher[nOuts];
    component outAssetsHasher[nOuts];

    var sumOuts[nAssets];
    for (var i = 0; i < nAssets; i++) {
    sumOuts[i] = 0;
    }

    var assetsOuts[nOuts][nOutAssets];
    for (var i = 0; i < nOuts; i++) {
        for (var j = 0; j < nOutAssets; j++) {
        assetsOuts[i][j] = 0;
        }
    }

    // verify correctness of transaction outputs
    for (var tx = 0; tx < nOuts; tx++) {

        // for every asset for every tx only one index is 1 others are 0
        // select the asset corresponding to the index
        // and add it to the assetHasher
        outAssetsHasher[tx] = Poseidon(nOutAssets);

        for (var a = 0; a < nOutAssets; a++) {
            var asset = 0;
            for (var i = 0; i < nAssets; i++) {
                outGetAsset[tx][a][i] = AND();
                outGetAsset[tx][a][i].a <== assetPubkeys[i];
                outGetAsset[tx][a][i].b <== outIndices[tx][a][i];
                asset += outGetAsset[tx][a][i].out;
            }
            assetsOuts[tx][a] = asset;
            outAssetsHasher[tx].inputs[a] <== asset;
        }

        for (var i = 0; i < nOutAssets; i++) {
            // Check that amount fits into 64 bits to prevent overflow
            outAmountCheck[tx][i] = Num2Bits(64);
            outAmountCheck[tx][i].in <== outAmount[tx][i];
        }

        outAmountsHasher[tx] = Poseidon(nOutAssets);
        for (var i = 0; i < nOutAssets; i++) {
            outAmountsHasher[tx].inputs[i] <== outAmount[tx][i];
        }

        outCommitmentHasher[tx] = Poseidon(8);
        outCommitmentHasher[tx].inputs[0] <== transactionVersion; // transaction version
        outCommitmentHasher[tx].inputs[1] <== outAmountsHasher[tx].out;
        outCommitmentHasher[tx].inputs[2] <== outPubkey[tx];
        outCommitmentHasher[tx].inputs[3] <== outBlinding[tx];
        outCommitmentHasher[tx].inputs[4] <== outAssetsHasher[tx].out;
        outCommitmentHasher[tx].inputs[5] <== outAppDataHash[tx];
        outCommitmentHasher[tx].inputs[6] <== outPoolType[tx];
        outCommitmentHasher[tx].inputs[7] <== outVerifierPubkey[tx];
        outCommitmentHasher[tx].out === outputCommitment[tx];

        // ensure that all pool types are the same
        outPoolType[0] === outPoolType[tx];
    }

    // public inputs
    signal input publicAppVerifier;
    signal  input transactionHash;

    // generating input hash
    // hash commitment 
    component inputHasher = Poseidon(nIns);
    for (var i = 0; i < nIns; i++) {
        inputHasher.inputs[i] <== inCommitmentHasher[i].out;
    }

    component outputHasher = Poseidon(nOuts);
    for (var i = 0; i < nOuts; i++) {
        outputHasher.inputs[i] <== outCommitmentHasher[i].out;
    }

    component transactionHasher = Poseidon(3);

    transactionHasher.inputs[0] <== inputHasher.out;
    transactionHasher.inputs[1] <== outputHasher.out;
    transactionHasher.inputs[2] <== txIntegrityHash;


    transactionHash === transactionHasher.out;

signal input gameCommitmentHash[nAppUtxos];
signal input userPubkey[nAppUtxos];
component instructionHasher[nAppUtxos];

            component checkInstructionHash[nAppUtxos][nIns];
for (var appUtxoIndex = 0; appUtxoIndex < nAppUtxos; appUtxoIndex++) {
            	instructionHasher[appUtxoIndex] = Poseidon(2);
instructionHasher[appUtxoIndex].inputs[0] <== gameCommitmentHash[appUtxoIndex];
instructionHasher[appUtxoIndex].inputs[1] <== userPubkey[appUtxoIndex];
for (var inUtxoIndex = 0; inUtxoIndex < nIns; inUtxoIndex++) {
        checkInstructionHash[appUtxoIndex][inUtxoIndex] = ForceEqualIfEnabled();
        checkInstructionHash[appUtxoIndex][inUtxoIndex].in[0] <== inAppDataHash[inUtxoIndex];
        checkInstructionHash[appUtxoIndex][inUtxoIndex].in[1] <== instructionHasher[appUtxoIndex].out;
        checkInstructionHash[appUtxoIndex][inUtxoIndex].enabled <== isAppInUtxo[appUtxoIndex][inUtxoIndex];
   }

    }


signal input isDraw;
signal input isWin[3]; // player 1 executes the transaction
signal input isLoss;
signal input choice[2];
signal input slot[2];
signal input gameAmount;
signal input publicGameCommitment0;
signal input publicGameCommitment1;

signal input isPlayer2OutUtxo[nOuts];

var isWinTmp = 0;
for (var i = 0; i < 3; i++) {
(isWin[i] - 1) * isWin[i] === 0;
isWinTmp = isWinTmp + isWin[i];
}

component checkWin = ForceEqualIfEnabled();
checkWin.in[0] <== isWinTmp;
checkWin.in[1] <== 0;
checkWin.enabled <== isLoss + isDraw;

component checkIsDrawOrLose1 = OR();
checkIsDrawOrLose1.a <== isLoss;
checkIsDrawOrLose1.b <== isDraw;
checkIsDrawOrLose1.out === 1 - isWinTmp;
component checkLossDrawEqual1 = ForceEqualIfEnabled();
checkLossDrawEqual1.in[0] <== isLoss + isDraw;
checkLossDrawEqual1.in[1] <== 1;
checkLossDrawEqual1.enabled <== isLoss + isDraw;

component gameCommitmentHasher0 = Poseidon(4);
gameCommitmentHasher0.inputs[0] <== choice[0];
gameCommitmentHasher0.inputs[1] <== slot[0];
gameCommitmentHasher0.inputs[2] <== 0;
gameCommitmentHasher0.inputs[3] <== gameAmount;

component gameCommitmentHasher1 = Poseidon(4);
gameCommitmentHasher1.inputs[0] <== choice[1];
gameCommitmentHasher1.inputs[1] <== slot[1];
gameCommitmentHasher1.inputs[2] <== gameCommitmentHasher0.out;
gameCommitmentHasher1.inputs[3] <== gameAmount;

gameCommitmentHasher0.out === publicGameCommitment0;
gameCommitmentHasher1.out === publicGameCommitment1;


component checkCommittedAmount[2][nIns];
for (var playerIndex =0; playerIndex < 2; playerIndex++) {
for(var inUtxoIndex = 0; inUtxoIndex < nIns; inUtxoIndex++) {
checkCommittedAmount[playerIndex][inUtxoIndex] = ForceEqualIfEnabled();
checkCommittedAmount[playerIndex][inUtxoIndex].in[0] <== inAmount[inUtxoIndex][0];
checkCommittedAmount[playerIndex][inUtxoIndex].in[1] <== gameAmount;
checkCommittedAmount[playerIndex][inUtxoIndex].enabled <== isAppInUtxo[playerIndex][inUtxoIndex];
}
}


/*  rock = 0, paper = 1, scissors = 2
0 = 2nd player loses, 1 = draw, 2 = 2nd player wins
0 0 = 1
0 1 = 2
0 2 = 0
1 0 = 0
1 1 = 1
1 2 = 2
2 0 = 2
2 1 = 0
2 2 = 1
*/

component caseDraw = ForceEqualIfEnabled();
caseDraw.in[0] <== choice[0];
caseDraw.in[1] <== choice[1];
caseDraw.enabled <== isDraw;

component caseWin1 = game_logic();
caseWin1.choice <== choice;
caseWin1.isWin <== isWin[0];
caseWin1.refChoice <== [0, 2];

component caseWin2 = game_logic();
caseWin2.choice <== choice;
caseWin2.isWin <== isWin[1];
caseWin2.refChoice <== [1, 0];

component caseWin3 = game_logic();
caseWin3.choice <== choice;
caseWin3.isWin <== isWin[2];
caseWin3.refChoice <== [2, 1];

component checkUtxoDraw[nOuts];
for (var outUtxoIndex = 0;outUtxoIndex < nOuts; outUtxoIndex++) {
checkUtxoDraw[outUtxoIndex] = CheckUtxo(2);
checkUtxoDraw[outUtxoIndex].isEnabled <== isDraw;
checkUtxoDraw[outUtxoIndex].isAccount <== isPlayer2OutUtxo[outUtxoIndex];
checkUtxoDraw[outUtxoIndex].assetIsNative <== 1;
checkUtxoDraw[outUtxoIndex].actualAmounts[0] <== outAmount[outUtxoIndex][0];
checkUtxoDraw[outUtxoIndex].actualAmounts[1] <== 0;
checkUtxoDraw[outUtxoIndex].requestedAmount <== gameAmount;
checkUtxoDraw[outUtxoIndex].actualPubkey <== outPubkey[outUtxoIndex];
checkUtxoDraw[outUtxoIndex].requestedPubkey <== userPubkey[1];
checkUtxoDraw[outUtxoIndex].actualInstructionType <== outAppDataHash[outUtxoIndex];
checkUtxoDraw[outUtxoIndex].requestedInstructionType <== 0;
checkUtxoDraw[outUtxoIndex].actualVerifierPubkey <== outVerifierPubkey[outUtxoIndex];
checkUtxoDraw[outUtxoIndex].requestedVerifierPubkey <== 0;
checkUtxoDraw[outUtxoIndex].actualOutBlinding <== outBlinding[outUtxoIndex];
checkUtxoDraw[outUtxoIndex].requestedOutBlinding <== userPubkey[1] + userPubkey[1];
}

component checkUtxoLoss[nOuts];
for (var outUtxoIndex = 0;outUtxoIndex < nOuts; outUtxoIndex++) {
checkUtxoLoss[outUtxoIndex] = CheckUtxo(2);
checkUtxoLoss[outUtxoIndex].isEnabled <== isLoss;
checkUtxoLoss[outUtxoIndex].isAccount <== isPlayer2OutUtxo[outUtxoIndex];
checkUtxoLoss[outUtxoIndex].assetIsNative <== 1;
checkUtxoLoss[outUtxoIndex].actualAmounts[0] <== outAmount[outUtxoIndex][0];
checkUtxoLoss[outUtxoIndex].actualAmounts[1] <== 0;
checkUtxoLoss[outUtxoIndex].requestedAmount <== gameAmount * 2;
checkUtxoLoss[outUtxoIndex].actualPubkey <== outPubkey[outUtxoIndex];
checkUtxoLoss[outUtxoIndex].requestedPubkey <== userPubkey[1];
checkUtxoLoss[outUtxoIndex].actualInstructionType <== outAppDataHash[outUtxoIndex];
checkUtxoLoss[outUtxoIndex].requestedInstructionType <== 0;
checkUtxoLoss[outUtxoIndex].actualVerifierPubkey <== outVerifierPubkey[outUtxoIndex];
checkUtxoLoss[outUtxoIndex].requestedVerifierPubkey <== 0;
checkUtxoLoss[outUtxoIndex].actualOutBlinding <== outBlinding[outUtxoIndex];
checkUtxoLoss[outUtxoIndex].requestedOutBlinding <== userPubkey[1] + userPubkey[1];
}

}

template get_publickey(nIns) {
signal input isAppInUtxo[nIns];
signal input inPublicKey[nIns];
signal input opponentPubkey;
signal input inAppDataHash[nIns];
signal input actualAppDataHash;
component getPublickey[nIns];
component checkAppDataHash[nIns];
for (var inUtxo = 0; inUtxo < nIns; inUtxo++) {
getPublickey[inUtxo] = ForceEqualIfEnabled();
getPublickey[inUtxo].in[0] <== inPublicKey[inUtxo];
getPublickey[inUtxo].in[1] <== opponentPubkey;
getPublickey[inUtxo].enabled <== isAppInUtxo[inUtxo];
checkAppDataHash[inUtxo] = ForceEqualIfEnabled();
checkAppDataHash[inUtxo].in[0] <== inAppDataHash[inUtxo];
checkAppDataHash[inUtxo].in[1] <== actualAppDataHash;
checkAppDataHash[inUtxo].enabled <== isAppInUtxo[inUtxo];
}
}
template game_logic() {
signal input choice[2];
signal input isWin;
signal input refChoice[2];
component caseWin1A = ForceEqualIfEnabled();
caseWin1A.in[0] <== choice[0];
caseWin1A.in[1] <== refChoice[0];
caseWin1A.enabled <== isWin;

component caseWin1B = ForceEqualIfEnabled();
caseWin1B.in[0] <== choice[1];
caseWin1B.in[1] <== refChoice[1];
caseWin1B.enabled <== isWin;
}

template CheckUtxo(nrAssets) {
signal input isEnabled;
signal input isAccount;

signal input assetIsNative;

signal input actualAmounts[nrAssets];
signal input requestedAmount;
signal input actualPubkey;
signal input requestedPubkey;
signal input actualInstructionType;
signal input requestedInstructionType;
signal input actualVerifierPubkey;
signal input requestedVerifierPubkey;
signal input actualOutBlinding;
signal input requestedOutBlinding;


component outCheckAmountNative = ForceEqualIfEnabled();
outCheckAmountNative.in[0] <== actualAmounts[0];
outCheckAmountNative.in[1] <== requestedAmount;
outCheckAmountNative.enabled <== isAccount * isEnabled;


component outCheckBlinding = ForceEqualIfEnabled();
outCheckBlinding.in[0] <== actualOutBlinding;
outCheckBlinding.in[1] <== requestedOutBlinding;
outCheckBlinding.enabled <== isAccount * isEnabled;


component outCheckRecipient = ForceEqualIfEnabled();
outCheckRecipient.in[0] <== actualPubkey; //outPubkey;
outCheckRecipient.in[1] <== requestedPubkey; //authPubkey[i];
outCheckRecipient.enabled <== isAccount * isEnabled;



component outCheckInstructionType = ForceEqualIfEnabled();
outCheckInstructionType.in[0] <== actualInstructionType;
outCheckInstructionType.in[1] <== requestedInstructionType;
outCheckInstructionType.enabled <== isAccount * isEnabled;


component outCheckVerifier = ForceEqualIfEnabled();
outCheckVerifier.in[0] <== actualVerifierPubkey;
outCheckVerifier.in[1] <== requestedVerifierPubkey;
outCheckVerifier.enabled <== isAccount * isEnabled;

}