import { useRef } from "react";

import useScrollDirectionVisibility from "../hooks/useScrollDirectionVisibility.js";
import NavigationBar from "./ui/NavigationBar/NavigationBar.jsx";

const ENVIRONMENT_NAVBAR_CLASS_NAME =
  "mx-auto w-full max-w-[1200px] px-[16px] py-[12px] min-[768px]:px-[24px] min-[1024px]:px-[48px]";

function formatEnvironmentDate(date = new Date()) {
  const dateLabel = new Intl.DateTimeFormat("es-VE", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);

  return dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
}

function EnvironmentNavigationBar(props) {
  const navbarRef = useRef(null);

  useScrollDirectionVisibility(navbarRef);

  return (
    <div
      ref={navbarRef}
      className="sticky top-0 z-30 w-full shrink-0 bg-[var(--color-neutral-bg)] will-change-transform"
      data-scroll-direction-navbar
    >
      <NavigationBar
        {...props}
        variant="utility"
        showUtilityMenu={Boolean(props.onMenuClick)}
        utilityText={formatEnvironmentDate()}
        className={ENVIRONMENT_NAVBAR_CLASS_NAME}
      />
    </div>
  );
}

export default EnvironmentNavigationBar;
