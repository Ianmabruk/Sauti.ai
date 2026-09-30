import { NextResponse } from "next/server";

/**
 * Liveness endpoint for the hosting platform.
 *
 * Render polls this to decide whether the service is up, and a web service
 * without a working health check is failed by the deploy. It deliberately
 * answers `200` when the app itself is running, without calling the backend:
 * the frontend can serve its shell while the backend is restarting, and
 * failing here would take the whole frontend down over a dependency blip.
 *
 * Backend reachability is reported separately by the backend's own
 * `/api/sauti/health`, which is surfaced on the in-app Settings screen.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { status: "ok", service: "sauti-ai", timestamp: new Date().toISOString() },
    { status: 200 },
  );
}