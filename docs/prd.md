# 要求定義（Peace Message @ DX拠点）

## 目的

来訪者が「平和のメッセージ」を残し、**本人だけが後日（またはその場）に“自分が書いた”と証明できる**体験を提供する。メッセージは公開、本人性は秘密の合言葉とZKPで担保。DBは持たない。

## スコープ

* メッセージ投稿（オンチェーン記録）
* 証明の生成（フロントでZK証明を生成）
* 証明の検証（Verifierコントラクトのreadでtrue/false）
* 待機画面（RPCでイベント購読・一覧アニメ表示）
* 体験用“証明書QR”の表示（お土産配布はしない／写真は任意）

## ステークホルダー

来訪者、鑑賞者／メディア、拠点スタッフ（オペレーション）、開発チーム（フロント・コントラクト）

## ユーザー体験（基本フロー）

1. 待機画面で最新メッセージが流れる
2. 端末でメッセージ入力 → 合言葉入力 → 投稿
3. チェーンに「メッセージ + コミットメントh」を記録（イベントemit）
4. 本人確認したい時：Etherscan/BaseScanのTxを読み込み → 合言葉入力 → フロントでZK証明生成 → “証明書QR”をその場表示
5. 検証UIがQRを読み取り、Verifierコントラクトへread → true/falseを即表示

## 機能要件

### 1. メッセージ投稿

* チェーン：Base Mainnet（chainId=8453）
* コントラクト：`PeaceLog`（イベントemit用）
* イベント（仕様固定・将来用にscheme付与）

  ```
  event PeaceMessage(
    bytes32 indexed messageId,
    string  text,      // 正規化済み本文（公開）
    bytes32 h,         // コミットメント
    string  kioskId,   // 端末ID
    uint64  ts,        // 端末時刻 or block時刻
    uint8   scheme     // v=1
  );
  ```
* コミットメント定義（ZK互換）
  `h = Poseidon([textHashF, chainIdF, contractF, kioskIdF, tsBucketF, sF])`

  * `textHashF`：正規化本文のバイト列→PoseidonBytes→field
  * `tsBucketF`：`floor(ts/60)`
  * `sF`：合言葉のUTF-8/NFCをbytes→field
* ガス：拠点側ウォレットで負担（EOAでOK）。Paymasterは不要。

### 2. 合言葉入力ルール

* UTF-8 / Unicode NFC / 1行のみ（改行・タブ禁止）
* 前後trim、制御文字禁止
* 文字数：推奨8〜64（上限100）
* 多言語：日本語・英語・中国語（簡/繁）・韓国語対応（表示フォント：Noto系）

### 3. 証明生成（フロント）

* 方式：Groth16またはPLONK（小回路・QR収容のため）
* 入力：`s`（端末内のみ）、公開入力（下記）
* 出力：proof（毎回ランダムで異なる）
* 公開入力の順序（固定）
  `[textHashF, chainIdF, contractF, kioskIdF, tsBucketF, h]`
  ※ 有効期限つきにする場合は `t_issue`（UNIX秒）や `ttlSec` を追加

### 4. 検証

* コントラクト：`PeaceVerifier`（自動生成Verifierをラップして `verifyProof(...) returns (bool)` を提供）
* 呼び出し：`eth_call`（readのみ・ガス不要）
* 検証UIはQRから`txHash`を取得→チェーンのイベントを再取得→公開入力を再構成→`verifyProof`呼び出し→結果表示

### 5. 待機画面

* RPC購読（WS推奨、HTTPポーリングでも可）で `PeaceMessage` を取得
* メモリのみ保持（リングバッファ）
* カード/ティッカーでアニメ表示、各カードに「証明する」ボタン

### 6. 体験用“証明書QR”

* その場表示のみ（配布・保存なし）。写真撮影は可。
* ペイロード例（概略）：

  ```
  { tx, h, pub:{...}, proof:{...} }  // Base64url圧縮
  ```
* 検証WebはこのQRを読み、`tx`からイベントを突合してread検証

## 非機能要件

* セキュリティ：`s`は端末外へ送らない／入力後即メモリクリア
* プライバシ：本文は公開前提。個人情報を書かない注意表示
* パフォーマンス：証明生成 3–15秒目安（端末性能で変動）、検証は瞬時
* 可用性：ネットが落ちた場合は「ローカル一致チェックのみ」の案内を表示（本番検証は要ネット）
* 国際化：UI言語は日・英・中・韓の切替スイッチ

## 制約・前提

* DBなし（永続保存しない）
* 検証はreadのみ（オンチェーン書き込みなし）
* Poseidonパラメータ、正規化ルール、公開入力順序は仕様固定（`scheme=1`）

## 受け入れ基準（抜粋）

* メッセージ投稿で、Etherscan/BaseScanに本文と`h`が表示される
* 正しい`s`で生成したproofが`verifyProof`=true、異なる`s`ではfalse
* 同じ入力でも証明（proof）は毎回異なるが、常にtrue
* 待機画面に新着メッセージが流れ、指定カードから検証フローへ遷移できる
* 多言語入力が正しく正規化・検証される（NFCテスト含む）

## アウト・オブ・スコープ

* アカウント抽象化／ウォレット発行
* サーバサイドDB／ユーザ管理
* オンチェーンでの検証記録（write）

## リスクと対策（要点）

* 誤入力・異体字：NFC＋ガイド文＋プレビュー
* 端末性能不足：軽量回路（Poseidonベース）＋進捗UI
* 「コピー悪用」懸念：新しい証明を作れるのは本人のみ、を演出で周知
* 時限証明が必要な場合：公開入力に`t_issue`/`ttlSec`を追加しVerifierで`block.timestamp`比較

## 成果物

* Solidity：`PeaceLog.sol`（イベント用）、`PeaceVerifier.sol`（Verifier + ラッパー）
* フロント：投稿UI、待機画面、証明生成UI、検証UI
* ZK資材：回路（circom等）、wasm/zkey、公開鍵（vk）、検証ABI
* 運用手順：拠点端末セットアップガイド、注意表示文（多言語）

## オープン事項（初期決め）

* ZK方式：Groth16 か PLONK
* `ts`の基準：端末時刻 or block時刻（演出と実装の整合）
* 有効期限を使うか：使うなら`TTL`仕様を確定
* イベントの`kioskId`命名規則
