import overviewAsset from "@/assets/landing/shot-overview.png.asset.json";
import employeesAsset from "@/assets/landing/shot-employees.png.asset.json";
import profileAsset from "@/assets/landing/shot-profile.png.asset.json";
import calendarAsset from "@/assets/landing/shot-calendar.png.asset.json";

// Real screenshots of /demo/* captured via Playwright at 1440x868 (dpr=2 → 2880x1736).
// Aspect matches the inner viewport of /browser-chrome.svg (1728:1041 ≈ 1.66).
// To refresh: rerun /tmp/browser/shoot.py, then `lovable-assets create --file …`.
function Shot({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={1440}
      height={868}
      loading="lazy"
      decoding="async"
      className="block h-full w-full object-cover object-top"
    />
  );
}

export function DirectoryMockup() {
  return <Shot src={employeesAsset.url} alt="Clusters list and node statuses" />;
}

export function ProfilesMockup() {
  return <Shot src={profileAsset.url} alt="Real-time metrics and log streaming" />;
}

export function BirthdaysMockup() {
  return <Shot src={calendarAsset.url} alt="AI Copilot diagnosing failed pods" />;
}

export function OverviewMockup() {
  return <Shot src={overviewAsset.url} alt="Auto-remediation suggestions for deployments" />;
}

export function HeroDirectoryMockup() {
  return <DirectoryMockup />;
}
