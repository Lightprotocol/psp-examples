use anchor_lang::prelude::*;
use groth16_solana::groth16::Groth16Verifyingkey;

pub const VERIFYINGKEY_INCLUSION_PROOF: Groth16Verifyingkey = Groth16Verifyingkey {
    nr_pubinputs: 2,
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
        48, 49, 179, 183, 52, 193, 98, 20, 224, 64, 81, 162, 109, 108, 44, 155, 60, 136, 26, 220,
        58, 252, 184, 28, 51, 253, 234, 13, 232, 174, 103, 234, 10, 166, 160, 182, 17, 189, 144,
        121, 169, 109, 134, 113, 182, 168, 188, 238, 136, 207, 52, 80, 218, 187, 143, 250, 150, 72,
        46, 189, 72, 6, 74, 202, 25, 187, 92, 246, 165, 164, 252, 180, 120, 219, 59, 69, 48, 3,
        216, 151, 25, 22, 142, 42, 191, 238, 23, 170, 74, 56, 46, 221, 137, 153, 217, 140, 12, 11,
        109, 87, 235, 254, 92, 207, 165, 130, 67, 10, 243, 183, 25, 38, 129, 49, 148, 211, 249,
        133, 135, 6, 243, 89, 57, 44, 145, 176, 65, 12,
    ],

    vk_ic: &[
        [
            34, 251, 1, 250, 254, 19, 131, 25, 32, 248, 79, 192, 240, 93, 107, 142, 180, 104, 237,
            18, 226, 24, 220, 124, 110, 161, 66, 140, 35, 7, 160, 61, 22, 198, 9, 48, 147, 246, 97,
            71, 143, 103, 102, 120, 212, 203, 138, 195, 143, 205, 87, 234, 16, 105, 133, 203, 43,
            49, 67, 39, 9, 90, 4, 94,
        ],
        [
            10, 245, 252, 79, 46, 46, 251, 138, 142, 26, 57, 126, 85, 169, 51, 125, 108, 112, 65,
            64, 157, 174, 248, 92, 153, 19, 121, 82, 78, 83, 28, 248, 46, 131, 129, 143, 73, 137,
            109, 21, 130, 187, 39, 83, 17, 178, 49, 121, 151, 29, 29, 104, 181, 233, 100, 219, 99,
            208, 87, 176, 218, 91, 203, 29,
        ],
        [
            6, 200, 93, 81, 145, 31, 133, 61, 206, 208, 107, 32, 24, 165, 120, 74, 139, 149, 229,
            136, 53, 2, 181, 119, 144, 129, 98, 15, 72, 130, 123, 221, 23, 131, 187, 83, 101, 114,
            92, 95, 179, 78, 196, 86, 52, 202, 149, 42, 74, 186, 38, 104, 218, 213, 55, 235, 252,
            233, 210, 44, 234, 151, 239, 168,
        ],
    ],
};
#[account]
pub struct ZKinclusionProofProofInputs {
    root: u8,
    reference_value: u8,
    leaf_preimage: u8,
    path_elements: [u8; 18],
    index: u8,
}
#[account]
pub struct ZKinclusionProofPublicInputs {
    root: u8,
    reference_value: u8,
}
#[account]
pub struct InstructionDataLightInstructionInclusionProofSecond {
    root: [u8; 32],
    reference_value: [u8; 32],
}