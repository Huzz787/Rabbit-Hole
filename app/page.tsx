import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { KnowledgeUniversePreview } from "@/components/graph/KnowledgeUniversePreview";
import { TrendingDiscoveries } from "@/components/home/TrendingDiscoveries";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <HeroSection />

      {/* Knowledge Universe Force Graph Preview */}
      <KnowledgeUniversePreview />

      {/* Trending Discoveries 6-Card Grid */}
      <TrendingDiscoveries />
    </div>
  );
}
