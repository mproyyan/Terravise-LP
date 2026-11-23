import React, { useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { X, CheckCircle, Shield, Building, HardHat, Mail, User } from "lucide-react"

interface LeadIntakeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadIntakeModal({ open, onOpenChange }: LeadIntakeModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    role: "Lead Geotechnical Engineer",
    projectArea: "5–20 Hectares (10–30 CPTs)",
    rigCount: "2–4 Rigs",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulated submission for MVP
    setSubmitted(true)
  }

  const handleClose = () => {
    onOpenChange(false)
    // reset after close animation
    setTimeout(() => setSubmitted(false), 300)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-[#F8F7F4] border border-stone-300 p-6 sm:p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="emerald" className="text-[10px]">
                  B2B Early Access
                </Badge>
                <span className="font-mono text-[10px] text-stone-500">
                  Version 4.6-A
                </span>
              </div>
              <DialogPrimitive.Title className="text-xl font-bold font-sans tracking-tight text-stone-900">
                Request Terravise Field Pilot
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-xs text-stone-600 mt-1 font-mono">
                Deploy on-device CPT exploration to your active investigation rigs.
              </DialogPrimitive.Description>
            </div>

            <DialogPrimitive.Close asChild>
              <button
                onClick={handleClose}
                className="text-stone-400 hover:text-stone-900 transition-colors p-1 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogPrimitive.Close>
          </div>

          {/* Form Body */}
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-sans font-bold text-lg text-stone-900">
                  Pilot Credentials Dispatched
                </h4>
                <p className="text-xs font-mono text-stone-600 max-w-sm mx-auto">
                  Our Geotechnical Engineering team has scheduled your enterprise
                  onboarding call for <strong>{formData.company || "your consultancy"}</strong>.
                </p>
              </div>
              <div className="p-3 bg-stone-100 border border-stone-200 text-left font-mono text-[11px] text-stone-600 max-w-sm mx-auto space-y-1">
                <div>• Recipient: {formData.email || "engineer@domain.com"}</div>
                <div>• Assigned Coordinator: Dr. H. Robertson, PE</div>
                <div>• Rig SDK: Native iPadOS M-Series Active</div>
              </div>
              <Button
                variant="primary"
                onClick={handleClose}
                className="w-full mt-4"
              >
                Return to Landing Page
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Ir. Budi Santoso, ST, MT"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 text-stone-900 text-xs font-mono placeholder:text-stone-400 focus:outline-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-700">
                  Work Email (Corporate / University)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="budi@geoteknik-nusantara.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 text-stone-900 text-xs font-mono placeholder:text-stone-400 focus:outline-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-700">
                    Company / Firm
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input
                      required
                      type="text"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      placeholder="PT Geotek Konsultan"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 text-stone-900 text-xs font-mono placeholder:text-stone-400 focus:outline-stone-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-700">
                    Your Primary Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-stone-300 text-stone-900 text-xs font-mono focus:outline-stone-900 cursor-pointer"
                  >
                    <option>Lead Geotechnical Engineer</option>
                    <option>CPT Contractor / Rig Operator</option>
                    <option>Structural Foundation Designer</option>
                    <option>Project Civil Director</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-700">
                    Upcoming Campaign Size
                  </label>
                  <select
                    value={formData.projectArea}
                    onChange={(e) =>
                      setFormData({ ...formData, projectArea: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-stone-300 text-stone-900 text-xs font-mono focus:outline-stone-900 cursor-pointer"
                  >
                    <option>&lt; 5 Hectares (1–10 CPTs)</option>
                    <option>5–20 Hectares (10–30 CPTs)</option>
                    <option>20–100 Hectares (30–100 CPTs)</option>
                    <option>Linear Infrastructure (Rail/Highway)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-700">
                    Active CPT Rig Fleet
                  </label>
                  <select
                    value={formData.rigCount}
                    onChange={(e) =>
                      setFormData({ ...formData, rigCount: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-stone-300 text-stone-900 text-xs font-mono focus:outline-stone-900 cursor-pointer"
                  >
                    <option>1 Rig (Trial Pilot)</option>
                    <option>2–4 Rigs (Field Team)</option>
                    <option>5+ Rigs (Enterprise Fleet)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-stone-500">
                <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>NDA & statutory compliance guaranteed. Zero data leakage.</span>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Submit Pilot Request
                </Button>
              </div>
            </form>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
