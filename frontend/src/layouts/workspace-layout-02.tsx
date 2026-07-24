import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { WorkspaceTopBar02 } from "@/pages/workspace/components/workspace-top-bar-02";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { AiChatAgent } from "@/pages/kubernetes/components/ai-chat-agent";
import { IconSparkles } from "@tabler/icons-react";

export default function WorkspaceLayout02() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const isOverview = pathname === "/overview";
  const isClusterView = pathname.startsWith("/cluster") || pathname.startsWith("/demo/cluster");
  const clusterId = searchParams.get("clusterId");

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiGlowing, setIsAiGlowing] = useState(true);

  useEffect(() => {
    // Initial glow stops after 5 minutes
    const initialTimer = setTimeout(() => {
      setIsAiGlowing(false);
    }, 5 * 60 * 1000);

    // Then every 10 minutes, glow for 5 minutes
    const interval = setInterval(() => {
      setIsAiGlowing(true);
      setTimeout(() => {
        setIsAiGlowing(false);
      }, 5 * 60 * 1000);
    }, 10 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const currentTab = searchParams.get("tab");
  const showRightSidebar = isClusterView && clusterId && currentTab !== "ai";

  return (
    <div className="flex h-screen flex-col bg-muted">
      <WorkspaceTopBar02 />

      <div className="flex flex-1 overflow-hidden">
        {(isOverview || isClusterView) && <WorkspaceSidebar />}

        <div
          className="flex flex-1 flex-col overflow-hidden"
          style={!isOverview ? {
            backgroundImage: "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          } : undefined}
        >
          <div className={`flex flex-1 flex-col overflow-hidden ${isOverview ? "bg-background" : "px-0 pt-2 lg:px-2"}`}>
            <div className={`flex flex-1 flex-col overflow-hidden ${!isOverview ? "border border-border bg-background shadow-md lg:rounded-t-xl" : ""}`}>
              <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
                <Outlet />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (AI) - ONLY IN CLUSTER VIEW (HIDDEN ON DEDICATED AI PAGE) */}
        {showRightSidebar && (
          <>
            {isChatOpen ? (
              <aside className="w-[320px] lg:w-[350px] shrink-0 border-l border-border bg-background flex flex-col z-10 hidden md:flex animate-in slide-in-from-right-10 duration-300">
                <AiChatAgent onClose={() => setIsChatOpen(false)} />
              </aside>
            ) : (
              <aside className={`w-16 shrink-0 border-l border-border bg-background flex flex-col items-center justify-center z-10 hidden md:flex ${isAiGlowing ? 'ai-sidebar-glow' : ''}`}>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="w-full h-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors flex flex-col items-center justify-center gap-3 group relative z-10"
                  title="Open AI Assistant"
                >
                  <IconSparkles className="size-5 text-primary group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-bold tracking-[0.2em] uppercase opacity-80 group-hover:opacity-100 transition-opacity text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">Assistant</span>
                </button>
              </aside>
            )}
          </>
        )}
      </div>
    </div>
  );
}
