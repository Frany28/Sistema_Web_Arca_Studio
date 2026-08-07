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
  return (
    <NavigationBar
      {...props}
      variant="utility"
      showUtilityMenu={Boolean(props.onMenuClick)}
      utilityText={formatEnvironmentDate()}
      className={ENVIRONMENT_NAVBAR_CLASS_NAME}
    />
  );
}

export default EnvironmentNavigationBar;
