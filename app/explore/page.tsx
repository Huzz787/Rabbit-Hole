"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Network,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { EXPLORATION_PREVIEWS } from "@/lib/data/curatedTopics";
import { useSessionId } from "@/lib/utils/session";

interface RelatedTopicItem {
  title: string;
  relationship: string;
  category: string;
  summary: string;
}

interface TopicData {
  title: string;
  category: string;
  description: string;
  summary: string;
  facts: string[];
  exploreNext: string[];
  relatedTopics: RelatedTopicItem[];
}

function getCuratedDataForTopic(topic: string): TopicData {
  const slug = topic.toLowerCase().replace(/\s+/g, "-");
  const curated = EXPLORATION_PREVIEWS[slug] || {
    summary: `Exploration of ${topic} reveals profound intersections between physical reality, consciousness, and computational information.`,
    category: "Cosmic Frontier",
    relatedNodes: ["Quantum Foundations", "Cosmic Entropy", "Epistemology", "Information Theory", "Event Horizons"],
    deepDivePrompt: `Discover how ${topic} bridges cosmological physics and theoretical computing.`,
  };

  return {
    title: topic,
    category: curated.category,
    description: `A frontier inquiry into ${topic} and its unexpected implications across physical and philosophical boundaries.`,
    summary: curated.summary,
    facts: [
      `${topic} challenges classical assumptions about how spacetime, entropy, and information behave.`,
      `Observational breakthroughs continue to reveal anomalous dynamics at the frontier of ${topic}.`,
      `Theoretical models suggest ${topic} may hold the key to unifying quantum mechanics and gravity.`,
    ],
    exploreNext: [
      `What happens to quantum information at the extreme boundaries of ${topic}?`,
      `How does an observer's frame of reference transform understanding of ${topic}?`,
      `Could ${topic} be an emergent manifestation of holographic spacetime?`,
    ],
    relatedTopics: curated.relatedNodes.map((rn) => ({
      title: rn,
      relationship: "Interconnected Frontier",
      category: curated.category,
      summary: `Exploring the unexpected theoretical bridges with ${rn}.`,
    })),
  };
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTopic = searchParams.get("topic") || "Black Holes";
  const sessionId = useSessionId();

  const [inputTopic, setInputTopic] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [databaseStatus, setDatabaseStatus] = useState<"connected" | "offline">("connected");
  const [isSynthesizing, setIsSynthesizing] = useState(true);
  const [topicData, setTopicData] = useState<TopicData | null>(() => {
    // If it's a known curated topic, start with preview for instant perceived load
    const slug = (searchParams.get("topic") || "Black Holes").toLowerCase().replace(/\s+/g, "-");
    if (EXPLORATION_PREVIEWS[slug]) {
      return getCuratedDataForTopic(searchParams.get("topic") || "Black Holes");
    }
    return null;
  });
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Sync with Aiven & Gemini: fetch AI expansion with strict client timeout and AbortController
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const CLIENT_TIMEOUT_MS = 8000;

    const timeoutId = setTimeout(() => {
      console.warn(`[Client Timeout] Exploration request for "${activeTopic}" exceeded ${CLIENT_TIMEOUT_MS}ms. Aborting.`);
      controller.abort();
    }, CLIENT_TIMEOUT_MS);

    Promise.resolve().then(() => {
      if (isMounted) {
        setIsSynthesizing(true);
        setIsSaved(false);
        setSaveError(null);
        setNoticeMessage(null);
      }
    });

    async function fetchTopicExpansion() {
      try {
        const res = await fetch("/api/topics/expand", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
          },
          body: JSON.stringify({
            topicTitle: activeTopic,
            sessionId,
            forceRefresh: retryTrigger > 0,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.databaseStatus === "offline") {
            setDatabaseStatus("offline");
          } else {
            setDatabaseStatus("connected");
          }

          if (data.expansion) {
            setTopicData({
              title: data.expansion.title || activeTopic,
              category: data.expansion.category || "Cosmic Frontier",
              description: data.expansion.description || "",
              summary: data.expansion.summary || "",
              facts: data.expansion.facts || [],
              exploreNext: data.expansion.exploreNext || [],
              relatedTopics: data.expansion.relatedTopics || [],
            });
            setIsSynthesizing(false);
            return;
          }
        } else if (res.status === 503) {
          if (isMounted) setDatabaseStatus("offline");
        } else if (isMounted) {
          setNoticeMessage("AI service is temporarily busy. Displaying verified discovery.");
        }
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const isAbort = err instanceof Error && (err.name === "AbortError" || err.message.includes("aborted"));
        if (isMounted) {
          if (isAbort) {
            setNoticeMessage("AI synthesis took longer than expected. Displaying verified discovery.");
          } else {
            setDatabaseStatus("offline");
            setNoticeMessage("Connection interrupted. Displaying verified discovery.");
          }
        }
      }

      if (isMounted) {
        // Guaranteed fallback ensures screen is never left blank or stuck
        setTopicData((prev) => prev || getCuratedDataForTopic(activeTopic));
        setIsSynthesizing(false);
      }
    }

    fetchTopicExpansion();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [activeTopic, sessionId, retryTrigger]);

  const handleSaveToggle = async () => {
    if (!topicData) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const topicRes = await fetch("/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          title: activeTopic,
          category: topicData.category,
          summary: topicData.summary,
        }),
      });

      if (!topicRes.ok) {
        throw new Error("Database offline: Cannot bookmark discovery permanently right now.");
      }

      const { topic } = await topicRes.json();
      const saveRes = await fetch("/api/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          sessionId,
          topicId: topic.id,
          notes: topicData.summary,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Database offline: Cannot bookmark discovery permanently right now.");
      }

      setIsSaved(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Database is offline. Bookmark could not be saved permanently.";
      setSaveError(msg);
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTopic.trim()) {
      setIsSynthesizing(true);
      const nextTopic = inputTopic.trim();
      router.push(`/explore?topic=${encodeURIComponent(nextTopic)}`);
      setInputTopic("");
    }
  };

  const handleRelatedClick = (topicName: string) => {
    setIsSynthesizing(true);
    router.push(`/explore?topic=${encodeURIComponent(topicName)}`);
  };

  const handleRetry = useCallback(() => {
    setNoticeMessage(null);
    setRetryTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button & Action Toolbar */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Knowledge Map</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveToggle}
            disabled={isSaving || isSaved}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isSaved
                ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(0,207,255,0.2)]"
                : "border-white/10 hover:border-white/20 text-zinc-400 hover:text-white bg-white/[0.03]"
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-cyan-400 text-cyan-400" : ""}`} />
            )}
            <span>{isSaving ? "Saving..." : isSaved ? "Saved to Discoveries" : "Save Discovery"}</span>
          </button>
        </div>
      </div>

      {/* Notice / Latency Fallback Alert Banner */}
      {noticeMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-cyan-400" />
            <span>{noticeMessage}</span>
          </div>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 font-medium transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry AI Synthesis</span>
          </button>
        </div>
      )}

      {/* Save Error Alert Banner */}
      {saveError && (
        <div className="mb-6 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Explore Search Bar */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="relative flex items-center p-2 rounded-2xl bg-black/60 border border-white/15 focus-within:border-cyan-400/60 backdrop-blur-xl shadow-xl">
          <Search className="w-5 h-5 text-zinc-400 ml-3 mr-2" />
          <input
            type="text"
            value={inputTopic}
            onChange={(e) => setInputTopic(e.target.value)}
            placeholder={`Currently exploring "${activeTopic}" — dive into any curiosity...`}
            className="w-full py-2.5 px-2 bg-transparent text-white placeholder-zinc-500 focus:outline-none text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={isSynthesizing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs sm:text-sm transition-all disabled:opacity-75"
          >
            {isSynthesizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <span>Dive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Main Exploration Detail Container */}
      <div className="relative p-8 sm:p-10 rounded-3xl bg-black/40 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,207,255,0.08)] overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header Tag with Status */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
              <Compass className="w-3.5 h-3.5" />
              {topicData?.category || "Cosmic Frontier"}
            </span>

            <div className="flex items-center gap-2 text-xs">
              {databaseStatus === "offline" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Offline Constellation Mode</span>
                </span>
              )}

              {isSynthesizing ? (
                <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/30">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing with Gemini AI...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AI Synthesis Active</span>
                </div>
              )}
            </div>
          </div>

          {/* CIRCLE LOADING STATE WHEN SEARCHING */}
          {isSynthesizing ? (
            <div className="min-h-[380px] flex flex-col items-center justify-center gap-5 text-center py-16 animate-pulse">
              <div className="relative flex items-center justify-center">
                {/* Outer spinning ring */}
                <div className="w-20 h-20 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                {/* Inner reverse-spinning ring */}
                <div
                  className="w-12 h-12 rounded-full border-2 border-cyan-400/30 border-b-cyan-300 animate-spin absolute"
                  style={{ animationDirection: "reverse", animationDuration: "1s" }}
                />
                <Sparkles className="w-6 h-6 absolute text-cyan-300 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Synthesizing &ldquo;{activeTopic}&rdquo;
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                  Consulting Google Gemini AI to uncover hidden connections, paradoxes, and related rabbit holes...
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium bg-black/50 text-cyan-400 border border-cyan-500/20 mt-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Deep curiosity synthesis in progress</span>
              </div>
            </div>
          ) : (
            /* RENDERED CONTENT ONCE LOADED */
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {activeTopic}
              </h1>

              {topicData?.description && (
                <p className="mt-3 text-sm sm:text-base text-cyan-300/80 font-medium leading-relaxed">
                  {topicData.description}
                </p>
              )}

              <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl">
                {topicData?.summary}
              </p>

              {/* Section: Mind-Bending Facts */}
              {topicData?.facts && topicData.facts.length > 0 && (
                <div className="mt-8 p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Mind-Bending Facts
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {topicData.facts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Section: Questions to Explore Next */}
              {topicData?.exploreNext && topicData.exploreNext.length > 0 && (
                <div className="mt-6 p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Curiosity Vectors — Explore Next
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {topicData.exploreNext.map((prompt, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5"
                      >
                        <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-zinc-300 italic">{prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Interconnected Rabbit Holes */}
              <div className="mt-10 pt-8 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Network className="w-4 h-4 text-cyan-400" />
                    <span>Interconnected Rabbit Holes ({topicData?.relatedTopics.length || 0})</span>
                  </h3>
                  <span className="text-xs text-zinc-500">Click any topic to branch deeper</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {topicData?.relatedTopics.map((rel) => (
                    <button
                      key={rel.title}
                      onClick={() => handleRelatedClick(rel.title)}
                      className="flex flex-col p-4 rounded-xl bg-white/[0.03] hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/40 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
                          <span className="text-sm font-semibold text-zinc-200 group-hover:text-cyan-300 transition-colors">
                            {rel.title}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      {rel.relationship && (
                        <span className="text-[11px] font-mono text-cyan-400/80 mt-1 pl-4.5">
                          {rel.relationship}
                        </span>
                      )}
                      {rel.summary && (
                        <p className="text-xs text-zinc-400 mt-1 pl-4.5 line-clamp-2">
                          {rel.summary}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-cyan-400">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
