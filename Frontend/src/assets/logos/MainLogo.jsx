import { useEffect, useState } from "react";
import clsx from "clsx";

import logo20 from "./SIZE=20px.svg";
import logo20Dark from "./SIZE=20px-dark.svg";
import logo24 from "./SIZE=24px.svg";
import logo24Dark from "./SIZE=24px-dark.svg";
import logo32 from "./SIZE=32px.svg";
import logo32Dark from "./SIZE=32px-dark.svg";
import logo48 from "./SIZE=48px.svg";
import logo48Dark from "./SIZE=48px-dark.svg";
import logo64 from "./SIZE=64px.svg";
import logo64Dark from "./SIZE=64px-dark.svg";
import logo200 from "./SIZE=200px.svg";
import logo200Dark from "./SIZE=200px-dark.svg";

const LOGO_MAP = {
  light: {
    "20px": logo20,
    "24px": logo24,
    "32px": logo32,
    "48px": logo48,
    "64px": logo64,
    "200px": logo200,
  },
  dark: {
    "20px": logo20Dark,
    "24px": logo24Dark,
    "32px": logo32Dark,
    "48px": logo48Dark,
    "64px": logo64Dark,
    "200px": logo200Dark,
  },
};

function getDocumentDarkMode() {
  if (typeof document === "undefined") {
    return false;
  }

  return (
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark")
  );
}

function MainLogo({
  size = "32px",
  alt = "Main logo",
  className,
  imgClassName,
  ...props
}) {
  const [isDarkMode, setIsDarkMode] = useState(getDocumentDarkMode);
  const resolvedSize = LOGO_MAP.light[size] ? size : "32px";
  const logoSrc = isDarkMode
    ? LOGO_MAP.dark[resolvedSize]
    : LOGO_MAP.light[resolvedSize];

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const html = document.documentElement;
    const body = document.body;

    const observer = new MutationObserver(() => {
      setIsDarkMode(getDocumentDarkMode());
    });

    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class"],
    });

    if (body) {
      observer.observe(body, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={clsx("inline-flex items-center justify-center", className)}
      {...props}
    >
      <img
        src={logoSrc}
        alt={alt}
        className={clsx("block h-auto max-w-full", imgClassName)}
      />
    </div>
  );
}

export default MainLogo;
