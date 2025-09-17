import { readFileSync } from 'fs';
import { groth16 } from 'snarkjs';
import poseidonPkg from 'poseidon-lite';
const { poseidon2, poseidon5 } = poseidonPkg;
import {
    normalizeText,
    uint256ToBytes,
    uint64ToBytes,
    addressToBytes,
    toField,
    concat,
    bigIntToHex,
    isValidFieldElement
} from './crypto-utils.js';

/**
 * Real Zero-Knowledge Proof System for Peace Message
 * Uses actual circom circuit with Poseidon hash and Groth16 proofs
 */
export class RealPeaceZKSystem {
    constructor(options = {}) {
        this.chainId = options.chainId || 8453; // Base mainnet
        this.contractAddress = options.contractAddress || '0x1234567890123456789012345678901234567890';
        this.scheme = 1;
        
        // ZK circuit files (using fixed version with proper public inputs)
        this.circuitWasmPath = './build/peace_js/peace.wasm';
        this.circuitZkeyPath = './setup/peace_fixed_final.zkey';
        this.verificationKeyPath = './setup/verification_key_fixed.json';
        
    }

    /**
     * Ensure system is initialized before use
     */
    async ensureInitialized() {
        // poseidon-lite doesn't require initialization
        return Promise.resolve();
    }

    /**
     * Real Poseidon5 hash function
     * @param {BigInt[]} inputs - Array of 5 field elements
     * @returns {BigInt} Hash result
     */
    async realPoseidon5(inputs) {
        if (inputs.length !== 5) {
            throw new Error('Poseidon5 requires exactly 5 inputs');
        }
        
        return poseidon5(inputs);
    }

    /**
     * Real Poseidon2 hash function  
     * @param {BigInt[]} inputs - Array of 2 field elements
     * @returns {BigInt} Hash result
     */
    async realPoseidon2(inputs) {
        if (inputs.length !== 2) {
            throw new Error('Poseidon2 requires exactly 2 inputs');
        }
        
        return poseidon2(inputs);
    }

    /**
     * Calculate field elements for message components
     * @param {string} text - Message text
     * @param {number} timestamp - Timestamp in seconds
     * @returns {Object} Field elements
     */
    calculateFieldElements(text, timestamp) {
        // Normalize text and convert to field element
        const normalizedText = normalizeText(text);
        const textHashF = toField(new TextEncoder().encode(normalizedText));
        
        // Chain ID field element
        const chainIdBytes = uint256ToBytes(BigInt(this.chainId));
        const chainIdF = toField(chainIdBytes);
        
        // Contract address field element
        const contractBytes = addressToBytes(this.contractAddress);
        const contractF = toField(contractBytes);
        
        // Timestamp bucket (minute granularity) field element
        const tsBucket = Math.floor(timestamp / 60);
        const tsBucketBytes = uint64ToBytes(tsBucket);
        const tsBucketF = toField(tsBucketBytes);
        
        return {
            textHashF,
            chainIdF,
            contractF,
            tsBucketF,
            normalizedText,
            timestamp,
            tsBucket
        };
    }

    /**
     * Create commitment hash using real Poseidon
     * @param {string} text - Message text
     * @param {string} secret - Secret passphrase
     * @param {number} timestamp - Timestamp in seconds
     * @returns {Object} Commitment and field elements
     */
    async createRealCommitment(text, secret, timestamp = Math.floor(Date.now() / 1000)) {
        await this.ensureInitialized();
        
        // Validation
        if (!text || text.trim().length === 0) {
            throw new Error('Message text cannot be empty');
        }
        
        if (!secret || secret.trim().length === 0) {
            throw new Error('Secret passphrase cannot be empty');
        }

        const normalizedSecret = normalizeText(secret);
        if (normalizedSecret.includes('\n') || normalizedSecret.includes('\t')) {
            throw new Error('Secret passphrase cannot contain line breaks or tabs');
        }

        // Calculate field elements
        const fields = this.calculateFieldElements(text, timestamp);
        
        // Secret as field element
        const sF = toField(new TextEncoder().encode(normalizedSecret));
        
        console.log('🔐 Poseidonハッシュを計算中...');
        
        // Real Poseidon hashes
        // d = Poseidon5([textHashF, chainIdF, contractF, 0, tsBucketF])
        const d = await this.realPoseidon5([
            fields.textHashF,
            fields.chainIdF,
            fields.contractF,
            0n, // kioskIdF placeholder
            fields.tsBucketF
        ]);
        
        // h = Poseidon2([d, sF])
        const h = await this.realPoseidon2([d, sF]);
        
        console.log('✅ 実際のPoseidonでコミットメント計算完了');
        
        return {
            text: fields.normalizedText,
            secret: normalizedSecret,
            timestamp,
            commitment: h,
            fieldElements: {
                textHashF: fields.textHashF,
                chainIdF: fields.chainIdF,
                contractF: fields.contractF,
                tsBucketF: fields.tsBucketF,
                sF,
                d,
                h
            }
        };
    }

