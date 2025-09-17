# Peace Message - 実際のゼロ知識証明システム

Peace Messageアプリケーションの**実際の**ゼロ知識証明機能をNode.jsで実装したスタンドアローンスクリプト集です。

## 📋 概要

このディレクトリには、**本物のcircom回路、Poseidonハッシュ、Groth16証明**を使用してメッセージの作成・証明・検証を行うNode.jsスクリプトが含まれています。学術論文レベルの完全なzk-SNARKsシステムです。

## 🚀 クイックスタート

```bash
# zkディレクトリに移動
cd zk

# 依存関係をインストール
npm install

# 実際のZKデモを実行
npm run real-demo

# モックデモを実行（比較用）
npm run demo

# テストスイートを実行
npm run test
```

## 📁 ファイル構成

```
zk/
├── package.json              # パッケージ設定
├── README.md                 # このファイル
├── crypto-utils.js           # 暗号化ユーティリティ関数
├── peace-message.js          # PeaceMessageクラス（モック版）
├── real-zk-system.js         # 実際のZKシステム（メイン）
├── demo.js                  # モックデモスクリプト
├── real-demo.js             # 実際のZKデモスクリプト
├── test.js                  # 包括的テストスイート
├── circuits/
│   └── peace.circom         # ZK証明回路
├── build/                   # コンパイル済み回路
│   └── peace_js/
│       ├── peace.wasm       # 回路のWebAssembly
│       └── ...
└── setup/                   # 信頼できるセットアップファイル
    ├── peace_fixed_final.zkey # 証明キー
    └── verification_key_fixed.json # 検証キー
```

## 🔧 機能

### RealPeaceZKSystemクラス

実際のZKP機能を提供するメインクラス：

- **メッセージ正規化**: NFC正規化、トリム、改行統一
- **フィールド要素変換**: 文字列をBN254フィールド要素に変換
- **実際のPoseidonハッシュ**: poseidon-liteライブラリによる真正なハッシュ
- **実際のZK証明生成**: snarkjs + circomによる本物のGroth16証明
- **暗号学的検証**: 検証キーを使った真正な証明検証

### 暗号化ユーティリティ

- `normalizeText()` - 文字列の正規化
- `textToField()` - 文字列をフィールド要素に変換
- `toField()` - バイト配列をフィールド要素に変換
- `realPoseidon2()` / `realPoseidon5()` - 実際のPoseidonハッシュ関数
- `uint256ToBytes()` / `uint64ToBytes()` - 整数のバイト配列変換
- `isValidFieldElement()` - BN254フィールド要素の検証

## 🎯 使用例

### 基本的な使用方法

```javascript
import { RealPeaceZKSystem } from './real-zk-system.js';

const realZK = new RealPeaceZKSystem({
    chainId: 8453, // Base mainnet
    contractAddress: '0x1234567890123456789012345678901234567890'
});

// システム初期化
await realZK.ensureInitialized();

// 実際のメッセージコミットメント作成
const commitment = await realZK.createRealCommitment(
    '世界に平和を！',           // メッセージ
    'my-secret-passphrase',   // 秘密のパスフレーズ
    Math.floor(Date.now() / 1000)  // タイムスタンプ
);

// 実際のZK証明生成（Groth16）
const proofData = await realZK.generateRealProof(
    '世界に平和を！',
    'my-secret-passphrase',
    Math.floor(Date.now() / 1000)
);

// 暗号学的証明検証
const isValid = await realZK.verifyRealProof(
    proofData,
    '世界に平和を！',
    Math.floor(Date.now() / 1000)
);

console.log('ZK証明は有効:', isValid);
```

### コミットメント詳細表示

