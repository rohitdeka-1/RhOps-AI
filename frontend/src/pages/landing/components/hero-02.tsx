import { type ReactNode } from "react";

interface Hero02Props {
  heading: ReactNode;
  subtitle: string;
}

export function Hero02({ heading, subtitle }: Hero02Props) {
  return (
    <section className="landing pt-24 pb-12 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h1 className="text-balance">{heading}</h1>
          <p className="mt-6 text-pretty text-lg text-primary-foreground/80">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
