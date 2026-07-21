import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  IconSettings,
  IconCloud,
  IconBrandGithub,
  IconLogout,
  IconChevronRight,
  IconSun,
  IconMoon
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
