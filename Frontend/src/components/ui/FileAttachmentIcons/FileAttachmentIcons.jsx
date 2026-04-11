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
  CAD: { label: "DWG", color: "bg-[#344054]", nodeId: "2061:24078" },
  SKP: { label: "SKP", color: "bg-[#344054]", nodeId: "2061:24085" },
};

function FilePageOutline() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

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

    return () => {
      observer.disconnect();
    };
  }, []);

  const fill = isDarkMode
    ? "var(--color-neutral-100-uniform)"
    : "var(--color-neutral-100)";
  const stroke = "var(--color-neutral-200)";

  return (
    <svg
      viewBox="0 0 30 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-y-0 right-0 h-[40px] w-[30px]"
      aria-hidden="true"
    >
      <path
        d="M6.5 1.5H20.95L28.5 9.05V36.5C28.5 37.6046 27.6046 38.5 26.5 38.5H6.5C5.39543 38.5 4.5 37.6046 4.5 36.5V3.5C4.5 2.39543 5.39543 1.5 6.5 1.5Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
      <path
        d="M20.5 1.85V7.5C20.5 8.60457 21.3954 9.5 22.5 9.5H28.15"
        stroke={stroke}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function FileAttachmentIcons({
  className,
  type = "AI",
  "aria-label": ariaLabel,
  ...props
}) {
  const variant = FILE_ATTACHMENT_ICON_VARIANTS[type] ?? FILE_ATTACHMENT_ICON_VARIANTS.AI;

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
          "absolute bottom-[5px] left-0 inline-flex items-center overflow-hidden rounded-[4px] px-[2.5px] py-[2px]",
          variant.color,
        )}
      >
        <span className="font-['Inter:Medium',sans-serif] text-[10px] leading-[9px] tracking-[0.5px] text-[var(--color-neutral-100-uniform)] uppercase">
          {variant.label}
        </span>
      </div>
    </div>
  );
}

export default FileAttachmentIcons;
