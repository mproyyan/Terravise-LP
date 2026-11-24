import { useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { X, CheckCircle, Shield, Building, Mail, User } from "lucide-react"

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
    projectArea: "5 to 20 Hectares (10 to 30 CPTs)",
    rigCount: "2 to 4 Rigs",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => setSubmitted(false), 300)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#1C130D]/80 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby="lead-dialog-description"
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-[#FBF7F2] border border-[#1C130D]/20 p-6 sm:p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#1C130D]/15 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="emerald" className="text-[10px]">
                  Field deployment
                </Badge>
                <span className="font-mono text-[10px] text-[#63554B] tabular-nums">
                  Version 4.6.2
                </span>
              </div>
              <DialogPrimitive.Title className="text-xl font-bold font-sans tracking-tight text-[#1C130D] uppercase">
                Request Terravise field pilot
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="lead-dialog-description"
                className="text-xs text-[#63554B] mt-1 font-mono text-pretty"
              >
                Deploy on-device CPT exploration to active investigation rigs.
              </DialogPrimitive.Description>
            </div>

            <DialogPrimitive.Close asChild>
              <button
                onClick={handleClose}
                className="text-[#63554B] hover:text-[#1C130D] transition-colors p-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5A3008]"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogPrimitive.Close>
          </div>

          {/* Form Body */}
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 bg-[#FAD9BA]/30 border border-[#5A3008] text-[#5A3008] flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-sans font-bold text-lg text-[#1C130D]">
                  Pilot request confirmed
                </h4>
                <p className="text-xs font-mono text-[#63554B] max-w-sm mx-auto text-pretty">
                  Our engineering team has scheduled onboarding for <strong>{formData.company || "your consultancy"}</strong>.
                </p>
              </div>
              <div className="p-3 bg-[#E3D7C8]/30 border border-[#1C130D]/10 text-left font-mono text-[11px] text-[#63554B] max-w-sm mx-auto space-y-1">
                <div>• Recipient: {formData.email || "engineer@domain.com"}</div>
                <div>• Reviewer: Geotechnical engineering staff</div>
                <div>• Hardware: iPadOS M-Series offline package</div>
              </div>
              <Button
                variant="primary"
                onClick={handleClose}
                className="w-full mt-4"
              >
                Return to landing page
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="lead-full-name"
                  className="block text-xs font-mono uppercase tracking-wider text-[#1C130D]"
                >
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-[#63554B]" />
                  <input
                    id="lead-full-name"
                    required
                    aria-required="true"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Ir. Budi Santoso, ST, MT"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#1C130D]/20 text-[#1C130D] text-xs font-mono placeholder:text-[#63554B]/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5A3008]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="lead-email"
                  className="block text-xs font-mono uppercase tracking-wider text-[#1C130D]"
                >
                  Work email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#63554B]" />
                  <input
                    id="lead-email"
                    required
                    aria-required="true"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="budi@geoteknik-nusantara.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#1C130D]/20 text-[#1C130D] text-xs font-mono placeholder:text-[#63554B]/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5A3008]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="lead-company"
                    className="block text-xs font-mono uppercase tracking-wider text-[#1C130D]"
                  >
                    Company
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 w-4 h-4 text-[#63554B]" />
                    <input
                      id="lead-company"
                      required
                      aria-required="true"
                      type="text"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      placeholder="PT Geotek Nusantara"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#1C130D]/20 text-[#1C130D] text-xs font-mono placeholder:text-[#63554B]/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5A3008]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="lead-role"
                    className="block text-xs font-mono uppercase tracking-wider text-[#1C130D]"
                  >
                    Role
                  </label>
                  <select
                    id="lead-role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#1C130D]/20 text-[#1C130D] text-xs font-mono focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5A3008] cursor-pointer"
                  >
                    <option>Lead Geotechnical Engineer</option>
                    <option>CPT Contractor / Rig Operator</option>
                    <option>Foundation Structural Designer</option>
                    <option>Civil Project Director</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="lead-project-area"
                    className="block text-xs font-mono uppercase tracking-wider text-[#1C130D]"
                  >
                    Investigation size
                  </label>
                  <select
                    id="lead-project-area"
                    value={formData.projectArea}
                    onChange={(e) =>
                      setFormData({ ...formData, projectArea: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#1C130D]/20 text-[#1C130D] text-xs font-mono focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5A3008] cursor-pointer"
                  >
                    <option>Under 5 Hectares (1 to 10 CPTs)</option>
                    <option>5 to 20 Hectares (10 to 30 CPTs)</option>
                    <option>20 to 100 Hectares (30 to 100 CPTs)</option>
                    <option>Linear infrastructure</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="lead-rig-count"
                    className="block text-xs font-mono uppercase tracking-wider text-[#1C130D]"
                  >
                    Active rig fleet
                  </label>
                  <select
                    id="lead-rig-count"
                    value={formData.rigCount}
                    onChange={(e) =>
                      setFormData({ ...formData, rigCount: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#1C130D]/20 text-[#1C130D] text-xs font-mono focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5A3008] cursor-pointer"
                  >
                    <option>1 Rig (Trial pilot)</option>
                    <option>2 to 4 Rigs (Field crew)</option>
                    <option>5+ Rigs (Enterprise fleet)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-[#63554B]">
                <Shield className="w-3.5 h-3.5 text-[#5A3008] shrink-0" />
                <span>NDA guaranteed. Zero telemetry off device.</span>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full tracking-wider">
                  Submit pilot request
                </Button>
              </div>
            </form>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
