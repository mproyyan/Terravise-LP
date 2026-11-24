import { createClient } from "@supabase/supabase-js"
import type { FeedbackSubmission } from "../types"

/**
 * Supabase client configuration for Terravise
 *
 * Required environment variables in .env:
 * VITE_SUPABASE_URL=https://your-project.supabase.co
 * VITE_SUPABASE_ANON_KEY=your-anon-key
 *
 * SQL schema to run in Supabase SQL Editor:
 * ```sql
 * CREATE TABLE IF NOT EXISTS feedback (
 *   id BIGSERIAL PRIMARY KEY,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   full_name TEXT NOT NULL,
 *   role TEXT NOT NULL,
 *   role_other TEXT,
 *   industry TEXT,
 *   industry_other TEXT,
 *   favorite_features TEXT[] DEFAULT '{}',
 *   potential_rating TEXT,
 *   collaboration_interest TEXT,
 *   collaboration_types TEXT[] DEFAULT '{}',
 *   collaboration_contact_name TEXT,
 *   collaboration_contact_org TEXT,
 *   collaboration_contact_info TEXT,
 *   feedback_notes TEXT NOT NULL,
 *   is_displayed BOOLEAN NOT NULL DEFAULT false
 * );
 *
 * -- Add flag column if table already exists:
 * ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS is_displayed BOOLEAN NOT NULL DEFAULT false;
 *
 * -- Enable Row Level Security (RLS) and allow public insert, select & update
 * ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow public insert to feedback"
 *   ON feedback FOR INSERT
 *   TO anon, authenticated
 *   WITH CHECK (true);
 * CREATE POLICY "Allow public select from feedback"
 *   ON feedback FOR SELECT
 *   TO anon, authenticated
 *   USING (true);
 * CREATE POLICY "Allow public update on feedback"
 *   ON feedback FOR UPDATE
 *   TO anon, authenticated
 *   USING (true)
 *   WITH CHECK (true);
 * ```
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ""
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("http") &&
  supabaseAnonKey.length > 10
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function submitFeedback(payload: FeedbackSubmission): Promise<{ success: boolean; error?: string }> {
  // If Supabase credentials are not provided in environment, simulate success and cache locally for dev
  if (!supabase || !isSupabaseConfigured) {
    console.warn(
      "Terravise Supabase: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set. Storing feedback in localStorage for development."
    )
    try {
      const existing = JSON.parse(localStorage.getItem("terravise_feedback_local") || "[]")
      existing.push({
        ...payload,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
      })
      localStorage.setItem("terravise_feedback_local", JSON.stringify(existing))
      return { success: true }
    } catch {
      return { success: true }
    }
  }

  try {
    const { error } = await supabase.from("feedback").insert([
      {
        full_name: payload.full_name,
        role: payload.role,
        role_other: payload.role_other || null,
        industry: payload.industry || null,
        industry_other: payload.industry_other || null,
        favorite_features: payload.favorite_features || [],
        potential_rating: payload.potential_rating || null,
        collaboration_interest: payload.collaboration_interest || null,
        collaboration_types: payload.collaboration_types || [],
        collaboration_contact_name: payload.collaboration_contact_name || null,
        collaboration_contact_org: payload.collaboration_contact_org || null,
        collaboration_contact_info: payload.collaboration_contact_info || null,
        feedback_notes: payload.feedback_notes,
      },
    ])

    if (error) {
      console.error("Error inserting feedback into Supabase:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to connect to Supabase"
    console.error("Unexpected error submitting feedback:", err)
    return { success: false, error: message }
  }
}

export interface FeedbackDisplayItem {
  id: string
  full_name?: string
  role: string
  feedback_notes: string
  created_at?: string
  is_displayed?: boolean
}

export interface FeedbackAdminItem {
  id: string
  created_at?: string
  full_name: string
  role: string
  industry?: string
  favorite_features: string[]
  potential_rating?: string
  collaboration_interest?: string
  collaboration_types: string[]
  collaboration_contact_name?: string
  collaboration_contact_org?: string
  collaboration_contact_info?: string
  feedback_notes: string
  is_displayed: boolean
}

function getLocalFeedbacks(): FeedbackDisplayItem[] {
  try {
    const raw = localStorage.getItem("terravise_feedback_local")
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.feedback_notes === "string" &&
          item.feedback_notes.trim().length > 0 &&
          Boolean(item.is_displayed)
      )
      .map((item, idx) => ({
        id: String(item.id || `local-${idx}`),
        full_name: item.full_name ? String(item.full_name).trim() : undefined,
        role: cleanRoleText(item.role, item.role_other),
        feedback_notes: String(item.feedback_notes).trim(),
        created_at: item.created_at,
        is_displayed: Boolean(item.is_displayed),
      }))
      .reverse()
  } catch {
    return []
  }
}

export function cleanRoleText(role?: string, roleOther?: string): string {
  if (!role) return "Pengunjung"
  if (role === "Lainnya" && roleOther) return roleOther.trim()
  if (role.startsWith("Lainnya:")) {
    const extracted = role.replace(/^Lainnya:\s*/i, "").trim()
    return extracted || "Pengunjung"
  }
  return role.trim()
}

