"use client"

import { SignIn } from "@clerk/nextjs"
import Link from "next/link"
import { Zap } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 mb-8">
        <span className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
          <Zap size={16} className="text-white" />
        </span>
        SmartBooking
      </Link>

      {/* Clerk form renders in its own white card */}
      <SignIn fallbackRedirectUrl="/auth/redirect" />

      <p className="text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-emerald-600 hover:text-emerald-700 font-semibold transition">
          Create one free
        </Link>
      </p>

      <p className="text-xs text-slate-400 mt-4">
        Want to offer services?{" "}
        <Link href="/artisan-apply" className="text-emerald-500 hover:underline">
          Join as an artisan
        </Link>
      </p>
    </div>
  )
}
