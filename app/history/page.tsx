"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { History, Compass, Sparkles, Flame, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import ContributionSkyline from "@/components/ui/contribution-skyline";
import { useExplorationTracker } from "@/lib/utils/explorationTracker";
import { useSessionId } from "@/lib/utils/session";

interface HistoryRecord {
  id: string;
  sessionId: string;
  topicId: string;
  exploredAt: string;
  topic: {
    id: string;
    title: string;
    category?: string;
    summary?: string;
  };
}

export default function HistoryPage() {
  const sessionId = useSessionId();
  const { activityData, exploredCount, progressPercentage } = useExplorationTracker();
  const [historyItems, setHistoryItems] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (sessionId === "anonymous-init") return;

    fetch(`/api/history?sessionId=${encodeURIComponent(sessionId)}`, {
      headers: { "x-session-id": sessionId },
    })
      .then((res) => {
        if (res.status === 503) {
          if (isMounted) setIsOffline(true);
          return { history: [] };
        }
        return res.ok ? res.json() : { history: [] };
      })
      .then((data) => {
        if (isMounted) {
          setHistoryItems(data.history || []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsOffline(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const fallbackTrails = [
    { title: "Black Holes", domain: "Astrophysics", timestamp: "Recent Discovery" },
    { title: "Quantum Computing", domain: "Quantum Physics", timestamp: "Recent Discovery" },
    { title: "The Simulation Hypothesis", domain: "Philosophy", timestamp: "Recent Discovery" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 backdrop-blur-sm mb-3">
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>Curiosity Timeline</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Exploration History
          </h1>
          <p className="mt-2 text-base text-zinc-400 max-w-xl">
            Trace back your steps down the rabbit hole. Review your personal curiosity trails, active streaks, and daily knowledge discoveries persisted in Aiven.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl flex items-center gap-3">
            <Flame className="w-6 h-6 text-amber-400" />
            <div>
              <div className="text-xs text-zinc-400">Current Streak</div>
              <div className="text-lg font-bold text-white">4 Days</div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <div>
              <div className="text-xs text-zinc-400">Nodes Discovered</div>
              <div className="text-lg font-bold text-cyan-400">{exploredCount} ({progressPercentage}%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="font-semibold block">Aiven Database is currently offline</span>
            <span>Exploration trails are temporarily stored in local memory and will reconnect automatically once the database is available.</span>
          </div>
        </div>
      )}

      {/* Contribution Skyline 3D / 2D Activity Map */}
      <div className="mb-12 p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Year of Curiosity Activity</span>
          </h2>
          <span className="text-xs text-zinc-400">Drag in 3D to orbit · Double-click to reset</span>
        </div>

        <ContributionSkyline
          data={activityData}
          palette="ocean"
          defaultView="3d"
          unit="rabbit hole"
          unitPlural="rabbit holes"
          className="border-0 bg-transparent"
        />
      </div>

      {/* Recent Exploration Journey Trails */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Recent Rabbit Holes Traversed</span>
          </h3>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Explore More</span>
            <Compass className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 flex items-center justify-center text-cyan-400">
            <div className="w-6 h-6 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          </div>
        ) : historyItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {historyItems.map((item) => (
              <Link
                key={item.id}
                href={`/explore?topic=${encodeURIComponent(item.topic.title)}`}
                className="p-5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-cyan-500/40 backdrop-blur-xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                    {item.topic.category || "Discovery"}
                  </span>
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mt-1">
                    {item.topic.title}
                  </h4>
                  {item.topic.summary && (
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                      {item.topic.summary}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                  <span>{new Date(item.exploredAt).toLocaleDateString()}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {fallbackTrails.map((trail) => (
              <Link
                key={trail.title}
                href={`/explore?topic=${encodeURIComponent(trail.title)}`}
                className="p-5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-cyan-500/40 backdrop-blur-xl transition-all group"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                  {trail.domain}
                </span>
                <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mt-1">
                  {trail.title}
                </h4>
                <p className="text-xs text-zinc-500 mt-3">{trail.timestamp}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
