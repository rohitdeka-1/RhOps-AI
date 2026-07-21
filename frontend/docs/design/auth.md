# Auth

Every template ships with real Supabase auth — Google, Apple, and email.
Auth is not simulated, not deferred, not a SPEC-GAP.

---

## AuthProvider

Wraps the entire app. Exposes `{ user, session, loading, signOut }`.

```typescript
// src/lib/auth/auth-provider.tsx
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Register listener FIRST (before getSession)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // 2. Then hydrate initial state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear(); // wipe React Query cache
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
```

**Why listener before getSession**: If the user arrives via an OAuth callback,
`onAuthStateChange` fires a `SIGNED_IN` event immediately. If `getSession`
runs first and `onAuthStateChange` is registered after, the event is missed
and the user appears unauthenticated.

---

## ProtectedRoute

Redirects unauthenticated users to `/sign-in`. Preserves the `from` location
so they return after signing in.

```typescript
// src/components/protected-route.tsx
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSkeleton />;
  if (!user) return <Navigate to="/sign-in" state={{ from: location }} replace />;
  return <>{children}</>;
}
```

**In App.tsx**:
```typescript
<Route element={<ProtectedRoute><SupabaseDataProvider><WorkspaceLayout /></SupabaseDataProvider></ProtectedRoute>}>
  <Route path="/goals" element={<GoalsPage />} />
  <Route path="/feed" element={<FeedPage />} />
</Route>
```

---

## Sign In page (`/sign-in`)

```
┌──────────────────────────────────────────┐
│  [Logo] App Name                         │
│  Sign in                                 │
│  Welcome back to your workspace          │
│                                          │
│  [Google icon] Continue with Google      │  ← full width, primary
│  [Apple icon]  Continue with Apple       │  ← full width, outline
│                                          │
│  ────────── or continue with email ───── │
│                                          │
│  Email                                   │
│  [you@company.com…                    ]  │
│                                          │
│  Password                [Forgot?]       │
│  [Password…                           ]  │
│                                          │
│  [Sign in]                               │  ← full width, primary
│                                          │
│  Create account  ·  View demo            │
└──────────────────────────────────────────┘
```

**OAuth buttons** (use Lovable managed client, NOT supabase.auth):
```typescript
import { lovable } from "@/integrations/lovable/index";

const handleOAuth = async (provider: 'google' | 'apple') => {
  const result = await lovable.auth.signInWithOAuth(provider, {
    redirect_uri: window.location.origin,
  });
  if (result.error) {
    setError('OAuth sign-in failed');
    return;
  }
  if (result.redirected) {
    return; // browser navigating to provider — just wait
  }
  // session is set, navigate to app
  const from = location.state?.from?.pathname || '/goals';
  navigate(from, { replace: true });
};
```

**Email sign-in**:
```typescript
const handleEmailSignIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.includes('Email not confirmed')) {
      setError('Please confirm your email before signing in');
    } else {
      setError('Invalid email or password');
    }
  } else {
    const from = location.state?.from?.pathname || '/goals';
    navigate(from, { replace: true });
  }
};
```

**Forgot password**:
```typescript
await supabase.auth.resetPasswordForEmail(email);
toast('Check your email for a reset link');
```

---

## Sign Up page (`/sign-up`)

Same layout as sign-in. Same OAuth buttons. Email form has confirm password.

On successful signup: show "Check your email to confirm your account" inline.
Do NOT auto-redirect. Do NOT auto-sign-in. Email confirmation is required.

```typescript
const { error } = await supabase.auth.signUp({ email, password });
if (error) {
  setError(error.message);
} else {
  setShowConfirmation(true); // renders the "check your email" message
}
```

---

## Sign out

In the sidebar footer. Calls `signOut()` from AuthProvider.

```typescript
function SidebarFooter() {
  const { user, signOut } = useAuth();

  return (
    <SidebarFooterContent>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start">
            <Avatar><AvatarFallback>{initials}</AvatarFallback></Avatar>
            <span>{user?.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={signOut}>
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooterContent>
  );
}
```

---

## Route table

| Route | Access | Behavior |
|-------|--------|----------|
| `/` | public | Landing page |
| `/sign-in` | public | Redirects to default app route if already authenticated |
| `/sign-up` | public | Redirects to default app route if already authenticated |
| `/demo/*` | public | Seed data, SeedDataProvider, no auth |
| `/*` (app routes) | **protected** | ProtectedRoute → redirects to `/sign-in` if not authenticated |

---

## Anti-patterns

```typescript
// ❌ Direct supabase OAuth — "missing OAuth secret" error
supabase.auth.signInWithOAuth({ provider: 'google' }); // bypasses Lovable broker
// ✅ Use Lovable managed client instead:
lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });

// ❌ Simulated auth
setTimeout(() => navigate('/goals'), 800); // not real auth

// ❌ OAuth toast instead of real call
toast('Google sign-in not configured'); // the providers ARE configured

// ❌ SPEC-GAP comment instead of implementation
// SPEC-GAP: no Supabase auth; simulate sign-in

// ❌ getSession before onAuthStateChange listener
supabase.auth.getSession(); // if OAuth callback, SIGNED_IN event is missed
supabase.auth.onAuthStateChange(...); // too late

// ❌ No React Query cache clear on sign-out
// User B signs in and sees User A's cached data

// ❌ Auto-confirm email signups
// supabase--configure_auth with autoConfirmEmail: true
// Users should verify their email
```
