import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IconLoader2 } from "@tabler/icons-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/base/button";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    
    if (!code) {
      setError("No authorization code provided by GitHub.");
      return;
    }

    const authenticateWithGitHub = async () => {
      try {
        const res = await api.post("/auth/github", { code });
        if (res.data.token) {
          localStorage.setItem("jwt_token", res.data.token);
          setUser(res.data.data);
          navigate("/overview", { replace: true });
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || 
          err.response?.data || 
          "An error occurred during GitHub authentication."
        );
      }
    };

    authenticateWithGitHub();
  }, [searchParams, navigate, setUser]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-6">
        <div className="w-full max-w-md space-y-4 rounded-lg bg-card p-6 shadow-sm border">
          <h2 className="text-xl font-semibold">Authentication Failed</h2>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/auth")} className="w-full">
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <div className="flex flex-col items-center space-y-4">
        <IconLoader2 className="size-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Authenticating with GitHub...</p>
      </div>
    </div>
  );
}
