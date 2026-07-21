import { useState } from "react";
import { useDataProvider } from "@/lib/data-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  IconDots,
  IconShieldCheck,
  IconUser,
  IconUserMinus,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import type { TeamMember, Invitation } from "@/lib/data-provider";
import { useSignedAvatarUrl } from "@/lib/use-signed-avatar-url";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface MemberRowProps {
  member: TeamMember;
  onChangeRole: (userId: string, role: "admin" | "member") => void;
  onRevoke: (member: TeamMember) => void;
}

function MemberRow({ member, onChangeRole, onRevoke }: MemberRowProps) {
  const newRole = member.role === "admin" ? "member" : "admin";
  const avatarSrc = useSignedAvatarUrl(member.avatar_url);

  return (
    <div className="flex items-center gap-4 py-3">
      <Avatar className="size-10">
        {avatarSrc && <AvatarImage src={avatarSrc} alt={member.full_name} />}
        <AvatarFallback className="text-xs font-medium">
          {getInitials(member.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {member.full_name}
        </p>
        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
      </div>
      <Badge color={member.role === "admin" ? "mint" : "gray"}>
        {member.role === "admin" ? "Admin" : "Member"}
      </Badge>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <IconDots className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onChangeRole(member.user_id, newRole)}>
            {newRole === "admin" ? (
              <IconShieldCheck className="size-4" />
            ) : (
              <IconUser className="size-4" />
            )}
            Change to {newRole === "admin" ? "Admin" : "Member"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onRevoke(member)}
          >
            <IconUserMinus className="size-4" />
            Revoke access
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function PendingRow({
  invitation,
  onRevoke,
}: {
  invitation: Invitation;
  onRevoke: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-3">
      <Avatar className="size-10">
        <AvatarFallback className="border-2 border-dashed border-muted-foreground/40 bg-transparent text-xs text-muted-foreground">
          ..
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {invitation.email}
        </p>
        <p className="text-sm text-muted-foreground">(pending)</p>
      </div>
      <Badge color="gray">
        {invitation.role === "admin" ? "Admin" : "Member"}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-destructive"
        onClick={() => onRevoke(invitation.id)}
      >
        <IconX className="size-4" />
        Revoke
      </Button>
    </div>
  );
}

export function TeamTab() {
  const {
    useTeamMembers,
    useInvitations,
    useUpdateUserRole,
    useCreateInvitation,
    useRevokeInvitation,
    useRemoveTeamMember,
  } = useDataProvider();
  const { data: members } = useTeamMembers();
  const { data: invitations } = useInvitations();
  const { mutate: updateRole } = useUpdateUserRole();
  const { mutate: createInvitation, isPending: isInviting } = useCreateInvitation();
  const { mutate: revokeInvitation } = useRevokeInvitation();
  const { mutate: removeTeamMember } = useRemoveTeamMember();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [revokeTarget, setRevokeTarget] = useState<TeamMember | null>(null);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    createInvitation({ email: inviteEmail.trim(), role: inviteRole });
    setInviteEmail("");
    setInviteRole("member");
  };

  const handleChangeRole = (userId: string, role: "admin" | "member") => {
    updateRole({ userId, role });
  };

  const handleConfirmRevoke = () => {
    if (!revokeTarget) return;
    removeTeamMember(revokeTarget.user_id);
    setRevokeTarget(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Team members</h2>
        <div className="mt-4 divide-y divide-border">
          {members.map((member) => (
            <MemberRow
              key={member.user_id}
              member={member}
              onChangeRole={handleChangeRole}
              onRevoke={setRevokeTarget}
            />
          ))}
          {invitations.map((inv) => (
            <PendingRow
              key={inv.id}
              invitation={inv}
              onRevoke={revokeInvitation}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleInvite}>
        <Label className="text-lg font-semibold text-foreground">
          Invite a team member
        </Label>
        <div className="mt-4 flex items-end gap-4">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>
          <Select
            value={inviteRole}
            onValueChange={(v) => setInviteRole(v as "admin" | "member")}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isInviting}>
            {isInviting && <IconLoader2 className="size-4 animate-spin" />}
            Send invite
          </Button>
        </div>
      </form>

      <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <IconUserMinus className="size-5 text-destructive" />
            </div>
            <AlertDialogTitle>
              Revoke access for {revokeTarget?.full_name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {revokeTarget?.full_name} will lose access to the team immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmRevoke}
            >
              Revoke access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
