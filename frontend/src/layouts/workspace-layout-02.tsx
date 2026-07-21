import { Outlet, useLocation } from "react-router-dom";
import { WorkspaceTopBar02 } from "@/pages/workspace/components/workspace-top-bar-02";
import { WorkspaceSidebar } from "./workspace-sidebar";

export default function WorkspaceLayout02() {
  const { pathname } = useLocation();
  const isOverview = pathname === "/overview";

  return (
    <div className="flex h-screen flex-col bg-muted">
      <WorkspaceTopBar02 />
      
      <div className="flex flex-1 overflow-hidden">
        {(isOverview || pathname.startsWith("/cluster") || pathname.startsWith("/demo/cluster")) && <WorkspaceSidebar />}
        
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
      </div>
    </div>
  );
}
