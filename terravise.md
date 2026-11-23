# Terravise Platform Architecture & Technical Reference

> Master engineering reference, machine learning architecture, data models, and application workflows for Terravise (derived from the codebase at `/Users/royyan/Developments/ada/challenge-6/GeoSome`, where it was formerly designated as GeoSome). This document serves as the single source of truth for copywriting, landing page development, and geotechnical domain concepts.

---

## 1. Product Identity and Engineering Vision

### 1.1 What Is Terravise?
Terravise is an on-device geotechnical investigation system built for iPadOS on Apple silicon hardware. It guides field Cone Penetration Testing (CPT) campaigns dynamically, replacing fixed grid borehole schedules with real-time computational guidance.

### 1.2 The Engineering Problem
Conventional site investigations mandate drilling soundings in rigid geometric grids (such as a borehole every 25 to 50 meters). This practice causes three fundamental engineering failures:
1. **Redundant Drilling in Homogeneous Ground:** In uniform sand or silt, fixed grids repeat identical observations. Exploration crews spend days and thousands of dollars on redundant soundings that yield no new strata data.
2. **Blind Spots in Layered Geology:** Faults, dipping bedrock interfaces, and soft sensitive marine clay pockets often measure under 20 meters across. Fixed grids place boreholes on either side, missing critical hazard pockets entirely until post-construction differential settlement occurs.
3. **Arbitrary Stopping Criteria:** Drilling campaigns stop when contract budgets expire, not when the subsurface soil volume is mathematically understood with defensible certainty.

### 1.3 The Terravise Solution
Terravise executes an on-device Core ML neural pipeline to reconstruct a continuous 3D soil volume, recommend the next coordinate with the highest information gain, and provide a mathematically verified Practical STOP criterion.

### 1.4 Primary User Personas
1. **Lead Geotechnical Engineers and Consultancies:** Require cost-effective, defensible investigation layouts that comply with statutory standards.
2. **CPT Rig Contractors and Field Operators:** Need real-time coordinate routing on the rig without multi-day office reporting delays.
3. **Foundation and Structural Designers:** Require exact bearing layer top depths across building column locations to establish pile toe schedules.
4. **Project Directors and Civil Developers:** Aim to reduce exploration time by 30% to 50% without compromising structural safety.

---

## 2. On-Device Neural Computing Pipeline (`CPT3D-67` Engine)

All neural inference executes offline on iPadOS hardware via the Apple neural engine. Field data never leaves the device.

```
[ 1D CPT Sounding Profiles ]
              │
              ▼
[ CPTGridConfig & Spatial Mapping ] ──> 3D Regular Voxel Grid [nx, ny, nz] (dx, dy, dz = 1.0 m)
              │
              ├─────────────────────────────────────────┐
              ▼                                         ▼
[ SchemaGAN V4.2 Flexible ]               [ QCFS CNN V3 Core ML ]
3D Ic Volume Reconstruction               Continuous Volumetric Synthesis
(Soil Behavior Type Index)                qc (MPa) and fs (kPa)
              │                                         │
              ▼                                         ▼
[ Uncertainty V3 & Sufficiency ]          [ BearingRuleEngine ]
Error Bounds & Coverage (>= 80%)          Filter qc >= 15 MPa, thickness >= 2m
              │                                         │
              ├──────────────────────────┐              ▼
              ▼                          ▼        [ 3D Bearing Surface ]
[ StratigraphicStop ]      [ DQN V4.6-A Policy ]    Foundation Toe Depth (zb)
Practical STOP Trigger     29-Feature Coordinate
(Stops Drilling)           Guidance
```

### 2.1 Model 1: SchemaGAN V4.2 Flexible Core ML
* **Package Path:** `SchemaGAN_V4_2_Flexible.mlpackage`
* **Function:** Reconstructs a continuous 3D physical Robertson Soil Behavior Type Index ($I_c$) volume from sparse 1D CPT profiles.
* **Normalization Constants:**
  $$\mu = 2.7903323310879604, \quad \sigma = 0.7723778445702414$$
* **Processing Sequence:**
  1. Snaps uploaded 1D soundings to nearest unoccupied 3D grid cells $[nx, ny, nz]$.
  2. Initializes hidden domains using depth-aware Inverse Distance Weighting (IDW).
  3. Evaluates 2D Euclidean distance maps to observed sites across the structural footprint.
  4. Synthesizes continuous physical $I_c$ values and establishes the valid domain mask.

### 2.2 Model 2: QCFS CNN V3 Core ML
* **Package Path:** `QCFS_CNN_V3.mlpackage`
* **Function:** Predicts continuous cone tip resistance ($q_c$ in MPa) and sleeve friction ($f_s$ in kPa) across all valid domain voxels.
* **Mechanism:** Preserves direct sensor measurements at observed borehole locations while interpolating non-linear stress parameters throughout unobserved intervals.

