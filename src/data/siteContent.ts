import type { WorkflowStep } from "../types"

export const SITE_CONTENT = {
  hero: {
    badge: "Apple silicon field system. Autonomous CPT navigation",
    titleLine1: "A defensible foundation starts",
    titleLine2: "below the blind grid.",
    subtitle:
      "Terravise directs cone penetration testing rigs in real time. On-device SchemaGAN generative models and reinforcement learning agents replace fixed grid spacing with data-guided sounding locations.",
    primaryCta: "Request pilot access",
    secondaryCta: "Download CPT template",
    specPoints: [
      { label: "Ground certainty target", value: "84.2%" },
      { label: "Rig hours saved", value: "35% to 45%" },
      { label: "Neural inference latency", value: "82 ms" },
      { label: "Test standard", value: "ASTM D5778 and SNI 8460" },
    ],
  },
  problem: {
    tag: "01 / Investigation limits",
    heading: "Fixed grid spacing creates two costly errors",
    subheading:
      "Standard site investigations space soundings 25 to 50 meters apart. In uniform soil, the crew drills redundant soundings. In layered soil, the fixed spacing skips soft clay pockets and dipping rock layers.",
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
          "Soft sensitive marine clay pockets often measure less than 20 meters across. Fixed grids place boreholes on either side, missing the weak zone entirely.",
        impact: "Differential settlement risk",
        badge: "Structural hazard",
      },
      {
        number: "03",
        title: "Stopping by budget, not data",
        description:
          "Drilling campaigns stop when contract hours expire. Terravise measures mathematical model entropy, so engineers know when additional soundings stop adding data.",
        impact: "Defensible stopping data",
        badge: "Contract limit",
      },
    ],
  },
  dqn: {
    tag: "02 / Next sounding selection",
    heading: "Reinforcement learning selects each sounding coordinate",
    subheading:
      "The on-device deep Q-network evaluates candidate coordinates across the site boundary. It routes the CPT rig to the coordinate that resolves the largest strata uncertainty.",
    recommendationTitle: "DQN target coordinate. Spot 2",
    tabs: [
      {
        id: "gap",
        label: "Data gap",
        description:
          "The coordinate sits 16.2 meters from sounding B-01. No soundings exist within a 4.0 meter radius under the primary structural core.",
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
          "The interpolated soil behavior type index shows an offset of delta Ic 0.18 against soundings B-01 and B-03.",
      },
    ],
  },
  dynamicStop: {
    tag: "03 / Stopping criteria",
    heading: "Ground certainty reaches 84.2%",
    subheading:
      "When model entropy across the building footprint drops below statutory limits, Terravise issues a practical stop recommendation.",
    certaintyValue: 84.2,
    threshold: 80.0,
    statusText: "CPT coverage is sufficient. Practical stop criteria met.",
    explanation:
      "Drilling beyond 80% certainty adds less than 0.8% new data while adding 4,200 dollars in daily crawler operating expenses.",
  },
  voxel: {
    tag: "04 / Subsurface volume",
    heading: "Interactive 3D soil volume inspection",
    subheading:
      "Cut through the soil volume with Easting and Northing sliders. Inspect layer continuity from ground level down to 25.0 meters depth.",
  },
  bearing: {
    tag: "05 / Bearing layer verification",
    heading: "Competent strata depth and pile schedules",
    subheading:
      "Map the top of competent bearing soil across all completed soundings. Transfer confirmed pile toe termination depths directly to structural design teams.",
  },
  workflow: [
    {
      stepNumber: "01",
      title: "Stream rig telemetry",
      subtitle: "Live CPT data ingestion",
      description:
        "Stream cone resistance, sleeve friction, and pore pressure at 20 millimeters per second through Bluetooth or load AGS4 and CSV files.",
      deliverable: "Normalized Robertson SBT profile",
      badgeText: "Field input",
    },
    {
      stepNumber: "02",
      title: "Synthesize 3D strata",
      subtitle: "SchemaGAN simulation",
      description:
        "Generative models calculate 3D soil property distributions across the site boundary, marking soft clay pockets and dipping rock planes.",
      deliverable: "3D soil volume and entropy map",
      badgeText: "Neural processing",
    },
    {
      stepNumber: "03",
      title: "Direct the next sounding",
      subtitle: "DQN coordinate guidance",
      description:
        "The reinforcement learning agent ranks candidate locations and directs the rig operator to the coordinate with maximum information gain.",
      deliverable: "UTM coordinates and technical rationale",
      badgeText: "Rig routing",
    },
    {
      stepNumber: "04",
      title: "Confirm stopping and export",
      subtitle: "Engineering deliverables",
      description:
        "Confirm ground certainty past 80%. Export georeferenced pile toe elevation tables and bearing layer contours directly to DXF and CSV formats.",
      deliverable: "CAD DXF, CSV, and PDF reports",
      badgeText: "Final export",
    },
  ] as WorkflowStep[],
  trust: {
    tag: "06 / Standards and data privacy",
    heading: "Statutory standards. Offline on-device computation.",
    subheading:
      "Built for standard geotechnical workflows. All neural calculations run on local device silicon with zero network transmission.",
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
        desc: "SchemaGAN and DQN policies run on the local Apple neural engine. Field soundings never leave the device.",
      },
      {
        title: "ASTM D5778 and SNI 8460",
        desc: "Follows ASTM D5778 standard test methods for electronic friction cone testing and Indonesian SNI 8460:2017 foundation requirements.",
      },
    ],
  },
  faq: [
    {
      q: "Does Terravise replace the licensed geotechnical engineer?",
      a: "No. Terravise provides decision support during active drilling. Recommendations, uncertainty ranges, and stopping calculations support professional engineering judgment.",
    },
    {
      q: "What file formats can the rig operator import in the field?",
      a: "Terravise accepts direct serial and Bluetooth telemetry from digital CPT dataloggers, as well as AGS4, GEF, CSV, and Excel spreadsheets.",
    },
    {
      q: "How does the ground certainty metric decide when to stop?",
      a: "Ground certainty measures residual spatial entropy across the 3D volume. When additional soundings yield less than 1.0% uncertainty reduction, the system recommends stopping.",
    },
    {
      q: "Can Terravise run without internet access?",
      a: "Yes. Terravise runs offline on Apple silicon hardware. Neural model evaluation executes locally through the Apple neural engine.",
    },
  ],
}
