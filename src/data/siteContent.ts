import type { WorkflowStep } from "../types"

export const SITE_CONTENT = {
  hero: {
    badge: "Native Apple Silicon • Autonomous CPT Copilot",
    titleLine1: "A Defensible Foundation Starts",
    titleLine2: "Below the Blind Grid.",
    subtitle:
      "Terravise transforms rigid Cone Penetration Testing (Sondir) schedules into an adaptive, data-driven exploration process. Powered by on-device SchemaGAN generative models and reinforcement learning DQN agents.",
    primaryCta: "Request Pilot Access",
    secondaryCta: "Download CPT Template",
    specPoints: [
      { label: "Ground Certainty Target", value: "84.2%" },
      { label: "Drilling Time Saved", value: "35–45%" },
      { label: "On-Device Inference", value: "< 85 ms" },
      { label: "Standards Compliance", value: "ASTM D5778 / SNI 8460" },
    ],
  },
  problem: {
    tag: "01 — The Engineering Dilemma",
    heading: "The Paradox of Blind Uniform Grids",
    subheading:
      "Conventional site campaigns mandate drilling soundings every 25–50 meters in rigid geometric squares. This creates severe economic waste and dangerous geotechnical liabilities.",
    cards: [
      {
        number: "01",
        title: "Uniform Soil Over-Drilling",
        description:
          "In homogeneous formations, rigid grids burn weeks of rig mobilization and hundreds of millions in operational budget on redundant, identical soundings.",
        impact: "30-50% redundant drilling cost",
        badge: "Budget Burn",
      },
      {
        number: "02",
        title: "Complex Strata Blind Spots",
        description:
          "In folded geology, washouts and dipping bedrock fall precisely between grid squares, leaving sensitive clay lenses undiscovered until foundation failure.",
        impact: "Severe differential settlement risks",
        badge: "Structural Risk",
      },
      {
        number: "03",
        title: "Arbitrary Contract Stopping",
        description:
          "Drilling campaigns traditionally stop when the contract budget runs out, not when the subsurface soil profile is mathematically known with defensible confidence.",
        impact: "Zero statistical certainty",
        badge: "Liability Exposure",
      },
    ],
  },
  dqn: {
    tag: "02 — AI Next-Point Policy",
    heading: "Reinforcement Learning Active Guidance",
    subheading:
      "Instead of guessing where to mobilize the 20-ton CPT crawler next, Terravise's DQN agent ranks candidate locations by maximum information gain and uncertainty reduction.",
    recommendationTitle: "DQN Optimal Target: Spot 2",
    tabs: [
      {
        id: "gap",
        label: "Data Gap Optimization",
        description:
          "Fills a critical 16.2 m spatial void under high foundation loads with 0 existing soundings within a 4 m radius.",
      },
      {
        id: "transition",
        label: "Stratigraphic Transition",
        description:
          "SchemaGAN V4.2 flags a high-probability boundary between clean sand and soft sensitive marine clay at -8.5 m depth.",
      },
      {
        id: "anomaly",
        label: "Lateral Anomaly (ΔIc)",
        description:
          "Soil Behavior Type Index indicates lateral ΔIc = 0.18 divergence against sounding cluster B-01/B-03.",
      },
    ],
  },
  dynamicStop: {
    tag: "03 — Stopping Criteria",
    heading: "Ground Certainty Stopping Metric",
    subheading:
      "Know precisely when enough is enough. When cumulative model entropy drops below statutory safety thresholds, Terravise issues an automated STOP recommendation.",
    certaintyValue: 84.2,
    threshold: 80.0,
    statusText: "CPT coverage is statistically sufficient. Practical STOP criteria met.",
    explanation:
      "Continuing to drill beyond 80% certainty yields under 0.8% marginal information gain while inflating rig mobilization costs by $4,200/day.",
  },
  voxel: {
    tag: "04 — 3D Strata Inspection",
    heading: "Interactive Subsurface Voxel Cross-Section",
    subheading:
      "Slice seamlessly through soil volumes with dual Easting (X) and Northing (Y) parametric cutters. Inspect continuous stratigraphy from ground surface down to -25.0 m.",
  },
  bearing: {
    tag: "05 — Bearing Stratum Analysis",
    heading: "Competent Strata Depth & Pile Scheduling",
    subheading:
      "Instantly map the top of competent bearing soil across all soundings to deliver defensible pile toe termination depths for structural engineering handoffs.",
  },
  workflow: [
    {
      stepNumber: "01",
      title: "Import & Calibrate",
      subtitle: "Live CPT Rig Ingestion",
      description:
        "Stream cone resistance (qc), sleeve friction (fs), and pore pressure (u2) directly from electronic dataloggers or upload standard AGS/Excel files.",
      deliverable: "Standardized Robertson SBT (1990/2010) profile",
      badgeText: "Field Ingestion",
    },
    {
      stepNumber: "02",
      title: "Generative Strata Synthesis",
      subtitle: "SchemaGAN V4.2 Simulation",
      description:
        "Deep generative models synthesize probabilistic 3D soil volume distributions, highlighting hidden lenses, fault zones, and bedrock slopes.",
      deliverable: "3D Voxel Stratigraphy & Uncertainty Map",
      badgeText: "Neural Inference",
    },
    {
      stepNumber: "03",
      title: "Active DQN Sounding Guidance",
      subtitle: "Dynamic Rig Routing",
      description:
        "The on-device reinforcement learning agent evaluates coordinate candidates, directing the operator to the sounding coordinate with highest information gain.",
      deliverable: "Target Coordinates (UTM / WGS84) + Rationale",
      badgeText: "Autonomous Routing",
    },
    {
      stepNumber: "04",
      title: "Statistical STOP & Pile Export",
      subtitle: "Engineering Deliverables",
      description:
        "Attain defensible statutory stopping certainty. Export georeferenced pile toe elevation schedules and spatial bearing contours directly into CAD/BIM.",
      deliverable: "CAD DXF, CSV, and Audited PDF Reports",
      badgeText: "Executive Handover",
    },
  ] as WorkflowStep[],
  trust: {
    tag: "06 — Engineering Integrity",
    heading: "Rigorous Standards. Zero Cloud Leakage.",
    subheading:
      "Built strictly according to global geotechnical statutory frameworks with zero proprietary project data transmitted off your device.",
    badges: [
      {
        title: "Robertson SBT 9-Zone Standard",
        desc: "Automated classification according to Robertson (1990 & 2010) normalized Soil Behavior Type methods.",
      },
      {
        title: "Sub-Centimeter UTM Precision",
        desc: "Full projection conversion across all UTM zones and local datum benchmarks (WGS84, DGN95, ED50).",
      },
      {
        title: "100% On-Device Neural Privacy",
        desc: "All SchemaGAN generative models and DQN policies execute offline via Apple Silicon Neural Engine. Zero cloud telemetry.",
      },
      {
        title: "ASTM D5778 & SNI 8460 Compliant",
        desc: "Formally aligned with international standard test methods for electronic friction cone and piezocone penetration.",
      },
    ],
  },
  faq: [
    {
      q: "Does Terravise replace the licensed geotechnical engineer of record?",
      a: "No. Terravise is an advanced engineering copilot designed to eliminate blind spots and reduce redundant drilling. All model inferences, uncertainty bounds, and stopping recommendations serve as defensible computational evidence to support professional engineering judgment.",
    },
    {
      q: "What file formats can be streamed into Terravise in the field?",
      a: "Terravise accepts direct live serial/Bluetooth telemetry from standard CPT dataloggers, as well as offline import of standard AGS4, GEF, CPTv, CSV, and Excel (.xlsx) formats.",
    },
    {
      q: "How does the Ground Certainty metric mathematically determine when to stop?",
      a: "Ground Certainty calculates the residual spatial entropy across the 3D exploration volume. Once additional soundings offer less than 1.0% marginal uncertainty reduction and all critical building footprint loads meet bearing criteria, the statistical STOP criteria is triggered.",
    },
    {
      q: "Can Terravise run completely offline without an internet connection?",
      a: "Yes. Terravise is designed for remote exploration camps and offshore rigs. The entire neural model inference stack runs natively on-device using CoreML and the Apple Neural Engine without requiring internet connectivity.",
    },
  ],
}
