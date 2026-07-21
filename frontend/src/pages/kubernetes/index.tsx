import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ConnectCluster } from "./components/connect-cluster";
import { useClusters } from "@/hooks/use-clusters";
import { IconLoader2, IconSparkles } from "@tabler/icons-react";
import { OverviewTab } from "./tabs/overview-tab";
import { ExplorerTab } from "./tabs/explorer-tab";
import { AiChatAgent } from "./components/ai-chat-agent";

export default function Kubernetes() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("clusterId");
  const tab = searchParams.get("tab") || "overview";
  const [isChatOpen, setIsChatOpen] = useState(true);
  
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
        return <OverviewTab clusterId={projectId} cluster={projectCluster} />;
      case "explorer":
        return <ExplorerTab />;
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
      
      {/* Persistent AI Chat Agent Sidebar */}
      {isChatOpen && (
        <aside className="w-[320px] lg:w-[350px] shrink-0 border-l border-border bg-background flex flex-col z-10 hidden md:flex animate-in slide-in-from-right-10 duration-300">
          <AiChatAgent onClose={() => setIsChatOpen(false)} />
        </aside>
      )}

      {/* Floating button to reopen the chat when collapsed */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="absolute bottom-6 right-6 p-3.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 z-50 animate-in fade-in zoom-in duration-300"
          title="Open Assistant"
        >
          <IconSparkles className="size-6" />
        </button>
      )}
    </div>
  );
}
