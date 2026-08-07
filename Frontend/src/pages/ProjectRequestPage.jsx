import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CloudPlus, Edit2, InfoCircle, Link21, Location } from "iconsax-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";
import { useRecentProjects } from "../auth/RecentProjectsContext.jsx";
import { getUserDisplay } from "../auth/userDisplay.js";
import Alert from "../components/ui/Alert/Alert.jsx";
import Button from "../components/ui/Button/Button.jsx";
import Checkbox from "../components/ui/Checkbox/Checkbox.jsx";
import DropdownMenu from "../components/ui/DropdownMenu/DropdownMenu.jsx";
import { useImageCommentNotifications } from "../components/ui/Gallery/useImageComments.js";
import NavigationBar from "../components/ui/NavigationBar/NavigationBar.jsx";
import NotificationsDrawer from "../components/EnvironmentNotificationsDrawer.jsx";
import ProjectRequestCancelModal from "../components/ui/ProjectRequestFlow/ProjectRequestCancelModal.jsx";
import SideNavigation from "../components/ui/SideNavigation/SideNavigation.jsx";
import SideOverlayDrawer from "../components/ui/SideOverlayDrawer.jsx";
import { useRecentProjectComments } from "../hooks/useProjectComments.js";
import { getProjectNamesById } from "../utils/commentDisplay.js";
import { getProjectRequestRequiredFieldErrors } from "../utils/projectRequestValidation.js";
import { getProjectPath } from "../utils/projectRoutes.js";
import {
  createUserSideNavigationItems,
  getDashboardPath,
} from "../utils/sideNavigationItems.js";

const INITIAL_FORM = {
  projectName: "",
  projectType: "",
  location: "",
  description: "",
  projectSize: "",
  developmentMode: "",
  landStatus: "",
  investmentRange: "",
  capitalAvailability: "",
  startTime: "",
  decisionMaker: "",
  quality: "",
  experience: "",
  hasBlueprints: "Indeterminate",
  referenceLink: "",
};

function FieldLabel({ asSpan = false, children, optional = false, info = false, ...props }) {
  const content = (
    <>
      {children}{optional ? null : <span aria-hidden="true">*</span>}
      {info ? <InfoCircle size="18" color="currentColor" aria-hidden="true" /> : null}
    </>
  );
  const className = "flex items-center gap-[2px] text-[14px] font-medium leading-[17px] tracking-[-0.5px] text-[var(--color-text-300)]";

  return asSpan
    ? <span {...props} className={className}>{content}</span>
    : <label {...props} className={className}>{content}</label>;
}

function TextField({ icon: Icon, inputRef, invalid = false, label, multiline = false, optional = false, ...props }) {
  const controlClass = `w-full rounded-[8px] border bg-[var(--color-neutral-100)] px-[12px] text-[14px] leading-[17px] tracking-[-0.5px] text-[var(--color-text-300)] outline-none transition focus:ring-2 placeholder:text-[var(--color-text-100)] ${invalid ? "border-[var(--color-danger-100)] focus:border-[var(--color-danger-100)] focus:ring-[var(--color-danger-10)]" : "border-[var(--color-neutral-200)] focus:border-[var(--color-primary-300)] focus:ring-[var(--color-primary-10)]"}`;

  return (
    <div className="flex w-full flex-col gap-[8px]">
      <FieldLabel optional={optional}>{label}</FieldLabel>
      <div className="relative flex w-full">
        {Icon ? <Icon className="absolute left-[12px] top-[8px] size-[20px] text-[var(--color-text-100)]" aria-hidden="true" /> : null}
        {multiline ? (
          <textarea ref={inputRef} className={`${controlClass} block min-h-[130px] resize-y py-[12px] ${Icon ? "pl-[40px]" : ""}`} required={!optional} aria-invalid={invalid || undefined} aria-errormessage={invalid ? "project-request-required-alert" : undefined} {...props} />
        ) : (
          <input ref={inputRef} className={`${controlClass} block h-[36px] ${Icon ? "pl-[40px]" : ""}`} required={!optional} aria-invalid={invalid || undefined} aria-errormessage={invalid ? "project-request-required-alert" : undefined} {...props} />
        )}
      </div>
    </div>
  );
}

