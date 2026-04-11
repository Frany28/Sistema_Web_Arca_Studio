import clsx from "clsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import ProgressStepBase from "../components/ui/ProgressStepBase.jsx";
import ProgressStepGroup from "../components/ui/ProgressStepGroup.jsx";
import FileAttachmentIcons from "../components/ui/FileAttachmentIcons.jsx";
import FileUploadSection from "../components/ui/FileUploadSection/FileUploadSection.jsx";
import EmptyState from "../components/ui/EmptyState/EmptyState.jsx";
import {
  progressStepBaseFeaturedIconStateItems,
  progressStepBaseMainComponent,
  progressStepBaseLineTextStateItems,
  progressStepBaseNumberedStateItems,
  progressStepBaseQuickToggleItems,
  progressStepBaseSizeItems,
  progressStepBaseTypeItems,
} from "../components/ui/ProgressStepBase/progressStepBaseShowcaseData.js";
import {
  progressStepGroupMainComponent,
  progressStepGroupProgressRows,
  progressStepGroupTypeItems,
} from "../components/ui/ProgressStepGroup/progressStepGroupShowcaseData.js";
import { fileAttachmentIconsShowcaseItems } from "../components/ui/FileAttachmentIcons/fileAttachmentIconsShowcaseData.js";
import { fileUploadSectionMainComponent } from "../components/ui/FileUploadSection/fileUploadSectionShowcaseData.js";
import {
  emptyStateMainComponent,
  emptyStateQuickToggleItems,
  emptyStateSizeItems,
} from "../components/ui/EmptyState/emptyStateShowcaseData.js";
import NavigationBar from "../components/ui/NavigationBar/NavigationBar.jsx";
import {
  navigationBarMainComponent,
} from "../components/ui/NavigationBar/navigationBarShowcaseData.js";
import FooterSection from "../components/ui/FooterSection/FooterSection.jsx";
import {
  footerSectionMainComponent,
  footerSectionMobileComponent,
} from "../components/ui/FooterSection/footerSectionShowcaseData.js";
import SideNavigation from "../components/ui/SideNavigation/SideNavigation.jsx";
import { sideNavigationMainComponent } from "../components/ui/SideNavigation/sideNavigationShowcaseData.js";

function ShowcaseCard({ title, children, className }) {
  return (
    <section
      className={clsx(
        "flex flex-col gap-4 rounded-[20px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-6",
        className,
      )}
    >
      <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
        {title}
      </span>
      {children}
    </section>
  );
}

function PreviewTile({ label, children, className, previewClassName }) {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)]",
        className,
      )}
    >
      <div
        className={clsx(
          "flex items-center justify-center p-[16px]",
          previewClassName,
        )}
      >
        {children}
      </div>

      <div className="border-t border-[var(--color-neutral-200)] px-[8px] py-[6px]">
        <span className="text-[12px] leading-[20px] font-medium tracking-[-0.5px] text-[var(--color-text-300)]">
          {label}
        </span>
      </div>
    </div>
  );
}

