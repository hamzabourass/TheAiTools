import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { HOME_TOOL_PATH, isDisabledApi, isDisabledPage } from '@/lib/features';

const PUBLIC_PATHS = ['/', '/signin', '/terms', '/privacy'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Tools that are switched off are unreachable, signed in or not.
  if (isDisabledApi(path)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (isDisabledPage(path)) {
    return NextResponse.redirect(new URL(HOME_TOOL_PATH, request.url));
  }

  const isPublicRoute = PUBLIC_PATHS.includes(path) || path.startsWith('/api/auth');
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });
  if (!token) {
    if (path.startsWith('/api/')) {
      return NextResponse.json({ code: 'NOT_AUTHENTICATED', error: 'Not authenticated' }, { status: 401 });
    }
    const loginUrl = new URL('/signin', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon and public images
     * - api/auth routes (next-auth routes)
     */
    '/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|ico)$|api/auth).*)',
  ],
};
