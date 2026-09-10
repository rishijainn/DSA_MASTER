export type ProblemSource = 'leetcode' | 'gfg'

// Canonical dedupe identity for a problem: lowercase, then strip every
// non-alphanumeric character (removes punctuation and all spacing) so "Two
// Sum", "two-sum", and "TwoSum" all collapse to "twosum". Used to match the
// same problem across LeetCode and GFG. MUST mirror the SQL backfill in
// supabase/migrations/20260910000000_cross_platform_problems.sql.
export function normalizeTitle(title: unknown): string {
  return String(title ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 200)
}

// Standard platform-slug sanitization (lowercase, keep only [a-z0-9-]).
export function cleanSlug(slug: unknown): string {
  return typeof slug === 'string'
    ? slug.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase().slice(0, 100)
    : ''
}

export function leetcodeSlugUrl(slug: string): string {
  return `https://leetcode.com/problems/${slug}/`
}

export function gfgSlugUrl(slug: string): string {
  return `https://www.geeksforgeeks.org/problems/${slug}/`
}