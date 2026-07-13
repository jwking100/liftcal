import { ReportIssueDialog } from "@/components/ReportIssueDialog";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 py-4">
      <div className="container flex items-center justify-between text-sm text-muted-foreground">
        <span>Lift Calc — all weights in kg</span>
        <ReportIssueDialog />
      </div>
    </footer>
  );
}
