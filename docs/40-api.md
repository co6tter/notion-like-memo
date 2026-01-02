# API Spec (MVP)

## Architecture
- **Frontend**: Next.js App Router (Server Components + Client Components)
- **Backend**: Supabase (Postgres + Auth)
- **API Layer**: Next.js Route Handlers (`/app/api/*`) + Server Actions
- **Data Fetching**: Supabase Client SDK

## Auth
- **認証方式**: Supabase Auth (Magic Link / Email + Password)
- **セッション管理**: Cookie-based (Supabase Auth Helpers for Next.js)
- **権限**: ユーザーは自分のページのみ CRUD 可能（Row Level Security）

## API Endpoints

### Pages API

#### `GET /api/pages`
**Purpose:** ページ一覧取得

**Headers:**
- `Authorization: Bearer <supabase_access_token>` (Cookie経由で自動付与)
- **Note:** Supabase Client初期化には新しい `sb_publishable_` キーを使用（Legacy `anon` keyは非推奨）

**Query Parameters:**
- `q`: string (optional) - 検索クエリ（タイトル・本文を全文検索）
- `limit`: number (optional, default: 50) - 取得件数
- `offset`: number (optional, default: 0) - オフセット

**Response 200:**
```json
{
  "pages": [
    {
      "id": "uuid",
      "title": "My First Page",
      "content": {...},
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T12:00:00Z",
      "userId": "uuid"
    }
  ],
  "total": 42
}
```

**Errors:**
- `401 Unauthorized` - 未認証
- `500 Internal Server Error` - サーバーエラー

---

#### `GET /api/pages/:id`
**Purpose:** 特定ページの取得

**Path Parameters:**
- `id`: string (UUID) - ページID

**Response 200:**
```json
{
  "id": "uuid",
  "title": "My First Page",
  "content": {
    "blocks": [
      {
        "id": "block-uuid-1",
        "type": "heading1",
        "content": "Welcome",
        "order": 0
      },
      {
        "id": "block-uuid-2",
        "type": "paragraph",
        "content": "This is my first note.",
        "order": 1
      }
    ]
  },
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T12:00:00Z",
  "userId": "uuid"
}
```

**Errors:**
- `401 Unauthorized` - 未認証
- `403 Forbidden` - 他人のページへのアクセス
- `404 Not Found` - ページが存在しない
- `500 Internal Server Error`

---

#### `POST /api/pages`
**Purpose:** 新規ページ作成

**Request Body:**
```json
{
  "title": "New Page",
  "content": {
    "blocks": []
  }
}
```

**Validation (Zod):**
- `title`: string (max 200 chars, optional)
- `content.blocks`: array (optional, default: [])

**Response 201:**
```json
{
  "id": "uuid",
  "title": "New Page",
  "content": {"blocks": []},
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z",
  "userId": "uuid"
}
```

**Errors:**
- `400 Bad Request` - バリデーションエラー
- `401 Unauthorized`
- `500 Internal Server Error`

---

#### `PATCH /api/pages/:id`
**Purpose:** ページ更新（自動保存用）

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": {
    "blocks": [
      {
        "id": "block-uuid-1",
        "type": "paragraph",
        "content": "Updated content",
        "order": 0
      }
    ]
  }
}
```

**Validation (Zod):**
- `title`: string (max 200 chars, optional)
- `content.blocks`: array (optional)

**Response 200:**
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "content": {...},
  "updatedAt": "2025-01-01T12:30:00Z"
}
```

**Errors:**
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

---

#### `DELETE /api/pages/:id`
**Purpose:** ページ削除

**Response 204:**
- No Content

**Errors:**
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

---

## Data Models (TypeScript)

### Page
```typescript
interface Page {
  id: string // UUID
  title: string
  content: PageContent
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
  userId: string // UUID (Supabase Auth User ID)
}
```

### PageContent
```typescript
interface PageContent {
  blocks: Block[]
}

interface Block {
  id: string // UUID
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'orderedList'
  content: string // Plain text or formatted text (Tiptap JSON)
  order: number // Block順序
}
```

---

## Server Actions (Alternative API)

MVPでは、Route HandlersではなくNext.js Server Actionsを使うことも検討:

```typescript
// app/actions/pages.ts
'use server'

export async function createPage(data: { title?: string }) { ... }
export async function updatePage(id: string, data: Partial<Page>) { ... }
export async function deletePage(id: string) { ... }
export async function getPages(query?: string) { ... }
export async function getPage(id: string) { ... }
```

**推奨**: Server Actions（理由: 型安全、クライアントでの呼び出しがシンプル）

---

## Notes
- Supabase RLS (Row Level Security) で、ユーザーは自分のページのみアクセス可能に制御
- 自動保存はデバウンス（1秒）して `PATCH /api/pages/:id` を呼び出す
- 検索は Postgres Full-Text Search (FTS) を使用（初期MVPでは `ILIKE` でも可）
