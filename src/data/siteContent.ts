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
      depthDisplay: "0.0 m",
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
      depthDisplay: "-6.5 m",
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
      depthDisplay: "-14.0 m",
      stratumName: "Sensitive Clay & Void Zone",
      stratumColor: "#A0522D",
      title: "Recommend optimal sounding coordinates",
      subtitle: "Target coordinate recommendation",
      description:
        "The on-device AI evaluates completed soundings to identify critical data gaps and recommend the highest-value coordinates for the next test.",
      deliverable: "Spot 2 target coordinates (UTM 48S)",
      badgeText: "AUTONOMOUS RIG ROUTING",
      metrics: [
        { label: "Target Coordinate", value: "Spot 2 (48S 704120E)" },
        { label: "Primary Factor", value: "16.2 m Spatial Void" },
        { label: "Model Confidence", value: "84% (Q-Value #1)" },
      ],
      rationales: [
        {
          title: "Data Gap",
          desc: "16.2 m unmeasured void under core structural zone.",
          badge: "High Void",
        },
        {
          title: "Strata Boundary",
          desc: "Predicted transition to soft marine clay at -8.5 m.",
          badge: "Clay Interface",
        },
        {
          title: "Soil Anomaly",
          desc: "Localized soil behavior shift near soundings B-01 and B-03.",
          badge: "Behavior Shift",
        },
      ],
    },
    {
      stepNumber: "04",
      depthM: -25.0,
      depthDisplay: "-25.0 m",
      stratumName: "Dense Bearing Stratum",
      stratumColor: "#E76F51",
      title: "Inspect 3D stratigraphy and compare bearing layer depths",
      subtitle: "3D volume & depth comparison",
      description:
        "Inspect continuous 3D stratigraphy with slicing controls, or switch to the bearing layer heatmap to verify competent soil depth at key points and compare depths across building column locations.",
      deliverable: "Verified bearing depth across column locations",
      badgeText: "3D STRATIGRAPHY & BEARING HEATMAP",
      metrics: [
        { label: "CPT B-01 Bearing", value: "-14.8 m depth" },
        { label: "CPT B-02 Bearing", value: "-16.2 m depth" },
        { label: "Spot 2 Bearing", value: "-15.0 m depth" },
      ],
    },
  ] as WorkflowStep[],
  trust: {
    tag: "06 / Standards and data privacy",
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
  appDemo: {
    tag: "07 / Product film & demo",
    heading: "See Beneath. Decide Better.",
    subheading:
      "Before designing a foundation, engineers need to understand the ground it will stand on. Watch how Terravise transforms isolated CPT soundings into site-wide intelligence and recommends where to test next.",
    slogan: "See Beneath. Decide Better.",
    scenes: [
      {
        time: "00:00",
        seconds: 0,
        sceneNumber: "01",
        title: "The Ground Beneath",
        narration:
          "Every building begins with a vision. But what holds that vision up... lies beneath the surface.",
        desc: "Setting the foundation challenge: understanding site geology before construction.",
      },
      {
        time: "00:45",
        seconds: 45,
        sceneNumber: "02",
        title: "Cone Penetration Testing",
        narration:
          "Before designing a foundation, geotech engineers need to understand the ground it will stand on. One way to investigate the ground is through Cone Penetration Testing, or CPT. Each test provides information about the soil at a specific location.",
        desc: "Investigating soil resistance and stratigraphy at specific test coordinates.",
      },
      {
        time: "01:30",
        seconds: 90,
        sceneNumber: "03",
        title: "The Site-Wide Dilemma",
        narration:
          "But each test only tells us about one spot. Engineers still need to decide where to test next and get a better understanding of the soil conditions of the entire site.",
        desc: "Overcoming blind spots between soundings without costly redundant drilling.",
      },
      {
        time: "02:20",
        seconds: 140,
        sceneNumber: "04",
        title: "Informed Recommendation",
        narration:
          "Using existing CPT data, Terravise recommends the next location to investigate and explains why it is recommended, helping engineers make informed decisions.",
        desc: "Real-time coordinate guidance backed by transparent information-gain rationale.",
      },
      {
        time: "03:15",
        seconds: 195,
        sceneNumber: "05",
        title: "3D Strata & Hard Soil",
        narration:
          "It also visualizes predicted soil layers in 3D, helping engineers estimate the depth of hard soil across the site. This gives engineers a better understanding of the ground across their construction site.",
        desc: "Synthesizing continuous 3D stratigraphy and verifying competent bearing strata across the site.",
      },
    ],
    takeaways: [
      "Every CPT Sounding Contributes to Site-Wide Intelligence",
      "Transparent 'Why this point?' Target Rationale",
      "Predictive Continuous 3D Stratigraphy Volume",
      "Hard Soil Bearing Layer Depth Estimation Across the Site",
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
