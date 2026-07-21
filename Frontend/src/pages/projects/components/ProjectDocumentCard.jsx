import clsx from "clsx";
import AvatarLabel from "../../../components/ui/AvatarLabel/AvatarLabel.jsx";
import FileAttachmentIcons from "../../../components/ui/FileAttachmentIcons/FileAttachmentIcons.jsx";
import { getFileDisplayName } from "../../../utils/fileDisplayName.js";

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
          avatarContent={document.ownerAvatarSrc ? "Image" : "Text"}
          avatarSrc={document.ownerAvatarSrc}
          avatarName={document.owner}
          avatarDecorative={false}
          className="shrink-0"
          textClassName="text-[var(--color-text-300)]"
        />
      ) : null}

    </article>
  );
}
