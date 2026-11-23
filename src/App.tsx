import { useState } from "react"
import { Navbar } from "./components/layout/Navbar"
import { DepthSidebarTracker } from "./components/layout/DepthSidebarTracker"
import { Footer } from "./components/layout/Footer"
import { HeroSection } from "./components/sections/HeroSection"
import { ProblemSection } from "./components/sections/ProblemSection"
import { DQNRecommendationSection } from "./components/sections/DQNRecommendationSection"
import { DynamicStopSection } from "./components/sections/DynamicStopSection"
import { SubsurfaceVoxelSection } from "./components/sections/SubsurfaceVoxelSection"
import { BearingStratumSection } from "./components/sections/BearingStratumSection"
import { WorkflowSection } from "./components/sections/WorkflowSection"
import { TechnicalTrustSection } from "./components/sections/TechnicalTrustSection"
import { FinalCtaSection } from "./components/sections/FinalCtaSection"
import { LeadIntakeModal } from "./components/interactive/LeadIntakeModal"
import { Check } from "lucide-react"

export function App() {
  const [pilotModalOpen, setPilotModalOpen] = useState(false)
  const [downloadNotification, setDownloadNotification] = useState(false)

  const handleRequestPilot = () => {
    setPilotModalOpen(true)
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
    link.setAttribute("download", "terravise_cpt_standard_template_v4.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setDownloadNotification(true)
    setTimeout(() => setDownloadNotification(false), 4000)
  }

  return (
    <div className="min-h-screen bg-[#f4f2ec] text-[#171814] font-sans antialiased selection:bg-[#627056] selection:text-white relative">
      {/* Dynamic Subsurface Depth Meter (Fixed Sidebar) */}
      <DepthSidebarTracker />

      {/* Sticky Architectural Navbar */}
      <Navbar onRequestPilot={handleRequestPilot} />

      {/* Main Landing Sections Flow */}
      <main>
        <HeroSection
          onRequestPilot={handleRequestPilot}
          onDownloadTemplate={handleDownloadTemplate}
        />
        <ProblemSection />
        <DQNRecommendationSection />
        <DynamicStopSection />
        <SubsurfaceVoxelSection />
        <BearingStratumSection />
        <WorkflowSection />
        <TechnicalTrustSection />
        <FinalCtaSection
          onRequestPilot={handleRequestPilot}
          onDownloadTemplate={handleDownloadTemplate}
        />
      </main>

      {/* Engineering Footer */}
      <Footer />

      {/* Lead Intake Modal */}
      <LeadIntakeModal
        open={pilotModalOpen}
        onOpenChange={setPilotModalOpen}
      />

      {/* Floating Download Notification Toast */}
      {downloadNotification && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#171814] text-[#e8e5da] border border-[#7c8c6c] px-4 py-3 shadow-2xl flex items-center gap-3 font-mono text-xs animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-5 h-5 bg-[#627056] text-[#e8e5da] flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-[#e8e5da]">Template file downloaded</div>
            <div className="text-[10px] text-[#e8e5da]/60">terravise_cpt_standard_template_v4.csv</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
