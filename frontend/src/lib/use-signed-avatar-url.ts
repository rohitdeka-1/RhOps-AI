import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Resolve an avatar reference to a displayable URL.
 * - If `value` starts with `http`, returns it as-is (e.g. OAuth profile pictures).
 * - Otherwise treats it as a storage path inside the `employee-avatars` bucket
 *   and creates a 1-hour signed URL.
 */
function isDisplayable(value: string): boolean {
  return (
    value.startsWith("http") ||
    value.startsWith("/") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  );
}

export function useSignedAvatarUrl(value: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(
    value && isDisplayable(value) ? value : null
  );

  useEffect(() => {
    if (!value) {
      setUrl(null);
      return;
    }
    if (isDisplayable(value)) {
      setUrl(value);
      return;
    }
    let cancelled = false;
    supabase.storage
      .from("employee-avatars")
      .createSignedUrl(value, 3600)
      .then(({ data }) => {
        if (!cancelled) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  return url;
}