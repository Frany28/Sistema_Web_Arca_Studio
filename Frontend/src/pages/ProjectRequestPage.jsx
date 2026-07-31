import { useMemo, useRef, useState } from "react";
import { CloudPlus, Edit2, InfoCircle, Link21, Location } from "iconsax-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";
import { getUserDisplay } from "../auth/userDisplay.js";
import Button from "../components/ui/Button/Button.jsx";
import DropdownMenu from "../components/ui/DropdownMenu/DropdownMenu.jsx";
import NavigationBar from "../components/ui/NavigationBar/NavigationBar.jsx";
import SideNavigation from "../components/ui/SideNavigation/SideNavigation.jsx";
import SideOverlayDrawer from "../components/ui/SideOverlayDrawer.jsx";
import {
  createUserSideNavigationItems,
  getDashboardPath,
} from "../utils/sideNavigationItems.js";

const INITIAL_FORM = {
  projectName: "",
  projectType: "Residencial",
  location: "",
  description: "",
  projectSize: "Mediano (80-200 m²)",
  developmentMode: "Por fases",
  landStatus: "Sí, disponible",
  investmentRange: "$10,000 - $50,000 USD",
  capitalAvailability: "Disponible ahora",
  startTime: "De inmediato",
  decisionMaker: "Yo solo(a)",
  quality: "Funcional y económico",
  experience: "",
  referenceLink: "",
};

function FieldLabel({ children, optional = false, info = false }) {
  return (
    <label className="flex items-center gap-[4px] text-[14px] font-medium leading-[17px] tracking-[-0.5px] text-[var(--color-text-300)]">
      {children}{optional ? null : <span aria-hidden="true">*</span>}
      {info ? <InfoCircle size="14" color="currentColor" aria-hidden="true" /> : null}
    </label>
  );
}

