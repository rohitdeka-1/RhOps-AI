import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { IconFolder, IconLoader2, IconDotsVertical, IconTrash, IconBrandGithub, IconGitBranch, IconFileCode, IconLock } from "@tabler/icons-react";
import { PageHeader } from "./components/page-header";
import { Blankslate } from "./components/blankslate";
import { CreateProjectDialog } from "./components/create-project-dialog";
import { DeleteProjectDialog } from "./components/delete-project-dialog";
import { useProjects, Project } from "@/hooks/use-projects";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Overview() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const { data: projects, isLoading } = useProjects();
  const navigate = useNavigate();

  const isEmpty = !projects || projects.length === 0;

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-5xl space-y-6 py-2">
        <PageHeader 
          showCreate={!isEmpty && !isLoading} 
          onCreate={() => setIsCreateOpen(true)} 
        />
        
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center border rounded-lg bg-muted/20">
            <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : isEmpty ? (
          <Blankslate onCreate={() => setIsCreateOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project: Project) => (
              <Card 
                key={project.id} 
                className="hover:shadow-md transition-shadow cursor-pointer relative group flex flex-col justify-between"
                onClick={() => navigate(`/cluster?clusterId=${project.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <IconFolder className="size-5 text-primary shrink-0" />
                      <span className="truncate">{project.name}</span>
                    </CardTitle>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 rounded-md text-muted-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconDotsVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToDelete(project);
                            }}
                          >
                            <IconTrash className="size-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-2 text-xs text-muted-foreground">
                  {project.gitRepoUrl ? (
                    <div className="flex items-center gap-1.5 truncate text-foreground/80 font-mono text-[11px] bg-muted/40 px-2 py-1 rounded border border-border/40">
                      <IconBrandGithub className="size-3.5 text-primary shrink-0" />
                      <span className="truncate">{project.gitRepoUrl.replace("https://github.com/", "")}</span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {project.isPrivate ? (
                      <Badge variant="outline" className="text-[10px] h-5 gap-1 font-normal border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5">
                        <IconLock className="size-3" />
                        Private
                      </Badge>
                    ) : null}

                    {project.gitBranch ? (
                      <Badge variant="outline" className="text-[10px] h-5 gap-1 font-normal">
                        <IconGitBranch className="size-3" />
                        {project.gitBranch}
                      </Badge>
                    ) : null}

                    {project.yamlContent ? (
                      <Badge variant="secondary" className="text-[10px] h-5 gap-1 font-normal bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        <IconFileCode className="size-3" />
                        YAML Manifest
                      </Badge>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
      
      <DeleteProjectDialog 
        project={projectToDelete}
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      />
    </main>
  );
}
