"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { ForceGraphClientProps } from "./ForceGraphClient";
import { Loader2 } from "lucide-react";

// Safely dynamically load the ForceGraph component on client-side only (SSR disabled)
const DynamicForceGraph = dynamic<ForceGraphClientProps>(
  () => import("./ForceGraphClient"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm">Loading knowledge graph...</span>
      </div>
    ),
  }
);

export function KnowledgeGraph(props: ForceGraphClientProps) {
  return <DynamicForceGraph {...props} />;
}

export default KnowledgeGraph;
