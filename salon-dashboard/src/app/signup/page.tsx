"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Direct to dashboard instantly if possible, otherwise it will handle the "unverified" error at the top
      router.push("/");
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  const pageStyle = {
    backgroundImage: "url('/background.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={pageStyle}>
        <div className="absolute inset-0 pointer-events-none bg-black/40" />
        <div
          className="w-full max-w-lg mx-4 rounded-2xl p-10 border border-gray-100 text-center"
          style={{ background: "#ffffff", boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#ec4899" }}
          >
            <span className="text-2xl">✉️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-gray-700">{email}</span>.
            Click the link to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-block py-2.5 px-8 rounded-xl font-semibold text-sm text-white transition-colors"
            style={{ background: "#ec4899" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#db2777")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#ec4899")}
          >
            Back to Login
          </Link>
        </div>
        <p className="absolute bottom-4 text-center text-xs" style={{ color: "rgba(200,160,175,0.35)" }}>
          © 2026 Candy &amp; Rose Salon. All rights reserved.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={pageStyle}>
      {/* Overlay for better readability */}
      <div className="absolute inset-0 pointer-events-none bg-black/40" />

      <style>{`
        .input-focus:focus {
          outline: none;
          border-color: #ec4899 !important;
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.12);
        }
        .google-btn:hover { background: #f8f8f8 !important; }
      `}</style>

      <div className="relative z-10 w-full max-w-lg px-4 py-8">
        {/* Black card with pink bottom highlight */}
        <div
          className="relative rounded-2xl p-8 border border-gray-100 overflow-hidden"
          style={{
            background: "#ffffff",
            boxShadow: "0 24px 48px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {/* Pink bottom highlight stripe */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-pink-500" />

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-sm text-gray-500">Fill in your details to get started</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 bg-red-50 border border-red-200 text-red-700">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Google signup */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="google-btn w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl mb-5 font-semibold text-sm text-gray-600 border border-gray-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            style={{ background: "#ffffff" }}
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or register with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 border border-gray-200 bg-gray-50/50 transition-all duration-150 input-focus"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 border border-gray-200 bg-gray-50/50 transition-all duration-150 input-focus"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 border border-gray-200 bg-gray-50/50 transition-all duration-150 input-focus"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background: password.length >= (i + 1) * 4
                          ? password.length < 8 ? "#ef4444" : password.length < 12 ? "#f59e0b" : "#22c55e"
                          : "#e5e7eb",
                      }}
                    />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">
                    {password.length < 8 ? "Weak" : password.length < 12 ? "Good" : "Strong"}
                  </span>
                </div>
              )}
            </div>



            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: "#ec4899" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#db2777")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#ec4899")}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/login?showForm=true"
              className="font-semibold transition-colors"
              style={{ color: "#ec4899" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#db2777")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#ec4899")}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Copyright pinned at bottom */}
      <p className="absolute bottom-4 text-center text-xs text-white/80">
        © 2026 Candy &amp; Rose Salon. All rights reserved.
      </p>
    </div>
  );
}
