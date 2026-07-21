import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IconUserPlus } from "@tabler/icons-react";
import { toast } from "sonner";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDataProvider, type CreateEmployeeInput } from "@/lib/data-provider";
import type { Department } from "@/data/seed";

const departments: { value: Department; label: string }[] = [
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
  { value: "design", label: "Design" },
  { value: "operations", label: "Operations" },
];

export default function NewEmployee() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";
  const { useCreateEmployee } = useDataProvider();
  const { mutate: createEmployee, isPending } = useCreateEmployee();

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState<Department | "">("");
  const [startDate, setStartDate] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [birthday, setBirthday] = useState("");
  const [deskSnack, setDeskSnack] = useState("");
  const [hiddenTalent, setHiddenTalent] = useState("");
  const [karaokeSong, setKaraokeSong] = useState("");
  const [dreamVacation, setDreamVacation] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const funFacts: Record<string, string> = {};
    if (deskSnack.trim()) funFacts.desk_snack = deskSnack.trim();
    if (hiddenTalent.trim()) funFacts.hidden_talent = hiddenTalent.trim();
    if (karaokeSong.trim()) funFacts.karaoke_song = karaokeSong.trim();
    if (dreamVacation.trim()) funFacts.dream_vacation = dreamVacation.trim();

    const input: CreateEmployeeInput = {
      full_name: fullName.trim(),
      role: role.trim(),
      department: department as Department,
      start_date: startDate,
      email: email.trim() || null,
      phone: phone.trim() || null,
      location: location.trim() || null,
      birthday: birthday.trim().replace(/-\d{4}$/, "") || null,
      fun_facts: Object.keys(funFacts).length > 0 ? funFacts : undefined,
    };

    createEmployee(input, {
      onSuccess: () => {
        navigate(`${prefix}/employees`);
      },
      onError: () => {
        toast.error("Failed to add employee. Please try again.");
      },
    });
  };

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-[600px] space-y-6 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`${prefix}/overview`}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`${prefix}/employees`}>Employees</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New employee</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <IconUserPlus className="size-6 text-muted-foreground" />
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              New employee
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Fill in the details to add a team member.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset className="space-y-4">
                <legend className="text-sm font-medium text-foreground">
                  Identity
                </legend>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Full name…"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive">{errors.fullName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role / title *</Label>
                    <Input
                      id="role"
                      placeholder="Role / title…"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    {errors.role && (
                      <p className="text-xs text-destructive">{errors.role}</p>
                    )}
                  </div>
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
                      <p className="text-xs text-destructive">{errors.department}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    {errors.startDate && (
                      <p className="text-xs text-destructive">{errors.startDate}</p>
                    )}
                  </div>
                </div>
              </fieldset>

              <div className="border-b border-dashed border-border" />

              <fieldset className="space-y-4">
                <legend className="text-sm font-medium text-foreground">
                  Contact
                </legend>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email…"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="Phone…"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Location…"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthday">Birthday (MM-DD)</Label>
                    <Input
                      id="birthday"
                      placeholder="MM-DD…"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                    />
                  </div>
                </div>
              </fieldset>

              <div className="border-b border-dashed border-border" />

              <fieldset className="space-y-4">
                <legend className="text-sm font-medium text-foreground">
                  Fun facts (optional)
                </legend>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deskSnack">Desk snack</Label>
                    <Input
                      id="deskSnack"
                      placeholder="Desk snack…"
                      value={deskSnack}
                      onChange={(e) => setDeskSnack(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hiddenTalent">Hidden talent</Label>
                    <Input
                      id="hiddenTalent"
                      placeholder="Hidden talent…"
                      value={hiddenTalent}
                      onChange={(e) => setHiddenTalent(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="karaokeSong">Karaoke song</Label>
                    <Input
                      id="karaokeSong"
                      placeholder="Karaoke song…"
                      value={karaokeSong}
                      onChange={(e) => setKaraokeSong(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dreamVacation">Dream vacation</Label>
                    <Input
                      id="dreamVacation"
                      placeholder="Dream vacation…"
                      value={dreamVacation}
                      onChange={(e) => setDreamVacation(e.target.value)}
                    />
                  </div>
                </div>
              </fieldset>

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild>
                  <Link to={`${prefix}/employees`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isPending}>
                  Add team member &rarr;
                </Button>
              </div>
        </form>
      </div>
    </main>
  );
}
