import HomeScrollPanel from "../../../components/ui/HomeScrollPanel/HomeScrollPanel.jsx";
import HomeStatementPanel from "../../../components/ui/HomeStatementPanel/HomeStatementPanel.jsx";
import { HOME_SCROLL_PHASES } from "../../../utils/homeScrollNavigation.js";
import { HOME_IMAGE_PANELS, HOME_STATEMENT } from "../homeContent.js";

function HomeSections({
  active,
  navigationState,
  onInitialTitleReveal,
  statementPanelIndex,
  statementProgress,
}) {
  return (
    <>
      {HOME_IMAGE_PANELS.map((panel, panelIndex) => (
        <HomeScrollPanel
          key={panel.title}
          {...panel}
          onTitleRevealComplete={
            panelIndex === 0 ? onInitialTitleReveal : undefined
          }
          titleVisible={
            active &&
            navigationState.panelIndex === panelIndex &&
            navigationState.phase === HOME_SCROLL_PHASES.TITLE
          }
        />
      ))}
      <HomeStatementPanel
        active={active && navigationState.panelIndex === statementPanelIndex}
        effectStarted={
          active &&
          navigationState.panelIndex === statementPanelIndex &&
          navigationState.phase !== HOME_SCROLL_PHASES.IMAGE
        }
        mediaEnabled={active}
        {...HOME_STATEMENT}
        progress={statementProgress}
        statementVisible={
          active &&
          navigationState.panelIndex === statementPanelIndex &&
          navigationState.phase === HOME_SCROLL_PHASES.TITLE
        }
      />
    </>
  );
}

export default HomeSections;
