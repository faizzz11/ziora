import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup' || path === '/' || path === '/suspended';

  // Check if user is authenticated by looking for user data in cookies
  const isAuthenticated = request.cookies.has('user');

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users to login page
  if (!isAuthenticated && path.startsWith('/select')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/select/:path*', '/login', '/signup', '/', '/contact', '/about']
}; 