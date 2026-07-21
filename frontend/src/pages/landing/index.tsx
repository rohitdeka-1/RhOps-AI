import { featureTabs, testimonials as seedTestimonials } from "@/data/seed";
import { Header } from "./components/header";
import { FeatureShowcase, type Feature } from "./components/feature-showcase-01";
import { Testimonial02 } from "./components/testimonial-02";
import { Cta01 } from "./components/cta-01";
import { Footer } from "./components/footer";
import {
  DirectoryMockup,
  ProfilesMockup,
  BirthdaysMockup,
  OverviewMockup,
} from "./components/mockups";

const featureMockups: Record<string, React.ReactNode> = {
  employees: <DirectoryMockup />,
  profiles: <ProfilesMockup />,
  birthdays: <BirthdaysMockup />,
  overview: <OverviewMockup />,
};

const features: Feature[] = featureTabs.map((tab) => ({
  key: tab.id,
  label: tab.label,
  heading: tab.description,
  mockup: featureMockups[tab.id],
}));

const testimonials = seedTestimonials.map((t) => ({
  name: t.author,
  initials: t.author
    .split(" ")
    .map((n) => n[0])
    .join(""),
  title: t.title,
  company: t.company,
  quote: t.quote,
}));

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
