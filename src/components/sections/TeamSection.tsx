import { motion } from "framer-motion"
import { PlateHeader } from "../ui/PlateHeader"
import { SITE_CONTENT } from "../../data/siteContent"
import { ArrowUpRight } from "lucide-react"

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.54a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
    </svg>
  )
}

export function TeamSection() {
  const { team } = SITE_CONTENT

  return (
    <section
      id="team"
      aria-label="Engineering team and creators"
      className="py-20 lg:py-28 bg-[#F4ECE1] text-[#1C130D] border-b border-[#1C130D]/15 relative overflow-hidden select-none"
    >
      {/* Background Architectural Drafting Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1C130D 1px, transparent 1px), linear-gradient(to bottom, #1C130D 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 space-y-12">
        {/* Plate Header */}
        <div>
          <PlateHeader
            number="08"
            title={team.tag.split(" / ")[1] || "Engineering team & creators"}
            metaRight="6 Core contributors"
            tone="light"
            className="mb-6 sm:mb-8"
          />
          <div className="max-w-4xl space-y-3">
            <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#1C130D] uppercase tracking-[-0.035em] leading-[0.92] text-balance">
              {team.heading}
            </h2>
            <p className="font-sans text-[#63554B] text-sm sm:text-base max-w-3xl leading-relaxed text-pretty">
              {team.subheading}
            </p>
          </div>
        </div>

        {/* Team Members Responsive 6-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {team.members.map((member, idx) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className="bg-[#FAF5EE] border border-[#1C130D]/15 hover:border-[#7A421D]/50 transition-all duration-300 shadow-xs hover:shadow-xl group flex flex-col justify-between overflow-hidden"
            >
              {/* Photo Frame Container (Aspect 3:4) */}
              <div className="relative aspect-3/4 overflow-hidden bg-[#EAE2D5] border-b border-[#1C130D]/10">
                <img
                  src={member.image}
                  alt={`${member.name} - ${member.role}`}
                  loading="lazy"
                  className="w-full h-full object-cover object-top filter grayscale-[12%] group-hover:grayscale-0 group-hover:scale-104 transition-all duration-500"
                />

                {/* Subtle Gradient Vignette at Photo Foot */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#FAF5EE]/70 to-transparent pointer-events-none" />
              </div>

              {/* Card Information Body */}
              <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4">
                <div>
                  <h3 className="font-sans font-black text-xl sm:text-2xl text-[#1C130D] tracking-tight group-hover:text-[#7A421D] transition-colors uppercase">
                    {member.name}
                  </h3>
                  <p className="font-mono text-xs text-[#7A421D] font-bold tracking-wider uppercase mt-1 leading-snug">
                    {member.role}
                  </p>
                </div>

                {/* LinkedIn Action Link */}
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${member.name}'s profile on LinkedIn`}
                  className="inline-flex items-center justify-between w-full px-3.5 py-2.5 bg-[#1C130D] text-[#FAD9BA] hover:bg-[#5A3008] hover:text-[#EFE7DE] transition-all font-mono text-xs font-bold border border-[#1C130D]/20 cursor-pointer group/btn"
                >
                  <span className="flex items-center gap-2">
                    <LinkedinIcon className="w-3.5 h-3.5 text-[#0A66C2] group-hover/btn:text-[#FAD9BA] transition-colors" />
                    <span>LinkedIn Profile</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#FAD9BA] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
