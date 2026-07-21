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
  return <Shot src="/overview.png" alt="Clusters overview and node statuses" />;
}

export function ProfilesMockup() {
  return <Shot src="/explorer.png" alt="Cluster explorer and workloads" />;
}

export function BirthdaysMockup() {
  return <Shot src="/assistant.png" alt="AI Copilot diagnosing pods" />;
}

export function OverviewMockup() {
  return <Shot src="/overview.png" alt="Auto-remediation suggestions" />;
}

export function HeroDirectoryMockup() {
  return <DirectoryMockup />;
}
