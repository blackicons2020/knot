"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://knot-backend-core.onrender.com';
        
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials.");
      }

      if (data.token) {
        localStorage.setItem('knot_token', data.token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0D14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#D4AF37]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#E27D8D]/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 relative">
        <Link href="/" className="inline-block mb-10">
          <span className="text-3xl font-serif font-black tracking-wider text-[#F5F5F1] flex items-center gap-1">
            KNOT<span className="text-[#D4AF37]">.</span>
          </span>
        </Link>

        <div className="glass-card rounded-[36px] p-8 sm:p-10 border border-white/10 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <h1 className="text-2xl font-serif font-black text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-400 mb-8">Sign in to access your curated matches and AI coach.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1.5">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="name@email.com" 
                className="w-full bg-[#121721] border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1.5">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password" 
                className="w-full bg-[#121721] border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full mt-2 py-4 rounded-full text-sm font-black rose-glow-btn text-white disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</>
              ) : (
                <>Access Registry <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500">
              Not on the registry yet? <Link href="/onboarding" className="text-[#D4AF37] font-bold hover:underline">Apply here</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
