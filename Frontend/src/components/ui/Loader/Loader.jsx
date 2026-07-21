import clsx from "clsx";

function SkeletonBlock({ className }) {
  return <span className={clsx("skeleton-shimmer block", className)} />;
}

function ProjectRowSkeleton() {
  return (
    <div className="flex w-full flex-col gap-[16px] border-b border-[var(--color-neutral-200)] py-[16px] lg:flex-row lg:items-center lg:gap-[24px]">
      <SkeletonBlock className="h-[91px] w-full shrink-0 rounded-[var(--radius-2)] sm:w-[160px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
        <div className="flex items-center gap-[8px]">
          <SkeletonBlock className="h-[24px] w-[min(220px,65%)] rounded-[var(--radius-1)]" />
          <SkeletonBlock className="size-[24px] rounded-[var(--radius-full)]" />
        </div>
        <SkeletonBlock className="h-[8px] w-full rounded-[var(--radius-full)]" />
        <div className="flex justify-between gap-[12px]">
          <SkeletonBlock className="h-[14px] w-[88px] rounded-[var(--radius-1)]" />
          <SkeletonBlock className="h-[14px] w-[64px] rounded-[var(--radius-1)]" />
        </div>
      </div>
      <SkeletonBlock className="h-[41px] w-[112px] shrink-0 rounded-[var(--radius-2)]" />
    </div>
  );
}

function RequestRowSkeleton() {
  return (
    <div className="flex w-full flex-col gap-[16px] border-b border-[var(--color-neutral-200)] py-[16px] lg:flex-row lg:items-center lg:gap-[24px]">
      <SkeletonBlock className="h-[91px] w-full shrink-0 rounded-[var(--radius-2)] sm:w-[160px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
        <div className="flex items-center gap-[8px]">
          <SkeletonBlock className="h-[24px] w-[min(240px,68%)] rounded-[var(--radius-1)]" />
          <SkeletonBlock className="size-[24px] rounded-[var(--radius-full)]" />
          <SkeletonBlock className="size-[24px] rounded-[var(--radius-full)]" />
        </div>
        <SkeletonBlock className="h-[8px] w-full rounded-[var(--radius-full)]" />
        <SkeletonBlock className="h-[12px] w-[124px] rounded-[var(--radius-1)]" />
      </div>
      <SkeletonBlock className="h-[41px] w-[144px] shrink-0 rounded-[var(--radius-2)]" />
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex w-full items-start gap-[8px] rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-10)] p-[8px]">
      <SkeletonBlock className="size-[32px] shrink-0 rounded-[var(--radius-full)]" />
      <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
        <SkeletonBlock className="h-[13px] w-full rounded-[var(--radius-1)]" />
        <SkeletonBlock className="h-[11px] w-2/3 rounded-[var(--radius-1)]" />
        <div className="flex items-center gap-[6px]">
          <SkeletonBlock className="size-[18px] rounded-[var(--radius-1)]" />
          <SkeletonBlock className="h-[9px] w-[72px] rounded-[var(--radius-1)]" />
        </div>
      </div>
    </div>
  );
}

function VideoStageSkeleton() {
  return (
    <div className="relative size-full overflow-hidden rounded-[inherit]">
      <SkeletonBlock className="size-full rounded-[inherit]" />
      <div className="absolute inset-x-[20px] bottom-[20px] flex flex-col gap-[10px]">
        <SkeletonBlock className="h-[6px] w-full rounded-[var(--radius-full)]" />
        <div className="flex justify-between">
          <SkeletonBlock className="h-[16px] w-[92px] rounded-[var(--radius-1)]" />
          <SkeletonBlock className="h-[16px] w-[128px] rounded-[var(--radius-1)]" />
        </div>
      </div>
    </div>
  );
}

function CommentCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-[10px] rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-10)] p-[8px]">
      <div className="flex items-center gap-[8px]">
        <SkeletonBlock className="size-[24px] rounded-[var(--radius-full)]" />
        <SkeletonBlock className="h-[12px] w-[88px] rounded-[var(--radius-1)]" />
        <SkeletonBlock className="h-[10px] w-[52px] rounded-[var(--radius-1)]" />
      </div>
      <SkeletonBlock className="h-[14px] w-full rounded-[var(--radius-1)]" />
      <SkeletonBlock className="h-[14px] w-3/4 rounded-[var(--radius-1)]" />
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="flex w-full flex-col gap-[32px] py-[24px]">
      <div className="flex flex-col gap-[12px]">
        <SkeletonBlock className="h-[38px] w-[min(360px,75%)] rounded-[var(--radius-2)]" />
        <SkeletonBlock className="h-[18px] w-[min(240px,55%)] rounded-[var(--radius-1)]" />
        <div className="flex gap-[8px]">
          <SkeletonBlock className="h-[24px] w-[84px] rounded-[var(--radius-full)]" />
          <SkeletonBlock className="h-[24px] w-[112px] rounded-[var(--radius-full)]" />
        </div>
      </div>
      <div className="flex gap-[16px] border-b border-[var(--color-neutral-200)] pb-[12px]">
        <SkeletonBlock className="h-[18px] w-[88px] rounded-[var(--radius-1)]" />
        <SkeletonBlock className="h-[18px] w-[112px] rounded-[var(--radius-1)]" />
        <SkeletonBlock className="h-[18px] w-[72px] rounded-[var(--radius-1)]" />
      </div>
      <SkeletonBlock className="min-h-[320px] w-full rounded-[var(--radius-3)]" />
    </div>
  );
}

function Loader({ className, count = 1, label = "Cargando contenido", preset = "projectRow" }) {
  const itemCount = Math.max(1, Math.floor(Number(count) || 1));
  let content;

  if (preset === "commentCard") {
    content = Array.from({ length: itemCount }, (_, index) => <CommentCardSkeleton key={index} />);
  } else if (preset === "projectDetail") {
    content = <ProjectDetailSkeleton />;
  } else if (preset === "requestRow") {
    content = Array.from({ length: itemCount }, (_, index) => <RequestRowSkeleton key={index} />);
  } else if (preset === "activityItem") {
    content = Array.from({ length: itemCount }, (_, index) => <ActivityItemSkeleton key={index} />);
  } else if (preset === "videoStage") {
    content = <VideoStageSkeleton />;
  } else if (preset === "media" || preset === "modelThumbnail" || preset === "videoThumbnail") {
    content = <SkeletonBlock className="size-full rounded-[inherit]" />;
  } else if (preset === "upload") {
    content = (
      <div className="flex w-full items-center gap-[12px]">
        <SkeletonBlock className="size-[40px] shrink-0 rounded-[var(--radius-2)]" />
        <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
          <SkeletonBlock className="h-[14px] w-2/3 rounded-[var(--radius-1)]" />
          <SkeletonBlock className="h-[8px] w-full rounded-[var(--radius-full)]" />
        </div>
      </div>
    );
  } else if (preset === "action") {
    content = <SkeletonBlock className="h-[36px] w-[132px] rounded-[var(--radius-2)]" />;
  } else {
    content = Array.from({ length: itemCount }, (_, index) => <ProjectRowSkeleton key={index} />);
  }

  return (
    <div role="status" aria-live="polite" aria-busy="true" className={clsx("flex w-full flex-col gap-[var(--spacing-gap-4)]", className)}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="contents">{content}</div>
    </div>
  );
}

export default Loader;
