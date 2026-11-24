"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Sparkles, Shuffle, ArrowRight, Compass, Loader2 } from "lucide-react";

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isHoveredSurprise, setIsHoveredSurprise] = useState(false);

  const handleExplore = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setHasError(true);
      setTimeout(() => setHasError(false), 2000);
      return;
    }
    setIsNavigating(true);
    router.push(`/explore?topic=${encodeURIComponent(trimmed)}`);
  };

  const handleSurpriseMe = async () => {
    setIsNavigating(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1200);
      const res = await fetch("/api/topics/surprise", {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          router.push(`/explore?topic=${encodeURIComponent(data.title)}&from=surprise`);
          return;
        }
      }
    } catch {
      // Fast fallback to curated list on any network lag
    }
    const curatedList = [
      "Black Holes",
      "Quantum Computing",
      "The Simulation Hypothesis",
      "Psychology of Dreams",
      "Lost Civilizations",
      "The Fermi Paradox",
    ];
    const selected = curatedList[Math.floor(Math.random() * curatedList.length)];
    router.push(`/explore?topic=${encodeURIComponent(selected)}&from=surprise`);
  };

  const handlePillClick = (topic: string) => {
    setIsNavigating(true);
    router.push(`/explore?topic=${encodeURIComponent(topic)}`);
  };

  const quickPills = [
    "Black Holes",
    "Quantum Computing",
    "The Simulation Hypothesis",
    "Psychology of Dreams",
    "Fermi Paradox",
  ];

  return (
    <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
      {/* Top Floating Badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(0,207,255,0.12)] mb-8"
      >
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span className="tracking-wide uppercase text-[10px]">AI-Powered Knowledge Discovery</span>
      </motion.div>

      {/* Main Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
      >
        Curiosity has{" "}
        <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-300">
          no bottom.
        </span>
      </motion.h1>

      {/* Supporting Text */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed"
      >
        One question leads to another. Follow the connections, uncover unexpected ideas, and see where the rabbit hole takes you.
      </motion.p>

      {/* Prominent Search Bar & Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 max-w-2xl mx-auto"
      >
        <form
          onSubmit={handleExplore}
          className={`relative flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl bg-black/60 border ${
            hasError
              ? "border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.3)] animate-shake"
              : "border-white/15 focus-within:border-cyan-400/60 focus-within:shadow-[0_0_30px_rgba(0,207,255,0.25)]"
          } backdrop-blur-xl transition-all duration-300 shadow-2xl`}
        >
          <div className="relative flex-1 w-full flex items-center pl-3">
            <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (hasError) setHasError(false);
              }}
              placeholder={hasError ? "Please enter a topic to explore..." : "What's on your mind today?"}
              className={`w-full py-3 px-3.5 bg-transparent text-white placeholder-zinc-500 focus:outline-none text-base ${
                hasError ? "placeholder-rose-400" : ""
              }`}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isNavigating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all shadow-[0_0_20px_rgba(0,207,255,0.35)] hover:shadow-[0_0_25px_rgba(0,207,255,0.5)] active:scale-[0.98] disabled:opacity-80"
            >
              {isNavigating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSurpriseMe}
              disabled={isNavigating}
              onMouseEnter={() => setIsHoveredSurprise(true)}
              onMouseLeave={() => setIsHoveredSurprise(false)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-white/15 hover:border-cyan-500/40 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white font-medium text-sm transition-all backdrop-blur-md active:scale-[0.98] disabled:opacity-80"
            >
              <Shuffle className={`w-4 h-4 text-cyan-400 transition-transform ${isHoveredSurprise ? "rotate-180" : ""}`} />
              <span>Surprise Me</span>
            </button>
          </div>
        </form>

        {/* Quick Curiosity Suggestions */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 text-zinc-500 font-medium">
            <Compass className="w-3.5 h-3.5" />
            Try starting with:
          </span>
          {quickPills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => handlePillClick(pill)}
              className="px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-cyan-950/40 text-zinc-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all text-[11px]"
            >
              {pill}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
