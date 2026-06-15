import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { STORAGE_KEYS } from './utils/constants';

// Define public/auth routes that shouldn't require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract token and role from cookies
  const token = request.cookies.get(STORAGE_KEYS.ACCESS_TOKEN)?.value;
  const role = request.cookies.get('ims_user_role')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  
  // Define dashboard prefix routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isTeacherRoute = pathname.startsWith('/teacher');
  const isStudentRoute = pathname.startsWith('/student');
  const isPrivateRoute = isAdminRoute || isTeacherRoute || isStudentRoute;

  // 1. If not logged in and trying to access private page -> redirect to /login
  if (!token && isPrivateRoute) {
    const loginUrl = new URL('/login', request.url);
    // Keep track of the original page to redirect back after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If logged in and trying to access login/signup -> redirect to dashboard
  if (token && isPublicRoute) {
    let dashboardPath = '/login';
    if (role === 'ADMIN') dashboardPath = '/admin/dashboard';
    else if (role === 'TEACHER') dashboardPath = '/teacher/dashboard';
    else if (role === 'STUDENT') dashboardPath = '/student/dashboard';
    
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // 3. If logged in and trying to access private page -> check role permissions
  if (token && isPrivateRoute) {
    if (isAdminRoute && role !== 'ADMIN') {
      // User is not admin, redirect to their proper dashboard
      return redirectToProperDashboard(role, request);
    }
    if (isTeacherRoute && role !== 'TEACHER') {
      // User is not teacher, redirect to their proper dashboard
      return redirectToProperDashboard(role, request);
    }
    if (isStudentRoute && role !== 'STUDENT') {
      // User is not student, redirect to their proper dashboard
      return redirectToProperDashboard(role, request);
    }
  }

  // Allow request to proceed
  return NextResponse.next();
}

/**
 * Redirects user to their role-appropriate dashboard if they try to access
 * an unauthorized section.
 */
function redirectToProperDashboard(role: string | undefined, request: NextRequest) {
  let dashboardPath = '/login';
  if (role === 'ADMIN') dashboardPath = '/admin/dashboard';
  else if (role === 'TEACHER') dashboardPath = '/teacher/dashboard';
  else if (role === 'STUDENT') dashboardPath = '/student/dashboard';
  
  return NextResponse.redirect(new URL(dashboardPath, request.url));
}

// Configure middleware matching path rules
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (local images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
