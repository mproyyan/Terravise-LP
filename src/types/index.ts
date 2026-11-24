export type SoilClassification =
  | "Sensitive Fine-Grained"
  | "Clay"
  | "Silty Clay"
  | "Clayey Silt"
  | "Sandy Silt"
  | "Silty Sand"
  | "Clean Sand"
  | "Gravelly Sand"
  | "Dense Stratum / Bedrock"

export interface SoilLayer {
  id: string
  name: string
  soilType: SoilClassification
  depthStartM: number
  depthEndM: number
  colorHex: string
  tailwindColor: string
  qcMpaAvg: number
  icAvg: number
  description: string
  riskLevel: "low" | "medium" | "high" | "bearing"
}

export interface RecommendedPoint {
  id: string
  name: string
  utm: string
  confidence: number
  shallowSoil: string
  deepSoil: string
  lateralDeltaIc: number
  distanceNearestM: number
  soundingsInRadius4m: number
  status: "active_target" | "drilled" | "scheduled"
  reasoning: {
    gap: {
      title: string
      description: string
      metric: string
      badge: string
    }
    transition: {
      title: string
      description: string
      metric: string
      badge: string
    }
    anomaly: {
      title: string
      description: string
      metric: string
      badge: string
    }
  }
}

export interface BearingPoint {
  id: string
  pointName: string
  northing: string
  easting: string
  depthM: number
  qcMpa: number
  icValue: number
  bearingLayerMet: boolean
  pileRecommendation: string
}

export interface BearingCriteria {
  minQc: number        // default: 15.0 MPa
  maxIc: number        // default: 1.80
  minThickness: number // default: 2.0 m
}

export interface CptSoundingData {
  id: string
  name: string
  easting: number
  northing: number
  surfaceElevationM: number
  drilledDepthM: number
  groundCertaintyContribution: number
  timestamp: string
}

export interface CptTestPipeLayer {
  layerName: string
  soilType: SoilClassification
  depthRange: string
  thicknessM: number
  qcMpa: number
  icValue: number
  colorHex: string
}

export interface CptTestPipePoint {
  id: string
  code: string
  sector: string
  utm: string
  pos3D: [number, number] // [x, z] in 3D boundary space
  terminationDepthM: number
  bearingDepthM: number
  waterTableM: number
  status: string
  layers: CptTestPipeLayer[]
}

export interface WorkflowMetric {
  label: string
  value: string
}

export interface WorkflowRationale {
  title: string
  desc: string
  badge: string
}

export interface WorkflowStep {
  stepNumber: string
  depthM: number
  depthDisplay: string
  stratumName: string
  stratumColor: string
  title: string
  subtitle: string
  description: string
  deliverable: string
  badgeText: string
  metrics: WorkflowMetric[]
  rationales?: WorkflowRationale[]
}

export interface AppDemoScene {
  time: string
  seconds: number
  sceneNumber: string
  title: string
  narration: string
  desc: string
}

export interface AppDemoContent {
  tag: string
  heading: string
  subheading: string
  slogan: string
  videoUrl?: string
  scenes: AppDemoScene[]
  takeaways: string[]
}

export interface LeadFormData {
  fullName: string
  email: string
  company: string
  role: string
  projectArea: string
  rigCount: string
  notes?: string
}

export interface TeamMember {
  name: string
  role: string
  image: string
  linkedin: string
  bio?: string
}

export interface TeamSectionContent {
  tag: string
  heading: string
  subheading: string
  members: TeamMember[]
}
