import { PageHeader } from "@/components/shell/PageHeader";

export default function StatsPage() {
  return (
    <div>
      <PageHeader eyebrow="Coming in Phase 3" title="Dashboard" />
      <p className="text-muted">
        KPIs, weekly chart, and the 5 AM heatmap land next.
      </p>
    </div>
  );
}
