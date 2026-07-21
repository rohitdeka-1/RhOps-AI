import { Navigate, Link } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { Button } from "@/components/base/button";
import { AuthCard } from "./components/auth-card";

export default function Auth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/overview" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex h-14 items-center justify-between px-6 lg:px-8">
        <Link
          to="/"
          className="font-heading text-[21px] font-semibold leading-6 tracking-tight text-foreground"
        >
          Team Directory
        </Link>
        <Button variant="ghost" asChild>
          <Link to="/">
            <IconArrowLeft className="size-4" />
            Home
          </Link>
        </Button>
      </header>
      <main className="flex flex-1 items-center justify-center px-6">
        <AuthCard />
      </main>
    </div>
  );
}
