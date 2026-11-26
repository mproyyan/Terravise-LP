import { useState, useEffect, useCallback } from "react"
import {
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  LogOut,
  Copy,
  Check,
  Play,
  Square,
} from "lucide-react"
import {
  fetchAllFeedbacksForAdmin,
  updateFeedbackDisplayFlag,
  type FeedbackAdminItem,
} from "../../lib/supabase"
import {
  getAutoScrollEnabled,
  setAutoScrollEnabled,
  AUTOSCROLL_STORAGE_KEY,
} from "../../lib/autoScroll"

const ADMIN_PASSWORD = "ujangkedu"
const SESSION_AUTH_KEY = "terravise_feedback_admin_auth"

const SQL_MIGRATION_SNIPPET = `-- 1. Tambah kolom flag is_displayed
ALTER TABLE public.feedback 
ADD COLUMN IF NOT EXISTS is_displayed BOOLEAN NOT NULL DEFAULT false;

-- 2. Buka izin baca (SELECT) & ubah flag (UPDATE)
DROP POLICY IF EXISTS "Allow public select from feedback" ON public.feedback;
CREATE POLICY "Allow public select from feedback"
  ON public.feedback FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public update on feedback" ON public.feedback;
CREATE POLICY "Allow public update on feedback"
  ON public.feedback FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);`

