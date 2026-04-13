import clsx from "clsx";
import { useEffect, useState } from "react";

const FILE_ATTACHMENT_ICON_VARIANTS = {
  AI: { label: "AI", color: "bg-[#FF5C00]", nodeId: "2061:23994" },
  DOC: { label: "DOC", color: "bg-[#3873FF]", nodeId: "2061:24001" },
  GIF: { label: "GIF", color: "bg-[#6E45F0]", nodeId: "2061:24008" },
  JPG: { label: "JPG", color: "bg-[#3873FF]", nodeId: "2061:24015" },
  MP4: { label: "MP4", color: "bg-[#6E45F0]", nodeId: "2061:24022" },
  PDF: { label: "PDF", color: "bg-[#FF1607]", nodeId: "2061:24029" },
  PNG: { label: "PNG", color: "bg-[#3873FF]", nodeId: "2061:24036" },
  PPT: { label: "PPT", color: "bg-[#FF1607]", nodeId: "2061:24043" },
  PSD: { label: "PSD", color: "bg-[#3873FF]", nodeId: "2061:24050" },
  SVG: { label: "SVG", color: "bg-[#3873FF]", nodeId: "2061:24057" },
  TXT: { label: "TXT", color: "bg-[#344054]", nodeId: "2061:24064" },
  OBJ: { label: "OBJ", color: "bg-[#344054]", nodeId: "2061:24071" },
  DWG: { label: "DWG", color: "bg-[#344054]", nodeId: "2061:24078" },
  CAD: { label: "DWG", color: "bg-[#344054]", nodeId: "2061:24078" },
  SKP: { label: "SKP", color: "bg-[#344054]", nodeId: "2061:24085" },
};

function FilePageOutline() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const root = document.documentElement;

    const syncTheme = () => {
      setIsDarkMode(root.classList.contains("dark"));
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const fill = isDarkMode
    ? "var(--color-neutral-100-uniform)"
    : "var(--color-neutral-100)";

  const stroke = "var(--color-neutral-200)";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="35"
      height="40"
      viewBox="0 0 35 40"
      fill="none"
      className="absolute inset-0 h-[40px] w-[35px]"
      aria-hidden="true"
    >
      <g clipPath="url(#clip0_file_attachment_icon)">
        <path
          d="M5 4C5 1.79086 6.79086 0 9 0H22.5L35 12.5V36C35 38.2091 33.2091 40 31 40H9C6.79086 40 5 38.2091 5 36V4Z"
          fill={fill}
        />
        <path
          d="M5 36V4C5 1.79086 6.79086 0 9 0H22.5L35 12.5V36C35 38.2091 33.2091 40 31 40V38.5C32.3807 38.5 33.5 37.3807 33.5 36V13.1211L21.8789 1.5H9C7.61929 1.5 6.5 2.61929 6.5 4V36C6.5 37.3807 7.61929 38.5 9 38.5V40L8.79395 39.9951C6.68056 39.8879 5 38.14 5 36ZM31 38.5V40H9V38.5H31Z"
          fill={stroke}
        />
        <path
          d="M21.25 10V1C21.25 0.585786 21.5858 0.25 22 0.25C22.4142 0.25 22.75 0.585786 22.75 1V10C22.75 11.2426 23.7574 12.25 25 12.25H34C34.4142 12.25 34.75 12.5858 34.75 13C34.75 13.4142 34.4142 13.75 34 13.75H25C22.9289 13.75 21.25 12.0711 21.25 10Z"
          fill={stroke}
        />
      </g>

      <defs>
        <clipPath id="clip0_file_attachment_icon">
          <rect width="30" height="40" fill="white" transform="translate(5)" />
        </clipPath>
      </defs>
    </svg>
  );
}

function normalizeFileType(type) {
  if (!type) return "AI";

  const normalized = String(type).trim().toUpperCase();

  const aliases = {
    JPEG: "JPG",
    TEXT: "TXT",
  };

  return aliases[normalized] ?? normalized;
}

function FileAttachmentIcons({
  className,
  type = "AI",
  "aria-label": ariaLabel,
  ...props
}) {
  const normalizedType = normalizeFileType(type);
  const variant =
    FILE_ATTACHMENT_ICON_VARIANTS[normalizedType] ??
    FILE_ATTACHMENT_ICON_VARIANTS.AI;

  return (
    <div
      className={clsx("relative h-[40px] w-[35px] shrink-0", className)}
      data-node-id={variant.nodeId}
      aria-label={ariaLabel ?? `File attachment icon ${variant.label}`}
      {...props}
    >
      <FilePageOutline />

      <div
        className={clsx(
          "absolute bottom-[4.75px] left-0 inline-flex items-center justify-center rounded-[4px] px-[2.5px] py-[2px]",
          variant.color,
        )}
      >
        <span className="text-label-small uppercase text-neutral-100-uniform text-center leading-none">
          {variant.label}
        </span>
      </div>
    </div>
  );
}

export default FileAttachmentIcons;
