#!/usr/bin/env node

import { PeaceMessage } from './peace-message.js';
import { 
    normalizeText, 
    textToField, 
    isValidFieldElement,
    bigIntToHex 
} from './crypto-utils.js';

/**
 * Peace Message ZKP テストスイート
 * 各機能の詳細なテストを実行
 */

console.log('🧪 Peace Message - Test Suite');
console.log('=============================\n');

let testsPassed = 0;
let testsTotal = 0;

/**
 * テスト結果を記録
 */
function assert(condition, testName) {
    testsTotal++;
    if (condition) {
        console.log(`✅ ${testName}`);
        testsPassed++;
    } else {
        console.log(`❌ ${testName}`);
    }
}

/**
 * エラーが期待されるテスト
 */
function assertThrows(fn, testName) {
    testsTotal++;
    try {
        fn();
        console.log(`❌ ${testName} - Expected error but none thrown`);
    } catch (error) {
        console.log(`✅ ${testName}`);
        testsPassed++;
    }
}

/**
 * 文字列正規化テスト
 */
function testStringNormalization() {
    console.log('📝 Testing String Normalization');
    console.log('--------------------------------');
    
    // 基本的な正規化
    assert(normalizeText('  hello world  ') === 'hello world', 'Basic trim test');
    assert(normalizeText('hello\r\nworld') === 'hello\nworld', 'CRLF to LF conversion');
    assert(normalizeText('hello\rworld') === 'hello\nworld', 'CR to LF conversion');
    
    // Unicode正規化
    const decomposed = 'é'; // e + combining acute accent
    const composed = 'é';   // precomposed character
    assert(normalizeText(decomposed) === normalizeText(composed), 'Unicode NFC normalization');
    
    // 日本語
    const japanese = '世界に平和を';
    assert(normalizeText(japanese) === japanese, 'Japanese text preservation');
    
    // 絵文字
    const emoji = '🕊️ Peace 🌍';
    assert(normalizeText(emoji) === emoji, 'Emoji preservation');
    
    console.log('');
}

/**
 * フィールド要素変換テスト
 */
function testFieldConversion() {
    console.log('🔢 Testing Field Element Conversion');
    console.log('-----------------------------------');
    
    // 基本的な変換
    const text = 'Hello, World!';
    const fieldElement = textToField(text);
    
    assert(typeof fieldElement === 'bigint', 'Field element is BigInt');
    assert(isValidFieldElement(fieldElement), 'Field element is valid');
    assert(fieldElement > 0n, 'Field element is positive');
    
    // 同じ入力は同じ出力
    const fieldElement2 = textToField(text);
    assert(fieldElement === fieldElement2, 'Deterministic field conversion');
    
    // 異なる入力は異なる出力（高確率）
    const fieldElement3 = textToField(text + '!');
    assert(fieldElement !== fieldElement3, 'Different inputs produce different outputs');
    
    // 空文字列のテスト
    const emptyField = textToField('');
    assert(isValidFieldElement(emptyField), 'Empty string produces valid field element');
    
    console.log('');
}

/**
 * PeaceMessage基本機能テスト
 */
function testPeaceMessageBasics() {
    console.log('🕊️  Testing PeaceMessage Basics');
    console.log('--------------------------------');
    
    const peaceMessage = new PeaceMessage();
    
    // インスタンス作成
    assert(peaceMessage.chainId === 8453, 'Default chain ID is Base mainnet');
    assert(peaceMessage.scheme === 1, 'Default scheme is 1');
    
    // カスタム設定
    const customPeaceMessage = new PeaceMessage({
        chainId: 1,
        contractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
    });
    assert(customPeaceMessage.chainId === 1, 'Custom chain ID set correctly');
    
    console.log('');
}

/**
 * コミットメント作成テスト
 */
