import { useState } from "react";
import { useConnectCluster } from "@/hooks/use-clusters";
import { Button } from "@/components/base/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconCloudUpload, IconLoader2, IconServer } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConnectClusterProps {
  projectId: string;
}

export function ConnectCluster({ projectId }: ConnectClusterProps) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("aws");
  const [inputType, setInputType] = useState<"file" | "text">("file");
  const [kubeconfig, setKubeconfig] = useState<File | null>(null);
  const [kubeconfigText, setKubeconfigText] = useState("");

  const { mutate: connectCluster, isPending } = useConnectCluster();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || (inputType === "file" && !kubeconfig) || (inputType === "text" && !kubeconfigText.trim())) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("provider", provider);
    formData.append("projectId", projectId);
    
    if (inputType === "text") {
      formData.append("kubeconfig", new Blob([kubeconfigText], { type: 'text/plain' }), "config.yaml");
    } else {
      formData.append("kubeconfig", kubeconfig!);
    }

    connectCluster(formData, {
      onSuccess: () => {
        toast.success("Cluster connected successfully!");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to connect cluster");
      },
    });
  };

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center py-8 px-4 bg-background">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <IconServer className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-card-foreground">
            Connect your cluster
          </h2>
          <p className="text-sm text-muted-foreground">
            Link an existing Kubernetes cluster to this project.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="clusterName" className="text-sm font-medium">Cluster Name</Label>
              <Input
                id="clusterName"
                placeholder="e.g. production-cluster"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="provider" className="text-sm font-medium">Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger id="provider" className="h-10 text-sm">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aws">AWS (EKS)</SelectItem>
                  <SelectItem value="gcp">Google Cloud (GKE)</SelectItem>
                  <SelectItem value="azure">Azure (AKS)</SelectItem>
                  <SelectItem value="custom">Local (Custom / Other)</SelectItem>
                </SelectContent>
              </Select>
              {provider === "custom" && (
                <p className="text-xs text-amber-500 dark:text-amber-400 mt-1.5 p-2 rounded bg-amber-500/10 border border-amber-500/20 leading-tight">
                  <strong>Note:</strong> Local clusters (Minikube/Docker) are only accessible from the machine where this backend is running.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Kubeconfig</Label>
              <Tabs value={inputType} onValueChange={(v) => setInputType(v as "file" | "text")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-10">
                  <TabsTrigger value="file" className="text-sm h-8">File Upload</TabsTrigger>
                  <TabsTrigger value="text" className="text-sm h-8">Paste YAML</TabsTrigger>
                </TabsList>
                
                <TabsContent value="file" className="mt-3">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="kubeconfig"
                      className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 border-border bg-muted/20 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-4 pb-4">
                        <IconCloudUpload className="w-6 h-6 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground">
                          <span className="font-semibold text-primary">Click to upload</span> or drag
                        </p>
                        <p className="text-xs text-muted-foreground truncate px-4 max-w-[300px]">
                          {kubeconfig ? kubeconfig.name : "YAML/JSON file"}
                        </p>
                      </div>
                      <input
                        id="kubeconfig"
                        type="file"
                        className="hidden"
                        onChange={(e) => setKubeconfig(e.target.files?.[0] || null)}
                        accept=".yaml,.yml,.json"
                      />
                    </label>
                  </div>
                </TabsContent>
                
                <TabsContent value="text" className="mt-3">
                  <Textarea
                    placeholder="Paste your kubeconfig YAML here..."
                    className="min-h-[112px] font-mono text-xs bg-muted/20 resize-y p-3"
                    value={kubeconfigText}
                    onChange={(e) => setKubeconfigText(e.target.value)}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <Button type="submit" className="w-full h-10 text-sm mt-2" disabled={isPending}>
            {isPending ? (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Connect Cluster
          </Button>
        </form>
      </div>
    </div>
  );
}
