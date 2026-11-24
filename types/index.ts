/**
 * Core type definitions for The Rabbit Hole
 */

export interface GraphNode {
  id: string;
  name: string;
  val?: number;
  color?: string;
  group?: string;
  summary?: string;
  depth?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  relationship?: string;
  value?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface TopicItem {
  id: string;
  name: string;
  summary: string;
  category?: string;
  depth?: number;
  relatedTopics?: string[];
}

export interface ExplorationJourney {
  id: string;
  sessionName: string;
  startedAt: string;
  stepsCount: number;
}
