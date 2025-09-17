pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

/*
 * Peace Message Zero-Knowledge Proof Circuit
 * 
 * This circuit proves knowledge of a secret passphrase without revealing it.
 * Based on the Peace Message ZKP specification.
 * 
 * Public inputs:
 * - textHashF: Hash of the message text
 * - chainIdF: Hash of the blockchain chain ID  
 * - contractF: Hash of the contract address
 * - tsBucketF: Hash of the timestamp bucket (minute granularity)
 * - h: Final commitment hash
 * 
 * Private inputs:
 * - sF: Hash of the secret passphrase
 * 
 * Circuit Logic:
 * 1. d = Poseidon5([textHashF, chainIdF, contractF, 0, tsBucketF])
 *    Note: kioskIdF is set to 0 as per user requirement (kiosk not needed)
 * 2. h' = Poseidon2([d, sF])  
 * 3. Constraint: h' === h (proves knowledge of secret without revealing it)
 */

template PeaceMessageProof() {
    // Public inputs (known to verifier)
    signal input textHashF;   // Field element from message text hash
    signal input chainIdF;    // Field element from chain ID
    signal input contractF;   // Field element from contract address
    signal input tsBucketF;   // Field element from timestamp bucket
    signal input h;          // Final commitment hash
    
    // Private inputs (known only to prover) 
    signal input sF;         // Field element from secret passphrase
    
    // Internal signals
    signal d;                // Intermediate hash result
    
    // Poseidon hash components
    component poseidon5 = Poseidon(5);
    component poseidon2 = Poseidon(2);
    
    // First Poseidon hash: d = Poseidon5([textHashF, chainIdF, contractF, 0, tsBucketF])
    poseidon5.inputs[0] <== textHashF;
    poseidon5.inputs[1] <== chainIdF;
    poseidon5.inputs[2] <== contractF;
    poseidon5.inputs[3] <== 0;  // kioskIdF placeholder (set to 0)
    poseidon5.inputs[4] <== tsBucketF;
    
    d <== poseidon5.out;
    
    // Second Poseidon hash: h' = Poseidon2([d, sF])
    poseidon2.inputs[0] <== d;
    poseidon2.inputs[1] <== sF;
    
    // Zero-knowledge constraint: prove h' === h without revealing sF
    poseidon2.out === h;
}

// Main component instantiation with public inputs
component main {public [textHashF, chainIdF, contractF, tsBucketF, h]} = PeaceMessageProof();