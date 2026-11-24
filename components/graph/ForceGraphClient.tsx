"use client";

import React, { useCallback, useRef, useState, useMemo } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { DOMAIN_COLORS, ExtendedGraphNode } from "@/lib/data/sampleKnowledgeGraph";
import { GraphData, GraphLink } from "@/types";

export interface ForceGraphClientProps {
  graphData: GraphData;
  width?: number;
  height?: number;
  selectedNodeId?: string | null;
  exploredNodeIds?: Set<string>;
  onNodeSelect?: (node: ExtendedGraphNode | null) => void;
  graphRef?: React.MutableRefObject<ForceGraphMethods | undefined>;
}

export default function ForceGraphClient({
  graphData,
  width = 800,
  height = 550,
  selectedNodeId,
  exploredNodeIds,
  onNodeSelect,
  graphRef,
}: ForceGraphClientProps) {
  const localRef = useRef<ForceGraphMethods | undefined>(undefined);
  const activeRef = graphRef || localRef;

  const [hoveredNode, setHoveredNode] = useState<ExtendedGraphNode | null>(null);

  // Compute neighboring nodes and links for hover/selection highlighting
  const highlightedData = useMemo(() => {
    const activeNodeId = hoveredNode?.id || selectedNodeId;
    const highlightNodes = new Set<string>();
    const highlightLinks = new Set<string>();

    if (activeNodeId) {
      highlightNodes.add(activeNodeId);
      graphData.links.forEach((link: GraphLink) => {
        const sourceId = typeof link.source === "object" ? (link.source as { id: string }).id : link.source;
        const targetId = typeof link.target === "object" ? (link.target as { id: string }).id : link.target;

        if (sourceId === activeNodeId || targetId === activeNodeId) {
          highlightLinks.add(`${sourceId}-${targetId}`);
          highlightNodes.add(sourceId);
          highlightNodes.add(targetId);
        }
      });
    }

    return { highlightNodes, highlightLinks, hasActive: Boolean(activeNodeId) };
  }, [hoveredNode, selectedNodeId, graphData.links]);

  // Handle node click
  const handleNodeClick = (node: object) => {
    const extNode = node as ExtendedGraphNode;
    if (onNodeSelect) {
      onNodeSelect(extNode);
    }
    // Center and zoom slightly into the node
    if (activeRef.current && typeof extNode.x === "number" && typeof extNode.y === "number") {
      activeRef.current.centerAt(extNode.x, extNode.y, 800);
      activeRef.current.zoom(1.8, 800);
    }
  };

  // Custom node drawing with canvas
  const drawNode = useCallback(
    (nodeObj: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = nodeObj as ExtendedGraphNode & { x?: number; y?: number };
      if (typeof node.x !== "number" || typeof node.y !== "number") return;

      const { highlightNodes, hasActive } = highlightedData;
      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const isHighlighted = isSelected || isHovered || highlightNodes.has(node.id);
      const isCuriosity = node.id === "curiosity";

      // If another node is active and this node is not connected, dim it
      const opacity = hasActive ? (isHighlighted ? 1 : 0.25) : 0.95;
      ctx.globalAlpha = opacity;

      const domain = DOMAIN_COLORS[node.category || "Astrophysics"] || DOMAIN_COLORS.Astrophysics;
      const baseRadius = isCuriosity ? 10 : Math.max(4.5, (node.val || 10) * 0.45);
      const r = isHighlighted ? baseRadius * 1.25 : baseRadius;

      // Glow effect for central node and highlighted nodes
      if (isCuriosity || isHighlighted) {
        const glowRadius = isCuriosity ? r * 2.8 : r * 2.2;
        const grad = ctx.createRadialGradient(node.x, node.y, r * 0.5, node.x, node.y, glowRadius);
        grad.addColorStop(0, domain.glow);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Outer ring for Curiosity or selected node or explored node
      if (isCuriosity || isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 3, 0, 2 * Math.PI, false);
        ctx.strokeStyle = isCuriosity ? "rgba(0, 207, 255, 0.8)" : "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (exploredNodeIds?.has(node.id)) {
        // Glowing cyan illuminated ring indicating node has been explored by the user
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 2.5, 0, 2 * Math.PI, false);
        ctx.strokeStyle = "rgba(0, 207, 255, 0.85)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      } else {
        // Muted dashed border for unexplored nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 2, 0, 2 * Math.PI, false);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Core node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
      ctx.fillStyle = isCuriosity ? "#ffffff" : domain.main;
      ctx.fill();

      // Node label
      const fontSize = Math.max(10, Math.min(14, 12 / globalScale));
      if (globalScale > 0.7 || isCuriosity || isHighlighted) {
        ctx.font = `${isCuriosity || isHighlighted ? "600" : "500"} ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const labelY = node.y + r + fontSize * 0.9;
        const text = node.name;

        // Dark text outline for readability
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
        ctx.strokeText(text, node.x, labelY);

        // Foreground text
        ctx.fillStyle = isCuriosity
          ? "#ffffff"
          : isHighlighted
          ? "#ffffff"
          : "rgba(220, 235, 255, 0.85)";
        ctx.fillText(text, node.x, labelY);
      }

      ctx.globalAlpha = 1;
    },
    [highlightedData, selectedNodeId, hoveredNode, exploredNodeIds]
  );

  return (
    <div className="relative w-full h-full cursor-grab active:cursor-grabbing select-none">
      <ForceGraph2D
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={activeRef as any}
        graphData={graphData}
        width={width}
        height={height}
        backgroundColor="transparent"
        nodeRelSize={4}
        nodeCanvasObject={drawNode}
        nodeCanvasObjectMode={() => "replace"}
        onNodeClick={handleNodeClick}
        onNodeHover={(node) => setHoveredNode((node as ExtendedGraphNode) || null)}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={(link: object) => {
          const l = link as GraphLink;
          const s = typeof l.source === "object" ? (l.source as { id: string }).id : l.source;
          const t = typeof l.target === "object" ? (l.target as { id: string }).id : l.target;
          return highlightedData.highlightLinks.has(`${s}-${t}`) ? 2.8 : 1.6;
        }}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleColor={() => "#00cfff"}
        linkColor={(link: object) => {
          const l = link as GraphLink;
          const s = typeof l.source === "object" ? (l.source as { id: string }).id : l.source;
          const t = typeof l.target === "object" ? (l.target as { id: string }).id : l.target;
          const isHighlighted = highlightedData.highlightLinks.has(`${s}-${t}`);

          if (highlightedData.hasActive) {
            return isHighlighted ? "rgba(0, 207, 255, 0.85)" : "rgba(0, 207, 255, 0.05)";
          }
          return "rgba(0, 207, 255, 0.22)";
        }}
        linkWidth={(link: object) => {
          const l = link as GraphLink;
          const s = typeof l.source === "object" ? (l.source as { id: string }).id : l.source;
          const t = typeof l.target === "object" ? (l.target as { id: string }).id : l.target;
          return highlightedData.highlightLinks.has(`${s}-${t}`) ? 2.2 : 1;
        }}
        cooldownTicks={120}
        d3VelocityDecay={0.3}
        warmupTicks={30}
      />
    </div>
  );
}
