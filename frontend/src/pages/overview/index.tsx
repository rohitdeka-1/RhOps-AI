import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { IconFolder, IconLoader2, IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { PageHeader } from "./components/page-header";
import { Blankslate } from "./components/blankslate";
import { CreateProjectDialog } from "./components/create-project-dialog";
import { DeleteProjectDialog } from "./components/delete-project-dialog";
import { useProjects, Project } from "@/hooks/use-projects";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
                className="hover:shadow-md transition-shadow cursor-pointer relative group"
                onClick={() => navigate(`/cluster?clusterId=${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <IconFolder className="size-5 text-primary" />
                      {project.name}
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
                  <CardDescription>
                    Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
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
