import { ProfileSection } from "./ProfileSection";
import { CustomExercisesSection } from "./CustomExercisesSection";
import { PersonalRecordsSection } from "./PersonalRecordsSection";

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <ProfileSection />
      <CustomExercisesSection />
      <PersonalRecordsSection />
    </div>
  );
}
