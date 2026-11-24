export interface TrendingTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  accentColor: string;
  badgeColor: string;
  iconName: "black-hole" | "cpu" | "globe" | "moon" | "hourglass" | "sparkles";
  stats?: string;
  connectionsCount: number;
}

export const TRENDING_DISCOVERIES: TrendingTopic[] = [
  {
    id: "black-holes",
    title: "Black Holes",
    category: "Astrophysics",
    description:
      "Where the known laws of physics collapse into infinite density and spacetime twists into an inescapable event horizon.",
    accentColor: "from-cyan-500/20 via-blue-500/10 to-transparent",
    badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-950/30",
    iconName: "black-hole",
    stats: "Singularity & Spacetime",
    connectionsCount: 18,
  },
  {
    id: "quantum-computing",
    title: "Quantum Computing",
    category: "Quantum Physics",
    description:
      "Harnessing superposition and entanglement to calculate across multiversal probabilities simultaneously.",
    accentColor: "from-teal-500/20 via-emerald-500/10 to-transparent",
    badgeColor: "text-teal-400 border-teal-500/30 bg-teal-950/30",
    iconName: "cpu",
    stats: "Qubits & Entanglement",
    connectionsCount: 24,
  },
  {
    id: "the-simulation-hypothesis",
    title: "The Simulation Hypothesis",
    category: "Philosophy & Digital Physics",
    description:
      "Could our physical universe and individual consciousness be an ultra-high-resolution artificial simulation running in a higher reality?",
    accentColor: "from-blue-500/20 via-indigo-500/10 to-transparent",
    badgeColor: "text-blue-400 border-blue-500/30 bg-blue-950/30",
    iconName: "globe",
    stats: "Bostrom's Trilemma",
    connectionsCount: 16,
  },
  {
    id: "psychology-of-dreams",
    title: "Psychology of Dreams",
    category: "Consciousness",
    description:
      "What happens when waking reality disengages and the human subconscious constructs intricate, unconstrained nocturnal worlds?",
    accentColor: "from-purple-500/20 via-fuchsia-500/10 to-transparent",
    badgeColor: "text-purple-400 border-purple-500/30 bg-purple-950/30",
    iconName: "moon",
    stats: "Lucid States & REM",
    connectionsCount: 14,
  },
  {
    id: "lost-civilizations",
    title: "Lost Civilizations",
    category: "Ancient Enigmas",
    description:
      "Submerged megaliths, mathematical alignments, and forgotten chapters of human ingenuity swallowed by ancient geological cataclysms.",
    accentColor: "from-amber-500/20 via-orange-500/10 to-transparent",
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-950/30",
    iconName: "hourglass",
    stats: "Pre-Ice Age Ruins",
    connectionsCount: 21,
  },
  {
    id: "the-fermi-paradox",
    title: "The Fermi Paradox",
    category: "Astrobiology",
    description:
      "If the galaxy holds trillions of planets over billions of years, where is everyone? Confronting the deafening cosmic silence.",
    accentColor: "from-sky-500/20 via-cyan-500/10 to-transparent",
    badgeColor: "text-sky-400 border-sky-500/30 bg-sky-950/30",
    iconName: "sparkles",
    stats: "The Great Filter",
    connectionsCount: 19,
  },
];

export const SURPRISE_TOPICS: string[] = [
  "Black Holes",
  "Quantum Computing",
  "The Simulation Hypothesis",
  "Psychology of Dreams",
  "Lost Civilizations",
  "The Fermi Paradox",
  "The Voynich Manuscript",
  "Antikythera Mechanism",
  "The Hard Problem of Consciousness",
  "Kardashev Scale",
  "Quantum Entanglement",
  "Event Horizons",
  "Bioluminescence in the Deep Abyss",
  "Many-Worlds Interpretation",
  "It From Bit",
  "Neural Plasticity",
  "Dark Energy & the Accelerating Cosmos",
];

export const EXPLORATION_PREVIEWS: Record<
  string,
  {
    summary: string;
    category: string;
    relatedNodes: string[];
    deepDivePrompt: string;
  }
> = {
  "black-holes": {
    summary:
      "A black hole is a volume of spacetime where gravity is so intense that nothing—no particles, light, or electromagnetic radiation—can escape its boundary.",
    category: "Astrophysics",
    relatedNodes: [
      "Event Horizons",
      "Hawking Radiation",
      "Spacetime Wormholes",
      "Dark Matter & Energy",
      "Gravitational Singularity",
      "Accretion Disks",
      "General Relativity",
      "Information Paradox",
    ],
    deepDivePrompt: "Explore the breakdown of general relativity at the gravitational singularity.",
  },
  "quantum-computing": {
    summary:
      "Quantum computers exploit the unique properties of quantum states—specifically superposition, interference, and entanglement—to resolve intractable computational puzzles.",
    category: "Quantum Physics",
    relatedNodes: [
      "Superposition",
      "Quantum Entanglement",
      "Many-Worlds Interpretation",
      "It From Bit",
      "Quantum Decoherence",
      "Topological Qubits",
      "Quantum Supremacy",
    ],
    deepDivePrompt: "Explore quantum decoherence and multiversal interference patterns.",
  },
  "the-simulation-hypothesis": {
    summary:
      "Philosophical proposition suggesting reality could be an artificial simulator created by an advanced civilization with astronomical computing power.",
    category: "Philosophy",
    relatedNodes: [
      "Bostrom's Trilemma",
      "It From Bit",
      "Lucid Dreaming",
      "Quantum Computing",
      "Planck Length Limits",
      "Holographic Universe",
      "Digital Physics",
    ],
    deepDivePrompt: "Examine whether pixelated Planck length is evidence of computational quantization.",
  },
  "psychology-of-dreams": {
    summary:
      "Investigating dream states reveals profound links between memory pruning, emotional regulation, theta-wave neurochemistry, and altered self-awareness.",
    category: "Consciousness",
    relatedNodes: [
      "Lucid Dreaming",
      "Hard Problem of Consciousness",
      "Neural Plasticity",
      "Hypnagogic Hallucinations",
      "Default Mode Network",
      "Subconscious Cognitive Architecture",
    ],
    deepDivePrompt: "Investigate whether dreams simulate existential threats for evolutionary resilience.",
  },
  "lost-civilizations": {
    summary:
      "Examining astronomical alignments, submerged coastal structures, and anomalous precision stonework from the Younger Dryas boundary.",
    category: "Ancient Enigmas",
    relatedNodes: [
      "Antikythera Mechanism",
      "The Voynich Manuscript",
      "Göbekli Tepe",
      "Younger Dryas Boundary",
      "Ancient Megaliths",
      "Underwater Archaeology",
    ],
    deepDivePrompt: "Analyze the sudden emergence of monumental architecture at Göbekli Tepe.",
  },
  "the-fermi-paradox": {
    summary:
      "The eerie contradiction between the billions of habitable worlds in our galaxy and the complete absence of detected technological signatures.",
    category: "Astrobiology",
    relatedNodes: [
      "Kardashev Scale",
      "Bostrom's Trilemma",
      "Extremophiles",
      "The Great Filter",
      "Dyson Spheres",
      "Von Neumann Probes",
      "Rare Earth Hypothesis",
    ],
    deepDivePrompt: "Discover the Great Filter: Are we past the impossible barrier or is it ahead?",
  },
};
