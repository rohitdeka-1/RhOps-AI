import { IconCloud, IconMapPin, IconTag } from "@tabler/icons-react";
import { Badge } from "@/components/base/badge";

interface PageHeaderProps {
  name: string;
  version: string;
  region: string;
}

export function PageHeader({ name, version, region }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <IconCloud className="size-6 text-primary" />
          <h1 className="text-[28px] font-semibold leading-none tracking-tight text-foreground">
            Kubernetes cluster
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Live resource view for {name} — CPU, memory, and health checks across
          all nodes and pods.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge color="blue" className="inline-flex items-center gap-1.5">
          <IconTag className="size-3.5" />
          {version}
        </Badge>
        <Badge color="gray" className="inline-flex items-center gap-1.5">
          <IconMapPin className="size-3.5" />
          {region}
        </Badge>
      </div>
    </div>
  );
}
