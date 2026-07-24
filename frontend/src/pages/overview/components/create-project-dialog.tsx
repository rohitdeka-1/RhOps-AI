import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/base/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProject, useGithubRepos, installGithubApp } from "@/hooks/use-projects";
import { IconBrandGithub, IconFileCode, IconUpload, IconLock, IconArrowRight, IconArrowLeft, IconSearch } from "@tabler/icons-react";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "SELECT_SOURCE" | "CONFIGURE_GITHUB" | "CONFIGURE_YAML";

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [step, setStep] = useState<Step>("SELECT_SOURCE");
  const [name, setName] = useState("");
  const [gitRepoUrl, setGitRepoUrl] = useState("");
  const [gitRepoName, setGitRepoName] = useState("");
  const [gitBranch, setGitBranch] = useState("main");
  const [manifestPath, setManifestPath] = useState("k8s/deployment.yaml");
  const [yamlContent, setYamlContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { mutateAsync: createProject, isPending } = useCreateProject();
  const { data: repos, isError: noGithubApp, isLoading: isReposLoading } = useGithubRepos();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setYamlContent(content);
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleImportRepo = (repo: any) => {
    setGitRepoUrl(repo.url);
    setGitRepoName(repo.fullName);
    setGitBranch(repo.defaultBranch || "main");
    // Default project name to repo name (without owner)
    setName(repo.fullName.split('/')[1] || repo.fullName);
    setStep("CONFIGURE_GITHUB");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createProject({
        name: name.trim(),
        gitRepoUrl: gitRepoUrl.trim() || undefined,
        gitBranch: gitBranch.trim() || "main",
        manifestPath: manifestPath.trim() || "k8s/deployment.yaml",
        yamlContent: yamlContent.trim() || undefined,
        syncStatus: gitRepoUrl ? "SYNCED" : yamlContent ? "MANUAL" : "PENDING",
      });

      toast.success("Project created successfully");
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create project");
    }
  };

  const resetForm = () => {
    setStep("SELECT_SOURCE");
    setName("");
    setGitRepoUrl("");
    setGitRepoName("");
    setGitBranch("main");
    setManifestPath("k8s/deployment.yaml");
    setYamlContent("");
    setFileName(null);
    setSearchQuery("");
  };

  const filteredRepos = repos?.filter((r) => 
    r.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) resetForm();
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background">
        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
          <div className="p-6 pb-4 border-b border-border/40">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {step === "SELECT_SOURCE" && "Import Git Repository"}
                {step === "CONFIGURE_GITHUB" && "Configure Project"}
                {step === "CONFIGURE_YAML" && "Upload Manifest"}
              </DialogTitle>
              <DialogDescription>
                {step === "SELECT_SOURCE" && "Select a repository to deploy your application."}
                {step === "CONFIGURE_GITHUB" && `Configuring deployment for ${gitRepoName}`}
                {step === "CONFIGURE_YAML" && "Deploy using a standalone Kubernetes manifest."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 overflow-y-auto">
            {/* STEP 1: SELECT SOURCE */}
            {step === "SELECT_SOURCE" && (
              <div className="space-y-6">
                {noGithubApp ? (
                  <div className="border border-border/60 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <IconBrandGithub className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Connect to GitHub</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Install the RhOps AI GitHub App to automatically import and sync your repositories.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => installGithubApp()}
                      className="mt-2"
                    >
                      <IconBrandGithub className="w-4 h-4 mr-2" />
                      Install GitHub App
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search repositories..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 h-10 bg-muted/30"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="h-10 text-xs font-medium bg-muted/30"
                        onClick={() => setStep("CONFIGURE_YAML")}
                      >
                        <IconFileCode className="w-4 h-4 mr-2" />
                        Use YAML instead
                      </Button>
                    </div>

                    <div className="border border-border/60 rounded-lg overflow-hidden flex flex-col max-h-[350px]">
                      {isReposLoading ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          Loading your repositories...
                        </div>
                      ) : filteredRepos && filteredRepos.length > 0 ? (
                        <div className="overflow-y-auto divide-y divide-border/60">
                          {filteredRepos.map((repo) => (
                            <div key={repo.id} className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <IconBrandGithub className="w-5 h-5 text-muted-foreground shrink-0" />
                                <div className="truncate">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-sm truncate">{repo.fullName}</span>
                                    {repo.private && <IconLock className="w-3 h-3 text-muted-foreground shrink-0" />}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {repo.defaultBranch}
                                  </div>
                                </div>
                              </div>
                              <Button 
                                type="button" 
                                size="sm" 
                                className="h-8 rounded-md px-4 shrink-0"
                                onClick={() => handleImportRepo(repo)}
                              >
                                Import
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          No repositories found matching "{searchQuery}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: CONFIGURE GITHUB */}
            {step === "CONFIGURE_GITHUB" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium">
                    Project Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="my-awesome-project"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                    required
                    className="h-10"
                  />
                  <p className="text-[11px] text-muted-foreground">This is how your project will appear in RhOps.</p>
                </div>

                <div className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <IconBrandGithub className="w-4 h-4" />
                    Build & Deployment Settings
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="gitBranch" className="text-xs text-muted-foreground">
                        Target Branch
                      </Label>
                      <Input
                        id="gitBranch"
                        placeholder="main"
                        value={gitBranch}
                        onChange={(e) => setGitBranch(e.target.value)}
                        disabled={isPending}
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="manifestPath" className="text-xs text-muted-foreground">
                        Manifest File Path
                      </Label>
                      <Input
                        id="manifestPath"
                        placeholder="k8s/deployment.yaml"
                        value={manifestPath}
                        onChange={(e) => setManifestPath(e.target.value)}
                        disabled={isPending}
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    RhOps will automatically sync with <strong>{gitBranch}</strong> branch. It looks for your Kubernetes configuration at the specified manifest path.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: CONFIGURE YAML (FALLBACK) */}
            {step === "CONFIGURE_YAML" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium">
                    Project Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Microservice Cluster"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                    required
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Upload or Paste Manifest (YAML/YML)</Label>
                    <label className="cursor-pointer text-[11px] text-primary hover:underline flex items-center gap-1 font-medium bg-primary/10 px-2 py-1 rounded-md">
                      <IconUpload className="w-3.5 h-3.5" />
                      {fileName ? fileName : "Upload File"}
                      <input
                        type="file"
                        accept=".yaml,.yml,.txt"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isPending}
                      />
                    </label>
                  </div>
                  <Textarea
                    placeholder="apiVersion: apps/v1&#10;kind: Deployment&#10;metadata:&#10;  name: my-app&#10;..."
                    value={yamlContent}
                    onChange={(e) => setYamlContent(e.target.value)}
                    disabled={isPending}
                    className="font-mono text-xs h-[250px] bg-muted/20 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 pt-4 border-t border-border/40 bg-muted/10 mt-auto">
            <div className="flex items-center justify-between">
              {step !== "SELECT_SOURCE" ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("SELECT_SOURCE")}
                  disabled={isPending}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <IconArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div /> // Placeholder for spacing
              )}
              
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                {step !== "SELECT_SOURCE" && (
                  <Button type="submit" disabled={isPending || !name.trim()}>
                    {isPending ? "Deploying..." : "Deploy Project"}
                    {!isPending && <IconArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