### 2.3 Model 3: DQN V4.6-A Core ML (Autonomous Rig Routing)
* **Package Path:** `DQN_V4_6_A.mlpackage`
* **Function:** A Deep Q-Network that evaluates all legal candidate coordinates within the project boundary and recommends the location with the maximum Q-value (highest information gain).
* **Input Vector (29 Engineered Features):**
  * **11 Global Context Features:**
    1. Observation density ratio: $\log(1 + N_{\text{sites}}) / \log(1 + N_{\text{possible}})$
    2. Easting dimension scale: $\log(1 + (nx \cdot dx) / 32)$
    3. Northing dimension scale: $\log(1 + (ny \cdot dy) / 32)$
    4. Vertical depth scale: $\log(1 + (nz \cdot dz) / 16)$
    5. Grid spacing $dx$: $\log(1 + dx / 2)$
    6. Grid spacing $dy$: $\log(1 + dy / 2)$
    7. Vertical layer resolution $dz$: $\log(1 + dz / 2)$
    8. Global mean of standardized $I_c$ ($z_{\text{rec}}$)
    9. Global standard deviation of standardized $I_c$ ($z_{\text{rec}}$)
    10. Fraction of valid domain voxels within bounding grid
    11. Fraction of observed voxels relative to valid domain
  * **18 Local Candidate Features:**
    1. Distance to nearest completed CPT sounding
    2. Number of soundings within a 4.0 meter radius
    3. Lateral $I_c$ gradient
    4. through 11. Mean and variance of predicted $I_c$ across 4 depth partitions
    12. Predicted shallow soil classification (Robertson zone 1 to 9)
    13. Predicted deep soil classification (Robertson zone 1 to 9)
    14. Lateral offset magnitude ($\Delta I_c$) relative to adjacent soundings
* **Physical Constraints:** Evaluates only coordinates inside the boundary polygon, outside completed drill holes, and compliant with minimum rig separation requirements.

### 2.4 Model 4: Uncertainty V3 and Sufficiency Engine
* **Function:** Computes residual model entropy and calibrated error bounds ($|I_c - I_{c,\text{true}}| \le 0.15$).
* **Predicted Coverage Metric:** The fraction of unobserved valid voxels with a calibrated error bound $\le 0.15$. The exploratory policy target is **$\ge 80.0\%$**.

### 2.5 Practical Dynamic STOP Policy
* **Policy Identifier:** `practical-dynamic-stop-research-1`
* **Three Mandatory Conditions for STOP:**
  1. **Global Physical Support:** The 95th percentile distance ratio ($P_{95}$) is $\le 1.0$ and maximum distance ratio is $\le 1.75$ relative to boundary boundaries.
  2. **Strata Stability:** The latest genuine sounding causes zero coherent revisions to main reconstructed layer boundaries or continuity, and shows zero profile mismatch across two or more consecutive vertical depth steps.
  3. **Sufficient Model Coverage:** Uncertainty V3 predicted coverage reaches $\ge 0.80$ (80%).
* **Operational Behavior:**
  * Once triggered, the system suppresses further DQN candidate generation and displays:
    > *"CPT coverage is sufficient. Current CPT data meets the assessment requirements."*
  * Manual sounding uploads remain enabled, but the system informs the operator that additional soundings yield under 0.8% marginal data gain while incurring standard rig mobilization costs.

---

## 3. Geotechnical Physics, Parameters, and Test Standards

### 3.1 Supported CPT Instrument Types
| Instrument Type | Required File Header Columns | Engineering Units |
| :--- | :--- | :--- |
| **Electrical CPT** | `depth_(m)`, `qc_(MPa)`, `fs_(kPa)` | Depth (m), Tip Resistance (MPa), Sleeve Friction (kPa) |
| **CPTm Bicone (Mechanical)** | `depth_(cm)`, `Cw_(kg/cm2)`, `Tw_(kg/cm2)` | Depth (cm), Cone and Total Resistance ($kg/cm^2$) |
| **CPTu (Piezocone)** | `depth_(m)`, `qc_(MPa)`, `fs_(kPa)`, `u2_(kPa)` | Adds Dynamic Penetration Pore Pressure $u_2$ (kPa) |

### 3.2 Standard Equipment Geometry
* Net area ratio ($\alpha$): `0.80`
* Cone tip diameter: `3.57 cm` (Projected tip area: $10\text{ cm}^2$)
* Friction sleeve diameter: `3.57 cm`
* Friction sleeve length: `13.3 cm` (Sleeve surface area: $150\text{ cm}^2$)
* Penetration rate: `20 mm/s` (ASTM D5778 standard test rate)

