"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/app/icon1.png";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col">
      <nav className="border-b border-white/5 px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 w-fit">
          <Image src={logo} alt="grunt" width={22} height={22} style={{ borderRadius: '3px', imageRendering: 'pixelated' }} />
          <span className="font-mono text-sm font-bold">grunt</span>
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl font-semibold mb-3">
              go pro. compress more.
            </h1>
            <p className="font-sans text-zinc-400 text-sm">
              unlock unlimited compressions and wenyan mode.
            </p>
          </div>

          <div className="border border-white rounded-xl p-8 mb-6">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-serif text-5xl font-semibold">$5</span>
              <span className="font-sans text-zinc-400">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Unlimited compressions",
                "All compression levels",
                "Wenyan classical Chinese mode 🤯",
                "Compression history & stats",
                "Priority support",
              ].map((text) => (
                <li key={text} className="flex items-center gap-3 font-sans text-sm">
                  <span className="text-emerald-400 font-mono">✓</span>
                  <span className="text-white">{text}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full font-mono text-sm bg-white text-black py-3 rounded-lg font-bold hover:bg-zinc-200 transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? "redirecting..." : "upgrade to pro →"}
            </button>

            <p className="font-mono text-xs text-zinc-600 text-center mt-3">
              cancel anytime · secure checkout via stripe
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="font-mono text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              ← back to dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
