import { NextRequest, NextResponse } from 'next/server';

// This route was referenced by Next.js build but doesn't exist
// Redirecting to the correct interview API endpoint
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/interviews', request.url));
}

export async function POST(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/interviews', request.url));
}