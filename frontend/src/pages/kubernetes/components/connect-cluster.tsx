import { useState, useEffect } from "react";
import { useConnectCluster, useClusters } from "@/hooks/use-clusters";
import { Button } from "@/components/base/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconLoader2, IconServer, IconTerminal, IconCheck, IconCopy } from "@tabler/icons-react";
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
  existingClusterId?: string;
}

export function ConnectCluster({ projectId, existingClusterId }: ConnectClusterProps) {
  const [step, setStep] = useState<1 | 2>(existingClusterId ? 2 : 1);
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("aws");
  const [clusterId, setClusterId] = useState<string | null>(existingClusterId || null);
  const [copied, setCopied] = useState(false);

  // If the parent updates the existingClusterId (e.g. from polling), sync it
  useEffect(() => {
    if (existingClusterId) {
      setClusterId(existingClusterId);
      setStep(2);
    }
  }, [existingClusterId]);

  const { mutate: connectCluster, isPending } = useConnectCluster();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !provider) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("provider", provider);
    formData.append("projectId", projectId);

    connectCluster(formData, {
      onSuccess: (data) => {
        // Assume backend returns { success: true, data: { id: "..." } }
        setClusterId(data.data.id);
        setStep(2);
        toast.success("Cluster created! Now install the agent.");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create cluster");
      },
    });
  };

  // Build the correct backend API URL for the kubectl command
  const getBackendUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    // In local development, Backend runs on 3000 (Vite on 8080)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return 'http://localhost:3000';
    // Production fallback
    return window.location.origin;
  };

  const installCommand = clusterId 
    ? `kubectl apply -f ${getBackendUrl()}/api/v1/clusters/${clusterId}/install.yaml`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Command copied to clipboard");
  };

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center py-8 px-4 bg-background">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            {step === 1 ? <IconServer className="h-5 w-5 text-primary" /> : <IconTerminal className="h-5 w-5 text-primary" />}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-card-foreground">
            {step === 1 ? "Connect your cluster" : "Install RhOps Agent"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {step === 1
              ? "Link an existing Kubernetes cluster to this project."
              : "Run this command in your terminal to deploy the Agent."}
          </p>
        </div>

        {step === 1 && (
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
              </div>
            </div>

            <Button type="submit" className="w-full h-10 text-sm mt-2" disabled={isPending}>
              {isPending ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Continue to Installation
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="relative rounded-md bg-zinc-950 p-4 font-mono text-sm text-zinc-300">
              <div className="flex justify-between items-start mb-2">
                <span className="text-zinc-500 text-xs">Terminal</span>
                <button onClick={handleCopy} className="text-zinc-400 hover:text-white transition-colors">
                  {copied ? <IconCheck className="h-4 w-4 text-green-500" /> : <IconCopy className="h-4 w-4" />}
                </button>
              </div>
              <code className="break-all">
                <span className="text-pink-500">kubectl</span> apply -f {`${getBackendUrl()}/api/v1/clusters/${clusterId}/install.yaml`}
              </code>
            </div>

            <div className="flex items-center justify-center p-4 rounded-md border border-primary/20 bg-primary/5">
              <IconLoader2 className="h-5 w-5 animate-spin text-primary mr-3" />
              <p className="text-sm font-medium text-primary">Waiting for Agent to connect...</p>
            </div>

            <Button
              variant="outline"
              className="w-full h-10 text-sm mt-2"
              onClick={() => window.location.reload()}
            >
              I've installed the Agent (Finish)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
