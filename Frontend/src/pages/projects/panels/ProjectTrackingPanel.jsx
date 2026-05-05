import ProjectTrackingComparisonGallery from "../components/tracking/ProjectTrackingComparisonGallery.jsx";
import ProjectTrackingMilestonesCard from "../components/tracking/ProjectTrackingMilestonesCard.jsx";
import ProjectTrackingStagesCard from "../components/tracking/ProjectTrackingStagesCard.jsx";
import ProjectTrackingSummaryRow from "../components/tracking/ProjectTrackingSummaryRow.jsx";
import {
  PROJECT_TRACKING_COMPARISONS,
  PROJECT_TRACKING_MILESTONES,
  PROJECT_TRACKING_STAGES,
  PROJECT_TRACKING_SUMMARY,
} from "../projectTrackingData.js";

export default function ProjectTrackingPanel({
  summary = PROJECT_TRACKING_SUMMARY,
  stages = PROJECT_TRACKING_STAGES,
  milestones = PROJECT_TRACKING_MILESTONES,
  comparisons = PROJECT_TRACKING_COMPARISONS,
}) {
  return (
    <section className="flex w-full flex-col gap-[16px]">
      <ProjectTrackingSummaryRow items={summary} />

      <div className="flex w-full flex-col items-start gap-[24px] lg:flex-row">
        <ProjectTrackingStagesCard stages={stages} />
        <ProjectTrackingMilestonesCard items={milestones} />
      </div>

      <ProjectTrackingComparisonGallery items={comparisons} />
    </section>
  );
}
