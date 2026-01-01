# User Stories

## Primary Users
- 個人ユーザー（学生、社会人、クリエイター）
- メモやアイデアを整理したい人
- シンプルなドキュメント作成ツールを求めている人

## Stories (MVP)

### 1. ページ管理
1. As a **User**, I want to **新しいページを作成**する so that **新しいメモを書き始められる**.
   - Notes: トップページから「新規ページ」ボタンで作成
   - Out of scope: テンプレートからの作成

2. As a **User**, I want to **ページ一覧を見る** so that **過去のメモを探せる**.
   - Notes: サイドバーまたはホーム画面に一覧表示
   - Out of scope: フォルダ/階層構造での整理

3. As a **User**, I want to **ページを削除**する so that **不要なメモを整理できる**.
   - Notes: 削除確認ダイアログを表示
   - Out of scope: ゴミ箱機能（削除は即座に実行）

### 2. エディタ機能
4. As a **User**, I want to **ページにタイトルをつける** so that **メモを識別しやすくする**.
   - Notes: ページ上部にタイトル入力欄
   - Out of scope: 絵文字アイコン

5. As a **User**, I want to **ブロック単位でコンテンツを編集**する so that **構造化されたメモを作成できる**.
   - Notes: 段落、見出し（H1/H2/H3）、箇条書き、番号付きリストに対応
   - Out of scope: チェックボックス、引用、コードブロック

6. As a **User**, I want to **マークダウン記法を使える** so that **素早くフォーマットできる**.
   - Notes: `#` で見出し、`-` で箇条書き、`**bold**`、`*italic*` など
   - Out of scope: 高度なマークダウン（表、リンクカードなど）

7. As a **User**, I want to **編集内容が自動保存される** so that **データを失わない**.
   - Notes: 一定時間後（例: 2秒）に自動保存
   - Out of scope: 手動保存ボタン（自動のみ）

### 3. 基本操作
8. As a **User**, I want to **ページを検索**する so that **目的のメモを素早く見つけられる**.
   - Notes: タイトルと本文を対象に全文検索
   - Out of scope: タグ検索、フィルタ機能

9. As a **User**, I want to **ページの作成日時・更新日時を確認**できる so that **いつ書いたか把握できる**.
   - Notes: ページ下部またはメタ情報欄に表示
   - Out of scope: 更新履歴の詳細表示
