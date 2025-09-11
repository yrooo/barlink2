import { NextRequest, NextResponse } from 'next/server';

// This route was referenced by Next.js build but doesn't exist
// Redirecting to the correct applications API endpoint
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/applications', request.url));
}

export async function POST(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/applications', request.url));
}

export async function PATCH(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/applications', request.url));
}