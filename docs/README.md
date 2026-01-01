# Specs (MVP)

この docs は「実装の根拠」を置く場所です。

## ドキュメント一覧
- [00-glossary.md](00-glossary.md): 用語定義
- [10-product-brief.md](10-product-brief.md): 目的 / ゴール / 非ゴール
- [20-user-stories.md](20-user-stories.md): ユースケース（誰が何をしたいか）
- [30-requirements.md](30-requirements.md): 要件（Must/Should/Could）
- [40-api.md](40-api.md): API 契約（エンドポイント、リクエスト/レスポンス）
- [50-ui.md](50-ui.md): 画面/コンポーネント最小設計
- [60-data.md](60-data.md): データモデル、制約、状態
- [70-acceptance-tests.md](70-acceptance-tests.md): 受け入れ条件（Given/When/Then）
- [80-release-notes.md](80-release-notes.md): リリースメモ

## 更新ルール
- 実装変更が入るPRは、関連する docs も更新する
- 迷ったら [30-requirements.md](30-requirements.md) に追記してから実装する
- 未決定事項は `TBD:` で明示して前に進む
