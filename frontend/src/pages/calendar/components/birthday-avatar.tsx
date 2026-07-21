import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSignedAvatarUrl } from "@/lib/use-signed-avatar-url";
import type { BirthdayEntry } from "@/lib/data-provider";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface BirthdayAvatarProps {
  entry: BirthdayEntry;
  size?: "sm" | "md";
}

export function BirthdayAvatar({ entry, size = "md" }: BirthdayAvatarProps) {
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";
  const avatarSrc = useSignedAvatarUrl(entry.avatar_url);

  const sizeClass = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const textClass = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <Link to={`${prefix}/employees/${entry.id}`} title={entry.full_name}>
      <Avatar className={sizeClass}>
        {avatarSrc && <AvatarImage src={avatarSrc} alt={entry.full_name} />}
        <AvatarFallback className={textClass}>
          {getInitials(entry.full_name)}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}
