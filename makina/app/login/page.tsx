'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const error = errorParam === 'invalid' ? 'Pogrešan email ili lozinka.' : null

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl overflow-hidden border-none">

        {/* HEADER: Solid blue with the thick yellow stripe underneath */}
        <div className="workshop-header">
          <h1 className="text-4xl font-black italic tracking-tighter">MAKINA</h1>
          <p className="text-blue-100/80 text-[10px] font-bold uppercase tracking-[0.4em] mt-1 ml-1">
            By Lovre Jurjević
          </p>
        </div>

        <div className="p-10">
          <form action="/api/auth/signin" method="post" className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                Email Adresa
              </Label>
              <Input
                name="email"
                type="email"
                placeholder="upišite email"
                required
                className="h-12 border-2 bg-slate-50/50 focus-visible:ring-primary placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                Lozinka
              </Label>
              <Input
                name="password"
                type="password"
                placeholder="upišite lozinku"
                required
                className="h-12 border-2 bg-slate-50/50 focus-visible:ring-primary placeholder:text-muted-foreground/50"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg border-l-4 border-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 bg-workshop-yellow hover:bg-yellow-300 text-accent-foreground font-black tracking-widest uppercase rounded-xl transition-all active:scale-[0.98] shadow-md shadow-yellow-500/10 mt-2"
            >
              PRIJAVI SE
            </Button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">
              Napravljeno za automehaničarski obrt Maki • 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}