    /**
     * Generate real Groth16 zero-knowledge proof
     * @param {string} text - Message text
     * @param {string} secret - Secret passphrase
     * @param {number} timestamp - Timestamp
     * @returns {Object} Real ZK proof data
     */
    async generateRealProof(text, secret, timestamp = Math.floor(Date.now() / 1000)) {
        await this.ensureInitialized();
        
        console.log('🚀 実際のZK証明を生成中...');
        
        // Create commitment
        const commitment = await this.createRealCommitment(text, secret, timestamp);
        
        // Prepare circuit inputs
        const circuitInputs = {
            textHashF: commitment.fieldElements.textHashF.toString(),
            chainIdF: commitment.fieldElements.chainIdF.toString(),
            contractF: commitment.fieldElements.contractF.toString(),
            tsBucketF: commitment.fieldElements.tsBucketF.toString(),
            h: commitment.fieldElements.h.toString(),
            sF: commitment.fieldElements.sF.toString()
        };
        
        console.log('🔢 回路入力の準備完了');
        console.log('📊 Input validation:', Object.keys(circuitInputs).map(k => 
            `${k}: ${isValidFieldElement(BigInt(circuitInputs[k])) ? '✅' : '❌'}`
        ).join(', '));
        
        try {
            // Generate witness and proof
            console.log('🧮 ウィットネスを計算中...');
            const { proof, publicSignals } = await groth16.fullProve(
                circuitInputs,
                this.circuitWasmPath,
                this.circuitZkeyPath
            );
            
            console.log('✅ 実際のGroth16証明の生成に成功！');
            
            // Display generated public signals
            console.log('📊 生成された公開シグナル:');
            console.log(`   textHashF:  0x${BigInt(publicSignals[0]).toString(16)}`);
            console.log(`   chainIdF:   0x${BigInt(publicSignals[1]).toString(16)}`);
            console.log(`   contractF:  0x${BigInt(publicSignals[2]).toString(16)}`);
            console.log(`   tsBucketF:  0x${BigInt(publicSignals[3]).toString(16)}`);
            console.log(`   h (コミット): 0x${BigInt(publicSignals[4]).toString(16)}`);
            
            return {
                proof,
                publicSignals,
                commitment,
                messageId: this.calculateMessageId(commitment)
            };
            
        } catch (error) {
            console.error('❌ 証明生成に失敗:', error);
            throw new Error(`ZK証明生成に失敗: ${error.message}`);
        }
    }

