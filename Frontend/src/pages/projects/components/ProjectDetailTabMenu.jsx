import HorizontalTabMenu from "../../../components/ui/HorizontalTabMenu/HorizontalTabMenu.jsx";
import { PROJECT_DETAIL_TABS } from "../projectDetailsData.js";

export default function ProjectDetailTabMenu({ activeIndex = 0, onChange }) {
  return (
    <HorizontalTabMenu
      items={PROJECT_DETAIL_TABS}
      activeIndex={activeIndex}
      style="Underlined"
      filled="off"
      interactive
      onChange={onChange}
      className="w-full"
      aria-label="Secciones del proyecto"
    />
  );
}
