"use client"

import { SignUp } from "@clerk/nextjs"
import Link from "next/link"
import { Zap } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30 flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 mb-2">
        <span className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
          <Zap size={16} className="text-white" />
        </span>
        SmartBooking
      </Link>

      <p className="text-sm text-slate-500 mb-6">
        Creating a <span className="font-semibold text-slate-700">customer</span> account.{" "}
        <Link href="/artisan-apply" className="text-indigo-600 hover:underline font-medium">
          Join as artisan →
        </Link>
      </p>

      {/* Clerk form */}
      <SignUp fallbackRedirectUrl="/auth/redirect" />

      <p className="text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-indigo-600 hover:text-indigo-700 font-semibold transition">
          Sign in
        </Link>
      </p>
    </div>
  )
}
