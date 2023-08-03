pragma circom 2.0.0;
include "./rock_paper_scissors.circom";
component main {public [publicGameCommitment0, publicGameCommitment1, transactionHash, publicAppVerifier]} =  rock_paper_scissors( 2, 18, 4, 4, 184598798020101492503359154328231866914977581098629757339001774613643340069, 0, 1, 3, 2, 2);