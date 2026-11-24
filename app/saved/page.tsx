"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Compass, ArrowRight, Trash2, Edit3, Check, X, FileText, AlertTriangle } from "lucide-react";
import { useSessionId } from "@/lib/utils/session";

interface SavedItem {
  id: string;
  sessionId: string;
  topicId: string;
  notes?: string;
  savedAt: string;
  topic: {
    id: string;
    title: string;
    category?: string;
    summary?: string;
  };
}

export default function SavedPage() {
  const sessionId = useSessionId();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (sessionId === "anonymous-init") return;

    fetch(`/api/saved?sessionId=${encodeURIComponent(sessionId)}`, {
      headers: { "x-session-id": sessionId },
    })
      .then((res) => {
        if (res.status === 503) {
          if (isMounted) setIsOffline(true);
          return { saved: [] };
        }
        return res.ok ? res.json() : { saved: [] };
      })
      .then((data) => {
        if (isMounted) {
          setSavedItems(data.saved || []);
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

  const handleDelete = async (topicId: string) => {
    try {
      await fetch(`/api/saved?sessionId=${encodeURIComponent(sessionId)}&topicId=${topicId}`, {
        method: "DELETE",
        headers: { "x-session-id": sessionId },
      });
      setSavedItems((prev) => prev.filter((item) => item.topicId !== topicId));
    } catch {
      // Failed deletion
    }
  };

  const handleStartEdit = (item: SavedItem) => {
    setEditingId(item.id);
    setNoteDraft(item.notes || "");
  };

  const handleSaveNote = async (item: SavedItem) => {
    setIsSavingNote(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          sessionId,
          topicId: item.topicId,
          notes: noteDraft,
        }),
      });

      if (res.ok) {
        setSavedItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, notes: noteDraft } : i))
        );
        setEditingId(null);
      }
    } catch {
      // Failed saving note
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 backdrop-blur-sm mb-3">
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
            <span>Curated Discoveries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Saved Discoveries
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-xl">
            Your personal bookmarked paradoxes, anomalies, and frontier explorations stored securely with your private research notes.
          </p>
        </div>

        {savedItems.length > 0 && (
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs sm:text-sm transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Discover More</span>
          </Link>
        )}
      </div>

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="font-semibold block">Aiven Database is currently offline</span>
            <span>Discoveries cannot be fetched or saved permanently. They will resume automatically once the database is reachable.</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-cyan-400">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        </div>
      ) : savedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-cyan-500/40 backdrop-blur-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
                    {item.topic.category || "Discovery"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
                      title="Edit research notes"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.topicId)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {item.topic.title}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                  {item.topic.summary}
                </p>

                {/* Notes Section: View & Inline Edit */}
                {editingId === item.id ? (
                  <div className="mt-4 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300 mb-1.5 block">
                      Add / Edit Personal Notes:
                    </label>
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Add research observations, questions, or ideas..."
                      className="w-full h-20 p-2 text-xs text-zinc-200 bg-black/60 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 resize-none"
                    />
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-zinc-400 hover:text-white rounded-lg transition-colors"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={() => handleSaveNote(item)}
                        disabled={isSavingNote}
                        className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all"
                      >
                        <Check className="w-3 h-3" />
                        <span>{isSavingNote ? "Saving..." : "Save Notes"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  item.notes && (
                    <div className="mt-3.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                          Notes:
                        </span>
                        <p className="text-xs text-zinc-300 italic mt-0.5">{item.notes}</p>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  Saved on {new Date(item.savedAt).toLocaleDateString()}
                </span>
                <Link
                  href={`/explore?topic=${encodeURIComponent(item.topic.title)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Revisit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="relative p-12 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl max-w-md w-full">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(0,207,255,0.2)]">
              <Bookmark className="w-8 h-8 text-cyan-400" />
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              No saved discoveries yet
            </h2>

            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              As you traverse the rabbit hole, bookmark intriguing nodes and unexpected paradoxes to revisit anytime.
            </p>

            <div className="mt-8">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all shadow-[0_0_20px_rgba(0,207,255,0.3)] hover:shadow-[0_0_25px_rgba(0,207,255,0.45)]"
              >
                <Compass className="w-4 h-4" />
                <span>Start Exploring</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
