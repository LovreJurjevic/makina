import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

export async function proxy(request: NextRequest) {

  const { user, response } = await updateSession(request)

  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    console.log('User is not authenticated, redirecting to login.')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && request.nextUrl.pathname.startsWith('/login')) {
    console.log('User is already authenticated, redirecting to dashboard.')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}