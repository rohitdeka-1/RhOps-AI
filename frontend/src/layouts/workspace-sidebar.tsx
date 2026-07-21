import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  IconGridDots,
  IconUsers,
  IconSettings,
  IconFileText,
  IconBook,
  IconExternalLink,
  IconDotsVertical,
  IconChevronDown,
  IconHome,
  IconGraph,
  IconServer,
  IconNetwork,
  IconDatabase,
  IconAdjustments,
  IconChartBar,
  IconLogs,
  IconBell,
  IconBrain,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand
} from "@tabler/icons-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const defaultNavGroups = [
  {
    items: [
      { label: "Projects", href: "/overview", icon: IconGridDots },
    ]
  },
  {
    items: [
      { label: "People", href: "#", icon: IconUsers },
      { label: "Settings", href: "#", icon: IconSettings, hasDropdown: true },
    ]
  },
  {
    items: [
      { label: "Docs", href: "#", icon: IconFileText, external: true },
      { label: "Blogs", href: "#", icon: IconBook, external: true },
    ]
  }
];

const getClusterNavGroups = (clusterId: string) => [
  {
    items: [
      { label: "Overview", href: `/cluster?clusterId=${clusterId}&tab=overview`, icon: IconHome },
      { label: "Cluster Explorer", href: `/cluster?clusterId=${clusterId}&tab=explorer`, icon: IconGraph },
    ]
  },
  {
    items: [
      { label: "AI Assistant", href: `/cluster?clusterId=${clusterId}&tab=ai`, icon: IconBrain },
      { label: "Project Settings", href: `/cluster?clusterId=${clusterId}&tab=settings`, icon: IconSettings },
    ]
  }
];

export function WorkspaceSidebar() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const getInitials = (name?: string) => name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "";

  const isClusterView = pathname.startsWith("/cluster") || pathname.startsWith("/demo/cluster");
  const clusterId = searchParams.get("clusterId");
  
  const navGroups = (isClusterView && clusterId) ? getClusterNavGroups(clusterId) : defaultNavGroups;
  const currentTab = searchParams.get("tab") || "overview";

  // When not hovered, it is collapsed (w-16). When hovered, it expands (w-60).
  const isCollapsed = !isHovered;

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex flex-col bg-background text-muted-foreground border-r border-border h-full shrink-0 transition-all duration-300 ease-in-out absolute md:relative z-50",
        isCollapsed ? "w-16" : "w-60 shadow-xl md:shadow-none"
      )}
    >
      {!isClusterView && (
        <div className={cn("p-4 pb-2 flex items-center", isCollapsed ? "justify-center" : "")}>
          <Link to="/overview" className={cn("flex items-center gap-2 text-foreground font-semibold hover:opacity-80 transition-opacity", isCollapsed ? "justify-center" : "")}>
            <div className="size-6 rounded-md bg-primary flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-primary-foreground">RH</span>
            </div>
            {!isCollapsed && <span className="text-[15px] whitespace-nowrap overflow-hidden">RhOps AI</span>}
          </Link>
        </div>
      )}

      {isClusterView && !isCollapsed && (
        <div className="p-4 pb-2 flex items-center justify-start">
           <span className="text-foreground font-semibold text-[15px] whitespace-nowrap overflow-hidden px-2">Cluster Menu</span>
        </div>
      )}
      
      {isClusterView && isCollapsed && (
        <div className="p-4 pb-2 flex items-center justify-center">
          <IconGraph className="size-5 text-primary" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-2 px-3 flex flex-col gap-4 mt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navGroups.map((group, i) => (
          <div key={i} className="flex flex-col gap-1">
            {group.items.map((item, j) => {
              const isActive = (isClusterView && clusterId) 
                ? (item.href.includes(`tab=${currentTab}`))
                : pathname === item.href;
                
              return (
                <Link
                  key={j}
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-md transition-colors hover:bg-muted",
                    isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5 text-[15px]",
                    isActive ? "bg-muted text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("shrink-0", isCollapsed ? "size-5" : "size-[18px]", isActive ? "text-foreground" : "text-muted-foreground")} stroke={isActive ? 2 : 1.5} />
                  {!isCollapsed && (
                    <>
                      <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                      {item.hasDropdown && (
                        <IconChevronDown className="size-4 ml-auto shrink-0 text-muted-foreground" />
                      )}
                      {item.external && (
                        <IconExternalLink className="size-4 ml-auto shrink-0 opacity-50" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
            {i < navGroups.length - 1 && (
              <div className="h-px bg-border my-2.5 mx-2 opacity-50 shrink-0" />
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center w-full rounded-md hover:bg-muted transition-colors",
              isCollapsed ? "justify-center p-2" : "gap-3 px-2 py-2"
            )}>
              <Avatar className="h-8 w-8 rounded-full border border-border shrink-0">
                <AvatarFallback className="bg-muted text-xs text-foreground">
                  {getInitials(user?.name || user?.username || user?.email)}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex flex-col flex-1 items-start text-[14px] overflow-hidden">
                    <span className="font-medium text-foreground text-left truncate w-full">{user?.name || user?.username || "Account"}</span>
                  </div>
                  <IconDotsVertical className="size-4 shrink-0 text-muted-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isCollapsed ? "start" : "end"} sideOffset={8} className="w-56 bg-background border-border text-foreground">
            <DropdownMenuItem onSelect={handleSignOut} className="hover:bg-muted focus:bg-muted cursor-pointer focus:text-foreground">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
