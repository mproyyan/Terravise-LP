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
 *   feedback_notes TEXT NOT NULL
 * );
 *
 * -- Enable Row Level Security (RLS) and allow public insert
 * ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow public insert to feedback"
 *   ON feedback FOR INSERT
 *   TO anon, authenticated
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
