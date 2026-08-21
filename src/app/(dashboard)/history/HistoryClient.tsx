'use client'

import { useState } from 'react'

interface Problem {
    id: string
    title: string
    difficulty: string
    leetcode_url: string
    hint_used: boolean
    felt_difficulty: string
    review_count: number
    next_review_date: string
    last_reviewed_at: string
    created_at: string
    stability: number
}

function difficultyBadge(d: string) {
    if (d === 'hard') return { color: '#f85149', bg: 'rgba(248,81,73,0.12)', border: 'rgba(248,81,73,0.3)' }
    if (d === 'medium') return { color: '#d29922', bg: 'rgba(210,153,34,0.12)', border: 'rgba(210,153,34,0.3)' }
    return { color: '#3fb950', bg: 'rgba(63,185,80,0.12)', border: 'rgba(63,185,80,0.3)' }
}

function rankBadge(difficulty: string) {
    if (difficulty === 'hard') return { label: 'S', color: '#f85149', bg: 'rgba(248,81,73,0.15)', border: 'rgba(248,81,73,0.4)' }
    if (difficulty === 'medium') return { label: 'A', color: '#d29922', bg: 'rgba(210,153,34,0.15)', border: 'rgba(210,153,34,0.4)' }
    return { label: 'B', color: '#388bfd', bg: 'rgba(56,139,253,0.15)', border: 'rgba(56,139,253,0.4)' }
}

function formatDate(dateStr: string) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysUntil(dateStr: string) {
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const todayMs = new Date(`${todayStr}T00:00:00`).getTime()
    const dueMs = new Date(`${dateStr}T00:00:00`).getTime()
    const diff = Math.round((dueMs - todayMs) / (1000 * 60 * 60 * 24))
    if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: '#d29922' }
    if (diff === 0) return { text: 'Due today', color: '#58a6ff' }
    return { text: `In ${diff}d`, color: '#484f58' }
}

