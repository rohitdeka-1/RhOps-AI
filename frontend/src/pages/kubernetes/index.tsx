import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ConnectCluster } from "./components/connect-cluster";
import { useClusters } from "@/hooks/use-clusters";
import { IconLoader2 } from "@tabler/icons-react";
import { OverviewTab } from "./tabs/overview-tab";
import { ExplorerTab } from "./tabs/explorer-tab";
import { ArchitectureTab } from "./tabs/architecture-tab";

export default function Kubernetes() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("clusterId");
  const tab = searchParams.get("tab") || "overview";
  
  const { data: clusters, isLoading } = useClusters();
  
  const projectCluster = clusters?.find((c) => c.projectId === projectId);

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 bg-muted/20">
        <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!projectId) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="text-muted-foreground text-center">
          <p className="font-medium text-foreground text-lg">No project selected</p>
          <p className="mt-1">Please select a project from the Overview page.</p>
        </div>
      </main>
    );
  }

  if (!projectCluster) {
    return <ConnectCluster projectId={projectId} />;
  }

  // Route to the appropriate tab based on search param
  const renderTab = () => {
    switch (tab) {
      case "overview":
        return <OverviewTab clusterId={projectCluster.id} cluster={projectCluster} />;
      case "explorer":
        return <ExplorerTab clusterId={projectCluster.id} />;
      case "architecture":
        return <ArchitectureTab clusterId={projectCluster.id} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <h2 className="text-lg font-medium text-foreground mb-2">Coming Soon</h2>
            <p>The {tab} tab is currently under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden relative">
      <main className="flex-1 overflow-auto p-6 bg-muted/20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {renderTab()}
      </main>
    </div>
  );
}
