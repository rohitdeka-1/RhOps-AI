import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "./components/page-header";
import { ProfileForm } from "./components/profile-form";
import { TeamTab } from "./components/team-tab";
import { GeneralTab } from "./components/general-tab";

export default function Settings() {
  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-5xl space-y-6 py-2">
        <PageHeader />
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>
          <Separator className="mt-4" />
          <TabsContent value="profile" className="mt-6">
            <ProfileForm />
          </TabsContent>
          <TabsContent value="team" className="mt-6">
            <TeamTab />
          </TabsContent>
          <TabsContent value="general" className="mt-6">
            <GeneralTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