```javascript
// 実際のフィールド要素の詳細表示
realZK.displayFieldElements(commitment);

// 出力例:
// === 実際のZKフィールド要素 ===
// textHashF:  0x35452eeb806b03617fbdc80ce1311f2e...
// chainIdF:   0x21a3985e023f694761a78576271add54...
// contractF:  0x375257011ecf7819f26cb40aeb86456f...
// tsBucketF:  0x819061cd9e6954cdcd70dd2785223da4...
// sF:         0x2bfe4659c9adc7870d8c4f5f61e34267...
// d:          0x2e7451ddce4e106f45a18231a3cf2ad9...
// h:          0x28658a3b3445d2259e52cf1b1081219d...
// 全フィールド要素が有効: true
// 🎯 実際のPoseidonハッシュ関数を使用中！
```

## 🧪 テストスイート

`test.js`では以下のテストを実行します：

### 基本機能テスト
- ✅ 文字列正規化（NFC、trim、改行変換）
- ✅ フィールド要素変換の決定性
- ✅ PeaceMessageクラスの初期化
- ✅ コミットメント作成の一貫性

### セキュリティテスト
- ✅ 空メッセージ/秘密の拒否
- ✅ 改行・タブを含む秘密の拒否
- ✅ Unicode文字の適切な処理
- ✅ 異なる入力での異なる出力確認

### 証明システムテスト
- ✅ ZK証明生成の構造検証
- ✅ 正しい証明の検証成功
- ✅ 不正な証明の検証失敗
- ✅ QRペイロードサイズチェック

### エッジケーステスト
- ✅ 長いメッセージの処理
- ✅ 特殊Unicode文字・絵文字
- ✅ 異なるチェーンIDでの分離
- ✅ パフォーマンスチェック

## 📱 デモスクリプト

`demo.js`では以下のシナリオをデモンストレーションします：

1. **日本語平和メッセージ** - 「世界に平和を！」
2. **英語平和メッセージ** - 「Peace for the world!」  
3. **技術メッセージ** - 絵文字付きメッセージ

各シナリオで以下を実行：
- コミットメント作成
- ZK証明生成
- 正しい証明の検証
- 間違ったメッセージでの検証失敗確認
- QRペイロードサイズ確認

追加で以下のテストも実行：
- セキュリティテスト（不正入力の検証）
- パフォーマンステスト（10回実行の平均時間測定）

## ✅ 実装済み機能

現在の実装は**完全な実際のZKシステム**であり、以下を含みます：

1. **実際のPoseidonハッシュ**: poseidon-liteライブラリによる真正なPoseidon2/5関数
2. **実際のZK証明**: circom + snarkjsによる本物のGroth16 zk-SNARK証明
3. **暗号学的検証**: 検証キーを使った真正なzk-SNARK検証
4. **完全なセキュリティ**: 秘密を一切開示しないゼロ知識証明
5. **kioskId除外**: 仕様書から除外（ユーザーリクエストによる）

## 📊 パフォーマンス

- **証明生成時間**: 平均150-300ms
- **検証時間**: 平均15ms
- **回路制約数**: 1,352個のR1CS制約
- **公開入力数**: 5個（textHashF, chainIdF, contractF, tsBucketF, h）

## 🔮 本番環境への次のステップ

実装済みのZKシステムを本番環境に統合するための改善項目：

### 1. パフォーマンス最適化
```bash
# より効率的なcircom回路の設計
# バッチ証明検証の実装
```

### 2. ブラウザ対応
```bash
# WebAssemblyサポートの追加
# Web Workerでの証明生成
```

### 3. Solidity検証器
```bash
# ブロックチェーン上での証明検証
snarkjs zkey export solidityverifier setup/peace_fixed_final.zkey verifier.sol
```

### 4. フロントエンド統合
```bash
# Peace Messageアプリとの統合
# QRコードでの証明共有
```

## 🔗 関連ファイル

- `../docs/peace-message-zkp-spec.md` - 技術仕様書
- `../src/lib/mock-data.ts` - フロントエンド実装
- `../wrangler.toml` - Cloudflare Workers設定
- `circuits/peace.circom` - ZK証明回路
- `setup/verification_key_fixed.json` - 検証キー

## 📄 ライセンス

MIT License - 詳細は`../LICENSE`を参照してください。