import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/base/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataProvider, type UpdateEmployeeInput } from "@/lib/data-provider";
import type { Employee, Department } from "@/data/seed";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-provider";
import { useSignedAvatarUrl } from "@/lib/use-signed-avatar-url";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const departments: { value: Department; label: string }[] = [
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
  { value: "design", label: "Design" },
  { value: "operations", label: "Operations" },
];

interface EditFormProps {
  employee: Employee;
  onCancel: () => void;
  onSaved: () => void;
}

export function EditForm({ employee, onCancel, onSaved }: EditFormProps) {
  const { useUpdateEmployee } = useDataProvider();
  const { mutate: updateEmployee, isPending } = useUpdateEmployee();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(employee.avatar_url ?? null);
  const [uploading, setUploading] = useState(false);
  const previewUrl = useSignedAvatarUrl(avatarUrl);

  const [fullName, setFullName] = useState(employee.full_name);
  const [role, setRole] = useState(employee.role);
  const [department, setDepartment] = useState<Department>(employee.department);
  const [startDate, setStartDate] = useState(employee.start_date);
  const [email, setEmail] = useState(employee.email ?? "");
  const [phone, setPhone] = useState(employee.phone ?? "");
  const [location, setLocation] = useState(employee.location ?? "");
  const [birthday, setBirthday] = useState(employee.birthday ?? "");
  const [deskSnack, setDeskSnack] = useState(
    employee.fun_facts.desk_snack ?? ""
  );
  const [hiddenTalent, setHiddenTalent] = useState(
    employee.fun_facts.hidden_talent ?? ""
  );
  const [karaokeSong, setKaraokeSong] = useState(
    employee.fun_facts.karaoke_song ?? ""
  );
  const [dreamVacation, setDreamVacation] = useState(
    employee.fun_facts.dream_vacation ?? ""
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Full name is required";
    if (!role.trim()) next.role = "Role is required";
    if (!department) next.department = "Department is required";
    if (!startDate) next.startDate = "Start date is required";
    const bday = birthday.trim().replace(/-\d{4}$/, "");
    if (bday && !/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(bday)) {
      next.birthday = "Birthday must be MM-DD (e.g. 03-14)";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const funFacts: Record<string, string> = {};
    if (deskSnack.trim()) funFacts.desk_snack = deskSnack.trim();
    if (hiddenTalent.trim()) funFacts.hidden_talent = hiddenTalent.trim();
    if (karaokeSong.trim()) funFacts.karaoke_song = karaokeSong.trim();
    if (dreamVacation.trim()) funFacts.dream_vacation = dreamVacation.trim();

    const input: UpdateEmployeeInput = {
      full_name: fullName.trim(),
      role: role.trim(),
      department,
      start_date: startDate,
      email: email.trim() || null,
      phone: phone.trim() || null,
      location: location.trim() || null,
      birthday: birthday.trim().replace(/-\d{4}$/, "") || null,
      fun_facts: Object.keys(funFacts).length > 0 ? funFacts : undefined,
      avatar_url: avatarUrl,
    };

    updateEmployee({ id: employee.id, input });
    onSaved();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${employee.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("employee-avatars")
      .upload(path, file, { upsert: false, contentType: file.type });
    setUploading(false);
    if (error) {
      toast.error("Failed to upload photo.");
      return;
    }
    setAvatarUrl(path);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[600px] space-y-6">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-32 w-32">
              {previewUrl && (
                <AvatarImage src={previewUrl} alt={fullName || employee.full_name} />
              )}
              <AvatarFallback className="text-2xl">
                {getInitials(fullName || employee.full_name)}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
              </Button>
              {avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setAvatarUrl(null)}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-foreground">
              Identity
            </legend>
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Full name *</Label>
              <Input
                id="edit-fullName"
                placeholder="Full name…"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role / title *</Label>
              <Input
                id="edit-role"
                placeholder="Role / title…"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select
                  value={department}
                  onValueChange={(v) => setDepartment(v as Department)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department…" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-xs text-destructive">
                    {errors.department}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start date *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">
                    {errors.startDate}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          <div className="border-b border-dashed border-border" />

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-foreground">
              Contact
            </legend>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Email…"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                placeholder="Phone…"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                placeholder="Location…"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-birthday">Birthday (MM-DD)</Label>
              <Input
                id="edit-birthday"
                placeholder="MM-DD…"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
              {errors.birthday && (
                <p className="text-sm text-destructive">{errors.birthday}</p>
              )}
            </div>
          </fieldset>

          <div className="border-b border-dashed border-border" />

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-foreground">
              Fun facts
            </legend>
            <div className="space-y-2">
              <Label htmlFor="edit-deskSnack">Desk snack</Label>
              <Input
                id="edit-deskSnack"
                placeholder="Desk snack…"
                value={deskSnack}
                onChange={(e) => setDeskSnack(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hiddenTalent">Hidden talent</Label>
              <Input
                id="edit-hiddenTalent"
                placeholder="Hidden talent…"
                value={hiddenTalent}
                onChange={(e) => setHiddenTalent(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-karaokeSong">Karaoke song</Label>
              <Input
                id="edit-karaokeSong"
                placeholder="Karaoke song…"
                value={karaokeSong}
                onChange={(e) => setKaraokeSong(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dreamVacation">Dream vacation</Label>
              <Input
                id="edit-dreamVacation"
                placeholder="Dream vacation…"
                value={dreamVacation}
                onChange={(e) => setDreamVacation(e.target.value)}
              />
            </div>
          </fieldset>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              Save changes &rarr;
            </Button>
          </div>
    </form>
  );
}
