import { useEffect, useState } from "react";
import { IconMenu2 } from "@tabler/icons-react";
import { Button } from "@/components/base/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Logo } from "@/components/base/logo";
import { scrollToHash } from "@/lib/scroll";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
];

/**
 * Header04 — floating pill header.
 *
 * Fixed at the top. Pill is content-width, gains surface + ring + blur on scroll.
 * Logo left, nav links center, Sign-in right. Mobile collapses to sheet drawer.
 */
export function Header04() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    setTimeout(() => scrollToHash(href), 50);
  };

  return (
    <header>
      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3">
        <div
          className={cn(
            "mx-auto w-fit rounded-2xl px-6 lg:px-2 transition-[background-color,box-shadow,backdrop-filter] duration-200",
            scrolled
              ? "bg-card/75 ring-1 ring-border shadow-md shadow-black/[0.065] backdrop-blur-xl"
              : "bg-transparent ring-0 shadow-none",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-x-8 lg:py-2">
            {/* Logo + mobile menu */}
            <div className="flex items-center justify-between gap-8 max-lg:h-14 max-lg:w-full">
              <a
                href="#"
                aria-label="Home"
                className="hover:bg-foreground/5 -ml-3 flex h-10 items-center justify-center rounded-xl px-3 lg:-m-1"
              >
                <Logo />
              </a>

              {/* Mobile hamburger */}
              <div className="lg:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open menu"
                      className="-mr-2.5"
                    >
                      <IconMenu2 className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72">
                    <SheetHeader>
                      <SheetTitle className="text-left">
                        <Logo />
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile">
                      {navLinks.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          onClick={(e) => handleClick(e, l.href)}
                          className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          {l.label}
                        </a>
                      ))}
                      <Button asChild className="mt-4">
                        <a href="/app">Get started</a>
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Center nav — desktop */}
            <nav className="hidden lg:flex" aria-label="Primary">
              <ul className="flex items-center gap-3">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={(e) => handleClick(e, l.href)}
                      className="inline-flex h-8 items-center justify-center rounded-md px-4 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Sign-in — desktop */}
            <div className="hidden items-center gap-3 lg:flex">
              <Button asChild variant="outline" size="sm" className="h-8 rounded-md px-3 text-xs">
                <a href="#">Sign in</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div aria-hidden className="h-20" />
    </header>
  );
}
