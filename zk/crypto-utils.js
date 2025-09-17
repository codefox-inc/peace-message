import { createHash } from 'crypto';

// BN254 field modulus
const BN254_FIELD_MODULUS = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

/**
 * 文字列をNFC正規化してトリム
 * @param {string} text - 入力テキスト
 * @returns {string} 正規化されたテキスト
 */
export function normalizeText(text) {
    return text.normalize('NFC').trim().replace(/\r\n|\r/g, '\n');
}

/**
 * バイト配列をBN254フィールド要素に変換
 * @param {Uint8Array} bytes - バイト配列
 * @returns {BigInt} フィールド要素
 */
export function toField(bytes) {
    const hash = createHash('sha256').update(bytes).digest();
    const hashBigInt = BigInt('0x' + hash.toString('hex'));
    return hashBigInt % BN254_FIELD_MODULUS;
}

/**
 * 文字列をUTF-8エンコードしてフィールド要素に変換
 * @param {string} text - 入力文字列
 * @returns {BigInt} フィールド要素
 */
export function textToField(text) {
    const normalizedText = normalizeText(text);
    const utf8Bytes = new TextEncoder().encode(normalizedText);
    return toField(utf8Bytes);
}

/**
 * uint64をバイト配列に変換（ビッグエンディアン）
 * @param {number} value - 64ビット整数値
 * @returns {Uint8Array} バイト配列
 */
export function uint64ToBytes(value) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, BigInt(value), false); // ビッグエンディアン
    return new Uint8Array(buffer);
}

/**
 * uint256をバイト配列に変換（ビッグエンディアン）
 * @param {BigInt} value - 256ビット整数値
 * @returns {Uint8Array} バイト配列
 */
export function uint256ToBytes(value) {
    const hex = value.toString(16).padStart(64, '0');
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

/**
 * アドレスをバイト配列に変換
 * @param {string} address - イーサリアムアドレス（0x...）
 * @returns {Uint8Array} 20バイトの配列
 */
export function addressToBytes(address) {
    const hex = address.replace('0x', '').padStart(40, '0');
    const bytes = new Uint8Array(20);
    for (let i = 0; i < 20; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

/**
 * 複数のバイト配列を連結
 * @param {...Uint8Array} arrays - バイト配列のリスト
 * @returns {Uint8Array} 連結されたバイト配列
 */
export function concat(...arrays) {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}

/**
 * 簡易的なPoseidon2ハッシュシミュレーション
 * 実装では適切なPoseidonライブラリを使用すること
 * @param {BigInt[]} inputs - 入力フィールド要素の配列
 * @returns {BigInt} ハッシュ値
 */
export function mockPoseidon2(inputs) {
    if (inputs.length !== 2) {
        throw new Error('Poseidon2 requires exactly 2 inputs');
    }
    
    // 簡易実装: SHA256を使用してフィールド要素をシミュレート
    const combined = uint256ToBytes(inputs[0]);
    const input2Bytes = uint256ToBytes(inputs[1]);
    const concatenated = concat(combined, input2Bytes);
    return toField(concatenated);
}

/**
 * 簡易的なPoseidon5ハッシュシミュレーション
 * 実装では適切なPoseidonライブラリを使用すること
 * @param {BigInt[]} inputs - 入力フィールド要素の配列
 * @returns {BigInt} ハッシュ値
 */
export function mockPoseidon5(inputs) {
    if (inputs.length !== 5) {
        throw new Error('Poseidon5 requires exactly 5 inputs');
    }
    
    // 簡易実装: 全ての入力を連結してハッシュ
    let concatenated = new Uint8Array(0);
    for (const input of inputs) {
        const bytes = uint256ToBytes(input);
        concatenated = concat(concatenated, bytes);
    }
    return toField(concatenated);
}

/**
 * BigIntを16進数文字列に変換
 * @param {BigInt} value - BigInt値
 * @returns {string} 16進数文字列
 */
export function bigIntToHex(value) {
    return '0x' + value.toString(16);
}

/**
 * フィールド要素の検証
 * @param {BigInt} value - 検証するフィールド要素
 * @returns {boolean} 有効かどうか
 */
export function isValidFieldElement(value) {
    return value >= 0n && value < BN254_FIELD_MODULUS;
}