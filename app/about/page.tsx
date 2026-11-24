import React from "react";
import Link from "next/link";
import { Sparkles, Compass, Network, Brain, Globe2, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 backdrop-blur-sm mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Philosophy</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          About The Rabbit Hole
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed">
          Modern search engines are built for answers. <br />
          <strong className="text-white">The Rabbit Hole is built for wonder.</strong>
        </p>
      </div>

      {/* Grid of Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="p-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Serendipitous Exploration</h3>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Curiosity is rarely linear. A inquiry into black holes may lead to information theory, which opens doors to the simulation hypothesis and the nature of human consciousness.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
            <Network className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Constellation of Knowledge</h3>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Rather than endless walls of text, our interactive knowledge graph models human curiosity as a living, glowing topological network.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">AI-Powered Synthesis</h3>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Powered by advanced intelligence, The Rabbit Hole maps semantic resonances across disparate academic domains, uncovering links that traditional searches miss.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
            <Globe2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Frontier Questions</h3>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            We focus on frontier questions: the cosmological paradoxes, the deep enigmas of ancient history, and the profound questions of our existential reality.
          </p>
        </div>
      </div>

      {/* Call to action */}
      <div className="p-10 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-black/60 to-indigo-950/40 border border-cyan-500/30 text-center backdrop-blur-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Ready to dive in?
        </h2>
        <p className="mt-2 text-sm text-zinc-300 max-w-md mx-auto">
          Start with any spark of interest and let curiosity guide your journey.
        </p>
        <div className="mt-6">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all shadow-[0_0_20px_rgba(0,207,255,0.3)]"
          >
            <span>Begin Exploring</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
