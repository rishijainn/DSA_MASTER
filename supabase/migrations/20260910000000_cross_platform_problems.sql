-- Cross-platform problem tracking (Option A: match by normalized title).
-- Adds platform provenance + GFG columns and the normalized-title dedupe key.
-- The JS-side normalization lives in src/lib/normalize.ts and MUST agree with
-- the regexp below (lowercase, strip every non-alphanumeric char).

-- 1. New columns
alter table public.problems
  add column if not exists source text not null default 'leetcode',
  add column if not exists gfg_slug text,
  add column if not exists gfg_url text,
  add column if not exists normalized_title text;

-- 2. Backfill source. All current rows are LeetCode imports, except rows that
--    already carry a GFG url (live-logged by the extension before this change).
update public.problems set source = 'leetcode' where source is null;

update public.problems
  set source = 'gfg',
      gfg_slug = leetcode_slug,
      gfg_url = leetcode_url,
      leetcode_slug = ''
  where source = 'leetcode'
    and (leetcode_url ilike '%geeksforgeeks.org%' or leetcode_url ilike '%practice.geeksforgeeks.org%');

-- 3. Backfill the dedupe key for every existing row.
update public.problems
  set normalized_title = lower(regexp_replace(coalesce(title, ''), '[^a-zA-Z0-9]', '', 'g'))
  where normalized_title is null;

-- 4. Indexes for cross-platform lookup + platform-scoped slug lookups.
create index if not exists problems_user_normalized_title_idx on public.problems (user_id, normalized_title);
create index if not exists problems_user_gfg_slug_idx on public.problems (user_id, gfg_slug);
create index if not exists problems_user_source_idx on public.problems (user_id, source);

-- 5. Source domain check (idempotent so the migration can be re-run safely).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'problems_source_check') then
    alter table public.problems
      add constraint problems_source_check check (source in ('leetcode', 'gfg'));
  end if;
end $$;