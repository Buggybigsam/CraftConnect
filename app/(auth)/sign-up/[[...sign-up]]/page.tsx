"use client"

import { SignUp, useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import BrandIcon from "@/components/brand-icon"

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const { isLoaded, isSignedIn } = useAuth()
  const isArtisan = searchParams.get("role") === "artisan"
  const redirectUrl = isArtisan ? "/artisan-apply" : "/auth/redirect"

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    window.location.href = redirectUrl
  }, [isLoaded, isSignedIn, redirectUrl])

  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 mb-2">
        <BrandIcon className="h-9 w-9 rounded-xl shadow-md shadow-emerald-200 ring-1 ring-emerald-100" priority />
        CraftConnect
      </Link>

      <p className="text-sm text-slate-500 mb-6">
        Creating your <span className="font-semibold text-slate-700">{isArtisan ? "artisan" : "customer"}</span> account.
        {!isArtisan && (
          <>
            {" "}
            <Link href="/artisan-apply" className="text-emerald-600 hover:underline font-medium">
              Join as artisan →
            </Link>
          </>
        )}
      </p>

      {/* Clerk form */}
      <SignUp fallbackRedirectUrl={redirectUrl} forceRedirectUrl={redirectUrl} />

      <p className="text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <Link href={isArtisan ? "/sign-in?role=artisan" : "/sign-in"} className="text-emerald-600 hover:text-emerald-700 font-semibold transition">
          Sign in
        </Link>
      </p>
    </div>
  )
}
