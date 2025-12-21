// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    
    if (isAdminRoute) {
      // For admin routes, check if user is admin
      if (!token || token.role !== 'admin') {
        // Redirect non-admin users to home
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // For admin routes, require authentication and admin role
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token && token.role === 'admin';
        }
        
        // For protected routes, require authentication
        if (
          req.nextUrl.pathname.startsWith('/account') ||
          req.nextUrl.pathname.startsWith('/cart') ||
          req.nextUrl.pathname.startsWith('/checkout')
        ) {
          return !!token;
        }
        
        // For public routes, allow everyone
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/cart/:path*',
    '/checkout/:path*',
  ],
};