import { useState, useEffect } from "react"
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
import { AppDemoSection } from "./components/sections/AppDemoSection"
import { TechnicalFaqSection } from "./components/sections/TechnicalFaqSection"
import { TeamSection } from "./components/sections/TeamSection"
import { FinalCtaSection } from "./components/sections/FinalCtaSection"
import { FeedbackPage } from "./components/feedback/FeedbackPage"
import { Subsurface3DProvider } from "./context/Subsurface3DContext"
import { HeroProblemGroundWrapper } from "./components/three/HeroProblemGroundStage"
import { SITE_CONTENT } from "./data/siteContent"

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return typeof window !== "undefined" ? window.location.pathname : "/"
  })

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const navigateTo = (path: string) => {
    window.history.pushState(null, "", path)
    setCurrentPath(path)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleOpenAppStore = () => {
    window.open(SITE_CONTENT.hero.appStoreUrl, "_blank", "noopener,noreferrer")
  }

  // Dedicated /feedback page route
  if (currentPath === "/feedback" || currentPath.startsWith("/feedback")) {
    return <FeedbackPage onBackToHome={() => navigateTo("/")} />
  }

  return (
    <Subsurface3DProvider>
      <div className="min-h-screen bg-[#FBF7F2] text-[#1C130D] font-sans antialiased selection:bg-[#FAD9BA] selection:text-[#381800] relative">
        {/* Dynamic Subsurface Depth Meter (Fixed Sidebar) */}
        <DepthSidebarTracker />

        {/* Minimal Architectural Navbar (Brand + App Store CTA + Feedback) */}
        <Navbar
          onOpenAppStore={handleOpenAppStore}
          onNavigateToFeedback={() => navigateTo("/feedback")}
        />

        {/* Main Landing Sections Flow with semantic id for skip links */}
        <main id="main-content" className="relative z-10 focus:outline-hidden">
          {/* Rapidkert-style Pinned Ground Sequence for Section 00 (Hero) -> Section 01 (Problem) */}
          <HeroProblemGroundWrapper>
            <HeroSection onOpenAppStore={handleOpenAppStore} />
            <ProblemSection />
          </HeroProblemGroundWrapper>

          {/* Section 02..07 with Dedicated Section-Scoped Visualizers & Scroll Tracks */}
          <DQNRecommendationSection />
          <SubsurfaceVoxelSection />
          <BearingStratumSection />
          <WorkflowSection />
          <TechnicalTrustSection />
          <AppDemoSection />
          <TeamSection />
          <TechnicalFaqSection />
          <FinalCtaSection onOpenAppStore={handleOpenAppStore} />
        </main>

        {/* Engineering Footer */}
        <Footer onNavigateToFeedback={() => navigateTo("/feedback")} />
      </div>
    </Subsurface3DProvider>
  )
}

export default App
