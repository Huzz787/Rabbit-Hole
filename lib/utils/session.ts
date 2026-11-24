"use client";

import { useSyncExternalStore } from "react";

const SESSION_STORAGE_KEY = "rh_session_id";

/**
 * Returns or generates a cryptographically random, persistent anonymous session ID.
 * Persists in both localStorage and document.cookie so both client and server can access it.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return "anonymous-server";
  }

  try {
    let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);

    // If missing or legacy hardcoded session ID, generate a fresh unique one
    if (!sessionId || sessionId === "default-session") {
      const randomPart =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      sessionId = `rh_anon_${randomPart}`;

      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
      document.cookie = `rh_session_id=${sessionId}; path=/; max-age=31536000; SameSite=Lax`;
    }

    return sessionId;
  } catch {
    return "anonymous-fallback";
  }
}

const emptySubscribe = () => () => {};

/**
 * React hook to safely retrieve the persistent anonymous session ID via useSyncExternalStore.
 */
export function useSessionId(): string {
  return useSyncExternalStore(
    emptySubscribe,
    getOrCreateSessionId,
    () => "anonymous-server"
  );
}
