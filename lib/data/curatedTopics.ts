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
    category: "Cognitive Science",
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
    category: "Archaeology & History",
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
  "Meteors and Cosmic Impacts",
  "Photosynthesis & Solar Capture",
  "Artificial Intelligence & Neural Networks",
];

export interface CuratedTopicData {
  title: string;
  category: string;
  description: string;
  summary: string;
  facts: string[];
  exploreNext: string[];
  relatedTopics: Array<{
    title: string;
    relationship: string;
    category: string;
    summary: string;
  }>;
}

export const CURATED_TOPICS: Record<string, CuratedTopicData> = {
  meteor: {
    title: "Meteor",
    category: "Astronomy & Planetary Science",
    description:
      "A meteor is the luminous streak of light produced when a meteoroid enters a planetary atmosphere at hypersonic speed and vaporizes due to ram-pressure heating.",
    summary:
      "Meteors represent dynamic collisions between interplanetary debris and Earth's upper atmosphere. Studying them reveals pristine elemental chemistry from the early solar system, illuminates atmospheric ablation dynamics, and assists planetary defense monitoring against hazardous impactors.",
    facts: [
      "Most light and heat from a meteor originate from ram pressure compression of atmospheric gas in front of the object, rather than direct surface friction.",
      "Astronomers distinguish three phases: a meteoroid in space, a meteor producing light in the atmosphere, and a meteorite that reaches the ground.",
      "Annual meteor showers occur when Earth sweeps through cometary debris trails, such as the Perseids originating from Comet Swift-Tuttle and Geminids from Asteroid 3200 Phaethon.",
      "The 2013 Chelyabinsk superbolide entered Earth's atmosphere over Russia at roughly 19 km/s, exploding at 30 km altitude with the energy of about 500 kilotons of TNT.",
      "Meteor glow colors reflect both chemical composition and atmospheric gas excitation; magnesium and nickel yield green-blue hues, while atmospheric nitrogen and oxygen produce red-orange glows.",
    ],
    exploreNext: [
      "Why do some meteoroids survive hypersonic atmospheric entry while others disintegrate completely in airbursts?",
      "How do astronomers reconstruct a meteor's orbital origin in the asteroid belt or Oort cloud from camera tracking networks?",
      "What chemical differences exist between primitive chondritic meteorites and differentiated iron meteorites?",
      "Could extraterrestrial organic molecules delivered by ancient meteors have catalyzed prebiotic chemistry on Earth?",
    ],
    relatedTopics: [
      {
        title: "Meteoroid",
        relationship: "Pre-atmospheric solid parent particle orbiting in interplanetary space",
        category: "Astronomy & Planetary Science",
        summary: "Small rocky or metallic bodies traveling through interplanetary space before intercepting a planetary atmosphere.",
      },
      {
        title: "Meteorite",
        relationship: "Solid physical fragment that survives atmospheric passage to strike ground",
        category: "Planetary Geology",
        summary: "Recovered extraterrestrial rocks providing direct laboratory access to primordial solar system materials.",
      },
      {
        title: "Atmospheric Ablation",
        relationship: "Thermodynamic mass-loss and vaporization mechanism during hypersonic entry",
        category: "Atmospheric Physics",
        summary: "The intense heating and mechanical shedding that vaporizes meteoroid surfaces at speeds from 11 to 72 km/s.",
      },
      {
        title: "Meteor Showers",
        relationship: "Periodic multi-meteor events caused by Earth crossing cometary orbital trails",
        category: "Observational Astronomy",
        summary: "Predictable annual celestial events where radiant points emit dozens to hundreds of meteors per hour.",
      },
      {
        title: "Impact Craters",
        relationship: "Geological scarring produced by large meteoroids and asteroid strikes",
        category: "Geophysics",
        summary: "Circular planetary depressions formed through hypervelocity kinetic energy release, such as Barringer Crater and Chicxulub.",
      },
      {
        title: "Chelyabinsk Meteor",
        relationship: "Benchmark modern superbolide airburst event observed with instrumented sensors",
        category: "Planetary Defense",
        summary: "The 20-meter near-Earth asteroid impact over Russia in February 2013 that injured over 1,000 people and renewed global planetary defense efforts.",
      },
      {
        title: "Tunguska Event",
        relationship: "Historical massive Siberian airburst of an incoming cometary or stony fragment",
        category: "Historical Science",
        summary: "The 1908 explosion that flattened 2,000 square kilometers of Siberian taiga forest without leaving a primary impact crater.",
      },
    ],
  },

  "black-holes": {
    title: "Black Holes",
    category: "Astrophysics",
    description:
      "A black hole is an astronomically dense region of spacetime where gravitational acceleration is so intense that nothing—not even electromagnetic radiation—can escape.",
    summary:
      "Formed from the gravitational collapse of massive stars or primordial cosmological fluctuations, black holes are premier natural laboratories for probing the intersection of Einstein's General Relativity and quantum field theory.",
    facts: [
      "The boundary marking the point of no return around a black hole is the event horizon; inside it, all geodesic paths lead inexorably inward.",
      "In 1974, Stephen Hawking demonstrated theoretically that quantum fluctuations near the event horizon cause black holes to emit thermal Hawking radiation and slowly evaporate.",
      "The Event Horizon Telescope produced the first direct radio silhouette of a supermassive black hole at the core of galaxy M87 in 2019.",
      "Supermassive black holes containing millions to billions of solar masses inhabit the centers of nearly all large galaxies, including Sagittarius A* in the Milky Way.",
      "Gravitational time dilation near a black hole horizon slows time drastically for an outside observer relative to a falling observer.",
    ],
    exploreNext: [
      "How does the Black Hole Information Paradox challenge the unitarity principle of quantum mechanics?",
      "Can supermassive black holes grow fast enough in the early universe without primordial seeds?",
      "What physical phenomena occur inside the ergosphere of a rotating Kerr black hole?",
      "Could micro black holes have formed in the first fractions of a second after the Big Bang?",
    ],
    relatedTopics: [
      {
        title: "Event Horizon",
        relationship: "The causal boundary beyond which events cannot affect an outside observer",
        category: "Astrophysics",
        summary: "The spherical threshold defining a black hole's point of no return.",
      },
      {
        title: "Hawking Radiation",
        relationship: "Quantum particle creation predicted near the gravitational horizon",
        category: "Theoretical Physics",
        summary: "Theoretical thermal radiation caused by quantum field fluctuations in curved spacetime.",
      },
      {
        title: "Accretion Disk",
        relationship: "Superheated matter spiraling inward toward the event horizon",
        category: "High Energy Astrophysics",
        summary: "A rotating disk of gas and dust emitting high-energy X-rays as it loses gravitational potential energy.",
      },
      {
        title: "Gravitational Singularity",
        relationship: "The central core where classical general relativity predicts infinite curvature",
        category: "General Relativity",
        summary: "A condition where density and gravitational curvature diverge toward infinity in classical physics.",
      },
      {
        title: "Gravitational Waves",
        relationship: "Spacetime ripples generated during binary black hole coalescences",
        category: "Gravitational Physics",
        summary: "Oscillations in spacetime metric detected by LIGO and Virgo during catastrophic cosmic mergers.",
      },
      {
        title: "Sagittarius A*",
        relationship: "The 4-million solar mass supermassive black hole at the center of the Milky Way",
        category: "Galactic Astronomy",
        summary: "The compact radio source anchoring stellar orbits at the heart of our home galaxy.",
      },
    ],
  },

  "artificial-intelligence": {
    title: "Artificial Intelligence",
    category: "Computer Science & Cognitive Systems",
    description:
      "Artificial Intelligence encompasses computational systems capable of performing cognitive tasks historically requiring human intelligence, such as pattern recognition, language reasoning, and autonomous decision-making.",
    summary:
      "From symbolic logic and statistical learning to deep transformer neural networks, AI has transitioned from academic conjecture to foundational infrastructure. It accelerates scientific discovery while presenting urgent socio-technical challenges in alignment, interpretability, and ethics.",
    facts: [
      "The Dartmouth Summer Research Project of 1956 is widely recognized as the foundational workshop that established artificial intelligence as an academic discipline.",
      "Deep neural networks learn representations through backpropagation, an algorithm that calculates gradients of loss functions across millions to billions of parameters.",
      "The Transformer architecture, introduced in 2017, revolutionized natural language processing by using self-attention mechanisms to process tokens in parallel.",
      "Reinforcement Learning from Human Feedback (RLHF) aligns probabilistic language models with human preferences, intentions, and safety guidelines.",
      "AlphaFold demonstrated that deep neural networks can accurately predict 3D protein structures from amino acid sequences, solving a 50-year grand challenge in structural biology.",
    ],
    exploreNext: [
      "How can mechanistic interpretability reveal what neural network representations actually compute internally?",
      "What are the mathematical limits of compute scaling versus data quality in training frontier foundation models?",
      "Can artificial neural systems achieve out-of-distribution causal reasoning without symbolic world models?",
      "How do we formally verify safety and constraint adherence in autonomous agent architectures?",
    ],
    relatedTopics: [
      {
        title: "Neural Networks",
        relationship: "The core mathematical architecture modeling interconnected weight layers",
        category: "Machine Learning",
        summary: "Layered computing systems inspired by biological brains that approximate complex nonlinear functions.",
      },
      {
        title: "Transformer Architecture",
        relationship: "The attention-based foundational structure behind modern large language models",
        category: "Deep Learning",
        summary: "The revolutionary self-attention neural network architecture introduced in 2017.",
      },
      {
        title: "Reinforcement Learning",
        relationship: "Autonomous training paradigm guided by reward feedback and environmental policy",
        category: "Autonomous Systems",
        summary: "Learning optimal behavior through iterative trial-and-error interactions with an environment.",
      },
      {
        title: "AI Alignment",
        relationship: "The research discipline ensuring AI systems conform to human values and safety goals",
        category: "AI Safety & Ethics",
        summary: "The vital field studying how to reliably guide AI systems toward intended human outcomes without deceptive behavior.",
      },
      {
        title: "Turing Test",
        relationship: "Historical benchmark evaluating indistinguishable conversational capability",
        category: "Philosophy of Computing",
        summary: "Alan Turing's 1950 operational test for assessing whether a machine exhibits intelligent behavior.",
      },
      {
        title: "Deep Learning",
        relationship: "The subset of machine learning utilizing multiple hierarchical feature extraction layers",
        category: "Computer Science",
        summary: "Hierarchical representation learning algorithms capable of processing raw perceptual data directly.",
      },
    ],
  },

  photosynthesis: {
    title: "Photosynthesis",
    category: "Biochemistry & Plant Biology",
    description:
      "Photosynthesis is the biochemical process by which oxygenic plants, algae, and cyanobacteria convert electromagnetic solar radiation into chemical bond energy stored in carbohydrates.",
    summary:
      "Photosynthesis is the biological cornerstone of Earth's biosphere, generating the atmospheric oxygen that sustains aerobic life and fixing atmospheric carbon dioxide into the organic base of global food webs.",
    facts: [
      "The Great Oxidation Event approximately 2.4 billion years ago was triggered by cyanobacteria evolving oxygenic photosynthesis, transforming Earth's atmosphere and surface geology.",
      "In the light-dependent reactions within thylakoid membranes, Photosystem II uses a manganese-calcium catalytic cluster to split water molecules into oxygen, protons, and electrons.",
      "Rubisco (ribulose-1,5-bisphosphate carboxylase-oxygenase) is the primary enzyme responsible for carbon fixation and is considered the most abundant protein on Earth.",
      "Quantum coherence has been observed in photosynthetic light-harvesting complexes, where excitons explore multiple pathways simultaneously to achieve near-100% quantum efficiency in energy transfer.",
      "C4 and CAM photosynthetic pathways evolved independently in arid environments to minimize photorespiration and drastically reduce water transpiration loss.",
    ],
    exploreNext: [
      "How do quantum effects in photosynthetic antennae protect reaction centers from photo-damage in variable sunlight?",
      "Can artificial catalytic systems replicate the water-splitting efficiency of Photosystem II for clean hydrogen production?",
      "What genetic engineering strategies are improving Rubisco's carbon fixation catalytic efficiency in major food crops?",
      "How did the endosymbiotic capture of ancient cyanobacteria give rise to modern eukaryotic chloroplasts?",
    ],
    relatedTopics: [
      {
        title: "Chloroplast",
        relationship: "The specialized cellular organelle where photosynthetic reactions take place",
        category: "Cell Biology",
        summary: "The double-membrane endosymbiotic organelle containing thylakoid stacks, stroma, and chlorophyll.",
      },
      {
        title: "Calvin Cycle",
        relationship: "The light-independent biochemical cycle that fixes atmospheric CO2 into sugars",
        category: "Biochemistry",
        summary: "The enzymatic cycle in the chloroplast stroma that synthesizes glyceraldehyde-3-phosphate using ATP and NADPH.",
      },
      {
        title: "Photosystem II",
        relationship: "The multi-protein complex that drives light absorption and water photolysis",
        category: "Biophysics",
        summary: "The membrane protein complex containing the water-oxidizing complex that generates atmospheric oxygen.",
      },
      {
        title: "Rubisco",
        relationship: "The carbon-fixing enzyme catalyzing the initial step of the Calvin cycle",
        category: "Molecular Enzymology",
        summary: "The pivotal enzyme catalyzing the carboxylation of RuBP, subject to photorespiratory oxygenation.",
      },
      {
        title: "Great Oxidation Event",
        relationship: "The paleoproterozoic atmospheric revolution caused by early cyanobacterial photosynthesis",
        category: "Geobiology & Earth History",
        summary: "The momentous surge in free atmospheric oxygen that permanently reshaped planetary geochemistry and biology.",
      },
      {
        title: "Chlorophyll",
        relationship: "The primary light-absorbing pigment molecule tuned to blue and red photons",
        category: "Organic Chemistry",
        summary: "The magnesium-porphyrin pigment that captures light photons to initiate photosynthetic electron transport.",
      },
    ],
  },
};

