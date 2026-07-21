import clsx from "clsx";
import AvatarLabel from "../../../components/ui/AvatarLabel/AvatarLabel.jsx";
import Button from "../../../components/ui/Button/Button.jsx";
import FileAttachmentIcons from "../../../components/ui/FileAttachmentIcons/FileAttachmentIcons.jsx";
import { getFileDisplayName } from "../../../utils/fileDisplayName.js";

function ExportIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M11.667 8.333L17.5 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.333 6.667V1.667H13.333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.167 1.667H7.5C3.333 1.667 1.667 3.333 1.667 7.5V12.5C1.667 16.667 3.333 18.333 7.5 18.333H12.5C16.667 18.333 18.333 16.667 18.333 12.5V10.833"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProjectDocumentCard({ document }) {
  if (!document) {
    return null;
  }

  const isEmptyState = document.emptyState === true;

  return (
    <article className="flex w-full items-center gap-[24px] bg-[var(--color-neutral-100)] p-[16px] max-[720px]:flex-wrap max-[520px]:gap-[16px]">
      <div className="flex min-w-0 flex-1 items-center gap-[12px]">
        <FileAttachmentIcons
          type={document.fileType}
          className={clsx(
            "h-[40px] w-[35px] shrink-0",
            isEmptyState && "opacity-50",
          )}
        />

        <div className="flex min-w-0 flex-col">
          <p
            className={clsx(
              "truncate text-heading-8",
              isEmptyState
                ? "text-[var(--color-neutral-400)]"
                : "text-[var(--color-text-300)]",
            )}
          >
            {getFileDisplayName(document.name)}
          </p>
          {!isEmptyState ? (
            <p className="truncate text-body-3 text-[var(--color-text-100)]">
              {document.size}
              {document.uploadedAt ? ` • ${document.uploadedAt}` : ""}
            </p>
          ) : null}
        </div>
      </div>

      {!isEmptyState ? (
        <AvatarLabel
          size="S"
          label={document.owner}
          showSubtitle={false}
          avatarTheme="Neutral"
          avatarContent="Icon"
          avatarDecorative
          className="shrink-0"
          textClassName="text-[var(--color-text-300)]"
        />
      ) : null}

      <Button
        theme="Primary"
        type="Outline"
        size="S"
        fitContent
        showLeftIcon
        showRightIcon={false}
        iconLeft={<ExportIcon className="size-5" />}
        className={clsx(
          "shrink-0",
          isEmptyState &&
            "border-[var(--color-neutral-400)] bg-transparent text-[var(--color-neutral-400)]",
        )}
        disabled={isEmptyState}
      >
        Abrir
      </Button>
    </article>
  );
}
