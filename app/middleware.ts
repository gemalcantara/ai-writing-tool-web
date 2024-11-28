import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/share/')) {
    const userCookie = request.cookies.get('user')
    if (!userCookie || !verifyToken(JSON.parse(userCookie.value).session)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/share/:path*'
}