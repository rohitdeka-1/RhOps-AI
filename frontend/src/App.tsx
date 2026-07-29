import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./lib/auth/auth-provider";
import { ProtectedRoute } from "./components/protected-route";
import { FilterProvider } from "./lib/filter-context";

// Layouts are shared across many routes — keep eager
import ApplicationLayout from "./layouts/application-layout";
import WorkspaceLayout02 from "./layouts/workspace-layout-02";

// Pages: lazy-loaded for route-level code splitting
const Landing = lazy(() => import("./pages/landing"));
const Auth = lazy(() => import("./pages/auth"));
const AuthCallback = lazy(() => import("./pages/auth/callback"));
const Overview = lazy(() => import("./pages/overview"));
const Kubernetes = lazy(() => import("./pages/kubernetes"));
const NotFound = lazy(() => import("./pages/not-found"));

const queryClient = new QueryClient();

function ProtectedAppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <FilterProvider>{children}</FilterProvider>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={null}>
          <Routes>
            {/* Public routes */}
            <Route element={<ApplicationLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Route>

            {/* Protected routes — auth required */}
            <Route
              element={
                <ProtectedAppShell>
                  <WorkspaceLayout02 />
                </ProtectedAppShell>
              }
            >
              <Route path="/overview" element={<Overview />} />
              <Route path="/cluster" element={<Kubernetes />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
    <Toaster />
  </QueryClientProvider>
);

export default App;
