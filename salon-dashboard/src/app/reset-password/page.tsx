"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 pointer-events-none bg-black/40" />
      <div className="relative w-full max-w-md">
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

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Update Password
            </h1>
            <p className="text-sm text-gray-500">
              Set a strong new password for your account.
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50/50 border border-gray-100 transition-all duration-150 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/10 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ec4899] hover:bg-[#db2777] text-white font-bold py-3 rounded-xl transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-pink-500" />
              </div>
              <p className="text-gray-900 font-bold mb-1">Success!</p>
              <p className="text-gray-500 text-sm">
                Password updated successfully. Redirecting to Login...
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Copyright */}
      <p className="absolute bottom-4 text-center text-xs text-white/80">
        © 2026 Candy &amp; Rose Salon. All rights reserved.
      </p>
    </div>
  );
}