function testCommitmentCreation() {
    console.log('🔐 Testing Commitment Creation');
    console.log('-------------------------------');
    
    const peaceMessage = new PeaceMessage();
    const text = '世界に平和を！';
    const secret = 'my-secret-passphrase';
    const timestamp = 1704067200; // 固定タイムスタンプ
    
    // 正常なコミットメント作成
    const commitment = peaceMessage.createCommitment(text, secret, timestamp);
    
    assert(commitment.text === text, 'Text preserved correctly');
    assert(commitment.secret === secret, 'Secret preserved correctly');
    assert(commitment.timestamp === timestamp, 'Timestamp preserved correctly');
    assert(typeof commitment.commitment === 'bigint', 'Commitment is BigInt');
    assert(isValidFieldElement(commitment.commitment), 'Commitment is valid field element');
    
    // フィールド要素の検証
    assert(isValidFieldElement(commitment.fieldElements.textHashF), 'textHashF is valid');
    assert(isValidFieldElement(commitment.fieldElements.chainIdF), 'chainIdF is valid');
    assert(isValidFieldElement(commitment.fieldElements.contractF), 'contractF is valid');
    assert(isValidFieldElement(commitment.fieldElements.tsBucketF), 'tsBucketF is valid');
    assert(isValidFieldElement(commitment.fieldElements.sF), 'sF is valid');
    assert(isValidFieldElement(commitment.fieldElements.d), 'd is valid');
    assert(isValidFieldElement(commitment.fieldElements.h), 'h is valid');
    
    // 決定論的性質のテスト
    const commitment2 = peaceMessage.createCommitment(text, secret, timestamp);
    assert(commitment.commitment === commitment2.commitment, 'Commitment creation is deterministic');
    
    // 異なる秘密で異なるコミットメント
    const commitment3 = peaceMessage.createCommitment(text, secret + '!', timestamp);
    assert(commitment.commitment !== commitment3.commitment, 'Different secrets produce different commitments');
    
    console.log('');
}

/**
 * エラーハンドリングテスト
 */
function testErrorHandling() {
    console.log('🚨 Testing Error Handling');
    console.log('--------------------------');
    
    const peaceMessage = new PeaceMessage();
    
    // 空のメッセージ
    assertThrows(
        () => peaceMessage.createCommitment('', 'secret'),
        'Empty message throws error'
    );
    
    // 空の秘密
    assertThrows(
        () => peaceMessage.createCommitment('message', ''),
        'Empty secret throws error'
    );
    
    // 秘密に改行
    assertThrows(
        () => peaceMessage.createCommitment('message', 'secret\nwith\nbreaks'),
        'Secret with line breaks throws error'
    );
    
    // 秘密にタブ
    assertThrows(
        () => peaceMessage.createCommitment('message', 'secret\twith\ttabs'),
        'Secret with tabs throws error'
    );
    
    // スペースのみのメッセージ
    assertThrows(
        () => peaceMessage.createCommitment('   ', 'secret'),
        'Whitespace-only message throws error'
    );
    
    // スペースのみの秘密
    assertThrows(
        () => peaceMessage.createCommitment('message', '   '),
        'Whitespace-only secret throws error'
    );
    
    console.log('');
}

/**
 * プルーフ生成・検証テスト
 */
function testProofGeneration() {
    console.log('🔒 Testing Proof Generation & Verification');
    console.log('--------------------------------------------');
    
    const peaceMessage = new PeaceMessage();
    const text = 'Test message for proof';
    const secret = 'test-secret-key';
    const timestamp = Math.floor(Date.now() / 1000);
    
    // 証明生成
    const proofData = peaceMessage.generateProof(text, secret, timestamp);
    
    assert(Array.isArray(proofData.publicInputs), 'Public inputs is array');
    assert(proofData.publicInputs.length === 5, 'Public inputs has 5 elements');
    assert(typeof proofData.proof === 'object', 'Proof is object');
    assert(Array.isArray(proofData.proof.a), 'Proof.a is array');
    assert(Array.isArray(proofData.proof.b), 'Proof.b is array');
    assert(Array.isArray(proofData.proof.c), 'Proof.c is array');
    
    // 正しい検証
    const verifyResult = peaceMessage.verifyProof(proofData, text, timestamp);
    assert(verifyResult === true, 'Correct proof verification passes');
    
    // 間違ったメッセージでの検証
    const wrongVerifyResult = peaceMessage.verifyProof(proofData, text + ' modified', timestamp);
    assert(wrongVerifyResult === false, 'Wrong message proof verification fails');
    
    // 間違ったタイムスタンプでの検証
    const wrongTimeVerifyResult = peaceMessage.verifyProof(proofData, text, timestamp + 60);
    assert(wrongTimeVerifyResult === false, 'Wrong timestamp proof verification fails');
    
    console.log('');
}

/**
 * パフォーマンスと一貫性テスト
 */
