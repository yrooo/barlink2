import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/api/users/profile',
  '/api/applications',
  '/api/jobs/employer',
  '/api/interviews'
];

// Define public routes that should redirect authenticated users
const authRoutes = [
  '/auth/signin',
  '/auth/signup'
];

// Define admin routes that require specific roles
const adminRoutes = [
  '/admin'
];

// Define employer routes
const employerRoutes = [
  '/dashboard',
  '/api/jobs/employer'
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  const { pathname } = req.nextUrl;
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is an employer route
  const isEmployerRoute = employerRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/signin', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && session) {
    // Get user profile to determine redirect destination
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (profile?.role === 'pencari_kandidat') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard/my-applications', req.url));
    }
  }
  
  // Role-based access control
  if (session) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    // Admin route protection
    if (isAdminRoute && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // Employer route protection
    if (isEmployerRoute && profile?.role !== 'pencari_kandidat') {
      return NextResponse.redirect(new URL('/dashboard/my-applications', req.url));
    }
  }
  
  // Handle API routes authentication
  if (pathname.startsWith('/api/')) {
    // Skip auth for public API routes
    const publicApiRoutes = [
      '/api/auth',
      '/api/users/register',
      '/api/jobs' // GET requests for job listings
    ];
    
    const isPublicApiRoute = publicApiRoutes.some(route => 
      pathname.startsWith(route)
    );
    
    if (!isPublicApiRoute && !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  // Refresh session if needed
  if (session) {
    await supabase.auth.getUser();
  }
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};