import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconBrandGithub, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/base/button";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";

export function AuthCard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/overview";

  const [tab, setTab] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.token) {
        localStorage.setItem("jwt_token", res.data.token);
        setUser(res.data.data);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        email,
        password,
        name: fullName,
        username,
      });

      if (res.data.token) {
        localStorage.setItem("jwt_token", res.data.token);
        setUser(res.data.data);
        navigate("/overview", { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "github") => {
    toast.info("GitHub login will be implemented later.");
  };

  const handleForgotPassword = async () => {
    toast.info("Password reset not implemented yet.");
  };

  const isSignIn = tab === "sign-in";

  return (
    <Card className="w-full max-w-[420px]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {isSignIn ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          {isSignIn
            ? "Sign in to your dashboard"
            : "Get started with RhOps AI"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as "sign-in" | "sign-up");
            setError(null);
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign in</TabsTrigger>
            <TabsTrigger value="sign-up">Sign up</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuth("github")}
              disabled={loading}
            >
              <IconBrandGithub className="size-4" />
              Continue with GitHub
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <TabsContent value="sign-in" className="mt-0 space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading && <IconLoader2 className="size-4 animate-spin" />}
                  Sign in
                </Button>
              </form>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full text-center text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </TabsContent>

            <TabsContent value="sign-up" className="mt-0 space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Sarah Chen"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="sarah_c"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading && <IconLoader2 className="size-4 animate-spin" />}
                  Create account
                </Button>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
