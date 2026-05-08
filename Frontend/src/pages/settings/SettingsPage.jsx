import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthToast, {
  AuthToastLockIcon,
} from "../../components/ui/AuthToast/AuthToast.jsx";
import NavigationBar from "../../components/ui/NavigationBar/NavigationBar.jsx";
import NotificationsDrawer from "../../components/ui/NotificationsDrawer.jsx";
import ProjectRequestModal from "../../components/ui/ProjectRequestModal.jsx";
import SideNavigation from "../../components/ui/SideNavigation/SideNavigation.jsx";
import SettingsVerticalTabMenu from "../../components/ui/SettingsVerticalTabMenu.jsx";
import {
  CLIENT_DRAWER_COMMENTS,
  CLIENT_DRAWER_RECENT_ACTIVITY,
} from "../clientDrawerData.js";
import PreferencesPanel from "./panels/PreferencesPanel.jsx";
import ProfilePanel from "./panels/ProfilePanel.jsx";
import SecurityPanel from "./panels/SecurityPanel.jsx";
import SupportPanel from "./panels/SupportPanel.jsx";
import AvatarUploadModal from "./components/AvatarUploadModal.jsx";
import { SendIcon } from "./settingsIcons.jsx";
import {
  applyThemePreference,
  getThemePreferenceFromDocument,
} from "./themeUtils.js";

const EXPANDED_SIDEBAR_WIDTH = 312;
const COLLAPSED_SIDEBAR_WIDTH = 76;
const TABLET_BREAKPOINT_PX = 768;

