import clsx from "clsx";

import logo20 from "./SIZE=20px.svg";
import logo24 from "./SIZE=24px.svg";
import logo32 from "./SIZE=32px.svg";
import logo48 from "./SIZE=48px.svg";
import logo64 from "./SIZE=64px.svg";
import logo200 from "./SIZE=200px.svg";

const LOGO_MAP = {
  "20px": logo20,
  "24px": logo24,
  "32px": logo32,
  "48px": logo48,
  "64px": logo64,
  "200px": logo200,
};

function MainLogo({
  size = "32px",
  alt = "Main logo",
  className,
  imgClassName,
  ...props
}) {
  const resolvedSize = LOGO_MAP[size] ? size : "32px";
  const logoSrc = LOGO_MAP[resolvedSize];

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
