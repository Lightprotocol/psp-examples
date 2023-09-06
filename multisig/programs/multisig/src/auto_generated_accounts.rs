use anchor_lang::prelude::*;

/**
 * This file is auto-generated by the Light cli.
 * DO NOT EDIT MANUALLY.
 * THE FILE WILL BE OVERWRITTEN EVERY TIME THE LIGHT CLI BUILD IS RUN.
 */
    #[allow(non_camel_case_types)]
    // helper struct to create anchor idl with u256 type
    #[account]
    #[derive(Debug, Copy, PartialEq)]
    pub struct u256 {
        pub x: [u8; 32],
    }
 
pub const NR_CHECKED_INPUTS: usize = 2;

#[allow(non_snake_case)]
#[derive(Debug)]
#[account]
pub struct InstructionDataLightInstructionSecond {
}

#[allow(non_snake_case)]
#[derive(Debug, Copy, PartialEq)]
#[account]
pub struct Utxo {
    pub amounts: [u64; 2],
    pub spl_asset_index: u64,
    pub verifier_address_index: u64,
    pub blinding: u256,
    pub app_data_hash: u256,
    pub account_shielded_public_key: u256,
    pub account_encryption_public_key: [u8; 32],
    pub threshold: u256,
    pub nrSigners: u256,
    pub public_key_x: [[u8; 32]; 7],
    pub public_key_y: [[u8; 32]; 7],
}

#[allow(non_snake_case)]
#[account]
#[derive(Debug, Copy, PartialEq)]
pub struct UtxoAppData {
    pub threshold: u256,
    pub nrSigners: u256,
    pub public_key_x: [[u8; 32]; 7],
    pub public_key_y: [[u8; 32]; 7],
}