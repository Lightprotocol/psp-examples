use anchor_lang::prelude::*;
use groth16_solana::groth16::Groth16Verifyingkey;

pub const VERIFYINGKEY_COMPRESSED_ACCOUNT_UPDATE: Groth16Verifyingkey = Groth16Verifyingkey {
    nr_pubinputs: 4,
    vk_alpha_g1: [
        45, 77, 154, 167, 227, 2, 217, 223, 65, 116, 157, 85, 7, 148, 157, 5, 219, 234, 51, 251,
        177, 108, 100, 59, 34, 245, 153, 162, 190, 109, 242, 226, 20, 190, 221, 80, 60, 55, 206,
        176, 97, 216, 236, 96, 32, 159, 227, 69, 206, 137, 131, 10, 25, 35, 3, 1, 240, 118, 202,
        255, 0, 77, 25, 38,
    ],

    vk_beta_g2: [
        9, 103, 3, 47, 203, 247, 118, 209, 175, 201, 133, 248, 136, 119, 241, 130, 211, 132, 128,
        166, 83, 242, 222, 202, 169, 121, 76, 188, 59, 243, 6, 12, 14, 24, 120, 71, 173, 76, 121,
        131, 116, 208, 214, 115, 43, 245, 1, 132, 125, 214, 139, 192, 224, 113, 36, 30, 2, 19, 188,
        127, 193, 61, 183, 171, 48, 76, 251, 209, 224, 138, 112, 74, 153, 245, 232, 71, 217, 63,
        140, 60, 170, 253, 222, 196, 107, 122, 13, 55, 157, 166, 154, 77, 17, 35, 70, 167, 23, 57,
        193, 177, 164, 87, 168, 199, 49, 49, 35, 210, 77, 47, 145, 146, 248, 150, 183, 198, 62,
        234, 5, 169, 213, 127, 6, 84, 122, 208, 206, 200,
    ],

    vk_gamme_g2: [
        25, 142, 147, 147, 146, 13, 72, 58, 114, 96, 191, 183, 49, 251, 93, 37, 241, 170, 73, 51,
        53, 169, 231, 18, 151, 228, 133, 183, 174, 243, 18, 194, 24, 0, 222, 239, 18, 31, 30, 118,
        66, 106, 0, 102, 94, 92, 68, 121, 103, 67, 34, 212, 247, 94, 218, 221, 70, 222, 189, 92,
        217, 146, 246, 237, 9, 6, 137, 208, 88, 95, 240, 117, 236, 158, 153, 173, 105, 12, 51, 149,
        188, 75, 49, 51, 112, 179, 142, 243, 85, 172, 218, 220, 209, 34, 151, 91, 18, 200, 94, 165,
        219, 140, 109, 235, 74, 171, 113, 128, 141, 203, 64, 143, 227, 209, 231, 105, 12, 67, 211,
        123, 76, 230, 204, 1, 102, 250, 125, 170,
    ],

    vk_delta_g2: [
        20, 145, 102, 194, 185, 96, 179, 71, 223, 73, 1, 210, 199, 9, 49, 87, 125, 132, 137, 37,
        183, 35, 36, 212, 176, 49, 208, 171, 247, 74, 155, 28, 23, 89, 73, 219, 28, 36, 157, 254,
        151, 252, 109, 55, 103, 203, 51, 246, 53, 204, 151, 245, 116, 193, 44, 153, 93, 81, 94,
        239, 252, 188, 68, 94, 33, 123, 79, 9, 205, 230, 155, 209, 240, 176, 67, 220, 149, 181, 4,
        107, 56, 83, 158, 59, 203, 131, 101, 181, 178, 91, 246, 245, 149, 26, 42, 54, 36, 135, 180,
        17, 232, 123, 138, 91, 191, 124, 57, 79, 30, 135, 152, 79, 139, 190, 97, 114, 204, 53, 247,
        101, 103, 235, 71, 196, 81, 215, 129, 101,
    ],

    vk_ic: &[
        [
            12, 95, 27, 116, 206, 124, 91, 218, 109, 47, 85, 54, 164, 21, 135, 202, 33, 61, 71,
            238, 179, 124, 132, 54, 223, 203, 31, 160, 170, 147, 211, 246, 34, 101, 240, 120, 2,
            44, 217, 96, 76, 243, 191, 109, 155, 239, 57, 208, 132, 84, 209, 15, 173, 88, 101, 2,
            28, 10, 67, 203, 111, 14, 175, 97,
        ],
        [
            23, 205, 50, 21, 80, 69, 92, 138, 226, 46, 22, 217, 204, 179, 213, 47, 229, 112, 180,
            96, 36, 45, 217, 46, 167, 254, 239, 82, 14, 191, 69, 120, 27, 130, 8, 237, 142, 30,
            178, 46, 222, 13, 117, 61, 157, 163, 179, 78, 118, 190, 135, 127, 178, 235, 32, 129,
            208, 248, 221, 207, 232, 197, 83, 97,
        ],
        [
            41, 157, 138, 104, 12, 225, 91, 36, 134, 103, 217, 189, 202, 26, 100, 39, 175, 190, 11,
            24, 47, 114, 59, 63, 60, 129, 130, 171, 144, 249, 47, 147, 3, 209, 251, 62, 117, 34,
            14, 12, 204, 38, 36, 40, 254, 140, 203, 105, 197, 195, 110, 68, 5, 130, 250, 157, 103,
            165, 203, 15, 74, 144, 31, 112,
        ],
        [
            0, 48, 6, 136, 51, 187, 10, 226, 219, 139, 136, 40, 61, 54, 39, 111, 158, 243, 201,
            213, 237, 245, 201, 91, 119, 84, 129, 107, 209, 189, 169, 11, 28, 36, 64, 50, 184, 61,
            37, 83, 203, 54, 23, 202, 71, 9, 185, 172, 24, 141, 38, 154, 179, 84, 238, 91, 72, 190,
            165, 167, 94, 111, 101, 178,
        ],
        [
            0, 201, 203, 65, 163, 142, 97, 13, 60, 60, 109, 55, 214, 28, 5, 225, 165, 81, 213, 167,
            155, 116, 222, 250, 160, 112, 211, 229, 203, 11, 87, 130, 27, 252, 99, 12, 70, 41, 141,
            196, 44, 31, 193, 11, 44, 30, 46, 94, 98, 228, 87, 119, 209, 104, 39, 27, 123, 23, 118,
            173, 61, 95, 209, 71,
        ],
    ],
};
#[account]
pub struct ZKcompressedAccountUpdateProofInputs {
    updated_root: u8,
    leaf: u8,
    sub_tree_hash: u8,
    new_sub_tree_hash: u8,
    sub_trees: [u8; 18],
    new_sub_trees: [u8; 18],
    path_indices: u8,
    zero_values: [u8; 18],
    sibling: u8,
}
#[account]
pub struct ZKcompressedAccountUpdatePublicInputs {
    updated_root: u8,
    leaf: u8,
    sub_tree_hash: u8,
    new_sub_tree_hash: u8,
}
#[account]
pub struct InstructionDataLightInstructionCompressedAccountUpdateSecond {
    updated_root: [u8; 32],
    leaf: [u8; 32],
    sub_tree_hash: [u8; 32],
    new_sub_tree_hash: [u8; 32],
}