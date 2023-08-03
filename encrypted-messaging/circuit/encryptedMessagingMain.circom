pragma circom 2.0.0;
include "./encrypted_messaging.circom";
component main {public [currentSlot, transactionHash, publicAppVerifier]} =  encrypted_messaging( 18, 4, 4, 184598798020101492503359154328231866914977581098629757339001774613643340069, 0, 1, 3, 2, 2);