import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <a
    href="#top"
    onClick={(e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }}
    className={cn(
      "inline-flex items-center font-heading text-[21px] font-semibold leading-6 tracking-tight",
      className,
    )}
    aria-label="Home"
  >
    Acme
  </a>
);
