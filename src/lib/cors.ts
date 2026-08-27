import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://dsa-master-bice.vercel.app',
  'http://localhost:3000',
]

export function corsHeaders(request?: NextRequest) {
  const origin = request?.headers.get('origin') ?? ''

  // Allow requests with no Origin (extensions, server-side, curl)
  // Allow requests from known origins (our web app, localhost for dev)
  const allowed = !origin || ALLOWED_ORIGINS.includes(origin)

  return {
    'Access-Control-Allow-Origin': allowed ? (origin || '*') : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

export function handleOptions(request?: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) })
}
