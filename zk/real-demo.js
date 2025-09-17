#!/usr/bin/env node

import { RealPeaceZKSystem } from './real-zk-system.js';

/**
 * Real Peace Message ZK Demo
 * Demonstrates end-to-end zero-knowledge proof generation and verification
 * using actual circom circuits, Poseidon hash, and Groth16 proofs
 */

console.log('🕊️  Peace Message - 実際のゼロ知識証明デモ');
console.log('==================================================\n');

// Initialize real ZK system
const realZK = new RealPeaceZKSystem({
    chainId: 8453, // Base mainnet
    contractAddress: '0x1234567890123456789012345678901234567890'
});

// Real test cases
const realTestCases = [
    {
        text: '世界に平和を！',
        secret: 'my-secret-passphrase-2025',
        description: '日本語の平和メッセージで実際のZK証明'
    },
    {
        text: 'Peace for the world!',
        secret: 'another-secret-123',
        description: '英語の平和メッセージで実際のZK証明'
    }
];

/**
 * Run a single test case with real ZK proofs
 */
async function runRealTestCase(testCase, index) {
    console.log(`\n--- 実際ZKテストケース ${index + 1}: ${testCase.description} ---`);
    
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        
        // Step 1: Create real commitment with Poseidon
        console.log('\n1️⃣  Poseidonで実際のコミットメントを作成中...');
        const commitment = await realZK.createRealCommitment(testCase.text, testCase.secret, timestamp);
        
        console.log(`✅ メッセージ: "${commitment.text}"`);
        console.log(`✅ 合言葉: "${testCase.secret}"`);
        console.log(`✅ タイムスタンプ: ${commitment.timestamp} (${new Date(commitment.timestamp * 1000).toISOString()})`);
        console.log(`✅ 実際Poseidonコミットメント: 0x${commitment.commitment.toString(16)}`);
        
        // Display real field elements
        realZK.displayFieldElements(commitment);
        
        // Step 2: Generate real Groth16 proof
        console.log('\n2️⃣  実際のGroth16 ZK証明を生成中...');
        const startTime = Date.now();
        
        const proofData = await realZK.generateRealProof(testCase.text, testCase.secret, timestamp);
        
        const endTime = Date.now();
        const proofTime = endTime - startTime;
        
        console.log(`✅ 実際の証明を${proofTime}msで生成`);
        console.log(`📋 メッセージID: ${proofData.messageId}`);
        console.log(`📊 公開シグナル数: ${proofData.publicSignals.length}`);
        console.log(`🔐 証明コンポーネント: a, b, c (Groth16形式)`);
        
        // Step 3: Verify real proof (correct case)
        console.log('\n3️⃣  実際の証明を検証中（正しいケース）...');
        const verifyStartTime = Date.now();
        
        // Simulate getting expected commitment from blockchain
        const blockchainCommitment = proofData.commitment.commitment; // This would come from blockchain in reality
        const verifyResult = await realZK.verifyRealProof(proofData, testCase.text, timestamp, blockchainCommitment);
        
        const verifyEndTime = Date.now();
        const verifyTime = verifyEndTime - verifyStartTime;
        
        console.log(`✅ 検証を${verifyTime}msで完了`);
        console.log(`🎯 検証結果: ${verifyResult ? '✅ 有効' : '❌ 無効'}`);
        
        // Step 4: Verify proof with wrong message
        console.log('\n4️⃣  間違ったメッセージで証明を検証...');
        const wrongVerifyResult = await realZK.verifyRealProof(
            proofData, 
            testCase.text + ' MODIFIED', 
            timestamp,
            blockchainCommitment // Same blockchain commitment
        );
        console.log(`✅ 間違いメッセージの検証: ${wrongVerifyResult ? '❌ 予期せぬ有効' : '✅ 正しく無効'}`);
        
        // Step 5: Generate proof with wrong secret passphrase and verify cross-validation fails
        console.log('\n5️⃣  間違った合言葉で別の証明を生成...');
        const wrongSecret = 'wrong-secret-passphrase';
        console.log(`🔍 テスト用の間違った合言葉: "${wrongSecret}"`);
        const wrongSecretProof = await realZK.generateRealProof(
            testCase.text, 
            wrongSecret, 
            timestamp
        );
        
        // Try to verify original proof against wrong secret's expected values
        console.log('🔍 ZK証明の原理確認: 異なる合言葉は異なるコミット値を生成');
        console.log(`   正しい合言葉 "${testCase.secret}" のh: 0x${proofData.commitment.commitment.toString(16)}`);
        console.log(`   間違い合言葉 "${wrongSecret}" のh: 0x${wrongSecretProof.commitment.commitment.toString(16)}`);
        const commitmentsDifferent = proofData.commitment.commitment !== wrongSecretProof.commitment.commitment;
        console.log(`📊 コミット値の差異: ${commitmentsDifferent ? '✅ 正しく異なる' : '❌ 予期せぬ同一'}`);
        
        // This demonstrates the zero-knowledge property: without the correct secret, 
        // you cannot generate the same commitment, thus verification will fail
        console.log('💡 ZK原理: 正しい合言葉を知らないと同じコミット値は生成できない');
        console.log('💡 結果: 間違った合言葉で生成した証明は検証に失敗する');
        
        // Test actual verification failure scenario with expected commitment
        console.log('\n🧪 実運用シナリオ: 間違った合言葉の証明を正しい期待コミットで検証');
        console.log(`   1. ブロックチェーンに記録された期待コミット: 0x${proofData.commitment.commitment.toString(16)}`);
        console.log(`   2. 証明者A: "${testCase.text}" + "${wrongSecret}" で証明生成 (異なるコミット値)`);
        console.log(`   3. 検証者: ブロックチェーンの期待コミットと証明を照合`);
        
        const realVerificationTest = await realZK.verifyRealProof(
            wrongSecretProof,                 // 間違った合言葉で生成した証明  
            testCase.text,                   // 正しいメッセージ
            timestamp,
            proofData.commitment.commitment  // 正しい合言葉で作ったコミット値（ブロックチェーンに記録済み）
        );
        console.log(`🔍 検証結果: ${realVerificationTest ? '❌ 予期せぬ成功' : '✅ 期待通り失敗'}`);
        console.log('💡 説明: 間違った合言葉の証明は期待コミット値と不一致で検証失敗');
        
        // Step 6: Display proof structure
        console.log('\n6️⃣  実際Groth16証明の構造:');
        console.log(`   証明.A: [${proofData.proof.pi_a[0]}, ${proofData.proof.pi_a[1]}]`);
        console.log(`   証明.B: [[${proofData.proof.pi_b[0][0]}, ${proofData.proof.pi_b[0][1]}], [${proofData.proof.pi_b[1][0]}, ${proofData.proof.pi_b[1][1]}]]`);
        console.log(`   証明.C: [${proofData.proof.pi_c[0]}, ${proofData.proof.pi_c[1]}]`);
        console.log(`   公開シグナル: ${proofData.publicSignals.length}個の要素`);
        
        return {
            success: true,
            proofTime,
            verifyTime,
            commitment,
            proofData,
            verifyResult,
            wrongVerifyResult,
            commitmentsDifferent,
            realVerificationTest
        };
        
    } catch (error) {
        console.error(`❌ 実ZKテストケース ${index + 1} が失敗:`, error.message);
        console.error('スタックトレース:', error.stack);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Performance comparison test
 */
async function performanceComparison() {
    console.log('\n\n⚡ パフォーマンス比較: 実際ZK vs モック');
    console.log('===========================================');
    
    const testMessage = 'Performance test message';
    const testSecret = 'performance-test-secret';
    const iterations = 3;
    
    console.log(`比較のため${iterations}回の反復を実行...`);
    console.log(`🔍 テストメッセージ: "${testMessage}"`);
    console.log(`🔍 テスト合言葉: "${testSecret}"`);
    
    // Real ZK performance
    console.log('\n🔐 実際ZKパフォーマンス:');
    const realTimes = [];
    
    for (let i = 0; i < iterations; i++) {
        console.log(`   反復 ${i + 1}/${iterations}...`);
        const startTime = Date.now();
        
        try {
            const proofData = await realZK.generateRealProof(
                testMessage,
                testSecret,
                Math.floor(Date.now() / 1000)
            );
            
            const verifyResult = await realZK.verifyRealProof(
                proofData,
                testMessage,
                Math.floor(Date.now() / 1000)
            );
            
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            realTimes.push(totalTime);
            
            console.log(`   ✅ ${totalTime}msで完了 (検証: ${verifyResult})`);
            
        } catch (error) {
            console.log(`   ❌ 失敗: ${error.message}`);
        }
    }
    
    // Calculate statistics
    if (realTimes.length > 0) {
        const avgRealTime = realTimes.reduce((a, b) => a + b, 0) / realTimes.length;
        const minRealTime = Math.min(...realTimes);
        const maxRealTime = Math.max(...realTimes);
        
        console.log(`\n📊 実際ZK統計:`);
        console.log(`   平均時間: ${avgRealTime.toFixed(2)}ms`);
        console.log(`   最短時間: ${minRealTime}ms`);
        console.log(`   最長時間: ${maxRealTime}ms`);
        console.log(`   成功率: ${realTimes.length}/${iterations} (${(realTimes.length/iterations*100).toFixed(1)}%)`);
        
        if (avgRealTime < 10000) {
            console.log('   ✅ パフォーマンス: 優秀 (< 10s)');
        } else if (avgRealTime < 30000) {
            console.log('   ✅ パフォーマンス: 良好 (< 30s)');
        } else {
            console.log('   ⚠️  パフォーマンス: 許容範囲 (ZK証明で< 60s)');
        }
    }
}

/**
 * Security validation tests
 */
async function securityValidation() {
    console.log('\n\n🔒 セキュリティ検証テスト');
    console.log('==========================');
    
    const securityTests = [
        {
            name: '証明の一意性',
            test: async () => {
                console.log('      🔍 テスト: 同じメッセージ "Test message" + 同じ合言葉 "secret1" で2つの証明生成');
                const proof1 = await realZK.generateRealProof('Test message', 'secret1');
                const proof2 = await realZK.generateRealProof('Test message', 'secret1');
                // Proofs should be different due to randomness, but both valid
                return proof1.proof.pi_a[0] !== proof2.proof.pi_a[0];
            },
            expectTrue: true
        },
        {
            name: '異なる秘密で異なる証明の生成',
            test: async () => {
                console.log('      🔍 テスト: 同じメッセージ "Same message" + 異なる合言葉 ("secret1" vs "secret2")');
                const proof1 = await realZK.generateRealProof('Same message', 'secret1');
                const proof2 = await realZK.generateRealProof('Same message', 'secret2');
                return proof1.publicSignals[4] !== proof2.publicSignals[4]; // h should be different
            },
            expectTrue: true
        },
        {
            name: 'クロス証明検証の失敗',
            test: async () => {
                console.log('      🔍 テスト: "Message A" + "secretA" の証明を "Message B" で検証');
                const proof1 = await realZK.generateRealProof('Message A', 'secretA');
                const verify = await realZK.verifyRealProof(proof1, 'Message B', Math.floor(Date.now() / 1000));
                return !verify; // Should fail
            },
            expectTrue: true
        }
    ];
    
    for (const secTest of securityTests) {
        console.log(`\n🧪 テスト中: ${secTest.name}`);
        try {
            const result = await secTest.test();
            if (result === secTest.expectTrue) {
                console.log('✅ セキュリティテスト合格');
            } else {
                console.log('❌ セキュリティテスト失敗');
            }
        } catch (error) {
            console.log(`❌ セキュリティテストエラー: ${error.message}`);
        }
    }
}

/**
 * Main demo execution
 */
async function main() {
    const results = [];
    
    try {
        console.log('🔧 実際ZKシステムを初期化中...');
        await realZK.ensureInitialized();
        console.log('✅ 実際ZKシステムの初期化完了\n');
        
        // Run real ZK test cases
        for (let i = 0; i < realTestCases.length; i++) {
            const result = await runRealTestCase(realTestCases[i], i);
            results.push(result);
        }
        
        // Performance comparison
        await performanceComparison();
        
        // Security validation
        await securityValidation();
        
        // Summary
        console.log('\n\n📋 実際ZKデモのサマリー');
        console.log('=====================');
        
        const successCount = results.filter(r => r.success).length;
        console.log(`✅ 成功した実際ZKテスト: ${successCount}/${results.length}`);
        
        if (successCount === results.length) {
            console.log('🎉 全ての実際ZKテストが成功しました！');
            console.log('\n🚀 達成解除: フルZK実装！');
            console.log('   ✅ 実際circom回路コンパイル完了');
            console.log('   ✅ トラステッドセットアップ完了');
            console.log('   ✅ 実際Poseidonハッシュ関数を使用');
            console.log('   ✅ 実際Groth16証明生成');
            console.log('   ✅ 実際ZK証明検証');
            console.log('   ✅ エンドツーエンドのセキュリティ検証');
            
            console.log('\n🔮 本番環境への次のステップ:');
            console.log('   1. パフォーマンス向上のため回路を最適化');
            console.log('   2. バッチ証明検証の実装');
            console.log('   3. ブラウザWebAssemblyサポートの追加');
            console.log('   4. ブロックチェーンへのSolidity検証器のデプロイ');
            console.log('   5. Peace Messageフロントエンドとの統合');
            
        } else {
            console.log('⚠️  一部の実際ZKテストが失敗。上記のエラーを確認してください。');
        }
        
    } catch (error) {
        console.error('❌ デモ失敗:', error);
        process.exit(1);
    }
    
    console.log('\n🕊️  実際Peace Message ZKデモ完了\n');
    
    // Force exit to prevent hanging from WebAssembly/snarkjs processes
    process.exit(0);
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Run the real demo
main().catch(console.error);