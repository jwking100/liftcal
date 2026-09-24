import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculatorTab } from "@/components/calculator/CalculatorTab";
import { PlatesTab } from "@/components/plates/PlatesTab";
import { LogWorkoutTab } from "@/components/log/LogWorkoutTab";
import { HistoryTab } from "@/components/history/HistoryTab";
import { SettingsTab } from "@/components/settings/SettingsTab";

const GUEST_ONLY_TABS = new Set(["log", "history", "settings"]);

export default function Index() {
  const { user } = useAuth();
  const [tab, setTab] = useState("calculator");

  const handleTabChange = (value: string) => {
    if (!user && GUEST_ONLY_TABS.has(value)) {
      toast.info("Sign in to unlock this tab");
      return;
    }
    setTab(value);
  };

  return (
    <div className="flex min-h-svh flex-col">
      <Header />

      <main className="container flex-1 py-6">
        <Tabs value={tab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="plates">Plates</TabsTrigger>
            <TabsTrigger value="log" className="gap-1.5">
              {!user && <Lock className="h-3 w-3" />}
              Log
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              {!user && <Lock className="h-3 w-3" />}
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              {!user && <Lock className="h-3 w-3" />}
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <CalculatorTab />
          </TabsContent>
          <TabsContent value="plates">
            <PlatesTab />
          </TabsContent>
          {user && (
            <>
              <TabsContent value="log">
                <LogWorkoutTab />
              </TabsContent>
              <TabsContent value="history">
                <HistoryTab />
              </TabsContent>
              <TabsContent value="settings">
                <SettingsTab />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
