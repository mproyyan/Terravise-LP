import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Users,
  Compass,
  Layers,
  MessageSquare,
  Building2,
  Send,
  Home,
  Check,
} from "lucide-react"
import { submitFeedback } from "../../lib/supabase"
import type { FeedbackSubmission } from "../../types"

interface FeedbackPageProps {
  onBackToHome: () => void
}

export function FeedbackPage({ onBackToHome }: FeedbackPageProps) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const TOTAL_STEPS = 7

  // Form State
  const [fullName, setFullName] = useState<string>("")
  const [role, setRole] = useState<string>("")
  const [roleOther, setRoleOther] = useState<string>("")
  const [industry, setIndustry] = useState<string>("")
  const [industryOther, setIndustryOther] = useState<string>("")
  const [favoriteFeatures, setFavoriteFeatures] = useState<string[]>([])
  const [potentialRating, setPotentialRating] = useState<string>("")
  const [collaborationInterest, setCollaborationInterest] = useState<string>("")
  const [collaborationTypes, setCollaborationTypes] = useState<string[]>([])
  const [collaborationContactName, setCollaborationContactName] = useState<string>("")
  const [collaborationContactOrg, setCollaborationContactOrg] = useState<string>("")
  const [collaborationContactInfo, setCollaborationContactInfo] = useState<string>("")
  const [feedbackNotes, setFeedbackNotes] = useState<string>("")

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number>(5)
  const [validationError, setValidationError] = useState<string>("")

  // Countdown timer for auto-redirect when isSuccess is true
  useEffect(() => {
    if (!isSuccess) return
    setCountdown(5)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onBackToHome()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isSuccess, onBackToHome])

  // Step 1 Validation: Full Name is Required
  const validateStep1 = () => {
    if (!fullName.trim()) {
      setValidationError("Mohon masukkan nama lengkap Anda.")
      return false
    }
    setValidationError("")
    return true
  }

  // Step 2 Validation: Role is Required
  const validateStep2 = () => {
    if (!role) {
      setValidationError("Silakan pilih salah satu latar belakang atau peran Anda.")
      return false
    }
    if (role === "Lainnya" && !roleOther.trim()) {
      setValidationError("Silakan tuliskan bidang atau peran Anda.")
      return false
    }
    setValidationError("")
    return true
  }

  // Step 7 Validation: Feedback Notes is Required
  const validateStep7 = () => {
    if (!feedbackNotes.trim()) {
      setValidationError("Silakan tuliskan masukan atau catatan Anda sebelum mengirim.")
      return false
    }
    setValidationError("")
    return true
  }

  const handleNext = () => {
    setValidationError("")
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrev = () => {
    setValidationError("")
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSkip = () => {
    setValidationError("")
    // Steps 1, 2, and 7 cannot be skipped
    if (currentStep === 1 || currentStep === 2 || currentStep === 7) return
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Multi-select without maximum limit
  const toggleFeature = (featureTitle: string) => {
    if (favoriteFeatures.includes(featureTitle)) {
      setFavoriteFeatures(favoriteFeatures.filter((f) => f !== featureTitle))
    } else {
      setFavoriteFeatures([...favoriteFeatures, featureTitle])
    }
  }

  const toggleCollabType = (typeTitle: string) => {
    if (collaborationTypes.includes(typeTitle)) {
      setCollaborationTypes(collaborationTypes.filter((t) => t !== typeTitle))
    } else {
      setCollaborationTypes([...collaborationTypes, typeTitle])
    }
  }

  const handleSubmit = async () => {
    if (!validateStep7()) return
    setIsSubmitting(true)
    setErrorMessage("")

    const payload: FeedbackSubmission = {
      full_name: fullName.trim(),
      role: role === "Lainnya" ? `Lainnya: ${roleOther.trim()}` : role,
      role_other: role === "Lainnya" ? roleOther.trim() : undefined,
      industry: industry === "Lainnya" ? `Lainnya: ${industryOther.trim()}` : industry || undefined,
      industry_other: industry === "Lainnya" ? industryOther.trim() : undefined,
      favorite_features: favoriteFeatures,
      potential_rating: potentialRating || undefined,
      collaboration_interest: collaborationInterest || undefined,
      collaboration_types: collaborationTypes,
      collaboration_contact_name: collaborationContactName.trim() || undefined,
      collaboration_contact_org: collaborationContactOrg.trim() || undefined,
      collaboration_contact_info: collaborationContactInfo.trim() || undefined,
      feedback_notes: feedbackNotes.trim(),
    }

    const res = await submitFeedback(payload)
    setIsSubmitting(false)

    if (res.success) {
      setIsSuccess(true)
    } else {
      setErrorMessage(res.error || "Terjadi kendala saat mengirim data. Silakan coba kembali.")
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF7F2] text-[#1C130D] font-sans relative selection:bg-[#FAD9BA] selection:text-[#381800] pb-20">
      {/* Background Architectural Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1C130D 1px, transparent 1px), linear-gradient(to bottom, #1C130D 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Top Navigation & Brand Header */}
      <header className="sticky top-0 z-30 bg-[#FBF7F2]/90 backdrop-blur-md border-b border-[#1C130D]/15 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            aria-label="Kembali ke beranda"
            className="flex items-center gap-2 text-xs font-mono font-bold text-[#7A421D] hover:text-[#1C130D] transition-colors py-1 px-2.5 bg-[#FAF5EE] border border-[#1C130D]/15 hover:border-[#1C130D]/40 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </button>

          <span className="text-[#1C130D]/30 hidden sm:inline">|</span>

          <span className="font-mono text-xs text-[#1C130D] font-bold tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>TERRAVISE</span>
            <span className="text-[#63554B] font-normal hidden md:inline">· Feedback & Collaboration Portal</span>
          </span>
        </div>

        {/* Linear Step Counter & Progress Bar */}
        {!isSuccess && (
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#63554B]">
            <span className="font-bold text-[#7A421D] tabular-nums">
              STEP {currentStep} <span className="text-[#63554B]/50">/ {TOTAL_STEPS}</span>
            </span>
            <div className="w-24 sm:w-36 h-2 bg-[#EAE2D5] border border-[#1C130D]/15 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#BD8564] to-[#7A421D] transition-all duration-300"
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Tab / Wizard Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 relative z-10">
        {isSuccess ? (
          /* =========================================================================
              SUCCESS STATE CARD WITH 5-SECOND AUTO-REDIRECT
             ========================================================================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FAF5EE] border border-[#1C130D]/20 p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-full bg-[#10B981]/15 border-2 border-[#10B981] text-[#10B981] flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#10B981] font-bold block">
                PENGIRIMAN BERHASIL
              </span>
              <h1 className="font-sans font-black text-2xl sm:text-4xl text-[#1C130D] uppercase tracking-tight">
                Terima Kasih, {fullName}!
              </h1>
              <p className="font-sans text-[#63554B] text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Masukan dan informasi kolaborasi Anda telah berhasil kami terima. Terima kasih banyak atas waktu dan insight berharga yang Anda berikan untuk pengembangan Terravise.
              </p>
            </div>

            {/* 5-Second Countdown Indicator */}
            <div className="font-mono text-xs text-[#7A421D] flex items-center justify-center gap-2 bg-[#EAE2D5]/70 py-2.5 px-4 border border-[#1C130D]/10 max-w-sm mx-auto">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>
                Kembali ke halaman utama dalam <strong className="text-[#1C130D] font-bold tabular-nums">{countdown}</strong> detik...
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1C130D] text-[#FAD9BA] hover:bg-[#5A3008] hover:text-[#EFE7DE] transition-colors font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Kembali Sekarang</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false)
                  setCurrentStep(1)
                  setFullName("")
                  setRole("")
                  setRoleOther("")
                  setIndustry("")
                  setIndustryOther("")
                  setFavoriteFeatures([])
                  setPotentialRating("")
                  setCollaborationInterest("")
                  setCollaborationTypes([])
                  setCollaborationContactName("")
                  setCollaborationContactOrg("")
                  setCollaborationContactInfo("")
                  setFeedbackNotes("")
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#FAF5EE] border border-[#1C130D]/20 text-[#1C130D] hover:bg-[#EAE2D5] transition-colors font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <span>Isi Form Baru</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* =========================================================================
              ACTIVE STEP CARD / TAB WIZARD
             ========================================================================= */
          <div className="bg-[#FAF5EE] border border-[#1C130D]/15 shadow-xl p-6 sm:p-10 space-y-8 relative">
            {/* Step Navigation Pill Indicator (No literal 'Wajib' or 'tidak dapat dilewati') */}
            <div className="flex items-center justify-between border-b border-[#1C130D]/15 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1C130D] text-[#FAD9BA] font-mono text-xs font-bold flex items-center justify-center">
                  {currentStep}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-[#7A421D] font-bold">
                  {currentStep === 1 && "Identitas Diri"}
                  {currentStep === 2 && "Peran & Latar Belakang"}
                  {currentStep === 3 && "Sektor Industri"}
                  {currentStep === 4 && "Fitur Terfavorit"}
                  {currentStep === 5 && "Potensi Penerapan"}
                  {currentStep === 6 && "Peluang Kolaborasi"}
                  {currentStep === 7 && "Masukan & Catatan Akhir"}
                </span>
              </div>

              {/* Skip label for optional steps */}
              {currentStep !== 1 && currentStep !== 2 && currentStep !== 7 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="font-mono text-[11px] text-[#63554B] hover:text-[#7A421D] underline cursor-pointer"
                >
                  Lewati langkah ini →
                </button>
              )}
            </div>

            {/* Validation Alert */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#FEE2E2] border border-[#DC2626]/30 text-[#991B1B] p-3 text-xs font-mono flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{validationError}</span>
              </motion.div>
            )}

            {/* Error Message from Supabase */}
            {errorMessage && (
              <div className="bg-[#FEE2E2] border border-[#DC2626]/30 text-[#991B1B] p-3 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Dynamic Step Content */}
            <AnimatePresence mode="wait">
              {/* STEP 1: Full Name */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#1C130D] uppercase tracking-tight">
                      Siapa nama lengkap Anda?
                    </h2>
                    <p className="font-sans text-sm text-[#63554B]">
                      Nama Anda akan dicatat bersama masukan untuk keperluan tindak lanjut tim Terravise.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="full-name-input" className="font-mono text-xs text-[#1C130D] font-bold uppercase block">
                      Nama Lengkap
                    </label>
                    <input
                      id="full-name-input"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value)
                        if (validationError) setValidationError("")
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNext()
                      }}
                      placeholder="Contoh: Ir. Budi Santoso, M.T."
                      autoFocus
                      className="w-full bg-[#FAF5EE] border border-[#1C130D]/25 p-3.5 text-base font-sans text-[#1C130D] placeholder-[#63554B]/50 focus:border-[#7A421D] focus:outline-hidden focus:ring-1 focus:ring-[#7A421D]"
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Role & Background (Clean single choices, no slashes '/') */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#1C130D] uppercase tracking-tight">
                      Apa latar belakang atau peran Anda saat ini?
                    </h2>
                    <p className="font-sans text-sm text-[#63554B]">
                      Pilih opsi yang paling mewakili profesi atau aktivitas utama Anda.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      "Praktisi Geoteknik",
                      "Software Engineer",
                      "Product Designer",
                      "Akademisi & Peneliti",
                      "Pengembang Properti & Bisnis",
                      "Pengunjung Umum",
                      "Lainnya",
                    ].map((item) => (
                      <label
                        key={item}
                        className={`flex items-center gap-3 p-3.5 border transition-all cursor-pointer ${
                          role === item
                            ? "bg-[#1C130D] border-[#1C130D] text-[#FAD9BA]"
                            : "bg-[#FAF5EE] border-[#1C130D]/15 text-[#1C130D] hover:border-[#1C130D]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="user-role"
                          value={item}
                          checked={role === item}
                          onChange={() => {
                            setRole(item)
                            if (validationError) setValidationError("")
                          }}
                          className="w-4 h-4 accent-[#BD8564]"
                        />
                        <span className="font-sans text-sm font-semibold">{item}</span>
                      </label>
                    ))}

                    {/* Free Text Input if 'Lainnya' selected */}
                    {role === "Lainnya" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-2"
                      >
                        <input
                          type="text"
                          value={roleOther}
                          onChange={(e) => setRoleOther(e.target.value)}
                          placeholder="Tuliskan bidang atau peran Anda di sini..."
                          autoFocus
                          className="w-full bg-[#FAF5EE] border border-[#7A421D] p-3 text-sm font-sans text-[#1C130D] placeholder-[#63554B]/50 focus:outline-hidden focus:ring-1 focus:ring-[#7A421D]"
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Industry Sector (Exact user requested list) */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#1C130D] uppercase tracking-tight">
                      Sektor industri mana yang paling relevan?
                    </h2>
                    <p className="font-sans text-sm text-[#63554B]">
                      Pilih sektor industri yang paling dekat dengan peran atau ketertarikan Anda.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      "Konstruksi & Infrastruktur",
                      "Pertambangan & Energi",
                      "Transportasi & Logistik",
                      "Perbankan & Keuangan",
                      "Properti & Real Estate",
                      "Manufaktur",
                      "Teknologi / Telekomunikasi",
                      "Konsultan / Jasa Profesional",
                      "Lainnya",
                    ].map((item) => (
                      <label
                        key={item}
                        className={`flex items-center gap-3 p-3.5 border transition-all cursor-pointer ${
                          industry === item
                            ? "bg-[#1C130D] border-[#1C130D] text-[#FAD9BA]"
                            : "bg-[#FAF5EE] border-[#1C130D]/15 text-[#1C130D] hover:border-[#1C130D]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="user-industry"
                          value={item}
                          checked={industry === item}
                          onChange={() => setIndustry(item)}
                          className="w-4 h-4 accent-[#BD8564]"
                        />
                        <span className="font-sans text-sm font-semibold">{item}</span>
                      </label>
                    ))}

                    {industry === "Lainnya" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-2"
                      >
                        <input
                          type="text"
                          value={industryOther}
                          onChange={(e) => setIndustryOther(e.target.value)}
                          placeholder="Sebutkan sektor industri Anda..."
                          autoFocus
                          className="w-full bg-[#FAF5EE] border border-[#7A421D] p-3 text-sm font-sans text-[#1C130D] placeholder-[#63554B]/50 focus:outline-hidden focus:ring-1 focus:ring-[#7A421D]"
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Favorite Features (NO MAXIMUM LIMIT) */}
              {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#1C130D] uppercase tracking-tight">
                      Fitur apa yang paling menarik perhatian Anda?
                    </h2>
                    <p className="font-sans text-sm text-[#63554B]">
                      Pilih bagian atau fitur pada demo Terravise yang paling menarik bagi Anda (dapat memilih lebih dari satu).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      {
                        title: "Rekomendasi Titik Sondir Berikutnya (DQN)",
                        desc: "AI yang menentukan koordinat penyelidikan terbaik berikutnya berdasarkan informasi maksimum.",
                        icon: Compass,
                      },
                      {
                        title: "Transparansi Alasan AI ('Why this point?')",
                        desc: "Penjelasan kriteria objektif mengapa titik tertentu direkomendasikan di lapangan.",
                        icon: Sparkles,
                      },
                      {
                        title: "Model 3D Lapisan Tanah (Voxel Slicing)",
                        desc: "Visualisasi 3D RealityKit untuk membelah dan menginspeksi interior stratigrafi tanah.",
                        icon: Layers,
                      },
                      {
                        title: "Peta Panas Kedalaman Lapisan Keras (Bearing Layer)",
                        desc: "Filter kedalaman tanah keras (qc ≥ 15 MPa) secara kontinu di seluruh tapak proyek.",
                        icon: Building2,
                      },
                      {
                        title: "Perbandingan Titik Kolom Struktur",
                        desc: "Membandingkan kedalaman lapisan tanah keras antar kolom gedung rencana.",
                        icon: CheckCircle2,
                      },
                      {
                        title: "Alur Kerja Lapangan iPadOS (100% Offline)",
                        desc: "Aplikasi rig yang cepat, intuitif, dan dapat bekerja tanpa jaringan internet.",
                        icon: MessageSquare,
                      },
                    ].map((item) => {
                      const isSelected = favoriteFeatures.includes(item.title)
                      const IconComponent = item.icon
                      return (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => toggleFeature(item.title)}
                          className={`p-3.5 text-left border transition-all cursor-pointer flex items-start gap-3.5 ${
                            isSelected
                              ? "bg-[#1C130D] border-[#1C130D] text-[#EFE7DE]"
                              : "bg-[#FAF5EE] border-[#1C130D]/15 text-[#1C130D] hover:border-[#1C130D]/40"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-sm border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? "bg-[#FAD9BA] border-[#FAD9BA] text-[#1C130D]"
                                : "border-[#1C130D]/30 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <IconComponent className={`w-3.5 h-3.5 ${isSelected ? "text-[#FAD9BA]" : "text-[#7A421D]"}`} />
                              <h4 className="font-sans font-bold text-sm tracking-tight">{item.title}</h4>
                            </div>
                            <p className={`font-sans text-xs mt-0.5 leading-relaxed ${isSelected ? "text-[#EFE7DE]/80" : "text-[#63554B]"}`}>
                              {item.desc}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Potential Rating */}
              {currentStep === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#1C130D] uppercase tracking-tight">
                      Bagaimana potensi penerapan Terravise?
                    </h2>
                    <p className="font-sans text-sm text-[#63554B]">
                      Bagaimana Anda melihat prospek penggunaan Terravise untuk kebutuhan investigasi geoteknik nyata ke depan?
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        title: "Sangat Tinggi",
                        desc: "Siap dan layak diuji coba pada proyek investigasi tanah nyata (pilot project)",
                      },
                      {
                        title: "Tinggi",
                        desc: "Sangat potensial, terutama jika terhubung langsung dengan sensor alat sondir digital",
                      },
                      {
                        title: "Menjanjikan",
                        desc: "Inovatif, membutuhkan validasi geoteknik lebih mendalam",
                      },
                      {
                        title: "Media Edukasi / Konseptual",
                        desc: "Sangat baik untuk sarana visualisasi kondisi tanah bawah permukaan",
                      },
                      {
                        title: "Belum Relevan",
                        desc: "Belum sesuai dengan fokus kebutuhan saya saat ini",
                      },
                    ].map((item) => (
                      <label
                        key={item.title}
                        className={`flex items-start gap-3 p-3.5 border transition-all cursor-pointer ${
                          potentialRating === item.title
                            ? "bg-[#1C130D] border-[#1C130D] text-[#EFE7DE]"
                            : "bg-[#FAF5EE] border-[#1C130D]/15 text-[#1C130D] hover:border-[#1C130D]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="potential-rating"
                          value={item.title}
                          checked={potentialRating === item.title}
                          onChange={() => setPotentialRating(item.title)}
                          className="w-4 h-4 accent-[#BD8564] mt-0.5"
                        />
                        <div>
                          <span className={`font-sans text-sm font-bold block ${potentialRating === item.title ? "text-[#FAD9BA]" : "text-[#1C130D]"}`}>
                            {item.title}
                          </span>
                          <span className={`font-sans text-xs ${potentialRating === item.title ? "text-[#EFE7DE]/80" : "text-[#63554B]"}`}>
                            {item.desc}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 6: Collaboration & Partnership */}
              {currentStep === 6 && (
                <motion.div
                  key="step-6"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#1C130D] uppercase tracking-tight flex items-center gap-2">
                      <Users className="w-6 h-6 text-[#7A421D]" />
                      <span>Peluang Kolaborasi & Kemitraan</span>
                    </h2>
                    <p className="font-sans text-sm text-[#63554B]">
                      Terravise saat ini terbuka untuk kolaborasi pengujian lapangan, riset geoteknik, dan pengembangan sistem. Apakah Anda atau relasi Anda tertarik berkolaborasi?
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      "Ya, saya pribadi tertarik berkolaborasi",
                      "Ya, saya memiliki rekan / kenalan / institusi yang relevan untuk dikenalkan",
                      "Mungkin di lain waktu",
                      "Hanya ingin memberikan masukan",
                    ].map((item) => (
                      <label
                        key={item}
                        className={`flex items-center gap-3 p-3.5 border transition-all cursor-pointer ${
                          collaborationInterest === item
                            ? "bg-[#1C130D] border-[#1C130D] text-[#FAD9BA]"
                            : "bg-[#FAF5EE] border-[#1C130D]/15 text-[#1C130D] hover:border-[#1C130D]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="collab-interest"
                          value={item}
                          checked={collaborationInterest === item}
                          onChange={() => setCollaborationInterest(item)}
                          className="w-4 h-4 accent-[#BD8564]"
                        />
                        <span className="font-sans text-sm font-semibold">{item}</span>
                      </label>
                    ))}
                  </div>

                  {/* Progressive Disclosure */}
                  {(collaborationInterest === "Ya, saya pribadi tertarik berkolaborasi" ||
                    collaborationInterest === "Ya, saya memiliki rekan / kenalan / institusi yang relevan untuk dikenalkan") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border-t border-[#1C130D]/15 pt-5 space-y-5"
                    >
                      <div className="space-y-2">
                        <label className="font-mono text-xs text-[#1C130D] font-bold uppercase block">
                          Bentuk Kolaborasi yang Memungkinkan:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            "Uji coba lapangan / Pilot testing proyek nyata",
                            "Penyediaan / validasi data tanah (CPT/Sondir)",
                            "Riset akademik & publikasi ilmiah",
                            "Integrasi perangkat keras / alat sondir rig",
                            "Investasi / akselerasi bisnis",
                            "Lainnya",
                          ].map((cType) => {
                            const isChecked = collaborationTypes.includes(cType)
                            return (
                              <button
                                key={cType}
                                type="button"
                                onClick={() => toggleCollabType(cType)}
                                className={`p-2.5 text-left border text-xs font-sans transition-all flex items-center gap-2 cursor-pointer ${
                                  isChecked
                                    ? "bg-[#251810] border-[#1C130D] text-[#FAD9BA] font-bold"
                                    : "bg-[#FAF5EE] border-[#1C130D]/15 text-[#1C130D] hover:border-[#1C130D]/40"
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${
                                    isChecked ? "bg-[#FAD9BA] border-[#FAD9BA] text-[#1C130D]" : "border-[#1C130D]/30"
                                  }`}
                                >
                                  {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                                <span>{cType}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Contact Details Inputs */}
                      <div className="bg-[#EAE2D5]/50 border border-[#1C130D]/15 p-4 space-y-3">
                        <span className="font-mono text-[11px] text-[#7A421D] font-bold uppercase block">
                          Informasi Kontak (Diri Anda atau Relasi Anda):
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-mono text-[10px] text-[#63554B] block uppercase mb-1">
                              Nama Kontak / Rekan
                            </label>
                            <input
                              type="text"
                              value={collaborationContactName}
                              onChange={(e) => setCollaborationContactName(e.target.value)}
                              placeholder="Nama lengkap..."
                              className="w-full bg-[#FAF5EE] border border-[#1C130D]/20 p-2.5 text-xs font-sans text-[#1C130D] focus:outline-hidden focus:border-[#7A421D]"
                            />
                          </div>

                          <div>
                            <label className="font-mono text-[10px] text-[#63554B] block uppercase mb-1">
                              Perusahaan / Instansi / Kampus
                            </label>
                            <input
                              type="text"
                              value={collaborationContactOrg}
                              onChange={(e) => setCollaborationContactOrg(e.target.value)}
                              placeholder="Nama instansi/organisasi..."
                              className="w-full bg-[#FAF5EE] border border-[#1C130D]/20 p-2.5 text-xs font-sans text-[#1C130D] focus:outline-hidden focus:border-[#7A421D]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-mono text-[10px] text-[#63554B] block uppercase mb-1">
                            Kontak yang Bisa Dihubungi (WhatsApp / Email / LinkedIn)
                          </label>
                          <input
                            type="text"
                            value={collaborationContactInfo}
                            onChange={(e) => setCollaborationContactInfo(e.target.value)}
                            placeholder="Contoh: 0812xxxx atau email@instansi.com..."
                            className="w-full bg-[#FAF5EE] border border-[#1C130D]/20 p-2.5 text-xs font-sans text-[#1C130D] focus:outline-hidden focus:border-[#7A421D]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* STEP 7: Feedback Notes */}
              {currentStep === 7 && (
                <motion.div
                  key="step-7"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#1C130D] uppercase tracking-tight">
                      Masukan, kritik, atau saran untuk Terravise
                    </h2>
                    <p className="font-sans text-sm text-[#63554B]">
                      Tuliskan pendapat, kritik membangun, atau saran fitur apa yang perlu ditingkatkan oleh tim pengembang kami.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="feedback-notes-input" className="font-mono text-xs text-[#1C130D] font-bold uppercase block">
                      Catatan Masukan
                    </label>
                    <textarea
                      id="feedback-notes-input"
                      rows={5}
                      value={feedbackNotes}
                      onChange={(e) => {
                        setFeedbackNotes(e.target.value)
                        if (validationError) setValidationError("")
                      }}
                      placeholder="Bagikan pandangan jujur Anda mengenai aplikasi Terravise di sini..."
                      autoFocus
                      className="w-full bg-[#FAF5EE] border border-[#1C130D]/25 p-3.5 text-sm font-sans text-[#1C130D] placeholder-[#63554B]/50 focus:border-[#7A421D] focus:outline-hidden focus:ring-1 focus:ring-[#7A421D] leading-relaxed"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Stepper Controls Toolbar */}
            <div className="border-t border-[#1C130D]/15 pt-6 flex items-center justify-between gap-4 font-mono text-xs">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#FAF5EE] border border-[#1C130D]/20 text-[#1C130D] hover:bg-[#EAE2D5] transition-colors font-bold cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Sebelumnya</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Skip button for optional steps */}
                {currentStep !== 1 && currentStep !== 2 && currentStep !== 7 && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-[#63554B] hover:text-[#1C130D] underline cursor-pointer py-2 px-3"
                  >
                    Lewati
                  </button>
                )}

                {currentStep < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1C130D] text-[#FAD9BA] hover:bg-[#5A3008] hover:text-[#EFE7DE] transition-colors font-bold cursor-pointer uppercase tracking-wider"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#10B981] text-white hover:bg-[#059669] disabled:opacity-50 transition-colors font-bold cursor-pointer uppercase tracking-wider shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengirim Data...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Feedback</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
