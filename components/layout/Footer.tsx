import React from "react";
import Link from "next/link";
import { Sparkles, Compass, Bookmark, History, Info } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black/40 backdrop-blur-xl mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>The Rabbit Hole 🐇</span>
            </Link>
            <p className="text-xs text-zinc-400 font-normal">
              Stay curious. Keep exploring.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-medium">
            <Link href="/explore" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
              <Compass className="w-3.5 h-3.5" />
              <span>Explore</span>
            </Link>
            <Link href="/saved" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved</span>
            </Link>
            <Link href="/history" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </Link>
            <Link href="/about" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </Link>
          </nav>

          {/* Copyright */}
          <div className="text-xs text-zinc-500 font-mono">
            &copy; 2026 The Rabbit Hole. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
