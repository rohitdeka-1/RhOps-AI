import { useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { IconUser, IconUserEdit } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDataProvider } from "@/lib/data-provider";
import { ConfirmDeleteDialog } from "@/pages/employees/components/confirm-delete-dialog";
import { ProfileCard } from "./components/profile-card";
import { EditForm } from "./components/edit-form";

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";

  const { useEmployee, useDeleteEmployee } = useDataProvider();
  const { data: employee, isLoading } = useEmployee(id ?? "");
  const { mutate: deleteEmployee } = useDeleteEmployee();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-[600px] space-y-6 py-2">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-96 rounded-lg bg-muted" />
        </div>
      </main>
    );
  }

  if (!employee) {
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
                <BreadcrumbPage>Not found</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <p className="text-sm text-muted-foreground">
            Employee not found.
          </p>
        </div>
      </main>
    );
  }

  const firstName = employee.full_name.split(" ")[0];
  const tenure = computeTenureString(employee.start_date);

  const handleDelete = () => {
    deleteEmployee(employee.id);
    toast.success(`${employee.full_name} removed.`);
    navigate(`${prefix}/employees`);
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
              {isEditing ? (
                <>
                  <BreadcrumbLink asChild>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-primary hover:underline"
                    >
                      {employee.full_name}
                    </button>
                  </BreadcrumbLink>
                </>
              ) : (
                <BreadcrumbPage>{employee.full_name}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {isEditing && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <IconUserEdit className="size-6 text-muted-foreground" />
            ) : (
              <IconUser className="size-6 text-muted-foreground" />
            )}
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {isEditing
                ? `Editing ${employee.full_name}`
                : employee.full_name}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? 'Changes save when you click "Save changes."'
              : `${employee.role} · ${capitalize(employee.department)} · ${tenure}`}
          </p>
        </div>

        {isEditing ? (
          <EditForm
            employee={employee}
            onCancel={() => setIsEditing(false)}
            onSaved={() => setIsEditing(false)}
          />
        ) : (
          <ProfileCard
            employee={employee}
            onEdit={() => setIsEditing(true)}
            onRemove={() => setShowDeleteDialog(true)}
          />
        )}

        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          name={employee.full_name}
          onConfirm={handleDelete}
        />
      </div>
    </main>
  );
}

function computeTenureString(startDate: string): string {
  const start = new Date(startDate);
  const now = new Date();
  const years = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
  return `${years} yr${years === 1 ? "" : "s"}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