### 3.3 Robertson (1990/2010) Normalized Soil Behavior Types (SBT)
Soil zones classified via Robertson $I_c$ cutoffs ($1.31, 2.05, 2.60, 2.95, 3.60$):
1. **Zone 1:** Sensitive fine-grained soil ($I_c \ge 3.60$, shallow) - High settlement risk
2. **Zone 2:** Clay to organic soil ($I_c \ge 3.20$)
3. **Zone 3:** Clays: clay to silty clay ($2.95 \le I_c < 3.20$)
4. **Zone 4:** Silt mixtures: clayey silt and silty clay ($2.60 \le I_c < 2.95$)
5. **Zone 5:** Sand mixtures: silty sand to sandy silt ($2.30 \le I_c < 2.60$)
6. **Zone 6:** Sands: clean sands to silty sands ($1.65 \le I_c < 2.30$)
7. **Zone 7:** Dense sand to gravelly sand ($I_c < 1.65$) - Primary foundation target
8. **Zone 8:** Stiff sand to clayey sand
9. **Zone 9:** Stiff fine-grained

---

## 4. Foundation Bearing Layer Engine (`BearingRuleEngine`)

### 4.1 Parametric Criteria for Competent Bearing Soil
The engine identifies competent strata for structural pile design using four configurable parameters:
1. **Minimum Cone Tip Resistance ($q_c$):** Default $\ge 15.0\text{ MPa}$ (adjustable from $5.0$ to $30.0\text{ MPa}$).
2. **Maximum Soil Behavior Index ($I_c$):** Default $\le 1.80$ (ensures granular coarse soil rather than stiff expansive clay).
3. **Minimum Contiguous Thickness:** Default $\ge 2.0\text{ meters}$ (prevents termination on thin floating lenses or false refusal).
4. **Minimum Lateral Footprint Fraction:** At least $5\%$ of total building footprint area.

### 4.2 3D Connected Component Analysis (6-Neighbor Connectivity)
Candidate voxels satisfying the $q_c$ threshold undergo 6-neighbor connectivity clustering in 3D space. Only clusters maintaining continuous vertical thickness $\ge 2.0\text{ m}$ and meeting lateral area thresholds qualify as true bearing layer components.

### 4.3 Engineering Outputs
* **Top Depth ($z_b$):** Elevation of the upper boundary of competent soil at every building column grid point.
* **Contiguous Thickness:** Verified vertical thickness of the bearing unit.
* **Pile Toe Directives:** Recommended toe termination depths (for example: *Toe at -16.0m with 1.2m socket embedment*).
* **Export Formats:** Exports directly to CSV, LandXML, and Bentley gINT.

---

## 5. iPadOS Application Architecture and User Workflows

```
[ 1. Project Management ] ──> Create or Open Projects, Review History
              │
              ▼
[ 2. Boundary Definition ] ──> Draw Structural Footprint on Satellite Map
              │
              ▼
[ 3. CPT Recommendation ]  ──> Ingest Live Rig Telemetry (CSV / XLSX)
              │                 Review DQN Recommended Coordinate
              │                 Inspect Rationale: "Why this point?"
              │                 Track Ground Certainty and Practical STOP Banner
              ▼
[ 4. Result Analysis ]     ──> Tab 1: Soil Interpolation (3D Voxel Slicing)
                               Tab 2: Bearing Layer (Strata Contours and Pile Schedules)
```

### 5.1 Screen 1: Project Management (`HomePage`)
* Lists stored site exploration projects with metadata: project title, last modified timestamp, completed CPT sounding count, and boundary area.
* Features a topographic contour visual backdrop.
* Action button: `StartProjectButton` (+ New Project).

### 5.2 Screen 2: Boundary Definition (`BoundaryCreationView`)
* Utilizes high-resolution MapKit satellite views.
* Supports coordinate entry via direct map taps or manual coordinate entry (Latitude/Longitude or UTM Zone 48S Easting/Northing).
* Computes polygon surface area in square meters ($m^2$) and hectares ($ha$), center coordinates, and perimeter.
* Validates polygon geometry to prevent self-intersecting boundaries.

### 5.3 Screen 3: CPT Ingestion and Navigation (`CPTRecommendationView`)
* **Map Layer:** Displays boundary polygon, completed CPT sounding markers, and an animated crosshair over the recommended sounding coordinate.
* **Bottom Sheet Hierarchy:**
  * **Primary Recommendation Card:** Displays spot label (such as Spot 2), UTM coordinates, distance to nearest CPT, and confidence level.
  * **"Why this point?" Rationale:** Provides transparent criteria:
    1. *Data Gap:* Fills the largest spatial void under heavy structural core loads (for example: 16.2 m gap, 0 soundings in 4 m radius).
    2. *Stratigraphic Shift:* Flags predicted formation boundaries (for example: clean sand terminating into soft clay at 8.5 m depth).
    3. *Soil Behavior Anomaly:* Highlights localized lateral variations ($\Delta I_c = 0.18$) compared to adjacent soundings.
  * **Stratigraphic Characterization:** Reports formation stability status (*Sufficient / Insufficient / Undetermined*).
  * **Practical STOP Banner:** Appears when predicted coverage reaches $\ge 80\%$, confirming statutory sufficiency.
  * **CPT Data List:** Displays all completed soundings with depth curves and sensor logs.

