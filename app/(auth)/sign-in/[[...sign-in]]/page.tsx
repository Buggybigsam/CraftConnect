"use client"

import { SignIn, useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { Wrench, User } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useEffect } from "react"
import BrandIcon from "@/components/brand-icon"

function SignInContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const role = searchParams.get("role") === "artisan" ? "artisan" : "customer"

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    window.location.href = `/auth/redirect${role === "artisan" ? "?role=artisan" : ""}`
  }, [isLoaded, isSignedIn, role])

  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 mb-6">
        <BrandIcon className="h-9 w-9 rounded-xl shadow-md shadow-emerald-200 ring-1 ring-emerald-100" priority />
        CraftConnect
      </Link>

      {/* Role Tab Switcher */}
      <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm mb-6 w-full max-w-sm">
        <button
          onClick={() => router.replace("/sign-in")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            role === "customer"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <User size={15} />
          Customer
        </button>
        <button
          onClick={() => router.replace("/sign-in?role=artisan")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            role === "artisan"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Wrench size={15} />
          Artisan
        </button>
      </div>

      {/* Context label */}
      {role === "artisan" && (
        <p className="text-sm text-slate-500 mb-4 text-center">
          Sign in to your{" "}
          <span className="font-semibold text-emerald-700">artisan dashboard</span> to manage your bookings.
        </p>
      )}
      {role === "customer" && (
        <p className="text-sm text-slate-500 mb-4 text-center">
          Sign in to{" "}
          <span className="font-semibold text-slate-800">browse and book artisans</span> near you.
        </p>
      )}

      {/* Clerk form */}
      <SignIn
        fallbackRedirectUrl={`/auth/redirect${role === "artisan" ? "?role=artisan" : ""}`}
        forceRedirectUrl={`/auth/redirect${role === "artisan" ? "?role=artisan" : ""}`}
      />

      {/* Footer links */}
      <p className="text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href={role === "artisan" ? "/artisan-apply" : "/sign-up"}
          className="text-emerald-600 hover:text-emerald-700 font-semibold transition"
        >
          {role === "artisan" ? "Apply as an artisan →" : "Create one free"}
        </Link>
      </p>

      {role === "customer" && (
        <p className="text-xs text-slate-400 mt-3">
          Are you an artisan?{" "}
          <button
            onClick={() => router.replace("/sign-in?role=artisan")}
            className="text-emerald-500 hover:underline font-medium"
          >
            Sign in here
          </button>
        </p>
      )}
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  )
}