export default function HistoryClient({ problems }: { problems: Problem[] }) {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
    const [sort, setSort] = useState<'newest' | 'oldest' | 'most_reviewed' | 'due_soon'>('newest')

    const filtered = problems
        .filter(p => {
            const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
            const matchFilter = filter === 'all' || p.difficulty === filter
            return matchSearch && matchFilter
        })
        .sort((a, b) => {
            if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            if (sort === 'most_reviewed') return b.review_count - a.review_count
            if (sort === 'due_soon') return new Date(a.next_review_date).getTime() - new Date(b.next_review_date).getTime()
            return 0
        })

    const totalReviews = problems.reduce((a, p) => a + p.review_count, 0)
    const hintCount = problems.filter(p => p.hint_used).length

    return (
        <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 24px' }}>

                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ color: '#e6edf3', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>Problem History</h1>
                    <p style={{ color: '#8b949e', fontSize: '13px', margin: 0 }}>Every problem you&apos;ve ever tracked — all in one place</p>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total tracked', value: problems.length, color: '#a78bfa' },
                        { label: 'Total reviews', value: totalReviews, color: '#58a6ff' },
                        { label: 'Used hint/AI', value: hintCount, color: '#d29922' },
                        { label: 'Clean solves', value: problems.length - hintCount, color: '#3fb950' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '10px', padding: '14px 16px' }}>
                            <p style={{ color: '#484f58', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace', margin: '0 0 6px 0' }}>{s.label}</p>
                            <p style={{ color: s.color, fontFamily: 'monospace', fontWeight: '800', fontSize: '22px', margin: 0 }}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', background: '#161b22', border: '1px solid #21262d', borderRadius: '8px', padding: '8px 14px' }}>
                        <span style={{ color: '#484f58', fontSize: '13px' }}>🔍</span>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search problems..."
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#e6edf3', fontSize: '13px', width: '100%' }}
                        />
                    </div>

                    {/* Difficulty filter */}
                    <div style={{ display: 'flex', gap: '4px', background: '#161b22', border: '1px solid #21262d', borderRadius: '8px', padding: '4px' }}>
                        {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{ padding: '5px 12px', borderRadius: '5px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', border: 'none', background: filter === f ? '#21262d' : 'transparent', color: filter === f ? '#e6edf3' : '#484f58', textTransform: 'capitalize' }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <select
                        value={sort}
                        onChange={e => setSort(e.target.value as 'newest' | 'oldest' | 'most_reviewed' | 'due_soon')}
                        style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '8px', padding: '8px 12px', color: '#8b949e', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="most_reviewed">Most reviewed</option>
                        <option value="due_soon">Due soon</option>
                    </select>
                </div>

                {/* Results count */}
                <p style={{ color: '#484f58', fontSize: '12px', fontFamily: 'monospace', marginBottom: '12px' }}>
                    {filtered.length} problem{filtered.length !== 1 ? 's' : ''} found
                </p>

                {/* Table */}
                {filtered.length === 0 ? (
                    <div style={{ background: '#161b22', border: '1px dashed #21262d', borderRadius: '10px', padding: '48px 24px', textAlign: 'center' }}>
                        <p style={{ color: '#484f58', fontSize: '14px', margin: 0 }}>
                            {search || filter !== 'all' ? 'No problems match your filters.' : 'No problems tracked yet. Solve something on LeetCode or GFG!'}
                        </p>
                    </div>
                ) : (
                    <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '10px', overflow: 'hidden' }}>
                        {/* Table header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 80px 80px 80px 100px 90px', gap: '0', padding: '10px 16px', borderBottom: '1px solid #21262d', background: '#0d1117' }}>
                            {['#', 'Problem', 'Difficulty', 'Reviews', 'Hint used', 'Next review', 'Added'].map(h => (
                                <p key={h} style={{ color: '#484f58', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{h}</p>
                            ))}
                        </div>

                        {/* Rows */}
                        {filtered.map((p, i) => {
                            const diff = difficultyBadge(p.difficulty)
                            const rank = rankBadge(p.difficulty)
                            const nextReview = daysUntil(p.next_review_date)
                            return (
                                <div
                                    key={p.id}
                                    style={{ display: 'grid', gridTemplateColumns: '32px 1fr 80px 80px 80px 100px 90px', gap: '0', padding: '12px 16px', borderBottom: i < filtered.length - 1 ? '1px solid #21262d' : 'none', alignItems: 'center', cursor: 'pointer', transition: 'background 0.1s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    onClick={() => window.open(p.leetcode_url, '_blank')}
                                >
                                    {/* Rank badge */}
                                    <div style={{ width: '22px', height: '22px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: rank.bg, border: `1px solid ${rank.border}` }}>
                                        <span style={{ color: rank.color, fontWeight: '800', fontSize: '9px' }}>{rank.label}</span>
                                    </div>

                                    {/* Title */}
                                    <p style={{ color: '#e6edf3', fontSize: '13px', fontWeight: '500', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '12px' }}>{p.title}</p>

                                    {/* Difficulty */}
                                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', textTransform: 'capitalize', color: diff.color, background: diff.bg, border: `1px solid ${diff.border}`, width: 'fit-content' }}>
                                        {p.difficulty}
                                    </span>

                                    {/* Reviews */}
                                    <p style={{ color: '#8b949e', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>{p.review_count}×</p>

                                    {/* Hint used */}
                                    <p style={{ color: p.hint_used ? '#d29922' : '#3fb950', fontSize: '11px', margin: 0, fontWeight: '600' }}>
                                        {p.hint_used ? '⚠ Yes' : '✓ No'}
                                    </p>

                                    {/* Next review */}
                                    <p style={{ color: nextReview.color, fontSize: '11px', fontFamily: 'monospace', margin: 0 }}>{nextReview.text}</p>

                                    {/* Added */}
                                    <p style={{ color: '#484f58', fontSize: '11px', fontFamily: 'monospace', margin: 0 }}>{formatDate(p.created_at)}</p>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}