export default function SettingsPage() {
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
    useState(false);
  const [isProjectRequestModalOpen, setIsProjectRequestModalOpen] =
    useState(false);
  const [activeSettingsTabId, setActiveSettingsTabId] = useState("profile");

  const [profileName, setProfileName] = useState("John Doe");
  const [companyName, setCompanyName] = useState("Next C.A.");
  const [email] = useState("usuario@gmail.com");
  const [primaryPhone] = useState("(444) 1234-5678");
  const [secondaryPhone] = useState("(444) 1234-5678");
  const [avatarInitials] = useState("JS");
  const [avatarSrc, setAvatarSrc] = useState("");
  const [isAvatarUploadModalOpen, setIsAvatarUploadModalOpen] =
    useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [themePreference, setThemePreference] = useState(
    getThemePreferenceFromDocument,
  );
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [commentsNotificationsEnabled, setCommentsNotificationsEnabled] =
    useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(false);
  const [whatsappNotificationsEnabled, setWhatsappNotificationsEnabled] =
    useState(false);
  const [supportIssueType, setSupportIssueType] = useState(null);
  const [isSupportIssueTypeMenuOpen, setIsSupportIssueTypeMenuOpen] =
    useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportDescription, setSupportDescription] = useState("");
  const [supportToastTrigger, setSupportToastTrigger] = useState(0);
  const [passwordToastTrigger, setPasswordToastTrigger] = useState(0);

  const todayLabel = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const formattedTodayLabel =
    todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${TABLET_BREAKPOINT_PX - 1}px)`,
    );

    function syncSidebarForViewport(event) {
      setIsSidebarExpanded(!event.matches);
    }

    syncSidebarForViewport(mediaQuery);
    mediaQuery.addEventListener("change", syncSidebarForViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncSidebarForViewport);
    };
  }, []);

  useEffect(() => () => {
    if (avatarSrc) {
      URL.revokeObjectURL(avatarSrc);
    }
  }, [avatarSrc]);

  const handleSideNavigationSelect = (item) => {
    if (item?.id === "dashboard") {
      navigate("/dashboard-clientes");
      return;
    }

    if (item?.id === "project-1" || item?.id === "project-2") {
      navigate("/proyectos/quinta-bella-vista");
      return;
    }

    if (item?.id === "more-projects") {
      navigate("/proyectos/quinta-bella-vista");
      return;
    }

    if (item?.id === "settings") {
      navigate("/configuraciones");
    }
  };

  const handleActivitySelect = (activity) => {
    if (!activity?.to) {
      return;
    }

    setIsNotificationsDrawerOpen(false);
    navigate(activity.to);
  };

  const passwordRequirements = [
    {
      id: "uppercase",
      label: "Al menos 1 mayúscula",
      test: (value) => /[A-Z]/.test(value),
    },
    {
      id: "number",
      label: "Al menos 1 número",
      test: (value) => /\d/.test(value),
    },
    {
      id: "special",
      label: "Al menos 1 carácter especial",
      test: (value) => /[^A-Za-z0-9]/.test(value),
    },
    {
      id: "length",
      label: "Al menos 8 caracteres",
      test: (value) => value.length >= 8,
    },
  ];

  let activePanel = (
    <ProfilePanel
      profileName={profileName}
      setProfileName={setProfileName}
      companyName={companyName}
      setCompanyName={setCompanyName}
      email={email}
      primaryPhone={primaryPhone}
      secondaryPhone={secondaryPhone}
      avatarInitials={avatarInitials}
      avatarSrc={avatarSrc}
      onUploadImageClick={() => setIsAvatarUploadModalOpen(true)}
    />
  );

  if (activeSettingsTabId === "security") {
    activePanel = (
      <SecurityPanel
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        passwordRequirements={passwordRequirements}
        onSubmit={() => setPasswordToastTrigger((current) => current + 1)}
      />
    );
  } else if (activeSettingsTabId === "preferences") {
    activePanel = (
      <PreferencesPanel
        themePreference={themePreference}
        setThemePreference={setThemePreference}
        isThemeMenuOpen={isThemeMenuOpen}
        setIsThemeMenuOpen={setIsThemeMenuOpen}
        commentsNotificationsEnabled={commentsNotificationsEnabled}
        setCommentsNotificationsEnabled={setCommentsNotificationsEnabled}
        emailNotificationsEnabled={emailNotificationsEnabled}
        setEmailNotificationsEnabled={setEmailNotificationsEnabled}
        whatsappNotificationsEnabled={whatsappNotificationsEnabled}
        setWhatsappNotificationsEnabled={setWhatsappNotificationsEnabled}
        applyThemePreference={applyThemePreference}
      />
    );
  } else if (activeSettingsTabId === "support") {
    activePanel = (
      <SupportPanel
        supportIssueType={supportIssueType}
        setSupportIssueType={setSupportIssueType}
        isSupportIssueTypeMenuOpen={isSupportIssueTypeMenuOpen}
        setIsSupportIssueTypeMenuOpen={setIsSupportIssueTypeMenuOpen}
        supportSubject={supportSubject}
        setSupportSubject={setSupportSubject}
        supportDescription={supportDescription}
        setSupportDescription={setSupportDescription}
        onSubmit={() => setSupportToastTrigger((current) => current + 1)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] transition-colors duration-200">
      <div className="flex min-h-screen w-full items-stretch">
        <SideNavigation
          activeItemId="settings"
          expanded={isSidebarExpanded}
          onExpandedChange={setIsSidebarExpanded}
          onItemSelect={handleSideNavigationSelect}
          onNewOpportunityClick={() => setIsProjectRequestModalOpen(true)}
          onLogoutClick={() => navigate("/")}
          className="min-h-screen shrink-0 self-stretch"
        />

        <div className="relative flex min-h-screen min-w-0 flex-1 flex-col self-stretch overflow-y-auto transition-[width] duration-300 ease-out">
          <AuthToast
            trigger={supportToastTrigger > 0 ? supportToastTrigger : null}
            title="Tu solicitud fue enviada"
            description="Estaremos verificando la información y te contactaremos en breve."
            leading={
              <span className="inline-flex items-center justify-center rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[8px] shadow-[var(--shadow-e1)] text-[var(--color-text-300)]">
                <SendIcon className="size-5" />
              </span>
            }
            autoHideMs={4200}
          />
          <AuthToast
            trigger={passwordToastTrigger > 0 ? passwordToastTrigger : null}
            title="Contraseña restablecida"
            description="Tu contraseña ha sido actualizada con éxito. Por razones de seguridad, por favor verifica la actividad reciente."
            leading={<AuthToastLockIcon />}
            autoHideMs={4200}
          />

          <NavigationBar
            variant="utility"
            utilityText={formattedTodayLabel}
            utilityActionActive={isNotificationsDrawerOpen}
            onUtilityActionClick={() =>
              setIsNotificationsDrawerOpen((current) => !current)
            }
            className="mx-auto w-full max-w-[1200px] px-[var(--spacing-spacing-gap-8,48px)] py-[var(--spacing-spacing-gap-4,12px)]"
          />

          <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-start px-[48px] pt-[48px]">
            <section className="flex w-full min-w-0 items-start gap-12 self-stretch">
              <SettingsVerticalTabMenu
                activeItemId={activeSettingsTabId}
                onChange={setActiveSettingsTabId}
              />
              <div className="min-w-0 flex-1">{activePanel}</div>
            </section>
          </div>

          <NotificationsDrawer
            open={isNotificationsDrawerOpen}
            onClose={() => setIsNotificationsDrawerOpen(false)}
            comments={CLIENT_DRAWER_COMMENTS}
            recentActivity={CLIENT_DRAWER_RECENT_ACTIVITY}
            onActivitySelect={handleActivitySelect}
          />
          <ProjectRequestModal
            open={isProjectRequestModalOpen}
            onClose={() => setIsProjectRequestModalOpen(false)}
            onPrevious={() => setIsProjectRequestModalOpen(false)}
            onNext={() => setIsProjectRequestModalOpen(false)}
          />
          <AvatarUploadModal
            open={isAvatarUploadModalOpen}
            onClose={() => setIsAvatarUploadModalOpen(false)}
            onConfirm={(file) => {
              if (!file.type.startsWith("image/")) {
                setIsAvatarUploadModalOpen(false);
                return;
              }

              const objectUrl = URL.createObjectURL(file);
              setAvatarSrc((currentValue) => {
                if (currentValue) {
                  URL.revokeObjectURL(currentValue);
                }

                return objectUrl;
              });
              setIsAvatarUploadModalOpen(false);
            }}
          />
        </div>
      </div>
    </main>
  );
}
