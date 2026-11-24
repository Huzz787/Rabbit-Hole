import { NextRequest } from "next/server";

/**
 * Extracts a secure, visitor-specific session ID on the server.
 * Checks explicit parameter, x-session-id header, and rh_session_id cookie.
 * Prevents usage of shared "default-session" ID.
 */
export function extractServerSessionId(req: NextRequest, explicitId?: string | null): string {
  if (explicitId && explicitId !== "default-session" && explicitId.trim().length > 0) {
    return explicitId.trim();
  }

  const headerId = req.headers.get("x-session-id");
  if (headerId && headerId !== "default-session" && headerId.trim().length > 0) {
    return headerId.trim();
  }

  const cookieId = req.cookies.get("rh_session_id")?.value;
  if (cookieId && cookieId !== "default-session" && cookieId.trim().length > 0) {
    return cookieId.trim();
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "client";
  return `rh_anon_${ip.replace(/[^a-zA-Z0-9]/g, "_")}`;
}
