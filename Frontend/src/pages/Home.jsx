import { useState } from "react";
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
import { navigationBarMainComponent } from "../components/ui/NavigationBar/navigationBarShowcaseData.js";
import FooterSection from "../components/ui/FooterSection/FooterSection.jsx";
import {
  footerSectionMainComponent,
  footerSectionMobileComponent,
} from "../components/ui/FooterSection/footerSectionShowcaseData.js";
import SideNavigation from "../components/ui/SideNavigation/SideNavigation.jsx";
import {
  sideNavigationCollapsedComponent,
  sideNavigationMainComponent,
} from "../components/ui/SideNavigation/sideNavigationShowcaseData.js";
import DropdownMenu from "../components/ui/DropdownMenu/DropdownMenu.jsx";
import {
  dropdownMenuMainComponent,
  dropdownMenuQuickToggleItems,
} from "../components/ui/DropdownMenu/dropdownMenuShowcaseData.js";
import Notification from "../components/ui/Notification/Notification.jsx";
import {
  notificationMainComponent,
  notificationQuickToggleItems,
  notificationTypeItems,
} from "../components/ui/Notification/notificationShowcaseData.js";
import ListItem from "../components/ui/ListItem/ListItem.jsx";
import {
  listItemInteractiveExample,
  listItemMainComponent,
  listItemQuickToggleItems,
  listItemStateItems,
} from "../components/ui/ListItem/listItemShowcaseData.js";
import Button from "../components/ui/Button/Button.jsx";
import Tooltip from "../components/ui/Tooltip/Tooltip.jsx";
import {
  tooltipMainComponent,
  tooltipPositionItems,
  tooltipQuickToggleItems,
} from "../components/ui/Tooltip/tooltipShowcaseData.js";
import Alert from "../components/ui/Alert/Alert.jsx";
import {
  alertMainComponent,
  alertQuickToggleItems,
  alertStyleItems,
  alertThemeItems,
} from "../components/ui/Alert/alertShowcaseData.js";
import CommentPanel from "../components/ui/CommentPanel/CommentPanel.jsx";
import { commentPanelMainComponent } from "../components/ui/CommentPanel/commentPanelShowcaseData.js";
import NotificationsPanel from "../components/ui/NotificationsPanel/NotificationsPanel.jsx";
import { notificationsPanelMainComponent } from "../components/ui/NotificationsPanel/notificationsPanelShowcaseData.js";

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

function NotificationExample({ notificationProps }) {
  const [instanceKey, setInstanceKey] = useState(0);
  const [feedback, setFeedback] = useState("");

  return (
    <div className="flex w-full max-w-[347px] flex-col items-start gap-[12px]">
      <Notification
        key={instanceKey}
        {...notificationProps}
        onDismiss={() => setFeedback("Notificación cerrada.")}
        onPrimaryAction={() => setFeedback("Acción ejecutada: Ver cambios.")}
        onSecondaryAction={() => setFeedback("Acción ejecutada: Descartar.")}
      />

      {feedback ? (
        <div className="flex flex-wrap items-center gap-[12px] pl-[4px]">
          <span className="text-body-5 text-[var(--color-text-100)]">
            {feedback}
          </span>

          <button
            type="button"
            className="text-body-5 text-[var(--color-text-300)] underline decoration-current underline-offset-2"
            onClick={() => {
              setInstanceKey((current) => current + 1);
              setFeedback("");
            }}
          >
            Reiniciar ejemplo
          </button>
        </div>
      ) : null}
    </div>
  );
}

function TooltipInteractiveExample({ tooltipProps }) {
  return (
    <div className="flex min-h-[164px] w-full items-end justify-center pt-[56px]">
      <Tooltip {...tooltipProps}>
        <Button
          theme="Primary"
          type="Outline"
          size="S"
          fitContent
          showLeftIcon={false}
          showRightIcon={false}
        >
          Pasa el cursor
        </Button>
      </Tooltip>
    </div>
  );
}