function testConsistency() {
    console.log('🎯 Testing Consistency & Performance');
    console.log('-------------------------------------');
    
    const peaceMessage = new PeaceMessage();
    const iterations = 5;
    const text = 'Consistency test message';
    const secret = 'consistency-secret';
    
    const commitments = [];
    const startTime = Date.now();
    
    // 複数回実行して一貫性をチェック
    for (let i = 0; i < iterations; i++) {
        const timestamp = 1704067200 + i; // 異なるタイムスタンプ
        const commitment = peaceMessage.createCommitment(text, secret, timestamp);
        commitments.push(commitment);
    }
    
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / iterations;
    
    // 各コミットメントは異なるはず（タイムスタンプが違うため）
    const uniqueCommitments = new Set(commitments.map(c => c.commitment.toString()));
    assert(uniqueCommitments.size === iterations, 'Different timestamps produce different commitments');
    
    // 同じ条件では同じ結果
    const sameConditionCommitment1 = peaceMessage.createCommitment(text, secret, 1704067200);
    const sameConditionCommitment2 = peaceMessage.createCommitment(text, secret, 1704067200);
    assert(
        sameConditionCommitment1.commitment === sameConditionCommitment2.commitment,
        'Same conditions produce same commitments'
    );
    
    console.log(`⏱️  Average commitment creation time: ${avgTime.toFixed(2)}ms`);
    assert(avgTime < 100, 'Commitment creation is reasonably fast (< 100ms)');
    
    console.log('');
}

/**
 * エッジケーステスト
 */
function testEdgeCases() {
    console.log('🧩 Testing Edge Cases');
    console.log('----------------------');
    
    const peaceMessage = new PeaceMessage();
    
    // 非常に長いメッセージ
    const longMessage = 'A'.repeat(1000);
    const longCommitment = peaceMessage.createCommitment(longMessage, 'secret');
    assert(isValidFieldElement(longCommitment.commitment), 'Long message produces valid commitment');
    
    // Unicode文字、絵文字、特殊文字
    const unicodeMessage = '🕊️ こんにちは世界 🌍 Señor café naïve résumé';
    const unicodeCommitment = peaceMessage.createCommitment(unicodeMessage, 'unicode-secret');
    assert(isValidFieldElement(unicodeCommitment.commitment), 'Unicode message produces valid commitment');
    
    // 最小タイムスタンプ
    const minCommitment = peaceMessage.createCommitment('message', 'secret', 0);
    assert(isValidFieldElement(minCommitment.commitment), 'Minimum timestamp produces valid commitment');
    
    // 最大32bit整数タイムスタンプ
    const maxCommitment = peaceMessage.createCommitment('message', 'secret', 2147483647);
    assert(isValidFieldElement(maxCommitment.commitment), 'Maximum timestamp produces valid commitment');
    
    // 異なるチェーンIDでの動作確認
    const ethereumPeaceMessage = new PeaceMessage({ chainId: 1 });
    const polygonPeaceMessage = new PeaceMessage({ chainId: 137 });
    
    const ethCommitment = ethereumPeaceMessage.createCommitment('message', 'secret', 1704067200);
    const polyCommitment = polygonPeaceMessage.createCommitment('message', 'secret', 1704067200);
    
    assert(
        ethCommitment.commitment !== polyCommitment.commitment,
        'Different chain IDs produce different commitments'
    );
    
    console.log('');
}

/**
 * テストスイート実行
 */
async function runAllTests() {
    console.log('Starting comprehensive test suite...\n');
    
    testStringNormalization();
    testFieldConversion();
    testPeaceMessageBasics();
    testCommitmentCreation();
    testErrorHandling();
    testProofGeneration();
    testConsistency();
    testEdgeCases();
    
    // 結果サマリー
    console.log('📊 Test Results');
    console.log('================');
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsTotal - testsPassed}`);
    console.log(`📈 Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);
    
    if (testsPassed === testsTotal) {
        console.log('\n🎉 All tests passed! The ZKP implementation is working correctly.');
        console.log('\n🔧 Ready for integration with:');
        console.log('   • Real Poseidon hash functions');
        console.log('   • Circom ZK circuits');
        console.log('   • Groth16 proof system');
        console.log('   • Blockchain integration');
    } else {
        console.log(`\n⚠️  ${testsTotal - testsPassed} test(s) failed. Please review and fix issues.`);
        process.exit(1);
    }
    
    console.log('');
}

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// テスト実行
runAllTests().catch(console.error);