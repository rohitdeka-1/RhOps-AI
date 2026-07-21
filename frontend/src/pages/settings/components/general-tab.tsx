import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDataProvider } from "@/lib/data-provider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/base/button";
import { Input } from "@/components/ui/input";
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
import { IconLoader2, IconSun, IconMoon, IconDeviceLaptop, IconAlertTriangle } from "@tabler/icons-react";

type ThemeChoice = "light" | "dark" | "system";

function readStoredTheme(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem("theme");
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

function applyTheme(theme: ThemeChoice) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  root.classList.toggle("dark", dark);
}

export function GeneralTab() {
  const navigate = useNavigate();
  const { useDeleteAccount } = useDataProvider();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const [theme, setTheme] = useState<ThemeChoice>(readStoredTheme);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    window.localStorage.setItem("theme", theme);
    applyTheme(theme);
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  const handleDeleteAccount = () => {
    deleteAccount();
    setDeleteOpen(false);
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">Appearance</p>
          <p className="text-sm text-muted-foreground">
            Choose how the app looks to you
          </p>
        </div>
        <RadioGroup
          value={theme}
          onValueChange={(v) => setTheme(v as ThemeChoice)}
          className="grid grid-cols-3 gap-2 max-w-md"
        >
          {(
            [
              { value: "light", label: "Light", Icon: IconSun },
              { value: "dark", label: "Dark", Icon: IconMoon },
              { value: "system", label: "System", Icon: IconDeviceLaptop },
            ] as const
          ).map(({ value, label, Icon }) => (
            <Label
              key={value}
              htmlFor={`theme-${value}`}
              className={
                "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors " +
                (theme === value
                  ? "border-primary bg-accent text-foreground"
                  : "border-border text-muted-foreground hover:bg-accent/50")
              }
            >
              <RadioGroupItem
                id={`theme-${value}`}
                value={value}
                className="sr-only"
              />
              <Icon className="size-4" />
              {label}
            </Label>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Delete account</p>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all data
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={() => setDeleteOpen(true)}
        >
          Delete account
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteConfirm(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <IconAlertTriangle className="size-5 text-destructive" />
            </div>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all team data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Type DELETE to confirm:
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder=""
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteConfirm !== "DELETE" || isDeleting}
              onClick={handleDeleteAccount}
            >
              {isDeleting && <IconLoader2 className="size-4 animate-spin" />}
              Delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
