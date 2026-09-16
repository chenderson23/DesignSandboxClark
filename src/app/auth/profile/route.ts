import { NextResponse } from 'next/server';

// Stub profile endpoint for Auth0Provider (v4).
// Returns null so useUser() resolves to { user: undefined } without a 404.
export function GET() {
  return NextResponse.json(null);
}
