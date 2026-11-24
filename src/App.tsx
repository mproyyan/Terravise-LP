import { useState } from "react"
import { Navbar } from "./components/layout/Navbar"
import { DepthSidebarTracker } from "./components/layout/DepthSidebarTracker"
import { Footer } from "./components/layout/Footer"
import { HeroSection } from "./components/sections/HeroSection"
import { ProblemSection } from "./components/sections/ProblemSection"
import { DQNRecommendationSection } from "./components/sections/DQNRecommendationSection"
import { SubsurfaceVoxelSection } from "./components/sections/SubsurfaceVoxelSection"
import { BearingStratumSection } from "./components/sections/BearingStratumSection"
import { WorkflowSection } from "./components/sections/WorkflowSection"
import { TechnicalTrustSection } from "./components/sections/TechnicalTrustSection"
import { FinalCtaSection } from "./components/sections/FinalCtaSection"
import { Subsurface3DProvider } from "./context/Subsurface3DContext"
import { HeroProblemGroundWrapper } from "./components/three/HeroProblemGroundStage"
import { SITE_CONTENT } from "./data/siteContent"
import { Check } from "lucide-react"

export function App() {
  const [downloadNotification, setDownloadNotification] = useState(false)

  const handleOpenAppStore = () => {
    window.open(SITE_CONTENT.hero.appStoreUrl, "_blank", "noopener,noreferrer")
  }

  const handleDownloadTemplate = () => {
    const csvContent =
      "Depth_m,qc_MPa,fs_kPa,u2_kPa,Rf_pct,SBTn_Zone,Ic\n" +
      "0.00,0.00,0.0,0.0,0.00,0,0.00\n" +
      "0.50,6.40,45.2,5.1,0.71,6,1.62\n" +
      "1.00,7.10,51.8,6.0,0.73,6,1.58\n" +
      "2.00,4.80,38.0,12.4,0.79,5,2.10\n" +
      "6.50,1.20,18.5,88.2,1.54,1,2.95\n" +
      "14.00,16.80,142.0,18.0,0.85,8,1.48\n" +
      "16.50,19.20,168.0,15.5,0.88,8,1.42\n"

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "terravise_cpt_sample_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setDownloadNotification(true)
    setTimeout(() => setDownloadNotification(false), 4000)
  }

  return (
    <Subsurface3DProvider>
      <div className="min-h-screen bg-[#FBF7F2] text-[#1C130D] font-sans antialiased selection:bg-[#FAD9BA] selection:text-[#381800] relative">
        {/* Dynamic Subsurface Depth Meter (Fixed Sidebar) */}
        <DepthSidebarTracker />

        {/* Sticky Architectural Navbar */}
        <Navbar onOpenAppStore={handleOpenAppStore} />

        {/* Main Landing Sections Flow with semantic id for skip links */}
        <main id="main-content" className="relative z-10 focus:outline-hidden">
          {/* Rapidkert-style Pinned Ground Sequence for Section 00 (Hero) -> Section 01 (Problem) */}
          <HeroProblemGroundWrapper>
            <HeroSection
              onOpenAppStore={handleOpenAppStore}
              onDownloadTemplate={handleDownloadTemplate}
            />
            <ProblemSection />
          </HeroProblemGroundWrapper>

          {/* Section 02..07 with Dedicated Section-Scoped Visualizers & Scroll Tracks */}
          <DQNRecommendationSection />
          <SubsurfaceVoxelSection />
          <BearingStratumSection />
          <WorkflowSection />
          <TechnicalTrustSection />
          <FinalCtaSection
            onOpenAppStore={handleOpenAppStore}
            onDownloadTemplate={handleDownloadTemplate}
          />
        </main>

        {/* Engineering Footer */}
        <Footer />

        {/* Floating Download Notification Toast */}
        {downloadNotification && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-6 z-50 bg-[#1C130D] text-[#EFE7DE] border border-[#7A421D] px-4 py-3 shadow-2xl flex items-center gap-3 font-mono text-xs animate-in slide-in-from-bottom-4 duration-200"
          >
            <div className="w-5 h-5 bg-[#5A3008] text-[#FAD9BA] flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-bold text-[#EFE7DE]">Sample CPT file downloaded</div>
              <div className="text-[10px] text-[#EFE7DE]/60">terravise_cpt_sample_template.csv</div>
            </div>
          </div>
        )}
      </div>
    </Subsurface3DProvider>
  )
}

export default App