function SelectField({ invalid = false, label, value, onChange, options, optional = false, info = false, placeholder = "Selecciona una opción" }) {
  const [isOpen, setIsOpen] = useState(false);
  const items = options.map((option) => ({
    id: option,
    label: option,
    supportingText: "",
    type: "Text",
  }));

  return (
    <div className="flex w-full flex-col gap-[8px]">
      <FieldLabel optional={optional} info={info}>{label}</FieldLabel>
      <DropdownMenu
        type="Text"
        label={value || placeholder}
        supportingText=""
        items={items}
        selectedItemId={value}
        open={isOpen}
        onOpenChange={setIsOpen}
        onItemSelect={(item) => {
          onChange(item.id);
          setIsOpen(false);
        }}
        interactive
        triggerHeightClassName="h-[37px]"
        triggerWrapperClassName={invalid ? "!border-[var(--color-danger-100)]" : undefined}
        className="w-full max-w-none"
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-errormessage={invalid ? "project-request-required-alert" : undefined}
        aria-required={!optional}
      />
    </div>
  );
}

function ChoiceGroup({ invalid = false, label, value, options, onChange, info = false, optional = false, orientation = "horizontal" }) {
  const labelId = useId();

  return (
    <div role="group" aria-labelledby={labelId} aria-invalid={invalid || undefined} aria-errormessage={invalid ? "project-request-required-alert" : undefined} aria-required={!optional} className="flex w-full flex-col gap-[8px]">
      <FieldLabel asSpan id={labelId} info={info} optional={optional}>{label}</FieldLabel>
      <div className={orientation === "vertical" ? "flex flex-col items-start gap-[8px]" : "flex flex-wrap gap-[8px]"}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`${orientation === "vertical" && value === option ? "h-[33px] py-[7px]" : "h-[36px] py-[8px]"} rounded-[8px] border px-[12px] text-[14px] font-medium leading-[17px] tracking-[-0.5px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-10)] ${value === option ? "border-transparent bg-[var(--color-neutral-200)] text-[var(--color-text-300)]" : invalid ? "border-[var(--color-danger-100)] bg-transparent text-[var(--color-text-100)]" : "border-[var(--color-neutral-200)] bg-transparent text-[var(--color-text-100)] hover:border-[var(--color-neutral-300)] hover:text-[var(--color-text-300)]"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxField({ label, value, onChange }) {
  return (
    <div className="flex h-[41px] w-full items-center justify-between gap-[16px]">
      <FieldLabel optional>{label}</FieldLabel>
      <Checkbox
        checked={value}
        size="S"
        interactive
        aria-label={label}
        onCheckedChange={onChange}
      />
    </div>
  );
}

function FormDivider() {
  return (
    <div aria-hidden="true" className="relative h-0 w-full">
      <span className="absolute inset-x-0 top-0 h-px bg-[var(--color-neutral-200)]" />
    </div>
  );
}

function FormSection({ title, description, children, fieldsVariant = "stacked" }) {
  const fieldsClassName = fieldsVariant === "responsive-grid"
    ? "flex min-w-[214.5px] flex-1 flex-wrap items-start gap-[16px] [&>*]:min-w-[214.5px] [&>*]:basis-[214.5px] [&>*]:grow"
    : "flex w-full min-w-0 max-w-[445px] flex-col gap-[16px] min-[480px]:w-[445px]";

  return (
    <section className="flex w-full max-w-[850px] flex-wrap content-start items-start gap-[48px]">
      <div className="flex w-full min-w-0 flex-col gap-[16px] text-[var(--color-text-200)] min-[480px]:min-w-[300px] min-[480px]:w-[350px]">
        <h2 className="text-[16px] font-bold leading-[19px] tracking-[-0.5px]">{title}</h2>
        <p className="text-[14px] leading-[17px] tracking-[-0.5px]">{description}</p>
      </div>
      <div className={fieldsClassName}>{children}</div>
    </section>
  );
}

export default function ProjectRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const currentUser = getUserDisplay(user);
  const initialRequest = location.state?.initialRequest;
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    projectName: initialRequest?.projectName || "",
    projectType: initialRequest?.projectType || INITIAL_FORM.projectType,
    location: initialRequest?.location || "",
    description: initialRequest?.description || "",
    referenceLink: initialRequest?.referenceLink || "",
  }));
  const [files, setFiles] = useState([]);
  const [submitMessage, setSubmitMessage] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showRequiredAlert, setShowRequiredAlert] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [pendingRequestAction, setPendingRequestAction] = useState(null);
  const [isRequestActionModalOpen, setIsRequestActionModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const requiredFieldErrors = useMemo(
    () => getProjectRequestRequiredFieldErrors(form),
    [form],
  );
  const hasRequiredFieldErrors = Object.keys(requiredFieldErrors).length > 0;
  const navigationItems = useMemo(
    () => createUserSideNavigationItems([], currentUser.roleCode),
    [currentUser.roleCode],
  );
  const { projects: recentProjects } = useRecentProjects();
  const notificationProjectIds = useMemo(
    () => recentProjects.map((project) => project.id),
    [recentProjects],
  );
  const projectNamesById = useMemo(
    () => getProjectNamesById(recentProjects),
    [recentProjects],
  );
  const imageCommentNotifications = useImageCommentNotifications({
    projectIds: notificationProjectIds,
    projectNamesById,
    refreshIntervalMs: isNotificationsDrawerOpen ? 5000 : 15000,
  });
  const {
    drawerComments: recentProjectComments,
    error: recentProjectCommentsError,
    loading: recentProjectCommentsLoading,
    refresh: refreshRecentComments,
  } = useRecentProjectComments({
    enabled: notificationProjectIds.length > 0,
    projectIds: notificationProjectIds,
    projectNamesById,
    refreshIntervalMs: isNotificationsDrawerOpen ? 5000 : 15000,
    user,
  });
  const notificationComments = useMemo(() => {
    const commentsById = new Map();

    [...recentProjectComments, ...imageCommentNotifications].forEach((comment) => {
      if (comment?.id !== undefined && comment?.id !== null) {
        commentsById.set(String(comment.id), comment);
      }
    });

    return Array.from(commentsById.values());
  }, [imageCommentNotifications, recentProjectComments]);

  useEffect(() => {
    if (isNotificationsDrawerOpen) {
      refreshRecentComments?.();
    }
  }, [isNotificationsDrawerOpen, refreshRecentComments]);

  const update = (field) => (eventOrValue) => {
    const value = eventOrValue?.target ? eventOrValue.target.value : eventOrValue;
    const nextForm = { ...form, [field]: value };

    setForm(nextForm);

    if (hasAttemptedSubmit && Object.keys(getProjectRequestRequiredFieldErrors(nextForm)).length === 0) {
      setShowRequiredAlert(false);
    }
  };
  const performSideNavigation = (item) => {
    if (item?.to) {
      navigate(item.to);
      return;
    }

    if (item.id === "dashboard") navigate(getDashboardPath(currentUser.roleCode));
    if (item.id === "requests") navigate("/solicitudes");
    if (item.id === "more-projects") navigate("/proyectos");
    if (item.id === "settings") navigate("/configuraciones");
  };
  const handleNavigation = (item) => {
    if (!item) {
      return;
    }

    setShowRequiredAlert(false);
    setIsNotificationsDrawerOpen(false);
    setIsMobileNavigationOpen(false);
    setPendingRequestAction({ type: "navigate", item });
    setIsRequestActionModalOpen(true);
  };
  const requestLogout = () => {
    setShowRequiredAlert(false);
    setIsNotificationsDrawerOpen(false);
    setIsMobileNavigationOpen(false);
    setPendingRequestAction({ type: "logout" });
    setIsRequestActionModalOpen(true);
  };
  const cancelRequestAction = () => {
    setIsRequestActionModalOpen(false);
  };
  const confirmRequestAction = () => {
    const action = pendingRequestAction;
    setIsRequestActionModalOpen(false);

    if (action?.type === "clear") {
      resetForm();
      return;
    }

    if (action?.type === "logout") {
      logout();
      navigate("/");
      return;
    }

    if (action?.type === "navigate") {
      performSideNavigation(action.item);
    }
  };
  const openImageComment = (comment) => {
    const targetProjectId = comment?.projectId;

    if (!targetProjectId) {
      return;
    }

    const params = new URLSearchParams({ tab: "renders" });

    if (comment.imageId) params.set("imageId", comment.imageId);
    if (comment.id) params.set("commentId", comment.id);

    const targetProject = recentProjects.find(
      (project) => String(project.id) === String(targetProjectId),
    );

    setIsNotificationsDrawerOpen(false);
    navigate(
      targetProject
        ? getProjectPath(targetProject, params.toString())
        : `/proyectos/${targetProjectId}?${params.toString()}`,
    );
  };
  const resetForm = () => {
    setForm(INITIAL_FORM);
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSubmitMessage("");
    setHasAttemptedSubmit(false);
    setShowRequiredAlert(false);
  };
  const requestFormReset = () => {
    setShowRequiredAlert(false);
    setPendingRequestAction({ type: "clear" });
    setIsRequestActionModalOpen(true);
  };
  const handleFrontendSubmit = () => {
    setHasAttemptedSubmit(true);
    setSubmitMessage("");

    if (hasRequiredFieldErrors) {
      setShowRequiredAlert(true);

      window.requestAnimationFrame(() => {
        const invalidField = formRef.current?.querySelector('[aria-invalid="true"]');
        const focusTarget = invalidField?.matches("input, textarea, button")
          ? invalidField
          : invalidField?.querySelector("input, textarea, button");

        invalidField?.scrollIntoView({ behavior: "smooth", block: "center" });
        focusTarget?.focus({ preventScroll: true });
      });

      return;
    }

    setShowRequiredAlert(false);
    setSubmitMessage("Formulario completado correctamente.");
  };
  const sidebar = (
    <SideNavigation
      activeItemId="requests"
      expanded={isSidebarExpanded}
      items={navigationItems}
      userName={currentUser.name}
      userEmail={currentUser.email}
      userAvatarSrc={currentUser.profilePhotoUrl}
      onExpandedChange={setIsSidebarExpanded}
      onItemSelect={handleNavigation}
      onNewOpportunityClick={() => navigate("/solicitudes/nueva")}
      onLogoutClick={requestLogout}
    />
  );

  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)]">
      <div className="flex min-h-screen items-stretch">
        <div className="hidden shrink-0 min-[768px]:block min-[768px]:[&>aside]:!w-[234px] min-[1024px]:[&>aside]:!w-[312px]">{sidebar}</div>
        <div className="min-w-0 flex-1">
          <NavigationBar
            variant="utility"
            showUtilityMenu
            utilityText={new Intl.DateTimeFormat("es-VE", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
            onMenuClick={() => setIsMobileNavigationOpen(true)}
            utilityActionActive={isNotificationsDrawerOpen}
            onUtilityActionClick={() => setIsNotificationsDrawerOpen((current) => !current)}
            className="mx-auto w-full max-w-[1200px] px-[16px] py-[12px] min-[768px]:px-[24px] min-[1024px]:px-[48px]"
          />

          <div className="content-reveal mx-auto flex w-full max-w-[1200px] flex-col items-center gap-[48px] px-[16px] pb-[48px] min-[768px]:px-[24px] min-[1024px]:px-[48px]">
            <header className="flex w-full max-w-[850px] flex-wrap items-end justify-between gap-x-[24px] gap-y-[16px]">
              <div className="min-w-0">
                <h1 className="text-[32px] font-bold leading-[38px] tracking-[-1px] text-[var(--color-text-50)] min-[768px]:text-[48px] min-[768px]:leading-[58px]">Solicitud de proyecto</h1>
                <p className="mt-[4px] text-[14px] leading-[17px] tracking-[-0.5px] text-[var(--color-text-200)] min-[768px]:text-[18px] min-[768px]:leading-[21px]">Cada proyecto merece ser el correcto.</p>
              </div>
              <p className="hidden shrink-0 text-right text-[14px] font-medium leading-[17px] tracking-[-0.5px] text-[var(--color-text-100)] min-[480px]:block">Tiempo estimado<br />3–5 minutos</p>
            </header>

            <FormDivider />

            <form ref={formRef} noValidate className="flex w-full flex-col items-center gap-[48px]" onSubmit={(event) => { event.preventDefault(); handleFrontendSubmit(); }}>
              <FormSection title="Detalles del proyecto" description="Cuéntanos qué deseas desarrollar. Esta información nos ayudará a comprender el alcance, los objetivos y las características generales de tu proyecto antes de la primera reunión.">
                <TextField invalid={hasAttemptedSubmit && requiredFieldErrors.projectName} label="Nombre del proyecto" icon={Edit2} placeholder='Ej. “Apto. Noventa y Uno”' value={form.projectName} onChange={update("projectName")} />
                <SelectField invalid={hasAttemptedSubmit && requiredFieldErrors.projectType} label="Tipo de proyecto" value={form.projectType} onChange={update("projectType")} options={["Residencial", "Comercial", "Corporativo", "Stands y exhibiciones"]} />
                <TextField invalid={hasAttemptedSubmit && requiredFieldErrors.location} label="Ubicación del proyecto" icon={Location} placeholder='Ej. “Maracaibo, Estado Zulia”' value={form.location} onChange={update("location")} />
                <TextField label="Descripción del proyecto" optional multiline placeholder="Describe brevemente qué quieres lograr, dónde está el inmueble y cualquier detalle relevante." value={form.description} onChange={update("description")} />
                <SelectField label="Tamaño aproximado del proyecto" optional value={form.projectSize} onChange={update("projectSize")} options={["Pequeño (menos de 80 m²)", "Mediano (80-200 m²)", "Grande (200-500 m²)", "Muy grande (más de 500 m²)", "No lo sé aún"]} />
                <SelectField invalid={hasAttemptedSubmit && requiredFieldErrors.developmentMode} label="¿Cómo prefiere desarrollar el proyecto?" info value={form.developmentMode} onChange={update("developmentMode")} options={["Por fases", "En su totalidad", "Por definir"]} />
                <ChoiceGroup label="¿Tiene terreno o inmueble disponible?" optional value={form.landStatus} onChange={update("landStatus")} options={["Sí, disponible", "En proceso de adquirirlo", "No todavía"]} />
                <CheckboxField label="¿Dispone de planos del lugar?" value={form.hasBlueprints} onChange={(value) => setForm((current) => ({ ...current, hasBlueprints: value }))} />
              </FormSection>

              <FormDivider />

              <FormSection fieldsVariant="responsive-grid" title="Viabilidad financiera" description="Conocer tu presupuesto y la disponibilidad de capital nos permite proponerte soluciones acordes.">
                <SelectField invalid={hasAttemptedSubmit && requiredFieldErrors.investmentRange} label="Rango de inversión estimado" value={form.investmentRange} onChange={update("investmentRange")} options={["No lo tengo definido aún", "Menos de $10,000 USD", "$10,000 - $50,000 USD", "$50,000 - $150,000 USD", "Más de $150,000 USD"]} />
                <SelectField invalid={hasAttemptedSubmit && requiredFieldErrors.capitalAvailability} label="Disponibilidad de capital" value={form.capitalAvailability} onChange={update("capitalAvailability")} options={["Disponible ahora", "En los próximos 3 meses", "Busca financiamiento", "Indefinido"]} />
              </FormSection>

              <FormDivider />

              <FormSection title="Compatibilidad" description="Estas preguntas nos ayudan a conocer tus expectativas, tiempos y experiencia previa para ofrecerte un proceso de trabajo más personalizado y eficiente.">
                <ChoiceGroup invalid={hasAttemptedSubmit && requiredFieldErrors.startTime} label="¿Cuándo espera iniciar el proyecto?" orientation="vertical" value={form.startTime} onChange={update("startTime")} options={["De inmediato", "1-3 meses", "3-6 meses", "Más de 6 meses"]} />
                <SelectField label="¿Quién toma la decisión final del proyecto?" optional value={form.decisionMaker} onChange={update("decisionMaker")} options={["Yo solo/a", "Con mi pareja/socio", "Familia extendida", "Empresa/junta"]} />
                <SelectField label="Expectativa de estilo / nivel de calidad" optional info value={form.quality} onChange={update("quality")} options={["Funcional y económico", "Calidad estándar", "Premium", "Exclusivo/lujo"]} />
                <ChoiceGroup label="¿Ha trabajado con un arquitecto o diseñador antes?" optional value={form.experience} onChange={update("experience")} options={["Sí, buena experiencia", "Sí, mala experiencia", "No, es la primera vez"]} />
              </FormSection>

              <FormDivider />

              <FormSection title="Referencias" description="Comparte imágenes, enlaces o cualquier material de referencia que represente tu visión del proyecto. Esto nos ayudará a comprender mejor el estilo, la atmósfera y los acabados que deseas lograr.">
                <div className="flex flex-col gap-[8px]">
                  <FieldLabel optional>Subir imágenes o archivos (opcional)</FieldLabel>
                  <button type="button" onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); setFiles(Array.from(event.dataTransfer.files || [])); }} className="flex min-h-[177px] w-full flex-col items-center justify-center gap-[12px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-[24px] py-[32px] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-10)] min-[480px]:h-[177px]">
                    <span className="flex size-[40px] items-center justify-center rounded-[8px] border border-[var(--color-neutral-200)] text-[var(--color-text-100)] shadow-[var(--shadow-e1)]"><CloudPlus size="20" color="currentColor" /></span>
                    <span className="flex w-full flex-col items-center gap-[8px] text-[14px] leading-[17px] tracking-[-0.5px] text-[var(--color-text-100)]">
                      <span className="flex min-h-[36px] flex-wrap items-center justify-center gap-[8px]">
                        <span className="text-[var(--color-text-300)] underline">Elige un archivo</span>
                        <span>O</span>
                        <span>Arrastra y suelta</span>
                      </span>
                      <span>Formatos JPEG, PNG, PDF y MP4, hasta 50 MB.</span>
                    </span>
                  </button>
                  <input ref={fileInputRef} type="file" multiple accept=".jpeg,.jpg,.png,.pdf,.mp4" className="sr-only" onChange={(event) => setFiles(Array.from(event.target.files || []))} />
                  {files.length ? <p className="text-[14px] text-[var(--color-text-200)]">{files.length} archivo(s) seleccionado(s)</p> : null}
                </div>
                <TextField label="Links de referencia (Pinterest, web, etc.) (opcional)" optional icon={Link21} placeholder='Ej. “https://es.pinterest.com/pin”' value={form.referenceLink} onChange={update("referenceLink")} />
              </FormSection>

              <FormDivider />

              <div className="w-full max-w-[850px]">
                <p className="text-[16px] leading-[19px] tracking-[-0.5px] text-[var(--color-text-100)]">Al enviar este formulario, nuestro equipo revisará la información y se pondrá en contacto contigo en un plazo aproximado de 24–48 horas.</p>
                {submitMessage ? <p role="status" className="mt-[16px] text-[14px] text-[var(--color-text-200)]">{submitMessage}</p> : null}
              </div>
              <footer className="flex w-full max-w-[850px] flex-col-reverse gap-[8px] min-[480px]:flex-row min-[480px]:justify-end">
                <Button theme="Primary" type="Outline" size="M" fitContent={false} showLeftIcon={false} showRightIcon={false} className="h-[41px] w-full min-[480px]:w-auto" onClick={requestFormReset}>Limpiar formulario</Button>
                <Button theme="Primary" type="Solid" htmlType="submit" size="M" fitContent={false} showLeftIcon={false} showRightIcon={false} className="h-[41px] w-full min-[480px]:w-auto">Enviar</Button>
              </footer>
            </form>
          </div>

          <NotificationsDrawer
            open={isNotificationsDrawerOpen}
            onClose={() => setIsNotificationsDrawerOpen(false)}
            comments={notificationComments}
            commentsError={recentProjectCommentsError}
            commentsLoading={recentProjectCommentsLoading}
            recentActivity={[]}
            recentActivityLoading={false}
            onCommentSelect={openImageComment}
          />
        </div>
      </div>

      <SideOverlayDrawer open={isMobileNavigationOpen} onClose={() => setIsMobileNavigationOpen(false)} side="left" widthClassName="w-[min(312px,calc(100vw-32px))]" className="z-[80] min-[768px]:hidden" panelClassName="rounded-none">
        <SideNavigation {...sidebar.props} expanded onItemSelect={(item) => { setIsMobileNavigationOpen(false); handleNavigation(item); }} />
      </SideOverlayDrawer>

      <ProjectRequestCancelModal
        open={isRequestActionModalOpen}
        onCancel={cancelRequestAction}
        onConfirm={confirmRequestAction}
        title={pendingRequestAction?.type === "clear" ? "¿Deseas limpiar el formulario?" : undefined}
        description={pendingRequestAction?.type === "clear" ? "Esta acción eliminará toda la información ingresada en el formulario." : undefined}
        primaryActionLabel={pendingRequestAction?.type === "clear" ? "Limpiar" : undefined}
        ariaLabel={pendingRequestAction?.type === "clear" ? "Confirmar limpieza del formulario" : undefined}
      />

      <div className="pointer-events-none fixed bottom-0 right-0 z-[90] flex w-full max-w-[722.615px] p-[16px] min-[480px]:p-[24px]">
        <Alert
          id="project-request-required-alert"
          visible={showRequiredAlert}
          theme="Danger"
          layout="Box"
          title="Por favor, proporcione la información necesaria."
          description="Le recordamos que es fundamental completar todos los campos obligatorios."
          showActions={false}
          showCloseButton
          onDismiss={() => setShowRequiredAlert(false)}
          aria-label="Campos obligatorios incompletos"
          className="pointer-events-auto"
        />
      </div>
    </main>
  );
}
