import { GraphData, GraphNode, GraphLink } from "@/types";

export interface ExtendedGraphNode extends GraphNode {
  summary: string;
  category: string;
  connectionsCount?: number;
  highlighted?: boolean;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export const DOMAIN_COLORS: Record<string, { main: string; glow: string; text: string }> = {
  Curiosity: {
    main: "#ffffff",
    glow: "rgba(0, 207, 255, 0.9)",
    text: "#00cfff",
  },
  Astrophysics: {
    main: "#00cfff",
    glow: "rgba(0, 207, 255, 0.6)",
    text: "#38bdf8",
  },
  "Quantum Realm": {
    main: "#2dd4bf",
    glow: "rgba(45, 212, 191, 0.6)",
    text: "#5eead4",
  },
  Consciousness: {
    main: "#a855f7",
    glow: "rgba(168, 85, 247, 0.6)",
    text: "#c084fc",
  },
  Philosophy: {
    main: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.6)",
    text: "#7dd3fc",
  },
  "Ancient Enigmas": {
    main: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.6)",
    text: "#fde68a",
  },
  "Deep Biosphere": {
    main: "#34d399",
    glow: "rgba(52, 211, 153, 0.6)",
    text: "#6ee7b7",
  },
};

export const SAMPLE_GRAPH_NODES: ExtendedGraphNode[] = [
  // Center
  {
    id: "curiosity",
    name: "Curiosity",
    val: 26,
    color: "#ffffff",
    group: "Curiosity",
    category: "Curiosity",
    summary: "The fundamental human impulse to ask 'what if' and unravel the unknown. The nexus of all exploration.",
    depth: 0,
    highlighted: true,
  },

  // Astrophysics & Space
  {
    id: "black-holes",
    name: "Black Holes",
    val: 18,
    color: "#00cfff",
    group: "Astrophysics",
    category: "Astrophysics",
    summary: "Regions of spacetime where gravitational acceleration is so strong that nothing—not even light—can escape.",
    depth: 1,
  },
  {
    id: "event-horizons",
    name: "Event Horizons",
    val: 12,
    color: "#00cfff",
    group: "Astrophysics",
    category: "Astrophysics",
    summary: "The threshold boundary around a black hole beyond which celestial events cannot affect an outside observer.",
    depth: 2,
  },
  {
    id: "hawking-radiation",
    name: "Hawking Radiation",
    val: 12,
    color: "#00cfff",
    group: "Astrophysics",
    category: "Astrophysics",
    summary: "Theoretical black-body thermal radiation released outside a black hole's event horizon due to quantum relativistic effects.",
    depth: 2,
  },
  {
    id: "fermi-paradox",
    name: "The Fermi Paradox",
    val: 18,
    color: "#00cfff",
    group: "Astrophysics",
    category: "Astrophysics",
    summary: "The glaring contradiction between the high probability of extraterrestrial life in the universe and the complete lack of evidence.",
    depth: 1,
  },
  {
    id: "kardashev-scale",
    name: "Kardashev Scale",
    val: 13,
    color: "#00cfff",
    group: "Astrophysics",
    category: "Astrophysics",
    summary: "A method of measuring a civilization's level of technological advancement based on the amount of cosmic energy they can harness.",
    depth: 2,
  },
  {
    id: "dark-matter",
    name: "Dark Matter & Energy",
    val: 15,
    color: "#00cfff",
    group: "Astrophysics",
    category: "Astrophysics",
    summary: "Invisible cosmic mass and pervasive energy that constitute roughly 95% of the total universe.",
    depth: 2,
  },
  {
    id: "wormholes",
    name: "Spacetime Wormholes",
    val: 13,
    color: "#00cfff",
    group: "Astrophysics",
    category: "Astrophysics",
    summary: "Hypothetical topological features creating theoretical shortcuts through four-dimensional spacetime.",
    depth: 2,
  },

  // Quantum Realm
  {
    id: "quantum-computing",
    name: "Quantum Computing",
    val: 18,
    color: "#2dd4bf",
    group: "Quantum Realm",
    category: "Quantum Realm",
    summary: "Harnessing quantum mechanics—superposition and entanglement—to perform computations far beyond classical supercomputers.",
    depth: 1,
  },
  {
    id: "quantum-entanglement",
    name: "Quantum Entanglement",
    val: 15,
    color: "#2dd4bf",
    group: "Quantum Realm",
    category: "Quantum Realm",
    summary: "Einstein's 'spooky action at a distance', where quantum states of pairs remain inextricably linked across cosmic distances.",
    depth: 2,
  },
  {
    id: "superposition",
    name: "Superposition",
    val: 12,
    color: "#2dd4bf",
    group: "Quantum Realm",
    category: "Quantum Realm",
    summary: "The principle that a physical system exists partially in all theoretically possible states simultaneously until observed.",
    depth: 2,
  },
  {
    id: "many-worlds",
    name: "Many-Worlds Interpretation",
    val: 14,
    color: "#2dd4bf",
    group: "Quantum Realm",
    category: "Quantum Realm",
    summary: "Everett's quantum hypothesis that all alternative possible quantum histories and futures are real, each in its own universe.",
    depth: 2,
  },

  // Consciousness
  {
    id: "psychology-of-dreams",
    name: "Psychology of Dreams",
    val: 18,
    color: "#a855f7",
    group: "Consciousness",
    category: "Consciousness",
    summary: "The mysterious nocturnal tapestry where the unconscious brain processes emotion, memory consolidation, and abstract symbolisms.",
    depth: 1,
  },
  {
    id: "lucid-dreaming",
    name: "Lucid Dreaming",
    val: 12,
    color: "#a855f7",
    group: "Consciousness",
    category: "Consciousness",
    summary: "The state of becoming meta-cognitively aware that one is dreaming, opening voluntary control over simulated reality.",
    depth: 2,
  },
  {
    id: "hard-problem",
    name: "Hard Problem of Consciousness",
    val: 15,
    color: "#a855f7",
    group: "Consciousness",
    category: "Consciousness",
    summary: "Chalmers' paradox: why and how physical brain matter gives rise to subjective, qualitative inner experience (qualia).",
    depth: 2,
  },
  {
    id: "neuroplasticity",
    name: "Neural Plasticity",
    val: 12,
    color: "#a855f7",
    group: "Consciousness",
    category: "Consciousness",
    summary: "The brain's lifelong ability to dynamically reorganize synaptic pathways in response to novel experiences and thought patterns.",
    depth: 2,
  },

  // Philosophy & Reality
  {
    id: "simulation-hypothesis",
    name: "The Simulation Hypothesis",
    val: 18,
    color: "#38bdf8",
    group: "Philosophy",
    category: "Philosophy",
    summary: "The philosophical proposition that reality, including Earth and the cosmos, is an artificial computer simulation.",
    depth: 1,
  },
  {
    id: "bostrom-trilemma",
    name: "Bostrom's Trilemma",
    val: 13,
    color: "#38bdf8",
    group: "Philosophy",
    category: "Philosophy",
    summary: "Nick Bostrom's probabilistic argument concluding that it is almost certain we live in a post-human ancestor simulation.",
    depth: 2,
  },
  {
    id: "information-theory",
    name: "It From Bit",
    val: 14,
    color: "#38bdf8",
    group: "Philosophy",
    category: "Philosophy",
    summary: "John Archibald Wheeler's theory that every physical item in the universe is at its bottom immaterial information.",
    depth: 2,
  },
  {
    id: "panpsychism",
    name: "Panpsychism",
    val: 12,
    color: "#38bdf8",
    group: "Philosophy",
    category: "Philosophy",
    summary: "The ancient view that mind or consciousness is a fundamental, ubiquitous feature of all matter down to subatomic particles.",
    depth: 2,
  },

  // Ancient Enigmas
  {
    id: "lost-civilizations",
    name: "Lost Civilizations",
    val: 18,
    color: "#fbbf24",
    group: "Ancient Enigmas",
    category: "Ancient Enigmas",
    summary: "Submerged ruins, megalithic architectural marvels, and forgotten technological epochs erased by past cataclysms.",
    depth: 1,
  },
  {
    id: "antikythera-mechanism",
    name: "Antikythera Mechanism",
    val: 13,
    color: "#fbbf24",
    group: "Ancient Enigmas",
    category: "Ancient Enigmas",
    summary: "An ancient Greek analogue computer and orrery from 150 BC exhibiting precision gear craftsmanship centuries ahead of its era.",
    depth: 2,
  },
  {
    id: "voynich-manuscript",
    name: "The Voynich Manuscript",
    val: 13,
    color: "#fbbf24",
    group: "Ancient Enigmas",
    category: "Ancient Enigmas",
    summary: "An illustrated codex carbon-dated to the 15th century, written in an unknown, completely undeciphered writing system.",
    depth: 2,
  },

  // Deep Biosphere
  {
    id: "abyssal-trench",
    name: "Abyssal Trenches",
    val: 15,
    color: "#34d399",
    group: "Deep Biosphere",
    category: "Deep Biosphere",
    summary: "Hadal zone deep-ocean chasms under thousands of atmospheres of pressure teeming with alien-like life adapted to perpetual darkness.",
    depth: 1,
  },
  {
    id: "bioluminescence",
    name: "Bioluminescence",
    val: 13,
    color: "#34d399",
    group: "Deep Biosphere",
    category: "Deep Biosphere",
    summary: "Living light generated through chemical reactions in abyssal organisms to communicate, camouflage, and lure prey.",
    depth: 2,
  },
  {
    id: "extremophiles",
    name: "Extremophiles",
    val: 12,
    color: "#34d399",
    group: "Deep Biosphere",
    category: "Deep Biosphere",
    summary: "Organisms thriving in geochemically extreme conditions on Earth, redefining the biological boundaries of cosmic life.",
    depth: 2,
  },
];

