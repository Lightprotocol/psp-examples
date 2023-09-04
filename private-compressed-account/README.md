# private-compressed-account

### User flow

1.  Insert a value into the Merkle tree. `(Hashed value, Poseidon([value]))`
2.  Prove inclusion of the value (A program can invoke this instruction via cpi to verify the property it wants to verify.)

The PSP has 2 circuits and 2 instructions to verify proofs

1.  Insert & update Merkle tree

    ⁃ PublicInputs: `(oldRoot,newRoot)`

    ⁃ Private inputs: `(value, )`

2.  Prove inclusion

    ⁃ Public inputs: `(Merkle tree root)`

    ⁃ Private inputs: `(Merkle tree path, Value)`

### Notes

- Merkle tree is append only
- Currently the CLI generates PSP's by default with 3 separate instructions (sequential execution over 3 txs.)

Current performance (not optimized, m2 mac, node env)

- (1) Merkle tree update, height 18: `.5-1s`
- (2) Inclusion proof: `.5-1s`

- [ ] add benchmarks after proofgen optimizations for different tree heights and machines.
