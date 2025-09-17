import {
    normalizeText,
    textToField,
    uint256ToBytes,
    uint64ToBytes,
    addressToBytes,
    toField,
    mockPoseidon5,
    mockPoseidon2,
    bigIntToHex,
    isValidFieldElement
} from './crypto-utils.js';

/**
 * Peace Message クラス
 * ゼロ知識証明システムのメッセージ処理を担当
 */
export class PeaceMessage {
    constructor(options = {}) {
        this.chainId = options.chainId || 8453; // Base mainnet
        this.contractAddress = options.contractAddress || '0x1234567890123456789012345678901234567890';
        this.scheme = 1;
    }

    /**
     * メッセージのフィールド要素を計算
     * @param {string} text - メッセージテキスト
     * @param {number} timestamp - タイムスタンプ（秒）
     * @returns {Object} フィールド要素のセット
     */
    calculateFieldElements(text, timestamp) {
        // 文字列正規化とフィールド要素変換
        const normalizedText = normalizeText(text);
        const textHashF = textToField(normalizedText);
        
        // チェーンIDをフィールド要素に変換
        const chainIdBytes = uint256ToBytes(BigInt(this.chainId));
        const chainIdF = toField(chainIdBytes);
        
        // コントラクトアドレスをフィールド要素に変換
        const contractBytes = addressToBytes(this.contractAddress);
        const contractF = toField(contractBytes);
        
        // タイムスタンプバケット（分単位）をフィールド要素に変換
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
     * コミットメントハッシュを計算
     * @param {string} text - メッセージテキスト
     * @param {string} secret - パスフレーズ
     * @param {number} timestamp - タイムスタンプ（秒）
     * @returns {Object} コミットメントと関連情報
     */
    createCommitment(text, secret, timestamp = Math.floor(Date.now() / 1000)) {
        // バリデーション
        if (!text || text.trim().length === 0) {
            throw new Error('Message text cannot be empty');
        }
        
        if (!secret || secret.trim().length === 0) {
            throw new Error('Secret passphrase cannot be empty');
        }

        // 改行・タブの禁止チェック（合言葉）
        const normalizedSecret = normalizeText(secret);
        if (normalizedSecret.includes('\n') || normalizedSecret.includes('\t')) {
            throw new Error('Secret passphrase cannot contain line breaks or tabs');
        }

        // フィールド要素計算
        const fields = this.calculateFieldElements(text, timestamp);
        
        // 秘密をフィールド要素に変換
        const sF = textToField(normalizedSecret);
        
        // 2段階Poseidonハッシュ
        // d = Poseidon5([textHashF, chainIdF, contractF, kioskIdF, tsBucketF])
        // Note: kioskを除外したので4つの要素のみ。Poseidon4として扱うか、0で埋める
        const d = mockPoseidon5([
            fields.textHashF,
            fields.chainIdF,
            fields.contractF,
            0n, // kioskIdF の代わりに0を使用
            fields.tsBucketF
        ]);
        
        // h = Poseidon2([d, sF])
        const h = mockPoseidon2([d, sF]);

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
     * ゼロ知識証明を生成（シミュレーション）
     * @param {string} text - メッセージテキスト
     * @param {string} secret - パスフレーズ
     * @param {number} timestamp - タイムスタンプ
     * @returns {Object} 証明データ
     */
    generateProof(text, secret, timestamp = Math.floor(Date.now() / 1000)) {
        const commitment = this.createCommitment(text, secret, timestamp);
        
        // 公開入力の構成
        const publicInputs = [
            commitment.fieldElements.textHashF,
            commitment.fieldElements.chainIdF,
            commitment.fieldElements.contractF,
            commitment.fieldElements.tsBucketF,
            commitment.fieldElements.h
        ];

        // Groth16証明のシミュレーション（実際の実装では適切なライブラリを使用）
        const proof = {
            a: [
                bigIntToHex(BigInt('0x' + Math.random().toString(16).slice(2).padStart(64, '0'))),
                bigIntToHex(BigInt('0x' + Math.random().toString(16).slice(2).padStart(64, '0')))
            ],
            b: [
                [
                    bigIntToHex(BigInt('0x' + Math.random().toString(16).slice(2).padStart(64, '0'))),
                    bigIntToHex(BigInt('0x' + Math.random().toString(16).slice(2).padStart(64, '0')))
                ],
                [
                    bigIntToHex(BigInt('0x' + Math.random().toString(16).slice(2).padStart(64, '0'))),
                    bigIntToHex(BigInt('0x' + Math.random().toString(16).slice(2).padStart(64, '0')))
                ]
            ],
            c: [
                bigIntToHex(BigInt('0x' + Math.random().toString(16).slice(2).padStart(64, '0'))),
                bigIntToHex(BigInt('0x' + Math.random().toString(16).slice(2).padStart(64, '0')))
            ]
        };

        return {
            publicInputs: publicInputs.map(bigIntToHex),
            proof,
            commitment,
            messageId: this.calculateMessageId(commitment)
        };
    }

    /**
     * ゼロ知識証明を検証（シミュレーション）
     * @param {Object} proofData - 証明データ
     * @param {string} expectedText - 期待されるメッセージテキスト
     * @param {number} expectedTimestamp - 期待されるタイムスタンプ
     * @returns {boolean} 検証結果
     */
    verifyProof(proofData, expectedText, expectedTimestamp) {
        try {
            // 期待される公開入力を再計算
            const expectedFields = this.calculateFieldElements(expectedText, expectedTimestamp);
            const expectedPublicInputs = [
                expectedFields.textHashF,
                expectedFields.chainIdF,
                expectedFields.contractF,
                expectedFields.tsBucketF,
                BigInt(proofData.publicInputs[4]) // h値は証明から取得
            ];

            // 公開入力の照合
            for (let i = 0; i < 4; i++) { // h値以外をチェック
                if (BigInt(proofData.publicInputs[i]) !== expectedPublicInputs[i]) {
                    console.log(`Public input mismatch at index ${i}`);
                    console.log(`Expected: ${bigIntToHex(expectedPublicInputs[i])}`);
                    console.log(`Actual: ${proofData.publicInputs[i]}`);
                    return false;
                }
            }

            // 実際の実装ではGroth16検証を実行
            // ここではシミュレーションとして常にtrueを返す
            console.log('ZK proof verification: SIMULATED SUCCESS');
            return true;

        } catch (error) {
            console.error('Proof verification failed:', error);
            return false;
        }
    }

    /**
     * メッセージIDを計算
     * @param {Object} commitment - コミットメントデータ
     * @returns {string} メッセージID
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
     * フィールド要素の詳細情報を表示
     * @param {Object} commitment - コミットメントデータ
     */
    displayFieldElements(commitment) {
        console.log('\n=== Field Elements ===');
        console.log(`textHashF:  ${bigIntToHex(commitment.fieldElements.textHashF)}`);
        console.log(`chainIdF:   ${bigIntToHex(commitment.fieldElements.chainIdF)}`);
        console.log(`contractF:  ${bigIntToHex(commitment.fieldElements.contractF)}`);
        console.log(`tsBucketF:  ${bigIntToHex(commitment.fieldElements.tsBucketF)}`);
        console.log(`sF:         ${bigIntToHex(commitment.fieldElements.sF)}`);
        console.log(`d:          ${bigIntToHex(commitment.fieldElements.d)}`);
        console.log(`h:          ${bigIntToHex(commitment.fieldElements.h)}`);
        
        // 検証
        const allValid = Object.values(commitment.fieldElements)
            .every(value => isValidFieldElement(value));
        console.log(`\nAll field elements valid: ${allValid}`);
    }
}