export const SAMPLE_GRAPH_LINKS: GraphLink[] = [
  // Primary connections to Curiosity
  { source: "curiosity", target: "black-holes", relationship: "Fundamental Mystery" },
  { source: "curiosity", target: "quantum-computing", relationship: "Frontier of Logic" },
  { source: "curiosity", target: "psychology-of-dreams", relationship: "Inner Cosmos" },
  { source: "curiosity", target: "simulation-hypothesis", relationship: "Nature of Reality" },
  { source: "curiosity", target: "lost-civilizations", relationship: "Forgotten Past" },
  { source: "curiosity", target: "fermi-paradox", relationship: "Cosmic Solitude" },
  { source: "curiosity", target: "abyssal-trench", relationship: "Unknown Depths" },

  // Astrophysics links
  { source: "black-holes", target: "event-horizons" },
  { source: "black-holes", target: "hawking-radiation" },
  { source: "black-holes", target: "wormholes" },
  { source: "black-holes", target: "dark-matter" },
  { source: "fermi-paradox", target: "kardashev-scale" },
  { source: "fermi-paradox", target: "extremophiles" },

  // Quantum links
  { source: "quantum-computing", target: "superposition" },
  { source: "quantum-computing", target: "quantum-entanglement" },
  { source: "quantum-entanglement", target: "many-worlds" },
  { source: "quantum-entanglement", target: "wormholes" },

  // Consciousness links
  { source: "psychology-of-dreams", target: "lucid-dreaming" },
  { source: "psychology-of-dreams", target: "hard-problem" },
  { source: "hard-problem", target: "neuroplasticity" },
  { source: "hard-problem", target: "panpsychism" },

  // Philosophy links
  { source: "simulation-hypothesis", target: "bostrom-trilemma" },
  { source: "simulation-hypothesis", target: "information-theory" },
  { source: "information-theory", target: "quantum-computing" },
  { source: "information-theory", target: "hawking-radiation" },
  { source: "bostrom-trilemma", target: "fermi-paradox" },
  { source: "simulation-hypothesis", target: "lucid-dreaming" },

  // Ancient & Deep Links
  { source: "lost-civilizations", target: "antikythera-mechanism" },
  { source: "lost-civilizations", target: "voynich-manuscript" },
  { source: "abyssal-trench", target: "bioluminescence" },
  { source: "abyssal-trench", target: "extremophiles" },
  { source: "extremophiles", target: "dark-matter" },
];

export const SAMPLE_KNOWLEDGE_GRAPH: GraphData = {
  nodes: SAMPLE_GRAPH_NODES,
  links: SAMPLE_GRAPH_LINKS,
};
