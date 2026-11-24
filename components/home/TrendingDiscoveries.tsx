"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Globe,
  Moon,
  Hourglass,
  Disc,
} from "lucide-react";
import { TRENDING_DISCOVERIES, TrendingTopic } from "@/lib/data/curatedTopics";

const ICONS_MAP: Record<TrendingTopic["iconName"], React.ElementType> = {
  "black-hole": Disc,
  cpu: Cpu,
  globe: Globe,
  moon: Moon,
  hourglass: Hourglass,
  sparkles: Sparkles,
};

export function TrendingDiscoveries() {
  const router = useRouter();

  const handleCardClick = (title: string) => {
    router.push(`/explore?topic=${encodeURIComponent(title)}`);
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan-950/40 text-cyan-300 border border-cyan-500/25 mb-3 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Curated Anomalies & Frontiers</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Rabbit holes worth falling into
        </h2>
        <p className="mt-3 text-base text-zinc-400">
          Hand-picked mysteries, cosmological paradoxes, and frontier questions waiting to be unraveled.
        </p>
      </div>

      {/* Grid of 6 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TRENDING_DISCOVERIES.map((topic, index) => {
          const Icon = ICONS_MAP[topic.iconName] || Sparkles;

          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => handleCardClick(topic.title)}
              className="group relative flex flex-col justify-between p-7 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-[0_4px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_0_35px_rgba(0,207,255,0.18)] hover:-translate-y-1"
            >
              {/* Subtle gradient hover highlight */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${topic.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />

              <div>
                {/* Top bar with icon and category badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,207,255,0.4)] transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${topic.badgeColor}`}>
                    {topic.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                  <span>{topic.title}</span>
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {topic.description}
                </p>
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono">
                  {topic.stats}
                </span>

                <div className="inline-flex items-center gap-1.5 font-semibold text-cyan-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default TrendingDiscoveries;