function TextField({ icon: Icon, label, multiline = false, optional, ...props }) {
  const controlClass = "w-full rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-[12px] text-[14px] leading-[17px] tracking-[-0.5px] text-[var(--color-text-300)] outline-none transition focus:border-[var(--color-primary-300)] focus:ring-2 focus:ring-[var(--color-primary-10)] placeholder:text-[var(--color-text-100)]";

  return (
    <div className="flex w-full flex-col gap-[8px]">
      <FieldLabel optional={optional}>{label}</FieldLabel>
      <div className="relative">
        {Icon ? <Icon className="absolute left-[12px] top-[10px] size-[20px] text-[var(--color-text-100)]" aria-hidden="true" /> : null}
        {multiline ? (
          <textarea className={`${controlClass} min-h-[112px] resize-y py-[12px] ${Icon ? "pl-[40px]" : ""}`} {...props} />
        ) : (
          <input className={`${controlClass} h-[41px] ${Icon ? "pl-[40px]" : ""}`} {...props} />
        )}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const items = options.map((option) => ({
    id: option,
    label: option,
    supportingText: "",
    type: "Text",
  }));

  return (
    <div className="flex w-full flex-col gap-[8px]">
      <FieldLabel>{label}</FieldLabel>
      <DropdownMenu
        type="Text"
        label={value}
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
        className="w-full max-w-none"
        aria-label={label}
      />
    </div>
  );
}

function ChoiceGroup({ label, value, options, onChange, info = false }) {
  return (
    <fieldset className="flex w-full flex-col gap-[8px]">
      <legend><FieldLabel info={info}>{label}</FieldLabel></legend>
      <div className="flex flex-wrap gap-[8px]">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`rounded-[8px] border px-[12px] py-[8px] text-[14px] font-medium leading-[17px] tracking-[-0.5px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-10)] ${value === option ? "border-[var(--color-primary-300)] bg-[var(--color-primary-300)] text-white" : "border-[var(--color-neutral-200)] bg-transparent text-[var(--color-text-100)] hover:border-[var(--color-neutral-300)] hover:text-[var(--color-text-300)]"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function FormSection({ title, description, children }) {
  return (
    <section className="grid w-full gap-[24px] border-t border-[var(--color-neutral-200)] py-[32px] min-[1024px]:grid-cols-[minmax(180px,350px)_minmax(280px,445px)] min-[1024px]:gap-[24px] min-[1280px]:gap-[48px]">
      <div className="flex flex-col gap-[16px] text-[var(--color-text-200)]">
        <h2 className="text-[16px] font-bold leading-[19px] tracking-[-0.5px]">{title}</h2>
        <p className="text-[14px] leading-[17px] tracking-[-0.5px]">{description}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-[16px]">{children}</div>
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const fileInputRef = useRef(null);
  const navigationItems = useMemo(
    () => createUserSideNavigationItems([], currentUser.roleCode),
    [currentUser.roleCode],
  );
  const update = (field) => (eventOrValue) => {
    const value = eventOrValue?.target ? eventOrValue.target.value : eventOrValue;
    setForm((current) => ({ ...current, [field]: value }));
  };
  const handleNavigation = (item) => {
    if (item.id === "dashboard") navigate(getDashboardPath(currentUser.roleCode));
    if (item.id === "requests") navigate("/solicitudes");
    if (item.id === "more-projects") navigate("/proyectos");
    if (item.id === "settings") navigate("/configuraciones");
  };
  const resetForm = () => {
    setForm(INITIAL_FORM);
    setFiles([]);
    setSubmitMessage("");
  };
  const handleFrontendSubmit = () => {
    if (!form.projectName.trim() || !form.location.trim() || !form.description.trim()) {
      setSubmitMessage("Completa el nombre, la ubicación y la descripción del proyecto.");
      return;
    }

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
      onLogoutClick={() => { logout(); navigate("/"); }}
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
            className="mx-auto w-full max-w-[1128px] px-[16px] py-[12px] min-[768px]:px-[24px] min-[1024px]:px-[48px]"
          />

          <div className="mx-auto w-full max-w-[1128px] px-[16px] pb-[48px] min-[768px]:px-[24px] min-[1024px]:px-[48px]">
            <header className="flex items-start justify-between gap-[24px] border-b border-[var(--color-neutral-200)] pb-[24px] pt-[8px]">
              <div className="min-w-0">
                <h1 className="text-[32px] font-bold leading-[38px] tracking-[-1px] text-[var(--color-text-300)] min-[768px]:text-[48px] min-[768px]:leading-[58px]">Solicitud de proyecto</h1>
                <p className="mt-[4px] text-[14px] leading-[17px] tracking-[-0.5px] text-[var(--color-text-200)]">Cada proyecto merece ser el correcto.</p>
              </div>
              <p className="hidden shrink-0 text-right text-[12px] leading-[15px] text-[var(--color-text-100)] min-[480px]:block">Tiempo estimado<br />3–5 minutos</p>
            </header>

            <form onSubmit={(event) => event.preventDefault()}>
              <FormSection title="Detalles del proyecto" description="Cuéntanos qué deseas desarrollar. Esta información nos ayudará a comprender el alcance, los objetivos y las características generales de tu proyecto antes de la primera reunión.">
                <TextField label="Nombre del proyecto" icon={Edit2} placeholder='Ej. “Apto. Noventa y Uno”' value={form.projectName} onChange={update("projectName")} />
                <SelectField label="Tipo de proyecto" value={form.projectType} onChange={update("projectType")} options={["Residencial", "Comercial", "Corporativo", "Stands y exhibiciones"]} />
                <TextField label="Ubicación del proyecto" icon={Location} placeholder='Ej. “Maracaibo, Estado Zulia”' value={form.location} onChange={update("location")} />
                <TextField label="Descripción del proyecto" multiline placeholder="Describe brevemente qué quieres lograr, dónde está el inmueble y cualquier detalle relevante." value={form.description} onChange={update("description")} />
                <SelectField label="Tamaño aproximado del proyecto" value={form.projectSize} onChange={update("projectSize")} options={["Pequeño (menos de 80 m²)", "Mediano (80-200 m²)", "Grande (más de 200 m²)"]} />
                <SelectField label="¿Cómo deseas desarrollar el proyecto?" value={form.developmentMode} onChange={update("developmentMode")} options={["Por fases", "Proyecto completo", "Por definir"]} />
                <ChoiceGroup label="¿Tiene terreno o inmueble disponible?" value={form.landStatus} onChange={update("landStatus")} options={["Sí, disponible", "En proceso de adquirirlo", "No todavía"]} />
                <ChoiceGroup label="¿Dispone de planos del lugar?" value={form.hasBlueprints} onChange={update("hasBlueprints")} options={["Sí", "No"]} />
              </FormSection>

              <FormSection title="Viabilidad financiera" description="Conocer tu presupuesto y la disponibilidad de capital nos permite proponerte soluciones acordes.">
                <SelectField label="Rango de inversión estimado" value={form.investmentRange} onChange={update("investmentRange")} options={["Menos de $10,000 USD", "$10,000 - $50,000 USD", "$50,000 - $100,000 USD", "Más de $100,000 USD"]} />
                <SelectField label="Disponibilidad del capital" value={form.capitalAvailability} onChange={update("capitalAvailability")} options={["Disponible ahora", "Parcialmente disponible", "En proceso de financiamiento"]} />
              </FormSection>

              <FormSection title="Compatibilidad" description="Estas preguntas nos ayudan a conocer tus expectativas, tiempos y experiencia previa para ofrecerte un proceso de trabajo más personalizado y eficiente.">
                <ChoiceGroup label="¿Cuándo esperas iniciar el proyecto?" value={form.startTime} onChange={update("startTime")} options={["De inmediato", "1-3 meses", "3-6 meses", "Más de 6 meses"]} />
                <SelectField label="¿Quién toma la decisión final del proyecto?" value={form.decisionMaker} onChange={update("decisionMaker")} options={["Yo solo(a)", "Mi pareja o familia", "Un equipo o socios"]} />
                <SelectField label="Expectativa de estilo / nivel de calidad" value={form.quality} onChange={update("quality")} options={["Funcional y económico", "Equilibrio entre diseño y presupuesto", "Alta gama / personalizado"]} />
                <ChoiceGroup label="¿Ha trabajado con un arquitecto o diseñador antes?" value={form.experience} onChange={update("experience")} options={["Sí, buena experiencia", "Sí, mala experiencia", "No, primera vez"]} />
              </FormSection>

              <FormSection title="Referencias" description="Comparte imágenes, enlaces o cualquier material de referencia que represente tu visión del proyecto. Esto nos ayudará a comprender mejor el estilo, la atmósfera y los acabados que deseas lograr.">
                <div className="flex flex-col gap-[8px]">
                  <FieldLabel optional>Subir imágenes / archivos (opcional)</FieldLabel>
                  <button type="button" onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); setFiles(Array.from(event.dataTransfer.files || [])); }} className="flex min-h-[160px] w-full flex-col items-center justify-center gap-[12px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-[24px] py-[32px] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-10)]">
                    <span className="flex size-[40px] items-center justify-center rounded-[8px] border border-[var(--color-neutral-200)]"><CloudPlus size="20" color="currentColor" /></span>
                    <span className="text-[14px] text-[var(--color-text-100)]"><span className="text-[var(--color-text-300)] underline">Elige un archivo</span> &nbsp;O&nbsp; Arrastra y suelta</span>
                    <span className="text-[14px] text-[var(--color-text-100)]">Formatos JPEG, PNG, PDF y MP4, hasta 50 MB.</span>
                  </button>
                  <input ref={fileInputRef} type="file" multiple accept=".jpeg,.jpg,.png,.pdf,.mp4" className="sr-only" onChange={(event) => setFiles(Array.from(event.target.files || []))} />
                  {files.length ? <p className="text-[14px] text-[var(--color-text-200)]">{files.length} archivo(s) seleccionado(s)</p> : null}
                </div>
                <TextField label="Link de referencia (Pinterest, web, etc.)" optional icon={Link21} placeholder='Ej. “https://es.pinterest.com/pin”' value={form.referenceLink} onChange={update("referenceLink")} />
              </FormSection>

              <p className="border-t border-[var(--color-neutral-200)] pt-[32px] text-[16px] leading-[19px] tracking-[-0.5px] text-[var(--color-text-100)]">Al enviar este formulario, nuestro equipo revisará la información y se pondrá en contacto contigo en un plazo aproximado de 24–48 horas.</p>
              {submitMessage ? <p role="status" className="mt-[16px] text-[14px] text-[var(--color-text-200)]">{submitMessage}</p> : null}
              <footer className="flex flex-col-reverse gap-[8px] py-[32px] min-[480px]:flex-row min-[480px]:justify-end">
                <Button theme="Primary" type="Outline" size="M" fitContent={false} showLeftIcon={false} showRightIcon={false} className="w-full min-[480px]:w-auto" onClick={resetForm}>Limpiar formulario</Button>
                <Button theme="Primary" type="Solid" size="M" fitContent={false} showLeftIcon={false} showRightIcon={false} className="w-full min-[480px]:w-auto" onClick={handleFrontendSubmit}>Enviar</Button>
              </footer>
            </form>
          </div>
        </div>
      </div>

      <SideOverlayDrawer open={isMobileNavigationOpen} onClose={() => setIsMobileNavigationOpen(false)} side="left" widthClassName="w-[min(312px,calc(100vw-32px))]" className="z-[80] min-[768px]:hidden" panelClassName="rounded-none">
        <SideNavigation {...sidebar.props} expanded onItemSelect={(item) => { setIsMobileNavigationOpen(false); handleNavigation(item); }} />
      </SideOverlayDrawer>
    </main>
  );
}
