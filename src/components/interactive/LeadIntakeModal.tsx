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
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#171814]/80 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-[#f4f2ec] border border-[#171814]/20 p-6 sm:p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#171814]/15 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="emerald" className="text-[10px]">
                  Field deployment
                </Badge>
                <span className="font-mono text-[10px] text-[#5c5f55]">
                  Version 4.6.2
                </span>
              </div>
              <DialogPrimitive.Title className="text-xl font-bold font-sans tracking-tight text-[#171814] uppercase">
                Request Terravise field pilot
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-xs text-[#5c5f55] mt-1 font-mono">
                Deploy on-device CPT exploration to active investigation rigs.
              </DialogPrimitive.Description>
            </div>

            <DialogPrimitive.Close asChild>
              <button
                onClick={handleClose}
                className="text-[#5c5f55] hover:text-[#171814] transition-colors p-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogPrimitive.Close>
          </div>

          {/* Form Body */}
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 bg-[#627056]/20 border border-[#627056] text-[#627056] flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-sans font-bold text-lg text-[#171814]">
                  Pilot request confirmed
                </h4>
                <p className="text-xs font-mono text-[#5c5f55] max-w-sm mx-auto">
                  Our engineering team has scheduled onboarding for <strong>{formData.company || "your consultancy"}</strong>.
                </p>
              </div>
              <div className="p-3 bg-[#dedacd]/30 border border-[#171814]/10 text-left font-mono text-[11px] text-[#5c5f55] max-w-sm mx-auto space-y-1">
                <div>• Recipient: {formData.email || "engineer@domain.com"}</div>
                <div>• Reviewer: Geotechnical staff</div>
                <div>• Hardware: iPadOS M-series offline package</div>
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
                <label className="block text-xs font-mono uppercase tracking-wider text-[#171814]">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-[#5c5f55]" />
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Ir. Budi Santoso, ST, MT"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#171814]/20 text-[#171814] text-xs font-mono placeholder:text-[#5c5f55]/60 focus:outline-[#845942]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#171814]">
                  Work email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#5c5f55]" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="budi@geoteknik-nusantara.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#171814]/20 text-[#171814] text-xs font-mono placeholder:text-[#5c5f55]/60 focus:outline-[#845942]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#171814]">
                    Company
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 w-4 h-4 text-[#5c5f55]" />
                    <input
                      required
                      type="text"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      placeholder="PT Geotek Nusantara"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#171814]/20 text-[#171814] text-xs font-mono placeholder:text-[#5c5f55]/60 focus:outline-[#845942]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#171814]">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#171814]/20 text-[#171814] text-xs font-mono focus:outline-[#845942] cursor-pointer"
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
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#171814]">
                    Investigation size
                  </label>
                  <select
                    value={formData.projectArea}
                    onChange={(e) =>
                      setFormData({ ...formData, projectArea: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#171814]/20 text-[#171814] text-xs font-mono focus:outline-[#845942] cursor-pointer"
                  >
                    <option>Under 5 Hectares (1 to 10 CPTs)</option>
                    <option>5 to 20 Hectares (10 to 30 CPTs)</option>
                    <option>20 to 100 Hectares (30 to 100 CPTs)</option>
                    <option>Linear infrastructure</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#171814]">
                    Active rig fleet
                  </label>
                  <select
                    value={formData.rigCount}
                    onChange={(e) =>
                      setFormData({ ...formData, rigCount: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#171814]/20 text-[#171814] text-xs font-mono focus:outline-[#845942] cursor-pointer"
                  >
                    <option>1 Rig (Trial pilot)</option>
                    <option>2 to 4 Rigs (Field crew)</option>
                    <option>5+ Rigs (Enterprise fleet)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-[#5c5f55]">
                <Shield className="w-3.5 h-3.5 text-[#627056] shrink-0" />
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
