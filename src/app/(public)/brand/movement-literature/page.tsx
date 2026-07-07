import type { Metadata } from "next";
import { Manifesto } from "@/components/brand/Manifesto";
import { IntelBriefing } from "@/components/brand/IntelBriefing";
import { Kicker } from "@/components/brand/Kicker";
import { StarDivider } from "@/components/ui/StarDivider";
import { Redacted } from "@/components/brand/Redacted";
import { Stamp } from "@/components/brand/Stamp";

export const metadata: Metadata = {
  title: "Movement Literature Showcase | BMJ Brand",
  description: "Showcase of high-end document and presentation styles for The Black Male Journal.",
};

export default function MovementLiteraturePage() {
  return (
    <div className="bg-bmj-black min-h-screen">
      {/* Introduction */}
      <section className="page-shell py-24 text-center">
        <Kicker className="justify-center mb-4">Visual Spec 2.1</Kicker>
        <h1 className="page-title mb-6">Movement Literature</h1>
        <p className="editorial-deck mx-auto">
          Elevating BMJ's visual doctrine for high-stakes documentation. 
          This showcase demonstrates the application of aggressive hierarchy, 
          asymmetric grids, and militant print aesthetics.
        </p>
      </section>

      <StarDivider className="my-12" />

      {/* Manifesto Section */}
      <section className="py-12">
        <div className="page-shell mb-12">
          <h2 className="section-title text-bmj-red">01. The Manifesto Style</h2>
          <p className="text-bmj-tan mt-2 font-mono text-sm">USE: HIGH-IMPACT VISIONARY STATEMENTS // DARK MODE ONLY</p>
        </div>
        
        <Manifesto 
          title="The Sovereign Decree" 
          incitement="A Call to Order"
          className="border-y border-bmj-tan/10"
        >
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <h2 className="subsection-title mb-6">The Assessment of Modern Silence</h2>
              <div className="space-y-6 body-text">
                <p>
                  We find ourselves in an era of neutralized speech and algorithmic compliance. 
                  The Black man's voice has been partitioned into corporate-friendly segments, 
                  stripped of its ancestral weight and its revolutionary potential.
                </p>
                <p className="lead-text italic text-bmj-white">
                  "Silence is not merely the absence of sound; it is the presence of fear."
                </p>
                <p>
                  To navigate the consequences of truth, one must first possess the truth. 
                  This document serves as the foundation for a new intellectual sovereignty—one 
                  rooted in study, discipline, and the refusal to be silent.
                </p>
              </div>
            </div>
            <div className="lg:col-span-4 lg:border-l lg:border-bmj-tan/20 lg:pl-12">
              <Kicker className="mb-4 text-bmj-amber">Key Directives</Kicker>
              <ul className="space-y-4 font-label text-sm uppercase tracking-wider text-bmj-cream/80">
                <li className="flex gap-3">
                  <span className="text-bmj-red font-bold">01</span>
                  <span>Master the Body through discipline</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-bmj-red font-bold">02</span>
                  <span>Master the Mind through study</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-bmj-red font-bold">03</span>
                  <span>Master the Speech through truth</span>
                </li>
              </ul>
            </div>
          </div>
        </Manifesto>
      </section>

      <StarDivider className="my-24" />

      {/* Intel Briefing Section */}
      <section className="py-12 bg-bmj-paper/5">
        <div className="page-shell mb-12">
          <h2 className="section-title text-bmj-gold">02. The Intelligence Briefing</h2>
          <p className="text-bmj-tan mt-2 font-mono text-sm">USE: DENSE INFORMATION // PRINT-READY // PAPER TEXTURE</p>
        </div>

        <IntelBriefing 
          title="Operational Protocol: The 2026 Shift"
          date="APRIL 20, 2026"
          classification="STRICTLY CONFIDENTIAL // LEVEL 4 CLEARANCE"
        >
          <div className="absolute top-20 right-20 hidden lg:block">
            <Stamp rotation={-15} variant="red">Approved</Stamp>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="font-display text-2xl text-bmj-deep-black mb-4">I. Executive Summary</h3>
              <p>
                As we transition into the second quarter of 2026, the BMJ media infrastructure must evolve 
                from a broadcast model to a membership-led intelligence network. This requires a 
                total synchronization of our <Redacted>clandestine digital assets</Redacted> and physical distribution points.
              </p>
            </section>

            <section className="grid md:grid-cols-2 gap-8">
              <div className="bg-bmj-deep-black/5 p-6 border-l-4 border-bmj-crimson">
                <h4 className="font-display text-xl text-bmj-deep-black mb-2">Internal Audits</h4>
                <ul className="font-typewriter text-xs space-y-2 text-bmj-deep-black/80">
                  <li>- Editorial Output: +24%</li>
                  <li>- Member Retention: 92%</li>
                  <li>- <Redacted>Strategic Reserves</Redacted>: STABLE</li>
                </ul>
              </div>
              <div className="bg-bmj-deep-black/5 p-6 border-l-4 border-bmj-olive">
                <h4 className="font-display text-xl text-bmj-deep-black mb-2">Market Volatility</h4>
                <ul className="font-typewriter text-xs space-y-2 text-bmj-deep-black/80">
                  <li>- Ad-Tech Decay: CRITICAL</li>
                  <li>- Platform Risk: HIGH</li>
                  <li>- Sovereignty Index: RISING</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-display text-2xl text-bmj-deep-black mb-4">II. The Command Line</h3>
              <p>
                Every communication must adhere to the militant print spec. No gradients. No rounded edges. 
                The clarity of our design is a reflection of the clarity of our thought. 
                The target location for the summit is <Redacted>classified information</Redacted>.
              </p>
              <div className="mt-6 p-4 border border-bmj-deep-black/10 bg-white/50 italic">
                "We do not seek to be liked; we seek to be undeniable."
              </div>
            </section>
          </div>
        </IntelBriefing>
      </section>

      <footer className="page-shell py-24 text-center border-t border-bmj-tan/10">
        <Kicker className="justify-center mb-4">End of Showcase</Kicker>
        <p className="text-bmj-tan text-xs font-mono">BMJ BRAND REPOSITORY // REF: ML-SPEC-2026</p>
      </footer>
    </div>
  );
}
