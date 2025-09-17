#!/usr/bin/env node

import { PeaceMessage } from './peace-message.js';

/**
 * Peace Message ZKP デモスクリプト
 * メッセージ作成・証明生成・検証のフルフローをデモ
 */

console.log('🕊️  Peace Message - Zero-Knowledge Proof Demo');
console.log('================================================\n');

// PeaceMessageインスタンスを作成
const peaceMessage = new PeaceMessage({
    chainId: 8453, // Base mainnet
    contractAddress: '0x1234567890123456789012345678901234567890'
});

// デモデータ
const testCases = [
    {
        text: '世界に平和を！',
        secret: 'my-secret-passphrase-2025',
        description: 'Japanese peace message'
    },
    {
        text: 'Peace for the world!',
        secret: 'another-secret-123',
        description: 'English peace message'
    },
    {
        text: 'Let technology bring us together, not apart. 🌍',
        secret: 'tech-for-good',
        description: 'Technology message with emoji'
    }
];

/**
 * 単一のテストケースを実行
 */
async function runTestCase(testCase, index) {
    console.log(`\n--- Test Case ${index + 1}: ${testCase.description} ---`);
    
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        
        // Step 1: メッセージのコミットメント作成
        console.log('\n1️⃣  Creating commitment...');
        const commitment = peaceMessage.createCommitment(testCase.text, testCase.secret, timestamp);
        
        console.log(`✅ Message: "${commitment.text}"`);
        console.log(`✅ Timestamp: ${commitment.timestamp} (${new Date(commitment.timestamp * 1000).toISOString()})`);
        console.log(`✅ Commitment: ${commitment.commitment.toString(16)}`);
        
        // フィールド要素の詳細表示
        peaceMessage.displayFieldElements(commitment);
        
        // Step 2: ZK証明生成
        console.log('\n2️⃣  Generating ZK proof...');
        const proofData = peaceMessage.generateProof(testCase.text, testCase.secret, timestamp);
        
        console.log('✅ Proof generated successfully');
        console.log(`📋 Message ID: ${proofData.messageId}`);
        console.log(`📊 Public inputs count: ${proofData.publicInputs.length}`);
        console.log(`🔐 Proof structure: a[${proofData.proof.a.length}], b[${proofData.proof.b.length}], c[${proofData.proof.c.length}]`);
        
        // Step 3: 証明検証（正しいケース）
        console.log('\n3️⃣  Verifying proof (correct case)...');
        const verifyResult = peaceMessage.verifyProof(proofData, testCase.text, timestamp);
        console.log(`✅ Verification result: ${verifyResult ? '✅ VALID' : '❌ INVALID'}`);
        
        // Step 4: 証明検証（間違ったメッセージ）
        console.log('\n4️⃣  Verifying proof (wrong message)...');
        const wrongVerifyResult = peaceMessage.verifyProof(proofData, testCase.text + ' modified', timestamp);
        console.log(`✅ Verification result: ${wrongVerifyResult ? '❌ UNEXPECTED VALID' : '✅ CORRECTLY INVALID'}`);
        
        // Step 5: QRペイロード生成（シミュレーション）
        console.log('\n5️⃣  QR Payload simulation...');
        const qrPayload = {
            tx: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`, // 模擬tx hash
            pub: proofData.publicInputs,
            proof: proofData.proof
        };
        
        const qrJson = JSON.stringify(qrPayload, null, 2);
        const qrSize = new TextEncoder().encode(qrJson).length;
        console.log(`📱 QR payload size: ${qrSize} bytes`);
        if (qrSize > 1024) {
            console.log('⚠️  Warning: QR payload might be too large for QR codes');
        } else {
            console.log('✅ QR payload size acceptable');
        }
        
        return {
            success: true,
            commitment,
            proofData,
            verifyResult,
            wrongVerifyResult,
            qrSize
        };
        
    } catch (error) {
        console.error(`❌ Error in test case ${index + 1}:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * セキュリティテストケース
 */
async function runSecurityTests() {
    console.log('\n\n🔒 Security Tests');
    console.log('=================');
    
    const securityTests = [
        {
            name: 'Empty message',
            test: () => peaceMessage.createCommitment('', 'secret'),
            expectError: true
        },
        {
            name: 'Empty secret',
            test: () => peaceMessage.createCommitment('Hello', ''),
            expectError: true
        },
        {
            name: 'Secret with line break',
            test: () => peaceMessage.createCommitment('Hello', 'secret\nwith\nbreaks'),
            expectError: true
        },
        {
            name: 'Secret with tab',
            test: () => peaceMessage.createCommitment('Hello', 'secret\twith\ttab'),
            expectError: true
        },
        {
            name: 'Valid Unicode message',
            test: () => peaceMessage.createCommitment('こんにちは世界🌍', 'valid-secret'),
            expectError: false
        }
    ];
    
    for (const secTest of securityTests) {
        console.log(`\n🧪 Testing: ${secTest.name}`);
        try {
            const result = secTest.test();
            if (secTest.expectError) {
                console.log('❌ Expected error but got success');
            } else {
                console.log('✅ Test passed');
            }
        } catch (error) {
            if (secTest.expectError) {
                console.log(`✅ Correctly caught error: ${error.message}`);
            } else {
                console.log(`❌ Unexpected error: ${error.message}`);
            }
        }
    }
}

/**
 * パフォーマンステスト
 */
async function runPerformanceTest() {
    console.log('\n\n⚡ Performance Test');
    console.log('==================');
    
    const iterations = 10;
    const testMessage = 'Performance test message for benchmarking';
    const testSecret = 'performance-test-secret-key';
    
    console.log(`Running ${iterations} iterations...`);
    
    const startTime = Date.now();
    let successCount = 0;
    
    for (let i = 0; i < iterations; i++) {
        try {
            const proofData = peaceMessage.generateProof(
                testMessage, 
                testSecret, 
                Math.floor(Date.now() / 1000)
            );
            const isValid = peaceMessage.verifyProof(proofData, testMessage, Math.floor(Date.now() / 1000));
            if (isValid) successCount++;
        } catch (error) {
            console.error(`Iteration ${i + 1} failed:`, error.message);
        }
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;
    
    console.log(`\n📊 Performance Results:`);
    console.log(`   Total time: ${totalTime}ms`);
    console.log(`   Average time per iteration: ${avgTime.toFixed(2)}ms`);
    console.log(`   Success rate: ${successCount}/${iterations} (${(successCount/iterations*100).toFixed(1)}%)`);
    
    if (avgTime < 100) {
        console.log('✅ Performance: Excellent (< 100ms)');
    } else if (avgTime < 500) {
        console.log('✅ Performance: Good (< 500ms)');
    } else {
        console.log('⚠️  Performance: Could be improved (> 500ms)');
    }
}

/**
 * メインデモ実行
 */
async function main() {
    const results = [];
    
    // 基本テストケース実行
    for (let i = 0; i < testCases.length; i++) {
        const result = await runTestCase(testCases[i], i);
        results.push(result);
    }
    
    // セキュリティテスト実行
    await runSecurityTests();
    
    // パフォーマンステスト実行
    await runPerformanceTest();
    
    // 総合結果
    console.log('\n\n📋 Summary');
    console.log('==========');
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Successful test cases: ${successCount}/${results.length}`);
    
    if (successCount === results.length) {
        console.log('🎉 All tests passed successfully!');
        console.log('\n🔧 Next Steps:');
        console.log('   1. Implement real Poseidon hash functions');
        console.log('   2. Integrate with circom ZK circuits');
        console.log('   3. Add Groth16 proof generation/verification');
        console.log('   4. Test with actual blockchain integration');
    } else {
        console.log('⚠️  Some tests failed. Please review the errors above.');
    }
    
    console.log('\n🕊️  Peace Message ZKP Demo completed.\n');
}

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// デモ実行
main().catch(console.error);