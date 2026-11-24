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
    heading: "Fixed grid spacing creates two costly errors",
    subheading:
      "Standard site investigations space soundings 25 to 50 meters apart in uniform squares. In homogeneous soil, the crew drills redundant soundings. In layered ground, fixed spacing skips soft clay pockets and dipping rock layers.",
    cards: [
      {
        number: "01",
        title: "Over-drilling in uniform ground",
        description:
          "In uniform sand or silt, fixed spacing duplicates known strata. The rig spends days testing soil that earlier soundings already confirmed.",
        impact: "30% to 50% extra rig hours",
        badge: "Redundant drilling",
      },
      {
        number: "02",
        title: "Undetected soft clay lenses",
        description:
          "Soft sensitive marine clay pockets often measure less than 20 meters across. Fixed grids place boreholes on either side, missing the weak zone until foundation settlement occurs.",
        impact: "Differential settlement risk",
        badge: "Structural hazard",
      },
      {
        number: "03",
        title: "Stopping by budget, not data",
        description:
          "Drilling campaigns stop when contract budgets expire. Terravise measures model entropy and strata stability, so engineers know when additional soundings stop adding data.",
        impact: "Defensible stopping data",
        badge: "Contract limit",
      },
    ],
  },
  dqn: {
    tag: "02 / Next sounding selection",
    heading: "Reinforcement learning selects each sounding coordinate",
    subheading:
      "The on-device deep Q-network evaluates candidate coordinates across the site boundary using 29 engineered features. It routes the CPT rig to the coordinate that resolves the largest strata uncertainty.",
    recommendationTitle: "DQN target coordinate · Spot 2",
    tabs: [
      {
        id: "gap",
        label: "Data gap",
        description:
          "The coordinate sits 16.2 meters from sounding B-01. No soundings exist within a 4.0 meter radius under the main structural core.",
      },
      {
        id: "transition",
        label: "Strata boundary",
        description:
          "SchemaGAN predicts a boundary at 8.5 meters depth, where clean sand gives way to soft sensitive clay.",
      },
      {
        id: "anomaly",
        label: "Soil behavior anomaly",
        description:
          "The interpolated soil behavior type index shows an offset of ΔIc = 0.18 against soundings B-01 and B-03.",
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
      title: "Boundary definition",
      subtitle: "MapKit satellite mapping",
      description:
        "Draw structural building footprints directly on high-resolution satellite maps. Support tap-to-add coordinates, UTM Zone 48S inputs, and real-time polygon area calculations.",
      deliverable: "Georeferenced site polygon and area",
      badgeText: "CAD / GIS BOUNDARY INGESTION",
    },
    {
      stepNumber: "02",
      title: "CPT telemetry ingestion",
      subtitle: "Multi-instrument file parsing",
      description:
        "Import standard CSV and Excel (.xlsx) files directly on the rig. Terravise automatically maps column headers for Electrical CPT, CPTm Bicone, and CPTu piezocone instruments.",
      deliverable: "Normalized Robertson SBT profiles",
      badgeText: "SBTn NORMALIZATION & CURVES",
    },
    {
      stepNumber: "03",
      title: "DQN active rig routing",
      subtitle: "29-feature candidate evaluation",
      description:
        "The on-device reinforcement learning agent ranks candidate locations within the boundary polygon. It displays target coordinates with transparent rationale cards.",
      deliverable: "Target coordinates and rationale cards",
      badgeText: "MDP REINFORCEMENT LEARNING",
    },
    {
      stepNumber: "04",
      title: "3D voxel and bearing analysis",
      subtitle: "Foundation handoff & export",
      description:
        "Inspect the 3D voxel volume with interactive Easting and Northing slicing cutters. Apply parametric criteria (qc ≥ 15 MPa, Ic ≤ 1.80) to export pile toe schedules.",
      deliverable: "Pile toe schedule (CSV, LandXML, DXF)",
      badgeText: "3D VOXEL PILE TOE SCHEDULE",
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
