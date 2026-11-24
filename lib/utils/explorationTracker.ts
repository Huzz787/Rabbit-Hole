"use client";

import { useState, useCallback, useEffect } from "react";
import { SAMPLE_GRAPH_NODES } from "@/lib/data/sampleKnowledgeGraph";
import { ContributionDay } from "@/components/ui/contribution-skyline";

const STORAGE_KEY = "the_rabbit_hole_explored_nodes";

// Initial set of discovered nodes for a believable initial profile
export const INITIAL_EXPLORED_IDS = [
  "curiosity",
  "black-holes",
  "event-horizons",
  "quantum-computing",
  "simulation-hypothesis",
  "psychology-of-dreams",
  "fermi-paradox",
  "antikythera-mechanism",
];

// Generate synthetic curiosity exploration days matching the user's journey using a stable date anchor
export function getCuriosityActivityData(): ContributionDay[] {
  const data: ContributionDay[] = [];
  const anchor = new Date("2026-11-24T00:00:00Z");
  const DAY_MS = 86400000;

  // Generate 365 days of curiosity explorations
  for (let i = 364; i >= 0; i--) {
    const d = new Date(anchor.getTime() - i * DAY_MS);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getUTCDay();

    // Occasional bursts of intense rabbit-hole exploration
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isRecent = i < 30;

    let count = 0;
    // Deterministic pseudo-random generation based on index
    const roll = ((i * 9301 + 49297) % 233280) / 233280;

    if (isRecent) {
      if (roll > 0.35) {
        count = Math.floor(roll * 8) + 1;
      }
    } else if (roll > 0.6) {
      count = Math.floor(roll * (isWeekend ? 10 : 5)) + 1;
    }

    if (count > 0) {
      data.push({ date: dateStr, count });
    }
  }

  return data;
}

export function useExplorationTracker() {
  const [exploredNodeIds, setExploredNodeIds] = useState<Set<string>>(() => {
    return new Set(INITIAL_EXPLORED_IDS);
  });

  const [activityData, setActivityData] = useState<ContributionDay[]>(() => {
    return getCuriosityActivityData();
  });

  // Sync with localStorage on client mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Delay by one tick to avoid cascading render lint check
          queueMicrotask(() => {
            setExploredNodeIds(new Set(parsed));
          });
        }
      }
    } catch {
      /* fallback */
    }
  }, []);

  // Mark node as explored and increment activity
  const exploreNode = useCallback((nodeId: string) => {
    setExploredNodeIds((prev) => {
      if (prev.has(nodeId)) return prev;
      const updated = new Set(prev);
      updated.add(nodeId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(updated)));
      } catch {
        /* storage may fail in private window */
      }
      return updated;
    });

    // Add to today's activity count
    const todayStr = "2026-11-24";
    setActivityData((prev) => {
      const existing = prev.find((d) => d.date === todayStr);
      if (existing) {
        return prev.map((d) =>
          d.date === todayStr ? { ...d, count: d.count + 1 } : d
        );
      }
      return [...prev, { date: todayStr, count: 1 }];
    });
  }, []);

  const totalNodes = SAMPLE_GRAPH_NODES.length;
  const exploredCount = exploredNodeIds.size;
  const progressPercentage = Math.round((exploredCount / totalNodes) * 100);

  // Group progress by domain
  const categoryStats = SAMPLE_GRAPH_NODES.reduce(
    (acc, node) => {
      const cat = node.category || "General";
      if (!acc[cat]) {
        acc[cat] = { total: 0, explored: 0 };
      }
      acc[cat].total += 1;
      if (exploredNodeIds.has(node.id)) {
        acc[cat].explored += 1;
      }
      return acc;
    },
    {} as Record<string, { total: number; explored: number }>
  );

  return {
    exploredNodeIds,
    exploreNode,
    totalNodes,
    exploredCount,
    progressPercentage,
    categoryStats,
    activityData,
  };
}
