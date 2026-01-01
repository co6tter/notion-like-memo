# Product Brief

## Goal
- Notion風のシンプルなメモアプリのMVPを作成する
- ブロックベースのエディタで、直感的にメモを作成・編集・削除できる
- マークダウン記法に対応し、見出し・リスト・テキスト装飾を使える

## Non-Goal
- リアルタイム共同編集（複数ユーザーの同時編集）
- ページの共有機能・権限管理
- データベース機能（テーブルビュー、カレンダービューなど）
- ページのテンプレート機能
- 画像・ファイルのアップロード
- コメント機能
- バージョン履歴
- モバイルアプリ（WebのみでMVP）

## Success Metrics (optional)
- ページ作成から保存まで3秒以内
- エディタ操作のレスポンスタイム100ms以内
- ページ読み込み時間1秒以内

## Constraints / Tech Stack（MVP）

### Frontend
- **Framework**: Next.js（App Router） + React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui（任意） / Headless UI（任意）
- **State / Server Cache**: TanStack Query（推奨）
- **Forms**: React Hook Form
- **Validation**: Zod
- **Editor（Notion風）**: Tiptap（ProseMirror）

### Backend / BaaS
- **BaaS**: Supabase
  - **Database**: Postgres（Supabase Postgres）
  - **Auth**: Supabase Auth
  - **Storage**: Supabase Storage（画像/添付）
  - **Realtime（任意）**: Supabase Realtime（将来の共同編集など）
  - **Edge Functions（任意）**: Supabase Edge Functions（Webhook / 重い処理の分離）

### Data / Search
- **Primary store**: Postgres（pages / blocks）
- **Search（MVP）**: Postgres 全文検索（FTS）
- **Search（将来）**: Meilisearch / Typesense（必要になったら）

### Testing / Quality Gate ✅
- **Unit**: Vitest + React Testing Library
- **E2E**: Playwright（重要シナリオ最小）
- **Lint / Format**: ESLint + Prettier（or Biome：採用するなら統一）
- **Pre-commit hooks**: Lefthook / Husky（任意）

### CI / CD 🚀
- **CI**: GitHub Actions
  - lint → test → build を必須ゲート
- **Deploy**:
  - Frontend: Vercel
  - Backend: Supabase（DB/Auth/Storage）

### Observability（MVPでは最小）🔎
- **Error tracking**: Sentry（任意）
- **Logging**: Vercel logs / Supabase logs
- **Analytics（任意）**: Plausible / GA 等（後回しOK）

---

### Project Conventions（おすすめ）
- **Package manager**: pnpm
- **Env management**: `.env.local`（機密はCI/HostingのSecretsで管理）
- **Branching**: PRベース（main直push禁止）
- **Docs-first**: 変更があるPRは `docs/` も更新する

---

### Open Questions / TBD（必要ならここに残す）
- TBD: Editorの拡張範囲（table / embed / slash command など）
- TBD: 権限モデル（個人用→将来共有の想定）
- TBD: ブロック保存形式（JSON / block table / hybrid）
