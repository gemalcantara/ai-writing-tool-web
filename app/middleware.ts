import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: '/share/:path*'
}