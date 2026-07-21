import { Button } from "@/components/base/button";
import { IconArrowRight, IconSparkles } from "@tabler/icons-react";

interface Cta01Props {
  heading: string;
  eyebrow?: string;
  subtitle?: string;
  primaryCta: { label: string; href: string };
}

export function Cta01({
  heading,
  eyebrow = "Ready when you are",
  subtitle = "Set up your team directory in minutes. No credit card, no spreadsheets, no fuss.",
  primaryCta,
}: Cta01Props) {
  return (
    <section className="landing py-24">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary text-primary-foreground px-8 py-20 sm:px-16 sm:py-24">
          {/* decorative rings */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-primary-foreground/15 motion-safe:animate-drift"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -bottom-40 h-96 w-96 rounded-full border border-primary-foreground/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary-foreground/5 blur-3xl"
          />

          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest">
              <IconSparkles className="h-3.5 w-3.5" stroke={2} />
              {eyebrow}
            </span>
            <h2 className="mt-6 text-balance text-primary-foreground">
              {heading}
            </h2>
            <p className="mt-6 max-w-xl text-pretty text-lg text-primary-foreground/80">
              {subtitle}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <Button asChild size="lg" variant="secondary">
                <a href={primaryCta.href} className="group">
                  {primaryCta.label}
                  <IconArrowRight
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                    stroke={2.25}
                  />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