    /**
     * Verify real Groth16 zero-knowledge proof against expected commitment
     * @param {Object} proofData - Proof data from generateRealProof
     * @param {string} expectedText - Expected message text  
     * @param {number} expectedTimestamp - Expected timestamp
     * @param {BigInt} expectedCommitment - Expected commitment value (from blockchain or prior knowledge)
     * @returns {boolean} Verification result
     */
    async verifyRealProof(proofData, expectedText, expectedTimestamp, expectedCommitment = null) {
        await this.ensureInitialized();
        
        console.log('🔍 実際のZK証明を検証中...');
        
        try {
            // Load verification key
            const verificationKey = JSON.parse(readFileSync(this.verificationKeyPath));
            
            // Calculate expected public signals from the claimed message and timestamp
            const expectedFields = this.calculateFieldElements(expectedText, expectedTimestamp);
            
            // Use expected commitment if provided, otherwise use the one from proof (for backward compatibility)
            const commitmentToVerify = expectedCommitment || BigInt(proofData.publicSignals[4]);
            
            const expectedPublicSignals = [
                expectedFields.textHashF.toString(),
                expectedFields.chainIdF.toString(),
                expectedFields.contractF.toString(),
                expectedFields.tsBucketF.toString(),
                commitmentToVerify.toString() // Use expected commitment if provided
            ];
            
            // Display expected public signals
            console.log('📊 期待値の公開シグナル:');
            console.log(`   textHashF:  0x${BigInt(expectedPublicSignals[0]).toString(16)}`);
            console.log(`   chainIdF:   0x${BigInt(expectedPublicSignals[1]).toString(16)}`);
            console.log(`   contractF:  0x${BigInt(expectedPublicSignals[2]).toString(16)}`);
            console.log(`   tsBucketF:  0x${BigInt(expectedPublicSignals[3]).toString(16)}`);
            console.log(`   h (コミット): 0x${BigInt(expectedPublicSignals[4]).toString(16)}`);
            
            console.log('📊 実際値の公開シグナル:');
            console.log(`   textHashF:  0x${BigInt(proofData.publicSignals[0]).toString(16)}`);
            console.log(`   chainIdF:   0x${BigInt(proofData.publicSignals[1]).toString(16)}`);
            console.log(`   contractF:  0x${BigInt(proofData.publicSignals[2]).toString(16)}`);
            console.log(`   tsBucketF:  0x${BigInt(proofData.publicSignals[3]).toString(16)}`);
            console.log(`   h (コミット): 0x${BigInt(proofData.publicSignals[4]).toString(16)}`);
            
            // Check public signals match
            let allMatch = true;
            for (let i = 0; i < expectedPublicSignals.length; i++) {
                const matches = proofData.publicSignals[i] === expectedPublicSignals[i];
                console.log(`   🔍 インデックス ${i}: ${matches ? '✅ 一致' : '❌ 不一致'}`);
                
                if (!matches) {
                    allMatch = false;
                    console.log(`     期待値: ${expectedPublicSignals[i]}`);
                    console.log(`     実際値: ${proofData.publicSignals[i]}`);
                }
            }
            
            if (!allMatch) {
                return false;
            }
            
            // Verify the actual ZK proof
            console.log('🔐 Groth16証明を検証中...');
            const isValid = await groth16.verify(
                verificationKey,
                proofData.publicSignals,
                proofData.proof
            );
            
            console.log(`🎯 ZK証明の検証: ${isValid ? '✅ 有効' : '❌ 無効'}`);
            return isValid;
            
        } catch (error) {
            console.error('❌ 証明検証に失敗:', error);
            return false;
        }
    }

    /**
     * Calculate message ID
     * @param {Object} commitment - Commitment data
     * @returns {string} Message ID
     */
    calculateMessageId(commitment) {
        const messageData = JSON.stringify({
            text: commitment.text,
            h: bigIntToHex(commitment.commitment),
            ts: commitment.timestamp,
            scheme: this.scheme
        });
        
        const messageBytes = new TextEncoder().encode(messageData);
        const messageId = toField(messageBytes);
        return bigIntToHex(messageId);
    }

    /**
     * Display field elements with real vs mock comparison
     * @param {Object} commitment - Commitment data
     */
    displayFieldElements(commitment) {
        console.log('\n=== 実際のZKフィールド要素 ===');
        console.log(`textHashF:  ${bigIntToHex(commitment.fieldElements.textHashF)}`);
        console.log(`chainIdF:   ${bigIntToHex(commitment.fieldElements.chainIdF)}`);
        console.log(`contractF:  ${bigIntToHex(commitment.fieldElements.contractF)}`);
        console.log(`tsBucketF:  ${bigIntToHex(commitment.fieldElements.tsBucketF)}`);
        console.log(`sF:         ${bigIntToHex(commitment.fieldElements.sF)}`);
        console.log(`d:          ${bigIntToHex(commitment.fieldElements.d)}`);
        console.log(`h:          ${bigIntToHex(commitment.fieldElements.h)}`);
        
        // Validation
        const allValid = Object.values(commitment.fieldElements)
            .every(value => isValidFieldElement(value));
        console.log(`\n全フィールド要素が有効: ${allValid}`);
        console.log('🎯 実際のPoseidonハッシュ関数を使用中！');
    }
}