/**
 * Fetches ONLY feedbacks flagged with `is_displayed = true` for the `/feedbacks` CPT wall.
 */
export async function fetchFeedbacks(): Promise<FeedbackDisplayItem[]> {
  if (!supabase || !isSupabaseConfigured) {
    return getLocalFeedbacks()
  }

  try {
    localStorage.removeItem("terravise_feedback_local")
  } catch {
    // ignore storage errors
  }

  try {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("is_displayed", true)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error fetching displayed feedbacks from Supabase:", error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    const remoteItems: FeedbackDisplayItem[] = data
      .filter(
        (row) =>
          row &&
          typeof row.feedback_notes === "string" &&
          row.feedback_notes.trim().length > 0
      )
      .map((row) => ({
        id: String(row.id),
        full_name: row.full_name ? String(row.full_name).trim() : undefined,
        role: cleanRoleText(row.role, row.role_other),
        feedback_notes: String(row.feedback_notes).trim(),
        created_at: row.created_at,
        is_displayed: Boolean(row.is_displayed),
      }))

    return remoteItems
  } catch (err) {
    console.error("Unexpected error fetching feedbacks:", err)
    return []
  }
}

/**
 * Fetches all feedbacks (both displayed and hidden) for the Admin Moderation Page.
 */
export async function fetchAllFeedbacksForAdmin(): Promise<{
  items: FeedbackAdminItem[]
  error?: string
  missingFlagColumn?: boolean
}> {
  if (!supabase || !isSupabaseConfigured) {
    return { items: [], error: "Supabase belum dikonfigurasi di .env" }
  }

  try {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return { items: [], error: error.message }
    }

    if (!data || data.length === 0) {
      return { items: [] }
    }

    const firstRow = data[0] as Record<string, unknown>
    const missingFlagColumn = !("is_displayed" in firstRow)

    const items: FeedbackAdminItem[] = data.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      created_at: typeof row.created_at === "string" ? row.created_at : undefined,
      full_name: typeof row.full_name === "string" ? row.full_name : "",
      role: cleanRoleText(
        typeof row.role === "string" ? row.role : undefined,
        typeof row.role_other === "string" ? row.role_other : undefined
      ),
      industry:
        typeof row.industry === "string" && row.industry
          ? row.industry.replace(/^Lainnya:\s*/i, "")
          : undefined,
      favorite_features: Array.isArray(row.favorite_features)
        ? (row.favorite_features as string[])
        : [],
      potential_rating:
        typeof row.potential_rating === "string" ? row.potential_rating : undefined,
      collaboration_interest:
        typeof row.collaboration_interest === "string"
          ? row.collaboration_interest
          : undefined,
      collaboration_types: Array.isArray(row.collaboration_types)
        ? (row.collaboration_types as string[])
        : [],
      collaboration_contact_name:
        typeof row.collaboration_contact_name === "string"
          ? row.collaboration_contact_name
          : undefined,
      collaboration_contact_org:
        typeof row.collaboration_contact_org === "string"
          ? row.collaboration_contact_org
          : undefined,
      collaboration_contact_info:
        typeof row.collaboration_contact_info === "string"
          ? row.collaboration_contact_info
          : undefined,
      feedback_notes:
        typeof row.feedback_notes === "string" ? row.feedback_notes : "",
      is_displayed: Boolean(row.is_displayed),
    }))

    return { items, missingFlagColumn }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memuat data feedback"
    return { items: [], error: msg }
  }
}

/**
 * Toggles the `is_displayed` flag of a feedback item in Supabase.
 */
export async function updateFeedbackDisplayFlag(
  id: string,
  isDisplayed: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, error: "Supabase belum dikonfigurasi." }
  }

  try {
    const { data, error } = await supabase
      .from("feedback")
      .update({ is_displayed: isDisplayed })
      .eq("id", id)
      .select("id, is_displayed")

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error:
          "Update ditolak oleh RLS Supabase. Pastikan Anda sudah menjalankan policy FOR UPDATE di SQL Editor Supabase.",
      }
    }

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memperbarui status tampil"
    return { success: false, error: msg }
  }
}

