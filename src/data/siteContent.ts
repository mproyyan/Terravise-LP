import type { WorkflowStep } from "../types"

export const SITE_CONTENT = {
  hero: {
    badge: "iPadOS Geotechnical Field Intelligence · Apple Silicon M-Series",
    titleLine1: "A defensible foundation starts",
    titleLine2: "below the blind grid.",
    subtitle:
      "Terravise directs CPT rig exploration in real time. On-device SchemaGAN generative models and reinforcement learning agents replace rigid borehole grids with data-guided sounding locations.",
    primaryCta: "Download on App Store",
    secondaryCta: "Download sample CPT file",
    appStoreUrl: "https://apps.apple.com/app/terravise",
    specPoints: [
      { label: "Rig hours saved", value: "35% to 45%" },
      { label: "On-device latency", value: "82 ms" },
      { label: "Neural engine", value: "100% offline Core ML" },
      { label: "Standard test code", value: "ASTM D5778 & SNI 8460" },
    ],
  },
  problem: {
    tag: "01 / Investigation limits",
    heading: "Fixed grid spacing causes three fundamental engineering failures",
    subheading:
      "Conventional site investigations mandate drilling soundings in rigid geometric grids (such as a borehole every 25 to 50 meters). This practice causes three fundamental engineering failures: redundant drilling in uniform ground, blind spots in layered geology, and arbitrary stopping criteria.",
    cards: [
      {
        number: "01",
        title: "Redundant drilling in homogeneous ground",
        description:
          "In uniform sand or silt, fixed grids repeat identical observations. Exploration crews spend days and thousands of dollars on redundant soundings that yield no new strata data.",
        impact: "30% to 50% extra rig hours",
        badge: "Redundant drilling",
      },
      {
        number: "02",
        title: "Blind spots in layered geology",
        description:
          "Faults, dipping bedrock interfaces, and soft sensitive marine clay pockets often measure under 20 meters across. Fixed grids place boreholes on either side, missing critical hazard pockets entirely until post-construction differential settlement occurs.",
        impact: "Differential settlement risk",
        badge: "Structural hazard",
      },
      {
        number: "03",
        title: "Arbitrary stopping criteria",
        description:
          "Drilling campaigns stop when contract budgets expire, not when the subsurface soil volume is mathematically understood with defensible certainty.",
        impact: "Defensible stopping data",
        badge: "Contract limit",
      },
    ],
  },
  dqn: {
    tag: "02 / Next sounding selection",
    heading: "Reinforcement learning selects each sounding coordinate",
    subheading:
      "The on-device Deep Q-Network evaluates candidate coordinates within the project boundary across 29 engineered features. It routes the CPT rig to the coordinate with maximum information gain.",
    recommendationTitle: "DQN target coordinate · Spot 2",
    tabs: [
      {
        id: "gap",
        label: "Data gap",
        description:
          "Fills the largest spatial void under heavy structural core loads (16.2 meter gap, zero soundings within a 4.0 meter radius).",
      },
      {
        id: "transition",
        label: "Stratigraphic shift",
        description:
          "Flags predicted formation boundaries where clean sand terminates into soft sensitive clay at 8.5 meters depth.",
      },
      {
        id: "anomaly",
        label: "Soil behavior anomaly",
        description:
          "Highlights localized lateral variations (ΔIc = 0.18) compared to adjacent soundings B-01 and B-03.",
      },
    ],
  },
  voxel: {
    tag: "03 / Subsurface volume",
    heading: "Interactive 3D soil volume inspection",
    subheading:
      "Inspect continuous stratigraphy synthesized by SchemaGAN V4.2. Use dual Easting and Northing slicing controls to inspect layers from ground level down to 25.0 meters depth.",
  },
  bearing: {
    tag: "04 / Bearing layer verification",
    heading: "Competent strata depth and pile schedules",
    subheading:
      "Map the top of competent bearing soil across all completed soundings. Transfer confirmed pile toe termination depths directly to structural design teams.",
  },
  workflow: [
    {
      stepNumber: "01",
      depthM: 0.0,
      depthDisplay: "0.0 m (Ground Level)",
      stratumName: "Ground Surface & Boundary",
      stratumColor: "#D4A373",
      title: "Map site boundary on satellite imagery",
      subtitle: "Footprint mapping on iPadOS",
      description:
        "Trace building perimeters directly on high-resolution satellite maps with Apple Pencil or touch. Terravise locks geodetic coordinates and computes project area in seconds.",
      deliverable: "9,600 m2 locked footprint",
      badgeText: "WGS84 / UTM ZONE 48S",
      metrics: [
        { label: "Footprint Area", value: "0.96 Hectares" },
        { label: "Survey Vertices", value: "4 Corners Locked" },
        { label: "Candidate Nodes", value: "144 Grid Sites" },
      ],
    },
    {
      stepNumber: "02",
      depthM: -6.5,
      depthDisplay: "-6.5 m (Upper Strata)",
      stratumName: "Alluvial Sand & Silt Strata",
      stratumColor: "#588157",
      title: "Import CPT sounding files (.xlsx or .csv)",
      subtitle: "Automated spreadsheet file parsing",
      description:
        "Import standard CSV and Excel (.xlsx) files directly on the iPad as soundings complete. Terravise automatically maps instrument column headers (Electrical CPT, CPTm Bicone, CPTu) and reconstructs soil stratigraphy in milliseconds.",
      deliverable: "Parsed Robertson SBT soil profile",
      badgeText: "CSV & EXCEL (.XLSX) INGESTION",
      metrics: [
        { label: "File Formats", value: "CSV & Excel (.xlsx)" },
        { label: "Auto-Mapping", value: "CPT, CPTm, CPTu" },
        { label: "Parse Speed", value: "< 15 ms / sounding" },
      ],
    },
    {
      stepNumber: "03",
      depthM: -14.0,
      depthDisplay: "-14.0 m (Transition Zone)",
      stratumName: "Sensitive Clay & Void Zone",
      stratumColor: "#A0522D",
      title: "Route the rig to high-uncertainty targets",
      subtitle: "Autonomous coordinate guidance",
      description:
        "Instead of drilling uniform grids in identical ground, Terravise directs the rig to the coordinate with the largest information gap (Spot 2), showing clear technical rationale cards.",
      deliverable: "Target GPS coordinate & rationale cards",
      badgeText: "ELIMINATES 30% BLIND SOUNDINGS",
      metrics: [
        { label: "Next Sounding", value: "Spot 2 (Priority #1)" },
        { label: "Data Void", value: "16.2 m Unsurveyed Gap" },
        { label: "Information Gain", value: "+14.2% Certainty" },
      ],
    },
    {
      stepNumber: "04",
      depthM: -25.0,
      depthDisplay: "-25.0 m (Bearing Horizon)",
      stratumName: "Dense Bearing Bedrock",
      stratumColor: "#E76F51",
      title: "Verify STOP criteria and export pile schedules",
      subtitle: "Foundation handoff before rig demobilization",
      description:
        "When ground certainty reaches mathematical sufficiency (80% or greater), Terravise triggers the Practical STOP signal. Generate verified pile toe termination depths and export directly to structural designers.",
      deliverable: "Pile toe schedule (.CSV, CAD, LandXML)",
      badgeText: "PRACTICAL STOP VERIFIED (84% COVERAGE)",
      metrics: [
        { label: "STOP Status", value: "Met (84% Coverage)" },
        { label: "Pile Toe Depths", value: "-16.0 m to -17.5 m" },
        { label: "CAD Exports", value: "LandXML, CSV, gINT" },
      ],
    },
  ] as WorkflowStep[],
  trust: {
    tag: "05 / Standards and data privacy",
    heading: "Statutory standards. Offline on-device computation.",
    subheading:
      "Built for geotechnical field workflows. All neural calculations run on local Apple silicon neural engines with zero network transmission.",
    badges: [
      {
        title: "Robertson 9-zone classification",
        desc: "Classifies soil behavior type index automatically from normalized cone tip and sleeve friction measurements.",
      },
      {
        title: "UTM coordinate precision",
        desc: "Supports all standard UTM zones and local datum benchmarks including WGS84, DGN95, and ED50.",
      },
      {
        title: "Offline neural computation",
        desc: "SchemaGAN and DQN policies run on the local Apple neural engine. Field soundings never leave the iPad.",
      },
      {
        title: "ASTM D5778 & SNI 8460",
        desc: "Follows ASTM D5778 standard test methods for electronic friction cone testing and Indonesian SNI 8460:2017 foundation requirements.",
      },
    ],
  },
  faq: [
    {
      q: "Does Terravise replace the licensed geotechnical engineer?",
      a: "No. Terravise provides computational decision support during active drilling campaigns. Recommendations, uncertainty distributions, and stopping criteria support professional engineering judgment.",
    },
    {
      q: "What file formats can the rig operator import in the field?",
      a: "Terravise accepts direct serial and Bluetooth telemetry from digital CPT dataloggers, as well as AGS4, GEF, CSV, and Excel (.xlsx) spreadsheets.",
    },
    {
      q: "Can Terravise run on an iPad without an internet connection?",
      a: "Yes. Terravise is engineered to operate 100% offline in remote field sites. All Core ML models execute on the local Apple Neural Engine without transmitting data off-device.",
    },
    {
      q: "How does Terravise determine the foundation bearing layer?",
      a: "The BearingRuleEngine evaluates voxels where cone resistance qc ≥ 15 MPa and Soil Behavior Index Ic ≤ 1.80 over a continuous vertical thickness ≥ 2.0 meters using 6-neighbor 3D connected component clustering.",
    },
  ],
}
