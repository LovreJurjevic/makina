import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    console.log('Received sign-in request.')
    const tempResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => tempResponse.cookies.set(name, value, options))
                },
            },
        }
    )

    const form = await request.formData()
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    // Prepare redirect depending on outcome and copy cookies set by the Supabase client
    if (error) {
        const redirect = NextResponse.redirect(new URL('/login?error=invalid', request.url))
        tempResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value, c.options))
        return redirect
    }

    const redirect = NextResponse.redirect(new URL('/dashboard', request.url))
    tempResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value, c.options))
    return redirect
}