// Aliases for slug lookups
export const TOPIC_ALIASES: Record<string, string> = {
  meteors: "meteor",
  meteorite: "meteor",
  meteorites: "meteor",
  meteoroid: "meteor",
  meteoroids: "meteor",
  "black-hole": "black-holes",
  blackhole: "black-holes",
  blackholes: "black-holes",
  ai: "artificial-intelligence",
  "machine-learning": "artificial-intelligence",
  deeplearning: "artificial-intelligence",
  "deep-learning": "artificial-intelligence",
  plants: "photosynthesis",
};

export function getCuratedTopic(topicTitle: string): CuratedTopicData | null {
  const normalized = topicTitle.toLowerCase().trim().replace(/\s+/g, "-");
  if (CURATED_TOPICS[normalized]) {
    return CURATED_TOPICS[normalized];
  }
  const alias = TOPIC_ALIASES[normalized];
  if (alias && CURATED_TOPICS[alias]) {
    return CURATED_TOPICS[alias];
  }
  return null;
}

export const EXPLORATION_PREVIEWS: Record<
  string,
  {
    summary: string;
    category: string;
    relatedNodes: string[];
    deepDivePrompt: string;
  }
> = {
  meteor: {
    summary:
      "A meteor is the luminous streak of light produced when a meteoroid enters a planetary atmosphere at hypersonic speed and vaporizes due to ram pressure.",
    category: "Astronomy & Planetary Science",
    relatedNodes: [
      "Meteoroid",
      "Meteorite",
      "Atmospheric Ablation",
      "Meteor Showers",
      "Impact Craters",
      "Chelyabinsk Meteor",
      "Tunguska Event",
    ],
    deepDivePrompt: "Explore how atmospheric entry physics turns space dust into brilliant plasma fireballs.",
  },
  "black-holes": {
    summary:
      "A black hole is a volume of spacetime where gravity is so intense that nothing—no particles, light, or electromagnetic radiation—can escape its boundary.",
    category: "Astrophysics",
    relatedNodes: [
      "Event Horizon",
      "Hawking Radiation",
      "Accretion Disk",
      "Gravitational Singularity",
      "Gravitational Waves",
      "Sagittarius A*",
    ],
    deepDivePrompt: "Explore the breakdown of general relativity at the gravitational singularity.",
  },
  "artificial-intelligence": {
    summary:
      "Artificial Intelligence encompasses computational architectures capable of learning representations, processing natural language, and solving complex problems.",
    category: "Computer Science",
    relatedNodes: [
      "Neural Networks",
      "Transformer Architecture",
      "Reinforcement Learning",
      "AI Alignment",
      "Turing Test",
      "Deep Learning",
    ],
    deepDivePrompt: "Examine whether transformer attention layers represent emergent conceptual world models.",
  },
  photosynthesis: {
    summary:
      "Photosynthesis is the fundamental biochemical mechanism converting solar photons into chemical bond energy, providing the oxygen and organic carbon that sustain Earth's biosphere.",
    category: "Biochemistry & Plant Biology",
    relatedNodes: [
      "Chloroplast",
      "Calvin Cycle",
      "Photosystem II",
      "Rubisco",
      "Great Oxidation Event",
      "Chlorophyll",
    ],
    deepDivePrompt: "Analyze the quantum exciton transport mechanism in photosynthetic light-harvesting antennae.",
  },
  "quantum-computing": {
    summary:
      "Quantum computers exploit the unique properties of quantum states—specifically superposition, interference, and entanglement—to resolve intractable computational puzzles.",
    category: "Quantum Physics",
    relatedNodes: [
      "Superposition",
      "Quantum Entanglement",
      "Quantum Decoherence",
      "Topological Qubits",
      "Quantum Supremacy",
    ],
    deepDivePrompt: "Explore quantum decoherence and multiversal interference patterns.",
  },
  "the-simulation-hypothesis": {
    summary:
      "Philosophical proposition suggesting reality could be an artificial simulator created by an advanced civilization with astronomical computing power.",
    category: "Philosophy & Digital Physics",
    relatedNodes: [
      "Bostrom's Trilemma",
      "Digital Physics",
      "Information Theory",
      "Planck Length Limits",
      "Computational Complexity",
    ],
    deepDivePrompt: "Examine whether discrete Planck scale limits reflect computational granularity.",
  },
  "psychology-of-dreams": {
    summary:
      "Investigating dream states reveals profound links between memory pruning, emotional regulation, theta-wave neurochemistry, and altered self-awareness.",
    category: "Cognitive Science",
    relatedNodes: [
      "Lucid Dreaming",
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
    category: "Archaeology & History",
    relatedNodes: [
      "Antikythera Mechanism",
      "The Voynich Manuscript",
      "Göbekli Tepe",
      "Younger Dryas Boundary",
      "Ancient Megaliths",
    ],
    deepDivePrompt: "Analyze the sudden emergence of monumental architecture at Göbekli Tepe.",
  },
  "the-fermi-paradox": {
    summary:
      "The eerie contradiction between the billions of habitable worlds in our galaxy and the complete absence of detected technological signatures.",
    category: "Astrobiology",
    relatedNodes: [
      "Kardashev Scale",
      "The Great Filter",
      "Extremophiles",
      "Dyson Spheres",
      "Von Neumann Probes",
      "Rare Earth Hypothesis",
    ],
    deepDivePrompt: "Discover the Great Filter: Are we past the impossible barrier or is it ahead?",
  },
};
