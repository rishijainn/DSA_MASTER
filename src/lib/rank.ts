export type Rank = 'Beginner' | 'E-Class' | 'D-Class' | 'C-Class' | 'B-Class' | 'A-Class' | 'S-Class'

interface RankInfo {
    rank: Rank
    color: string
    bg: string
    border: string
    label: string
    glow: string
    min: number
    max: number
    next: number | null
    nextRank: Rank | null
}

export function getRankInfo(totalTracked: number): RankInfo {
    if (totalTracked >= 210) return {
        rank: 'S-Class', label: 'S', color: '#f85149', bg: 'rgba(248,81,73,0.15)', border: 'rgba(248,81,73,0.4)', glow: 'rgba(248,81,73,0.3)',
        min: 210, max: Infinity, next: null, nextRank: null
    }
    if (totalTracked >= 150) return {
        rank: 'A-Class', label: 'A', color: '#d29922', bg: 'rgba(210,153,34,0.15)', border: 'rgba(210,153,34,0.4)', glow: 'rgba(210,153,34,0.3)',
        min: 150, max: 209, next: 210, nextRank: 'S-Class'
    }
    if (totalTracked >= 100) return {
        rank: 'B-Class', label: 'B', color: '#388bfd', bg: 'rgba(56,139,253,0.15)', border: 'rgba(56,139,253,0.4)', glow: 'rgba(56,139,253,0.3)',
        min: 100, max: 149, next: 150, nextRank: 'A-Class'
    }
    if (totalTracked >= 60) return {
        rank: 'C-Class', label: 'C', color: '#3fb950', bg: 'rgba(63,185,80,0.15)', border: 'rgba(63,185,80,0.4)', glow: 'rgba(63,185,80,0.3)',
        min: 60, max: 99, next: 100, nextRank: 'B-Class'
    }
    if (totalTracked >= 30) return {
        rank: 'D-Class', label: 'D', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.4)', glow: 'rgba(167,139,250,0.3)',
        min: 30, max: 59, next: 60, nextRank: 'C-Class'
    }
    if (totalTracked >= 10) return {
        rank: 'E-Class', label: 'E', color: '#58a6ff', bg: 'rgba(88,166,255,0.15)', border: 'rgba(88,166,255,0.4)', glow: 'rgba(88,166,255,0.3)',
        min: 10, max: 29, next: 30, nextRank: 'D-Class'
    }
    return {
        rank: 'Beginner', label: '?', color: '#484f58', bg: 'rgba(72,79,88,0.15)', border: 'rgba(72,79,88,0.4)', glow: 'rgba(72,79,88,0.3)',
        min: 0, max: 9, next: 10, nextRank: 'E-Class'
    }
}

export function getRankProgress(totalTracked: number): number {
    const info = getRankInfo(totalTracked)
    if (!info.next) return 100
    return Math.round(((totalTracked - info.min) / (info.next - info.min)) * 100)
}