### 5.4 Screen 4: 3D Subsurface Voxel and Bearing Layer (`ResultAnalysisView`)
Provides two viewing modes in the top navigation bar:
1. **Mode 1: Soil Interpolation (`threeDLayer`):**
   * RealityKit 3D volumetric soil rendering.
   * Slicing controls: Dual range sliders for Easting ($X$) and Northing ($Z$) cuts to reveal interior stratigraphy.
   * Applies the Robertson 9-zone geotechnical color palette with physical soil textures (sand, silt, clay, gravel).
   * Displays virtual sounding rods at completed probe locations.
2. **Mode 2: Bearing Layer (`bearingLayer`):**
   * Displays the 3D top surface of the competent bearing layer.
   * Features parametric sliders for $q_c$ (MPa), $I_c$, and minimum layer thickness (m).
   * Generates elevation contour maps with depth color legends.
   * Column inspection popover: Displays top depth ($z_b$), nearest CPT distance, and pile toe recommendations.
   * Compare Data Sheet: A comparative table of pile toe elevations across all building columns for structural engineering handoff.

---

## 6. Technical Glossary and System Codes

| Technical Term | Definition | Indonesian Equivalent |
| :--- | :--- | :--- |
| **CPT / Sondir** | Cone Penetration Testing: Quasi-static penetration of an instrumented cone into soil. | Uji Penetrasi Konus / Uji Sondir |
| **$q_c$ (Cone Resistance)** | Total resistance against the cone tip, measured in MPa or $kg/cm^2$. | Tahanan Ujung Konus |
| **$f_s$ (Sleeve Friction)** | Frictional resistance against the cylindrical sleeve above the cone tip, in kPa. | Hambatan Pelekat / Gesekan Selimut |
| **$u_2$ (Pore Pressure)** | Dynamic pore water pressure measured behind the cone tip during penetration. | Tekanan Air Pori Dinamis |
| **$R_f$ (Friction Ratio)** | Ratio of sleeve friction to cone resistance: $R_f = (f_s / q_c) \times 100\%$. | Rasio Gesekan |
| **$I_c$ (SBT Index)** | Soil Behavior Type Index from normalized cone parameters (Robertson 1990/2010). | Indeks Tipe Perilaku Tanah |
| **Bearing Stratum** | Dense granular soil or rock competent to support structural deep pile loads. | Lapisan Tanah Keras / Pendukung Fondasi |
| **Ground Certainty** | Statistical volume coverage where calibrated model error bounds are $\le 0.15$ ($\ge 80\%$). | Kepastian Formasi Bawah Permukaan |
| **Practical STOP** | Decision criterion that halts drilling when additional soundings yield negligible new data. | Kriteria Penghentian Praktis |
| **Information Gain** | Reduction in spatial model entropy achieved by drilling a given coordinate. | Perolehan Informasi |
| **Differential Settlement** | Non-uniform foundation settlement between adjacent building columns. | Penurunan Diferensial Fondasi |
| **UTM Coordinates** | Universal Transverse Mercator Cartesian metric grid system (e.g., UTM Zone 48S). | Sistem Koordinat UTM |

---

## 7. Copywriting Guidelines and Value Propositions

Derived directly from verified system algorithms and the unslop rule set:

### 7.1 Approved Statements
* *"A defensible foundation starts below the blind grid."*
* *"From blind uniform drilling to mathematical certainty."*
* *"Save 35% to 45% of rig mobilization hours without missing critical soft lenses."*
* *"On-device Apple silicon neural computation. Zero telemetry off device."*
* *"Compliant with ASTM D5778 and SNI 8460:2017 deep foundation standards."*

### 7.2 Prohibited Patterns (AI Slop Anti-Patterns)
* **Never use em dashes (`—`) or en dashes (`–`)**: Use standard periods or commas.
* **Never use AI buzzwords**: *additionally, crucial, delve, enhance, foster, landscape, pivotal, showcase, testament, underscore, vibrant, copilot*.
* **Never use vague metaphors without mechanisms**: Do not say *"harnessing AI capabilities"*; specify *"the DQN agent ranks candidate coordinates by maximum information gain"*.
* **Never make claims without numbers**: Always provide concrete facts: $q_c \ge 15\text{ MPa}$, thickness $\ge 2.0\text{ m}$, penetration rate $20\text{ mm/s}$, coverage target $\ge 80\%$.
* **Never use decorative emojis** in formal engineering documentation.