function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] px-6 py-10 text-[var(--color-text-50)] transition-colors duration-200">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Progress step base
            </span>
            <h1 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h1>
          </div>

          <ThemeToggle />
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-4">
            <PreviewTile
              label="Numbered / Completed / M"
              className="w-full max-w-[336px]"
              previewClassName="min-h-[120px] w-full"
            >
              <ProgressStepBase {...progressStepBaseMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Quick Toggle" className="xl:col-span-8">
            <div className="flex flex-wrap items-start gap-[12px]">
              {progressStepBaseQuickToggleItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[336px]"
                  previewClassName={clsx(
                    "w-full",
                    item.label === "Base" ? "min-h-[99px]" : "min-h-[120px]",
                  )}
                >
                  <ProgressStepBase {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Type" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {progressStepBaseTypeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[336px]"
                  previewClassName={clsx(
                    "w-full",
                    item.label === "Line text"
                      ? "min-h-[63px]"
                      : "min-h-[99px]",
                  )}
                >
                  <ProgressStepBase {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="State / Line text" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {progressStepBaseLineTextStateItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[336px]"
                  previewClassName="min-h-[82px] w-full"
                >
                  <ProgressStepBase {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="State / Numbered" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {progressStepBaseNumberedStateItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[336px]"
                  previewClassName="min-h-[120px] w-full"
                >
                  <ProgressStepBase {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            title="State / Featured icon"
            className="xl:col-span-12"
          >
            <div className="flex flex-wrap items-start gap-[12px]">
              {progressStepBaseFeaturedIconStateItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[336px]"
                  previewClassName="min-h-[120px] w-full"
                >
                  <ProgressStepBase {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Size" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {progressStepBaseSizeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[336px]"
                  previewClassName={clsx(
                    "w-full",
                    item.label === "S"
                      ? "min-h-[107px]"
                      : item.label === "M"
                        ? "min-h-[120px]"
                        : "min-h-[132px]",
                  )}
                >
                  <ProgressStepBase {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Progress step group
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Table header label"
              className="w-full max-w-[1008px]"
              previewClassName="min-h-[152px] w-full overflow-x-auto"
            >
              <ProgressStepGroup {...progressStepGroupMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Type" className="xl:col-span-12">
            <div className="flex flex-col gap-[12px]">
              {progressStepGroupTypeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[1008px]"
                  previewClassName="min-h-[152px] w-full overflow-x-auto"
                >
                  <ProgressStepGroup {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Progress" className="xl:col-span-12">
            <div className="overflow-x-auto">
              <div className="flex min-w-[976px] flex-col gap-[20px]">
                {progressStepGroupProgressRows.map((item, index) => (
                  <ProgressStepGroup
                    key={`${item.type}-${item.size}-${index}`}
                    {...item}
                  />
                ))}
              </div>
            </div>
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              File upload section
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Attachment icons
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Saved icons" className="xl:col-span-12">
            <div className="overflow-x-auto rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[20px]">
              <div className="flex min-w-max items-center gap-[20px]">
                {fileAttachmentIconsShowcaseItems.map((item) => (
                  <FileAttachmentIcons
                    key={item.type}
                    type={item.type}
                    aria-label={`File type ${item.label}`}
                  />
                ))}
              </div>
            </div>
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              File upload section
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="File upload section"
              className="w-full max-w-[592px]"
              previewClassName="min-h-[560px] w-full"
            >
              <FileUploadSection {...fileUploadSectionMainComponent} />
            </PreviewTile>
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Empty state
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-4">
            <PreviewTile
              label="Empty State"
              className="w-full max-w-[360px]"
              previewClassName="w-full"
            >
              <EmptyState {...emptyStateMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Quick Toggle" className="xl:col-span-8">
            <div className="flex flex-wrap items-start gap-[12px]">
              {emptyStateQuickToggleItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[325px]"
                  previewClassName="w-full"
                >
                  <EmptyState {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Size" className="xl:col-span-8">
            <div className="flex flex-wrap items-start gap-[12px]">
              {emptyStateSizeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={clsx(
                    "w-full",
                    item.label === "S" ? "max-w-[325px]" : "max-w-[360px]",
                  )}
                  previewClassName="w-full"
                >
                  <EmptyState {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Navigation bar
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Navigation bar"
              className="w-full"
              previewClassName="w-full overflow-x-auto"
            >
              <NavigationBar {...navigationBarMainComponent} />
            </PreviewTile>
          </ShowcaseCard>
        </div>

        <ShowcaseCard title="Mobile" className="xl:col-span-12">
          <PreviewTile
            label="Mobile"
            className="w-full max-w-[640px]"
            previewClassName="w-full"
          >
            <NavigationBar
              {...navigationBarMainComponent}
              variant="mobile"
              showContactButton={false}
              showLoginButton={false}
            />
          </PreviewTile>
        </ShowcaseCard>
        <ShowcaseCard title="Utility" className="xl:col-span-12">
          <PreviewTile
            label="Utility"
            className="w-full max-w-[1128px]"
            previewClassName="w-full"
          >
            <NavigationBar
              {...navigationBarMainComponent}
              variant="utility"
              showContactButton={false}
              showLoginButton={false}
              utilityText="Lunes, 23 de Marzo"
            />
          </PreviewTile>
        </ShowcaseCard>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Footer section
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Top section" className="xl:col-span-12">
            <PreviewTile
              label="Desktop"
              className="w-full"
              previewClassName="w-full justify-start overflow-x-auto"
            >
              <FooterSection {...footerSectionMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Mobile" className="xl:col-span-12">
            <PreviewTile
              label="Mobile"
              className="w-full max-w-[420px]"
              previewClassName="w-full justify-start"
            >
              <FooterSection {...footerSectionMobileComponent} />
            </PreviewTile>
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Side navigation
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Expanded" className="xl:col-span-12">
            <PreviewTile
              label="Side navigation"
              className="w-full max-w-[376px]"
              previewClassName="w-full justify-start p-0"
            >
              <SideNavigation {...sideNavigationMainComponent} />
            </PreviewTile>
          </ShowcaseCard>
        </div>
      </section>
    </main>
  );
}

export default Home;
