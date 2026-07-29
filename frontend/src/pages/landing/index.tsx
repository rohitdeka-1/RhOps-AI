import { Header } from "./components/header";
import { FeatureShowcase, type Feature } from "./components/feature-showcase-01";
import { Testimonial02 } from "./components/testimonial-02";
import { Cta01 } from "./components/cta-01";
import { Footer } from "./components/footer";

const features: Feature[] = [
  {
    key: "overview",
    label: "Live Telemetry",
    heading: "Real-time metrics streaming through WebSocket Agent.",
    mockup: <div className="p-10 border rounded-lg bg-card text-card-foreground shadow flex items-center justify-center font-mono">Live Dashboard...</div>,
  },
  {
    key: "ai",
    label: "AI Copilot",
    heading: "Chat with your cluster to troubleshoot errors instantly.",
    mockup: <div className="p-10 border rounded-lg bg-card text-card-foreground shadow flex items-center justify-center font-mono">Copilot Active...</div>,
  }
];

const testimonials = [
  {
    name: "Alex Dev",
    initials: "AD",
    title: "Platform Engineer",
    company: "Tech Corp",
    quote: "RhOps AI completely transformed how we manage our clusters. No more manual kubectl digging.",
  }
];

export default function Landing() {
  return (
    <>
      <Header />
      <div data-hero-region id="features">
        <FeatureShowcase features={features} />
      </div>
      <div id="testimonials">
        <Testimonial02 testimonials={testimonials} />
      </div>
      <Cta01
        heading="Your infrastructure deserves an intelligent copilot."
        primaryCta={{ label: "Get started →", href: "/auth" }}
      />
      <Footer />
    </>
  );
}
