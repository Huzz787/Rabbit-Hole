import React from "react";
import { TopicItem } from "@/types";
import { Sparkles, ArrowRight } from "lucide-react";

interface TopicCardProps {
  topic: TopicItem;
  onExplore?: (topic: TopicItem) => void;
}

export function TopicCard({ topic, onExplore }: TopicCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          {topic.name}
        </h3>
        {topic.category && (
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            {topic.category}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
        {topic.summary}
      </p>
      {onExplore && (
        <button
          onClick={() => onExplore(topic)}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <span>Dive Deeper</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default TopicCard;
