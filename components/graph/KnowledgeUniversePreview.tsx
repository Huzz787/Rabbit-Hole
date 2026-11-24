"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Activity,
  Flame,
} from "lucide-react";
import { useExplorationTracker } from "@/lib/utils/explorationTracker";
import ContributionSkyline from "@/components/ui/contribution-skyline";

export function KnowledgeUniversePreview() {
  // Exploration progress tracker
  const {
    totalNodes,
    exploredCount,
    progressPercentage,
    activityData,
  } = useExplorationTracker();

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan-950/40 text-cyan-300 border border-cyan-500/25 mb-3 backdrop-blur-sm">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Curiosity Exploration Skyline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Trace your journey across the cosmos
          </h2>
          <p className="mt-2 text-base text-zinc-400 max-w-xl">
            A 3D isometric skyline mapping your daily exploration volume, deep dives, and knowledge discoveries over the last year. Drag in 3D to orbit, or switch to 2D heat map view.
          </p>
        </div>
      </div>

      {/* Exploration Tracker Progress Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Your Knowledge Map Progress</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {progressPercentage}% Unlocked
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              You have illuminated {exploredCount} of {totalNodes} frontier concepts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-200 font-medium">4 Day Streak</span>
          </div>

          <div className="flex items-center gap-3 border-l border-white/10 pl-4 hidden md:flex">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,207,255,0.6)]" />
              <span className="text-[11px] text-zinc-300">Explored ({exploredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-dashed border-zinc-400" />
              <span className="text-[11px] text-zinc-400">Undiscovered ({totalNodes - exploredCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Skyline Main Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl"
      >
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Interactive 3D Skyline</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Drag in 3D to orbit the skyline. Double-click anywhere to reset the camera view.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-400">Total Rabbit Holes</span>
            <div className="text-2xl font-bold text-cyan-400 tabular-nums">
              {activityData.reduce((acc, curr) => acc + curr.count, 0)}
            </div>
          </div>
        </div>

        <ContributionSkyline
          data={activityData}
          palette="ocean"
          defaultView="3d"
          unit="discovery"
          unitPlural="discoveries"
          title={
            <span className="text-zinc-200">
              <strong className="text-cyan-400">{exploredCount}</strong> unique topics illuminated across the cosmos
            </span>
          }
          className="border-0 bg-transparent"
        />
      </motion.div>
    </section>
  );
}

export default KnowledgeUniversePreview;