function AlertExample({ alertProps }) {
  const [instanceKey, setInstanceKey] = useState(0);
  const [feedback, setFeedback] = useState("");

  return (
    <div className="flex w-full flex-col items-start gap-[12px]">
      <Alert
        key={instanceKey}
        {...alertProps}
        onDismiss={() => setFeedback("Alerta cerrada.")}
        onPrimaryAction={() =>
          setFeedback("Acción ejecutada: Realizar cambios.")
        }
        onSecondaryAction={() => setFeedback("Acción ejecutada: Descartar.")}
      />

      {feedback ? (
        <div className="flex flex-wrap items-center gap-[12px] pl-[4px]">
          <span className="text-body-5 text-[var(--color-text-100)]">
            {feedback}
          </span>

          <button
            type="button"
            className="text-body-5 text-[var(--color-text-300)] underline decoration-current underline-offset-2"
            onClick={() => {
              setInstanceKey((current) => current + 1);
              setFeedback("");
            }}
          >
            Reiniciar ejemplo
          </button>
        </div>
      ) : null}
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
              Alert
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Alert"
              className="w-full max-w-[754px]"
              previewClassName="w-full"
            >
              <AlertExample alertProps={alertMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Quick Toggle" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {alertQuickToggleItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[754px]"
                  previewClassName="w-full"
                >
                  <AlertExample alertProps={item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Theme" className="xl:col-span-12">
            <div className="flex flex-col gap-[12px]">
              {alertThemeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[1192px]"
                  previewClassName="w-full"
                >
                  <div className="flex w-full flex-col items-center gap-[20px]">
                    <AlertExample alertProps={item.props} />
                    <AlertExample
                      alertProps={{
                        ...item.props,
                        layout: "Full width",
                      }}
                    />
                  </div>
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Style" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {alertStyleItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={clsx(
                    "w-full",
                    item.label === "Box" ? "max-w-[754px]" : "max-w-[1192px]",
                  )}
                  previewClassName="w-full"
                >
                  <AlertExample alertProps={item.props} />
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
              Tooltip
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Tooltip"
              className="w-full max-w-[256px]"
              previewClassName="min-h-[96px] w-full"
            >
              <Tooltip {...tooltipMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Quick Toggle" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {tooltipQuickToggleItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[256px]"
                  previewClassName="min-h-[96px] w-full"
                >
                  <Tooltip {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Tip position" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {tooltipPositionItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[256px]"
                  previewClassName="min-h-[96px] w-full"
                >
                  <Tooltip {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Interactive" className="xl:col-span-12">
            <PreviewTile
              label="Hover / Focus"
              className="w-full max-w-[320px]"
              previewClassName="min-h-[180px] w-full"
            >
              <TooltipInteractiveExample
                tooltipProps={{
                  ...tooltipMainComponent,
                  tipPosition: "Top center",
                  showTip: true,
                  showSubtext: true,
                }}
              />
            </PreviewTile>
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Notification
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Notification"
              className="w-full max-w-[427px]"
              previewClassName="w-full"
            >
              <NotificationExample
                notificationProps={notificationMainComponent}
              />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Quick Toggle" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {notificationQuickToggleItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[427px]"
                  previewClassName="w-full"
                >
                  <NotificationExample notificationProps={item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Type" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {notificationTypeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[427px]"
                  previewClassName="w-full"
                >
                  <NotificationExample notificationProps={item.props} />
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
            <span className="text-label-small uppercase text-neutral-100-uniform">
              JPG
            </span>

            <span className="text-label-small uppercase text-neutral-100-uniform">
              MP4
            </span>
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

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Dropdown menu
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Dropdown menu item"
              className="w-full max-w-[384px]"
              previewClassName="w-full justify-start"
            >
              <div className="w-full max-w-[320px]">
                <DropdownMenu {...dropdownMenuMainComponent} />
              </div>
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Quick Toggle" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {dropdownMenuQuickToggleItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[384px]"
                  previewClassName="w-full justify-start"
                >
                  <div className="w-full max-w-[320px]">
                    <DropdownMenu {...item.props} />
                  </div>
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
              List item
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Default"
              className="w-full max-w-[490px]"
              previewClassName="w-full justify-start"
            >
              <div className="w-full max-w-[426px] overflow-hidden rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)]">
                <ListItem {...listItemMainComponent} />
              </div>
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Quick Toggle" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {listItemQuickToggleItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[490px]"
                  previewClassName="w-full justify-start"
                >
                  <div className="w-full max-w-[426px] overflow-hidden rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)]">
                    <ListItem {...item.props} />
                  </div>
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="State" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {listItemStateItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[490px]"
                  previewClassName="w-full justify-start"
                >
                  <div className="w-full max-w-[426px] overflow-hidden rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)]">
                    <ListItem {...item.props} />
                  </div>
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
              Comment panel
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Comment Panel"
              className="w-full max-w-[490px]"
              previewClassName="w-full justify-start"
            >
              <CommentPanel {...commentPanelMainComponent} />
            </PreviewTile>
          </ShowcaseCard>
        </div>
      </section>
      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Notifications panel
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Notifications Panel"
              className="w-full max-w-[490px]"
              previewClassName="w-full justify-start"
            >
              <NotificationsPanel {...notificationsPanelMainComponent} />
            </PreviewTile>
          </ShowcaseCard>
        </div>
      </section>
    </main>
  );
}

export default Home;