export function FeedbackAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_AUTH_KEY) === "true"
    } catch {
      return false
    }
  })
  const [passwordInput, setPasswordInput] = useState<string>("")
  const [authError, setAuthError] = useState<string>("")

  // Data state
  const [items, setItems] = useState<FeedbackAdminItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [missingFlagColumn, setMissingFlagColumn] = useState<boolean>(false)
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({})
  const [filterMode, setFilterMode] = useState<"all" | "displayed" | "hidden">("all")
  const [copiedSql, setCopiedSql] = useState<boolean>(false)
  const [autoScrollOn, setAutoScrollOn] = useState<boolean>(() =>
    getAutoScrollEnabled()
  )

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === AUTOSCROLL_STORAGE_KEY) {
        setAutoScrollOn(e.newValue === "true")
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const handleToggleAutoScroll = () => {
    const next = !autoScrollOn
    setAutoScrollOn(next)
    setAutoScrollEnabled(next)
  }

  const loadFeedbacks = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg("")
    const res = await fetchAllFeedbacksForAdmin()
    if (res.error) {
      setErrorMsg(res.error)
    }
    setItems(res.items)
    setMissingFlagColumn(Boolean(res.missingFlagColumn))
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadFeedbacks()
    }
  }, [isAuthenticated, loadFeedbacks])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setAuthError("")
      try {
        sessionStorage.setItem(SESSION_AUTH_KEY, "true")
      } catch {
        // ignore
      }
    } else {
      setAuthError("Password salah. Silakan coba lagi.")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPasswordInput("")
    try {
      sessionStorage.removeItem(SESSION_AUTH_KEY)
    } catch {
      // ignore
    }
  }

  const handleToggleDisplay = async (item: FeedbackAdminItem) => {
    const nextState = !item.is_displayed
    setTogglingIds((prev) => ({ ...prev, [item.id]: true }))
    setErrorMsg("")

    const res = await updateFeedbackDisplayFlag(item.id, nextState)
    if (!res.success) {
      setErrorMsg(res.error || "Gagal memperbarui status feedback.")
    } else {
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, is_displayed: nextState } : row
        )
      )
    }

    setTogglingIds((prev) => ({ ...prev, [item.id]: false }))
  }

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_SNIPPET)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }

  // =========================================================================
  // 1. PASSWORD GATE VIEW
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#150E09] text-[#EFE7DE] font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#21160F] border border-[#BD8564]/40 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-[#EFE7DE]/15 pb-4">
            <div className="w-10 h-10 bg-[#150E09] border border-[#BD8564]/50 flex items-center justify-center text-[#FAD9BA]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#BD8564] block">
                Terravise Moderation
              </span>
              <h1 className="font-sans font-black text-xl uppercase tracking-tight text-[#EFE7DE]">
                Feedback Wall Admin
              </h1>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="admin-password"
                className="font-mono text-xs uppercase text-[#FAD9BA] font-bold block"
              >
                Masukkan Password Admin
              </label>
              <input
                id="admin-password"
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value)
                  if (authError) setAuthError("")
                }}
                placeholder="Password..."
                autoFocus
                className="w-full bg-[#150E09] border border-[#BD8564]/40 p-3 text-sm font-sans text-[#EFE7DE] placeholder-[#EFE7DE]/30 focus:outline-hidden focus:border-[#FAD9BA]"
              />
            </div>

            {authError && (
              <div className="bg-[#991B1B]/30 border border-[#EF4444]/50 text-[#FCA5A5] p-3 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#FAD9BA] text-[#1C130D] hover:bg-[#BD8564] hover:text-[#150E09] transition-colors font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  const displayedCount = items.filter((i) => i.is_displayed).length
  const hiddenCount = items.length - displayedCount

  const filteredItems = items.filter((item) => {
    if (filterMode === "displayed") return item.is_displayed
    if (filterMode === "hidden") return !item.is_displayed
    return true
  })

  // =========================================================================
  // 2. AUTHENTICATED ADMIN DASHBOARD VIEW
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FBF7F2] text-[#1C130D] font-sans">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#1C130D] text-[#EFE7DE] border-b border-[#BD8564]/40 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/terravise-logo.png"
              alt="Terravise"
              className="w-7 h-7 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans font-black text-base sm:text-lg uppercase tracking-tight text-[#EFE7DE]">
                  Kurasi Feedback Wall
                </h1>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-[#271C14] border border-[#BD8564]/50 text-[#FAD9BA]">
                  Admin
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#EFE7DE]/60">
                Pilih masukan mana saja yang akan ditampilkan di layar /feedbacks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-xs">
            <a
              href="/feedbacks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#271C14] border border-[#BD8564]/50 text-[#FAD9BA] hover:bg-[#38271B] transition-colors font-bold"
            >
              <span>Buka /feedbacks</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={loadFeedbacks}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF5EE] text-[#1C130D] hover:bg-[#EAE2D5] transition-colors font-bold cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-transparent border border-[#EFE7DE]/25 text-[#EFE7DE]/80 hover:text-white hover:border-[#EFE7DE] transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Hidden Landing Page Auto-Scroll Control Panel */}
        <div className="bg-[#1C130D] text-[#EFE7DE] border border-[#BD8564]/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  autoScrollOn ? "bg-[#10B981] animate-ping" : "bg-[#EFE7DE]/30"
                }`}
              />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FAD9BA]">
                Mode Auto-Scroll Landing Page:{" "}
                <strong className={autoScrollOn ? "text-[#10B981]" : "text-[#EFE7DE]/60"}>
                  {autoScrollOn ? "ON (AKTIF)" : "OFF (NONAKTIF)"}
                </strong>
              </span>
            </div>
            <p className="font-sans text-xs text-[#EFE7DE]/70">
              Jika diaktifkan, halaman utama (/) otomatis bergerak halus dari section ke section, berhenti sejenak di tiap section, dan kembali ke atas saat mencapai bawah.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs">
            <button
              type="button"
              onClick={handleToggleAutoScroll}
              className={`inline-flex items-center gap-2 px-4 py-2.5 font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                autoScrollOn
                  ? "bg-[#991B1B] text-white hover:bg-[#7F1D1D]"
                  : "bg-[#10B981] text-white hover:bg-[#059669]"
              }`}
            >
              {autoScrollOn ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Matikan Auto-Scroll</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Aktifkan Auto-Scroll</span>
                </>
              )}
            </button>

            <a
              href={autoScrollOn ? "/?autoscroll=on" : "/"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#271C14] border border-[#BD8564]/50 text-[#FAD9BA] hover:bg-[#38271B] transition-colors font-bold"
            >
              <span>Buka Landing Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Alert if SQL Migration / RLS Policy is needed */}
        {(missingFlagColumn || errorMsg) && (
          <div className="bg-[#21160F] text-[#EFE7DE] border-2 border-[#EF4444] p-5 space-y-3 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <h2 className="font-sans font-bold text-sm sm:text-base text-[#FAD9BA]">
                  {errorMsg ||
                    "Kolom flag 'is_displayed' belum ditemukan di tabel Supabase Anda"}
                </h2>
                <p className="font-sans text-xs text-[#EFE7DE]/80">
                  Jalankan query SQL singkat ini di menu <strong>SQL Editor</strong> Supabase Anda agar tombol Tampilkan/Sembunyikan berfungsi:
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAD9BA] text-[#1C130D] font-mono text-xs font-bold cursor-pointer shrink-0"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin SQL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-[#140D08] border border-[#EFE7DE]/15 p-3 text-[11px] font-mono text-[#FAD9BA] overflow-x-auto">
              {SQL_MIGRATION_SNIPPET}
            </pre>
          </div>
        )}

        {/* Summary Counters & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF5EE] border border-[#1C130D]/15 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3.5 py-2 font-mono text-xs font-bold uppercase transition-colors cursor-pointer ${
                filterMode === "all"
                  ? "bg-[#1C130D] text-[#FAD9BA]"
                  : "bg-[#EAE2D5]/70 text-[#63554B] hover:text-[#1C130D]"
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("displayed")}
              className={`px-3.5 py-2 font-mono text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterMode === "displayed"
                  ? "bg-[#10B981] text-white"
                  : "bg-[#EAE2D5]/70 text-[#63554B] hover:text-[#1C130D]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>Ditampilkan ({displayedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("hidden")}
              className={`px-3.5 py-2 font-mono text-xs font-bold uppercase transition-colors cursor-pointer ${
                filterMode === "hidden"
                  ? "bg-[#7A421D] text-[#FAD9BA]"
                  : "bg-[#EAE2D5]/70 text-[#63554B] hover:text-[#1C130D]"
              }`}
            >
              Disembunyikan ({hiddenCount})
            </button>
          </div>

          <div className="font-mono text-xs text-[#63554B]">
            Status Wall:{" "}
            <strong className="text-[#1C130D]">
              {displayedCount} feedback aktif diputar
            </strong>
          </div>
        </div>

        {/* Feedback Cards List */}
        {isLoading && items.length === 0 ? (
          <div className="bg-[#FAF5EE] border border-[#1C130D]/15 p-12 flex flex-col items-center justify-center gap-3 text-[#63554B]">
            <Loader2 className="w-6 h-6 animate-spin text-[#7A421D]" />
            <span className="font-mono text-xs uppercase">
              Memuat data feedback dari Supabase...
            </span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-[#FAF5EE] border border-[#1C130D]/15 p-12 text-center space-y-2">
            <p className="font-sans font-bold text-base text-[#1C130D]">
              Belum ada data feedback pada kategori ini.
            </p>
            <p className="font-sans text-xs text-[#63554B]">
              Jika data sudah ada di tabel Supabase namun belum muncul, pastikan Anda telah menjalankan SQL Policy SELECT di atas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => {
              const isBusy = Boolean(togglingIds[item.id])

              return (
                <article
                  key={item.id}
                  className={`bg-[#FAF5EE] border transition-all p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                    item.is_displayed
                      ? "border-[#10B981] shadow-[0_6px_24px_rgba(16,185,129,0.12)]"
                      : "border-[#1C130D]/15 opacity-85 hover:opacity-100"
                  }`}
                >
                  {/* Left Content: Name, Role, Feedback Notes, and Metadata */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Status Badge */}
                      {item.is_displayed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#10B981]/15 border border-[#10B981] text-[#065F46] font-mono text-[11px] font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tampil di Wall</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EAE2D5] border border-[#1C130D]/20 text-[#63554B] font-mono text-[11px] font-bold uppercase">
                          <EyeOff className="w-3 h-3" />
                          <span>Disembunyikan</span>
                        </span>
                      )}

                      {item.full_name && (
                        <h2 className="font-sans font-black text-lg text-[#1C130D]">
                          {item.full_name}
                        </h2>
                      )}

                      <span className="font-mono text-xs px-2.5 py-0.5 bg-[#1C130D] text-[#FAD9BA] font-semibold">
                        {item.role}
                      </span>

                      {item.industry && (
                        <span className="font-mono text-[11px] px-2 py-0.5 bg-[#EAE2D5] text-[#63554B]">
                          {item.industry}
                        </span>
                      )}
                    </div>

                    {/* Main Feedback Quote */}
                    <p className="font-sans text-sm sm:text-base text-[#1C130D] leading-relaxed bg-[#FBF7F2] border-l-4 border-[#BD8564] p-3.5">
                      "{item.feedback_notes}"
                    </p>

                    {/* Extra details if any (Potential / Collaboration) */}
                    {(item.potential_rating ||
                      item.collaboration_interest ||
                      item.collaboration_contact_info) && (
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-mono text-[#63554B] pt-1">
                        {item.potential_rating && (
                          <span>
                            Potensi: <strong className="text-[#1C130D]">{item.potential_rating}</strong>
                          </span>
                        )}
                        {item.collaboration_interest && (
                          <span>
                            Kolaborasi:{" "}
                            <strong className="text-[#1C130D]">
                              {item.collaboration_interest}
                            </strong>
                          </span>
                        )}
                        {item.collaboration_contact_info && (
                          <span>
                            Kontak:{" "}
                            <strong className="text-[#7A421D]">
                              {item.collaboration_contact_name
                                ? `${item.collaboration_contact_name} (${item.collaboration_contact_info})`
                                : item.collaboration_contact_info}
                            </strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Action Button: Single Click Toggle */}
                  <div className="shrink-0 flex md:flex-col items-stretch md:items-end justify-end">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggleDisplay(item)}
                      className={`w-full md:w-48 px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                        item.is_displayed
                          ? "bg-[#1C130D] text-[#FAD9BA] hover:bg-[#991B1B] hover:text-white"
                          : "bg-[#10B981] text-white hover:bg-[#059669] shadow-md"
                      }`}
                    >
                      {isBusy ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : item.is_displayed ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Sembunyikan</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Tampilkan di Wall</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
