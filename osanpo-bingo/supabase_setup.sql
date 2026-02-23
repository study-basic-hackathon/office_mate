-- =====================================================================
-- おさんぽビンゴ — Supabase SQL セットアップ
-- Supabase ダッシュボード → SQL Editor に貼り付けて実行してください
-- =====================================================================

-- ── rooms テーブル ────────────────────────────────────────────────────
create table if not exists rooms (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,          -- 5文字のルームコード
  items       jsonb not null default '[]',   -- 24項目の文字列配列
  found_cells int[] not null default '{12}', -- 開いているセルの index 配列（12 = FREE）
  photos      jsonb not null default '{}',   -- { "cellIndex": "https://..." }
  season      text not null default '',
  theme       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- updated_at を自動更新するトリガー
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rooms_updated_at
  before update on rooms
  for each row execute function update_updated_at();

-- ── collection テーブル ───────────────────────────────────────────────
create table if not exists collection (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid references rooms(id) on delete set null,
  room_snapshot jsonb not null default '{}',  -- ビンゴ達成時点の rooms 行全体
  bingo_count   int  not null default 0,
  created_at    timestamptz not null default now()
);

-- ── RLS（Row Level Security）─────────────────────────────────────────
-- 今回はシンプルに anon キーから読み書きを許可
-- 本番では auth.uid() などでユーザーごとに制限を強化してください

alter table rooms      enable row level security;
alter table collection enable row level security;

create policy "rooms: anyone can read"
  on rooms for select using (true);

create policy "rooms: anyone can insert"
  on rooms for insert with check (true);

create policy "rooms: anyone can update"
  on rooms for update using (true);

create policy "collection: anyone can read"
  on collection for select using (true);

create policy "collection: anyone can insert"
  on collection for insert with check (true);

-- ── Storage バケット ──────────────────────────────────────────────────
-- Supabase ダッシュボード → Storage → New bucket でも作成できます
insert into storage.buckets (id, name, public)
values ('bingo-photos', 'bingo-photos', true)
on conflict (id) do nothing;

create policy "bingo-photos: public read"
  on storage.objects for select
  using (bucket_id = 'bingo-photos');

create policy "bingo-photos: anyone can upload"
  on storage.objects for insert
  with check (bucket_id = 'bingo-photos');

create policy "bingo-photos: anyone can update"
  on storage.objects for update
  using (bucket_id = 'bingo-photos');
