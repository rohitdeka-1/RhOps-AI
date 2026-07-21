import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useDeleteProject, Project } from "@/hooks/use-projects";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

interface DeleteProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProjectDialog({ project, open, onOpenChange }: DeleteProjectDialogProps) {
  const [confirmName, setConfirmName] = useState("");
  const { mutate: deleteProject, isPending } = useDeleteProject();

  useEffect(() => {
    if (open) {
      setConfirmName("");
    }
  }, [open]);

  if (!project) return null;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    deleteProject(project.id, {
      onSuccess: () => {
        toast.success(`Project ${project.name} deleted`);
        onOpenChange(false);
      },
      onError: () => {
        toast.error("Failed to delete project");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <IconAlertTriangle className="size-5 text-destructive" />
          </div>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the project
            <span className="font-semibold text-foreground"> {project.name} </span> 
            and all associated clusters, graphs, and settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Type <span className="font-mono bg-muted px-1 py-0.5 rounded text-destructive">{project.name}</span> to confirm:
          </p>
          <Input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={project.name}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={confirmName !== project.name || isPending}
            onClick={handleDelete}
          >
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
