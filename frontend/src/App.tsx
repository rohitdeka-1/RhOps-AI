import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import ApplicationLayout from "./layouts/application-layout";
import WorkspaceLayout02 from "./layouts/workspace-layout-02";
import Landing from "./pages/landing";
import Auth from "./pages/auth";
import AuthCallback from "./pages/auth/callback";
import Overview from "./pages/overview";
import Employees from "./pages/employees";
import NewEmployee from "./pages/employees/new";
import EmployeeDetail from "./pages/employee-detail";
import CalendarPage from "./pages/calendar";
import Settings from "./pages/settings";
import Kubernetes from "./pages/kubernetes";
import NotFound from "./pages/not-found";
import { AuthProvider } from "./lib/auth/auth-provider";
import { ProtectedRoute } from "./components/protected-route";
import { SeedDataProvider, SupabaseDataProvider } from "./lib/data-provider";
import { FilterProvider } from "./lib/filter-context";

const queryClient = new QueryClient();

function ProtectedAppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SupabaseDataProvider>
        <FilterProvider>{children}</FilterProvider>
      </SupabaseDataProvider>
    </ProtectedRoute>
  );
}

function DemoShell({ children }: { children: React.ReactNode }) {
  return (
    <SeedDataProvider>
      <FilterProvider>{children}</FilterProvider>
    </SeedDataProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route element={<ApplicationLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Route>

          {/* Demo routes — seed data, no auth */}
          <Route
            element={
              <DemoShell>
                <WorkspaceLayout02 />
              </DemoShell>
            }
          >
            <Route path="/demo/overview" element={<Overview />} />
            <Route path="/demo/employees" element={<Employees />} />
            <Route path="/demo/employees/new" element={<NewEmployee />} />
            <Route path="/demo/employees/:id" element={<EmployeeDetail />} />
            <Route path="/demo/calendar" element={<CalendarPage />} />
            <Route path="/demo/settings" element={<Settings />} />
            <Route path="/demo/cluster" element={<Kubernetes />} />
          </Route>

          {/* Protected routes — Supabase data, auth required */}
          <Route
            element={
              <ProtectedAppShell>
                <WorkspaceLayout02 />
              </ProtectedAppShell>
            }
          >
            <Route path="/overview" element={<Overview />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/new" element={<NewEmployee />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/cluster" element={<Kubernetes />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    <Toaster />
  </QueryClientProvider>
);

export default App;
