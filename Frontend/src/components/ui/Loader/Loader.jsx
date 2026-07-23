import clsx from "clsx";

function SkeletonBlock({ className, delay = 0, style, tone = "surface" }) {
  return (
    <span
      className={clsx("skeleton-shimmer block", className)}
      data-skeleton-tone={tone}
      style={{ ...style, animationDelay: `${delay}ms` }}
    />
  );
}

function ProjectRowSkeleton() {
  return (
    <div className="flex w-full flex-wrap items-center gap-[24px] border-b border-[var(--color-neutral-200)] py-[16px]">
      <SkeletonBlock className="aspect-[140/80] min-h-[91px] min-w-[160px] flex-1 rounded-[var(--radius-2)]" />
      <div className="flex min-w-[300px] flex-1 flex-col gap-[12px]">
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
      <SkeletonBlock className="h-[49px] min-w-[105px] flex-1 rounded-[var(--radius-2)]" />
    </div>
  );
}

function RequestRowSkeleton() {
  return (
    <div className="flex w-full flex-wrap items-center gap-[24px] border-b border-[var(--color-neutral-200)] py-[16px]">
      <SkeletonBlock className="aspect-[140/80] min-h-[91px] min-w-[160px] flex-1 rounded-[var(--radius-2)]" />
      <div className="flex min-w-[300px] flex-1 flex-col gap-[12px]">
        <div className="flex items-center gap-[8px]">
          <SkeletonBlock className="h-[24px] w-[min(240px,68%)] rounded-[var(--radius-1)]" />
          <SkeletonBlock className="size-[24px] rounded-[var(--radius-full)]" />
          <SkeletonBlock className="size-[24px] rounded-[var(--radius-full)]" />
        </div>
        <SkeletonBlock className="h-[8px] w-full rounded-[var(--radius-full)]" />
        <SkeletonBlock className="h-[12px] w-[124px] rounded-[var(--radius-1)]" />
      </div>
      <SkeletonBlock className="h-[49px] min-w-[126px] flex-1 rounded-[var(--radius-2)]" />
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

function DocumentPreviewSkeleton() {
  return (
    <div className="flex min-h-[554px] w-full flex-col overflow-hidden rounded-b-[var(--radius-3)] bg-[var(--color-primary-300)]">
      <SkeletonBlock className="h-[34px] w-full rounded-none opacity-50" />
      <div className="flex flex-1 justify-center px-[36px] py-[36px]">
        <SkeletonBlock className="min-h-[486px] w-full max-w-[488px] rounded-[var(--radius-1)]" />
      </div>
    </div>
  );
}

function DocumentListSkeleton() {
  return (
    <div className="flex w-full flex-col gap-[12px]">
      <SkeletonBlock className="h-[14px] w-[min(290px,88%)] rounded-[var(--radius-1)]" delay={90} tone="muted" />
      {Array.from({ length: 3 }, (_, index) => (
        <SkeletonBlock
          key={index}
          className="h-[92px] w-full rounded-[var(--radius-3)]"
          delay={130 + index * 70}
        />
      ))}
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

const PROJECT_TAB_WIDTHS = [132, 138, 84, 88, 76, 94];

function ProjectDetailHeaderSkeleton({ activeSection = "info" }) {
  const activeTabIndex = ["info", "renders", "documents", "tracking", "warranties", "upload"].indexOf(activeSection);
  return (
    <>
      <div className="flex items-start justify-between gap-[24px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
          <SkeletonBlock className="h-[38px] w-[min(390px,78%)] rounded-[var(--radius-2)]" tone="text" />
          <SkeletonBlock className="h-[18px] w-[min(210px,52%)] rounded-[var(--radius-1)]" delay={70} tone="muted" />
        </div>
        <div className="relative size-[88px] shrink-0 max-sm:size-[68px]">
          <SkeletonBlock className="size-full rounded-full" delay={120} />
          <span className="absolute inset-[10px] rounded-full bg-[var(--color-neutral-bg)] max-sm:inset-[8px]" />
          <SkeletonBlock className="absolute left-1/2 top-1/2 h-[12px] w-[34px] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-1)]" delay={180} tone="text" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-[24px] max-sm:grid-cols-2 max-sm:gap-x-[12px] max-sm:gap-y-[20px]">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex min-w-0 flex-col gap-[7px]">
            <SkeletonBlock className="h-[4px] w-full rounded-full" delay={index * 65} />
            <SkeletonBlock className="mt-[7px] h-[14px] w-[72%] rounded-[var(--radius-1)]" delay={80 + index * 65} tone="text" />
            <SkeletonBlock className="h-[11px] w-[48%] rounded-[var(--radius-1)]" delay={130 + index * 65} tone="muted" />
          </div>
        ))}
      </div>

      <div className="flex gap-[24px] overflow-hidden border-b border-[var(--color-neutral-200)] pt-[12px]">
        {PROJECT_TAB_WIDTHS.map((width, index) => (
          <div key={width} className="flex shrink-0 flex-col gap-[10px] pb-[8px]">
            <SkeletonBlock className="h-[13px] rounded-[var(--radius-1)]" delay={index * 45} tone="muted" style={{ width }} />
            <SkeletonBlock className={clsx("h-[2px] rounded-full", index === activeTabIndex ? "w-full" : "w-0")} delay={90} />
          </div>
        ))}
      </div>
    </>
  );
}

function InfoPanelSkeleton() {
  return (
    <div className="flex flex-col gap-[24px]">
      <div className="grid grid-cols-3 gap-[48px] border-b border-[var(--color-neutral-200)] py-[16px] max-md:grid-cols-1 max-md:gap-[12px]">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center justify-between gap-[16px]">
            <SkeletonBlock className="h-[11px] w-[72px] rounded-[var(--radius-1)]" delay={index * 60} tone="muted" />
            <SkeletonBlock className="h-[12px] w-[62px] rounded-[var(--radius-1)]" delay={90 + index * 60} tone="text" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-[24px] border-b border-[var(--color-neutral-200)] pb-[12px]">
        <SkeletonBlock className="h-[11px] w-[68px] rounded-[var(--radius-1)]" tone="muted" />
        <SkeletonBlock className="h-[11px] w-[min(310px,62%)] rounded-[var(--radius-1)]" delay={80} tone="text" />
      </div>
      <SkeletonBlock className="h-[300px] w-full rounded-[var(--radius-2)]" delay={120} />
      <div className="grid grid-cols-2 items-start gap-[16px] max-lg:grid-cols-1">
        <div className="flex flex-col gap-[12px]">
          <SkeletonBlock className="h-[12px] w-[150px] rounded-[var(--radius-1)]" tone="muted" />
          {[96, 48, 48].map((height, index) => <SkeletonBlock key={index} className="w-full rounded-[var(--radius-2)]" delay={index * 70} style={{ height }} />)}
        </div>
        <div className="flex flex-col gap-[16px]">
          <SkeletonBlock className="h-[12px] w-[112px] rounded-[var(--radius-1)]" tone="muted" />
          <div className="grid grid-cols-2 gap-x-[28px] gap-y-[16px] px-[12px] max-sm:grid-cols-1">
            {Array.from({ length: 6 }, (_, index) => <SkeletonBlock key={index} className="h-[13px] w-[min(190px,90%)] rounded-[var(--radius-1)]" delay={index * 45} tone="text" />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function RendersPanelSkeleton() {
  return <div className="grid min-h-[480px] grid-cols-[minmax(0,1fr)_200px] gap-[16px] max-lg:grid-cols-1"><SkeletonBlock className="min-h-[480px] rounded-[var(--radius-3)]" /><div className="flex gap-[12px] lg:flex-col">{Array.from({ length: 3 }, (_, index) => <SkeletonBlock key={index} className="h-[150px] min-w-[150px] flex-1 rounded-[var(--radius-2)]" delay={index * 80} />)}</div></div>;
}

function DocumentsPanelSkeleton() {
  return <div className="grid grid-cols-[minmax(0,1fr)_335px] gap-[20px] max-lg:grid-cols-1"><div className="overflow-hidden rounded-[var(--radius-3)]"><div className="flex h-[80px] items-center gap-[12px] bg-[var(--color-neutral-10)] px-[20px]"><SkeletonBlock className="size-[42px] rounded-[var(--radius-1)]" /><div className="flex flex-1 flex-col gap-[8px]"><SkeletonBlock className="h-[13px] w-[220px] max-w-[65%] rounded-[var(--radius-1)]" tone="text" /><SkeletonBlock className="h-[10px] w-[130px] rounded-[var(--radius-1)]" tone="muted" /></div><SkeletonBlock className="h-[30px] w-[138px] rounded-full" delay={100} /></div><SkeletonBlock className="min-h-[554px] w-full rounded-none" delay={140} /></div><div className="flex flex-col gap-[12px]"><SkeletonBlock className="h-[44px] w-full rounded-[var(--radius-2)]" />{Array.from({ length: 3 }, (_, index) => <SkeletonBlock key={index} className="h-[82px] w-full rounded-[var(--radius-2)]" delay={70 + index * 70} />)}</div></div>;
}

function TrackingPanelSkeleton() {
  return <div className="flex flex-col gap-[24px]"><div className="grid grid-cols-4 gap-[16px] max-md:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <SkeletonBlock key={index} className="h-[82px] rounded-[var(--radius-2)]" delay={index * 55} />)}</div><div className="grid grid-cols-2 gap-[24px] max-lg:grid-cols-1"><SkeletonBlock className="h-[280px] rounded-[var(--radius-3)]" /><SkeletonBlock className="h-[280px] rounded-[var(--radius-3)]" delay={90} /></div><div className="grid grid-cols-3 gap-[16px] max-md:grid-cols-1">{Array.from({ length: 3 }, (_, index) => <SkeletonBlock key={index} className="h-[190px] rounded-[var(--radius-2)]" delay={index * 70} />)}</div></div>;
}

function WarrantiesPanelSkeleton() {
  return <div className="flex flex-col gap-[24px]"><div className="flex flex-wrap gap-[8px]"><SkeletonBlock className="h-[40px] w-[320px] max-w-full rounded-[var(--radius-2)]" /><SkeletonBlock className="h-[40px] w-[240px] max-w-full rounded-[var(--radius-2)]" delay={70} /></div><div className="flex flex-col">{Array.from({ length: 6 }, (_, index) => <div key={index} className="grid min-h-[56px] grid-cols-[1.3fr_1fr_1fr_1fr_80px_36px] items-center gap-[20px] border-b border-[var(--color-neutral-200)] max-md:grid-cols-[1fr_70px_36px]">{Array.from({ length: 6 }, (_, itemIndex) => <SkeletonBlock key={itemIndex} className={clsx("h-[12px] rounded-[var(--radius-1)]", itemIndex > 2 && "max-md:hidden")} delay={index * 45 + itemIndex * 20} tone={itemIndex === 0 ? "text" : "muted"} />)}</div>)}</div></div>;
}

function UploadPanelSkeleton() {
  return <div className="flex flex-col gap-[20px]"><SkeletonBlock className="h-[260px] w-full rounded-[var(--radius-3)]" /><div className="flex justify-between gap-[20px] max-sm:flex-col"><div className="flex flex-col gap-[8px]"><SkeletonBlock className="h-[12px] w-[220px] rounded-[var(--radius-1)]" tone="text" /><SkeletonBlock className="h-[11px] w-[310px] max-w-full rounded-[var(--radius-1)]" tone="muted" /></div><SkeletonBlock className="h-[40px] w-[132px] rounded-[var(--radius-2)]" delay={100} /></div>{Array.from({ length: 2 }, (_, index) => <SkeletonBlock key={index} className="h-[64px] w-full rounded-[var(--radius-2)]" delay={140 + index * 70} />)}</div>;
}

function ProjectDetailSkeleton({ section = "info" }) {
  const panels = { documents: <DocumentsPanelSkeleton />, info: <InfoPanelSkeleton />, renders: <RendersPanelSkeleton />, tracking: <TrackingPanelSkeleton />, upload: <UploadPanelSkeleton />, warranties: <WarrantiesPanelSkeleton /> };
  return <div className="flex w-full flex-col gap-[32px] py-[24px]"><ProjectDetailHeaderSkeleton activeSection={section} />{panels[section] || panels.info}</div>;
}

function Loader({ className, count = 1, label = "Cargando contenido", preset = "projectRow", section = "info" }) {
  const itemCount = Math.max(1, Math.floor(Number(count) || 1));
  let content;

  if (preset === "commentCard") {
    content = Array.from({ length: itemCount }, (_, index) => <CommentCardSkeleton key={index} />);
  } else if (preset === "projectDetail") {
    content = <ProjectDetailSkeleton section={section} />;
  } else if (preset === "requestRow") {
    content = Array.from({ length: itemCount }, (_, index) => <RequestRowSkeleton key={index} />);
  } else if (preset === "activityItem") {
    content = Array.from({ length: itemCount }, (_, index) => <ActivityItemSkeleton key={index} />);
  } else if (preset === "videoStage") {
    content = <VideoStageSkeleton />;
  } else if (preset === "documentPreview") {
    content = <DocumentPreviewSkeleton />;
  } else if (preset === "documentList") {
    content = <DocumentListSkeleton />;
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
