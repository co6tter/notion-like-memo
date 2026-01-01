# Data & State (MVP)

## Database (Supabase Postgres)

### Tables

#### `pages`
```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{"blocks": []}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_pages_updated_at ON pages(updated_at DESC);
CREATE INDEX idx_pages_title ON pages USING gin(to_tsvector('english', title)); -- Full-text search

-- Trigger for updated_at
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Fields:**
- `id`: UUID (Primary Key) - ページID
- `title`: TEXT - ページタイトル（最大200文字、アプリ側でバリデーション）
- `content`: JSONB - ページコンテンツ（ブロックの配列を含む）
- `created_at`: TIMESTAMPTZ - 作成日時
- `updated_at`: TIMESTAMPTZ - 更新日時（自動更新）
- `user_id`: UUID (Foreign Key) - 所有者のユーザーID（Supabase Auth）

**Constraints:**
- `title`: 最大200文字（アプリ側で制限）
- `content`: 有効なJSONB形式
- `user_id`: Supabase Auth の `auth.users(id)` を参照

---

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Policy: ユーザーは自分のページのみ閲覧可能
CREATE POLICY "Users can view their own pages"
  ON pages FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: ユーザーは自分のページのみ作成可能
CREATE POLICY "Users can create their own pages"
  ON pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: ユーザーは自分のページのみ更新可能
CREATE POLICY "Users can update their own pages"
  ON pages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: ユーザーは自分のページのみ削除可能
CREATE POLICY "Users can delete their own pages"
  ON pages FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Data Models (TypeScript)

### `Page`
```typescript
interface Page {
  id: string // UUID
  title: string
  content: PageContent
  createdAt: string // ISO 8601 timestamp
  updatedAt: string // ISO 8601 timestamp
  userId: string // UUID
}
```

### `PageContent`
```typescript
interface PageContent {
  blocks: Block[]
}

interface Block {
  id: string // UUID（クライアント側で生成）
  type: BlockType
  content: string // Plain text or Tiptap JSON string
  order: number // ブロックの順序（0始まり）
}

type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'orderedList'
```

**Alternative: Tiptap JSON format**
```typescript
// Tiptap native JSON format
interface TiptapContent {
  type: 'doc'
  content: TiptapNode[]
}

interface TiptapNode {
  type: string // 'paragraph', 'heading', 'bulletList', etc.
  attrs?: Record<string, any> // 例: { level: 1 } for heading
  content?: TiptapNode[]
  text?: string
  marks?: Array<{ type: string; attrs?: Record<string, any> }>
}
```

**推奨**: Tiptap JSON形式をそのまま `content` に保存（シンプル、Tiptap標準）

---

## Client State Management

### State Management Stack
- **Global State**: TanStack Query（サーバーキャッシュ）
- **Local State**: React `useState` / `useReducer`
- **Form State**: React Hook Form

---

### TanStack Query (React Query)

#### Pages List Query
```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['pages'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data as Page[]
  }
})
```

#### Single Page Query
```typescript
const { data: page, isLoading, error } = useQuery({
  queryKey: ['pages', pageId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single()
    if (error) throw error
    return data as Page
  }
})
```

#### Page Mutations
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Create Page
const createPageMutation = useMutation({
  mutationFn: async (newPage: Partial<Page>) => {
    const { data, error } = await supabase
      .from('pages')
      .insert([newPage])
      .select()
      .single()
    if (error) throw error
    return data as Page
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['pages'] })
  }
})

// Update Page (with debounce)
const updatePageMutation = useMutation({
  mutationFn: async ({ id, updates }: { id: string; updates: Partial<Page> }) => {
    const { data, error } = await supabase
      .from('pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Page
  },
  onSuccess: (data) => {
    queryClient.setQueryData(['pages', data.id], data)
    queryClient.invalidateQueries({ queryKey: ['pages'] })
  }
})

// Delete Page
const deletePageMutation = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['pages'] })
  }
})
```

---

## Application States

### Page List States
- **Loading**: ページ一覧読み込み中
- **Empty**: ページが0件
- **Success**: ページ一覧表示
- **Error**: 読み込み失敗

### Page Editor States
- **Loading**: ページ読み込み中
- **Editing**: 編集中（入力中）
- **Saving**: 保存中（自動保存トリガー後）
- **Saved**: 保存完了
- **Error**: 保存失敗またはページ読み込み失敗

### Auto-save Flow
```
User edits → debounce (2s) → trigger mutation → saving state → success/error
```

---

## Validation (Zod)

### Page Schema
```typescript
import { z } from 'zod'

const blockSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['paragraph', 'heading1', 'heading2', 'heading3', 'bulletList', 'orderedList']),
  content: z.string(),
  order: z.number().int().min(0)
})

const pageContentSchema = z.object({
  blocks: z.array(blockSchema)
})

const pageSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().max(200).default(''),
  content: pageContentSchema.default({ blocks: [] }),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  userId: z.string().uuid().optional()
})

export type Page = z.infer<typeof pageSchema>
export type Block = z.infer<typeof blockSchema>
export type PageContent = z.infer<typeof pageContentSchema>
```

---

## Search Implementation

### Option 1: Postgres Full-Text Search (FTS) - 推奨（MVP）
```sql
-- Create GIN index for full-text search
CREATE INDEX idx_pages_title_fts ON pages USING gin(to_tsvector('english', title));
CREATE INDEX idx_pages_content_fts ON pages USING gin(to_tsvector('english', content::text));
```

```typescript
// Query with FTS
const { data, error } = await supabase
  .from('pages')
  .select('*')
  .or(`title.ilike.%${query}%, content::text.ilike.%${query}%`)
  .order('updated_at', { ascending: false })
```

### Option 2: Simple ILIKE (MVP最小)
```typescript
const { data, error } = await supabase
  .from('pages')
  .select('*')
  .or(`title.ilike.%${query}%, content::text.ilike.%${query}%`)
```

---

## Notes
- `content` フィールドはJSONB形式でTiptapのネイティブJSON構造を保存
- 自動保存はデバウンス（2秒）を使用してAPIコール回数を削減
- RLSにより、ユーザーは自分のページのみアクセス可能
- 検索はMVPでは `ILIKE` で十分、将来的にFTSまたはMeilisearchに移行可能
