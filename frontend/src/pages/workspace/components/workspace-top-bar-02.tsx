import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  IconSettings,
  IconCloud,
  IconBrandGithub,
  IconLogout,
  IconChevronRight,
  IconSun,
  IconMoon,
  IconSparkles,
  IconLoader2
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/auth-provider";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/use-projects";
import { Badge } from "@/components/base/badge";
import { useAiSummary } from "@/contexts/ai-summary-context";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function WorkspaceTopBar02() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  
  const clusterId = searchParams.get("clusterId");
  const { data: projects } = useProjects();
  const currentProject = projects?.find((p) => p.id === clusterId);

  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    return (window.localStorage.getItem("theme") as "light" | "dark" | "system") || "system";
  });

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    window.localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", !isDark);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const { summaryData, isGenerating, isNewSummary, openSummary } = useAiSummary();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Auto-open when a new summary arrives
  useEffect(() => {
    if (isNewSummary) {
      setIsDropdownOpen(true);
    }
  }, [isNewSummary]);

  const handleToggleSummary = () => {
    if (isNewSummary) openSummary(); // Mark as read
    setIsDropdownOpen((prev) => !prev);
  };

  const isProjectView = pathname.startsWith("/cluster") || pathname.startsWith("/settings");
  const isOverview = pathname === "/overview";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-4 lg:px-6 border-b border-border bg-background">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/overview" className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <IconCloud className="size-5" />
        </Link>

        {isProjectView ? (
          <>
            <IconChevronRight className="size-4 text-muted-foreground" />
            <Link to="/overview" className="flex items-center gap-2 hover:bg-muted px-2 py-1.5 rounded-md transition-colors">
              <span className="font-medium">{user?.username || "Organization"}</span>
            </Link>
            <IconChevronRight className="size-4 text-muted-foreground" />
            <div className="flex items-center gap-2 px-2 py-1.5">
              <IconCloud className="size-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {currentProject?.name || "Project"}
              </span>
              <Badge variant="outline" className="text-[10px] h-5 ml-1">PRODUCTION</Badge>
            </div>
          </>
        ) : (
          <>
            <IconChevronRight className="size-4 text-muted-foreground" />
            <span className="font-medium px-2 py-1.5">Projects</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* AI Summary Notification Bubble */}
        {(isProjectView && clusterId) && (
          <div className="relative">
            <button
              onClick={handleToggleSummary}
              className={`relative p-2 text-muted-foreground hover:text-foreground transition-all rounded-full hover:bg-muted ${isNewSummary ? "animate-in slide-in-from-top-2 duration-500" : ""}`}
              title="AI Cluster Summary"
            >
              {isGenerating ? (
                <IconLoader2 className="size-5 animate-spin text-primary" />
              ) : (
                <IconSparkles className={`size-5 ${isNewSummary || isDropdownOpen ? "text-primary" : ""}`} />
              )}
              
              {/* Notification Dot */}
              {isNewSummary && !isGenerating && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
              )}
            </button>

            {/* iPhone-style Floating Notification / Dropdown */}
            {(!isGenerating && summaryData) && (
              <div 
                className={`absolute top-full mt-3 right-0 w-80 bg-card border border-border/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] rounded-[20px] p-4 z-50 transition-all duration-300 ${isDropdownOpen ? "animate-in slide-in-from-top-6 fade-in opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-y-2"}`}
              >
                {/* Pointer Caret */}
                <div className="absolute -top-2 right-3 w-4 h-4 bg-card border-l border-t border-border/60 rotate-45"></div>
                
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex gap-3 items-start">
                    <div className="size-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                      <IconSparkles className="size-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-semibold text-[13px] text-foreground">RhOps AI</h4>
                        <span className="text-[10px] text-muted-foreground">Now</span>
                      </div>
                      <p className="text-[13px] text-foreground leading-relaxed">
                        {summaryData.textSummary}
                      </p>
                    </div>
                  </div>
                  
                  {summaryData.quantify && (
                    <div className="mt-2 grid grid-cols-2 gap-2 bg-muted/50 p-2 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">CPU</span>
                        <span className="text-xs font-medium">{summaryData.quantify.cpu_usage_percentage}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Memory</span>
                        <span className="text-xs font-medium">{summaryData.quantify.memory_usage_percentage}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Pods</span>
                        <span className="text-xs font-medium">{summaryData.quantify.pods}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Issues</span>
                        <span className="text-xs font-medium">{summaryData.quantify.events}</span>
                      </div>
                    </div>
                  )}
                  
                  <button onClick={() => setIsDropdownOpen(false)} className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground text-center py-1">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
          aria-label="Toggle theme"
        >
          {theme === "dark" || (theme === "system" && document.documentElement.classList.contains("dark")) ? (
            <IconSun className="size-5" />
          ) : (
            <IconMoon className="size-5" />
          )}
        </button>

        <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mx-1">
          Feedback
        </a>
        
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noreferrer"
          className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
        >
          <IconBrandGithub className="size-5" />
        </a>

        {!isOverview && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Account menu"
              className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user?.name
                    ? getInitials(user.name)
                    : user?.email?.[0]?.toUpperCase() ?? ""}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user?.name || user?.username || "Account"}
                  </span>
                  {user?.email && (
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut}>
                <IconLogout className="size-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
