import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { PATHS } from '@/lib/paths';

const PROTECTED_PREFIXES: string[] = [PATHS.PORTAL, PATHS.ADMIN];
const ADMIN_PREFIXES: string[] = [PATHS.ADMIN];
const AUTH_PAGES: string[] = [PATHS.LOGIN, PATHS.SIGNUP];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect portal routes — redirect to login
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = PATHS.LOGIN;
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes — require admin or editor role
  const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAdmin && user) {
    const { data: member } = await supabase
      .from('members')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!member || (member.role !== 'admin' && member.role !== 'editor')) {
      const portalUrl = request.nextUrl.clone();
      portalUrl.pathname = PATHS.PORTAL;
      portalUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(portalUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && AUTH_PAGES.includes(pathname)) {
    const portalUrl = request.nextUrl.clone();
    portalUrl.pathname = PATHS.PORTAL;
    return NextResponse.redirect(portalUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
