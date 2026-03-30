import Flag from "../components/Flag.jsx";
import Button from "../components/ui/Button.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";

const sizeItems = [
  { label: "S", props: { theme: "Primary", size: "S", type: "Solid", state: "Default", showLeftIcon: false, showRightIcon: false, children: "Aceptar" } },
  { label: "M", props: { theme: "Primary", size: "M", type: "Solid", state: "Default", showLeftIcon: false, showRightIcon: false, children: "Aceptar" } },
  { label: "L", props: { theme: "Primary", size: "L", type: "Solid", state: "Default", showLeftIcon: false, showRightIcon: false, children: "Aceptar" } },
];

const quickToggleItems = [
  { label: "Left", props: { theme: "Primary", size: "S", type: "Solid", state: "Default", showRightIcon: false, children: "Button" } },
  { label: "Label", props: { theme: "Primary", size: "S", type: "Solid", state: "Default", showLeftIcon: false, showRightIcon: false, children: "Button" } },
  { label: "Right", props: { theme: "Primary", size: "S", type: "Solid", state: "Default", showLeftIcon: false, children: "Button" } },
  { label: "Icon", props: { theme: "Primary", size: "S", type: "Solid", state: "Default", showText: false, showRightIcon: false, "aria-label": "Quick toggle icon" } },
];

const styleSections = [
  {
    title: "styles / Primary / solid",
    active: { theme: "Primary", size: "S", type: "Solid", state: "Default" },
    disabled: { theme: "Primary", size: "S", type: "Solid", state: "Disabled" },
  },
  {
    title: "styles / Primary / outline",
    active: { theme: "Primary", size: "S", type: "Outline", state: "Default" },
    disabled: { theme: "Primary", size: "S", type: "Outline", state: "Disabled" },
  },
  {
    title: "styles / Primary / Ghost",
    active: { theme: "Primary", size: "S", type: "Ghost", state: "Default" },
    disabled: { theme: "Primary", size: "S", type: "Ghost", state: "Disabled" },
  },
  {
    title: "styles / Primary / Link",
    active: { theme: "Primary", size: "S", type: "Link", state: "Default" },
    disabled: { theme: "Primary", size: "S", type: "Link", state: "Disabled" },
  },
  {
    title: "styles / Danger / solid",
    active: { theme: "Danger", size: "S", type: "Solid", state: "Default" },
    disabled: { theme: "Danger", size: "S", type: "Solid", state: "Disabled" },
  },
  {
    title: "styles / Danger / outline",
    active: { theme: "Danger", size: "S", type: "Outline", state: "Default" },
    disabled: { theme: "Danger", size: "S", type: "Outline", state: "Disabled" },
  },
  {
    title: "styles / info / solid",
    active: { theme: "Info", size: "S", type: "Solid", state: "Default" },
    disabled: { theme: "Info", size: "S", type: "Solid", state: "Disabled" },
  },
  {
    title: "styles / info / outline",
    active: { theme: "Info", size: "S", type: "Outline", state: "Default" },
    disabled: { theme: "Info", size: "S", type: "Outline", state: "Disabled" },
  },
];

function CatalogCard({ title, children }) {
  return (
    <section className="rounded-[20px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-6 transition-colors duration-200">
      <h2 className="mb-4 text-heading-7">{title}</h2>
      {children}
    </section>
  );
}

function ExampleCell({ label, children }) {
  return (
    <div className="flex min-w-[120px] flex-col items-start gap-3">
      <div className="flex min-h-[52px] w-full items-center justify-center">
        {children}
      </div>
      <span className="text-body-4 text-[var(--color-text-200)]">{label}</span>
    </div>
  );
}

function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] px-6 py-10 text-[var(--color-text-50)] transition-colors duration-200">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-primary-10)] px-3 py-1 text-body-4 text-[var(--color-primary-300)]">
              <Flag countryCode="VE" title="Venezuela" />
              Sistema de botones ARCA
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="text-heading-4">Button Catalog</h1>
              <p className="max-w-3xl text-body-3 text-[var(--color-text-200)]">
                Ejemplos separados por bloque como en Figma: tamaños,
                quick toggle y estilos con estados independientes.
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <CatalogCard title="Sizes">
            <div className="flex flex-wrap gap-6">
              {sizeItems.map((item) => (
                <ExampleCell key={item.label} label={item.label}>
                  <Button {...item.props} />
                </ExampleCell>
              ))}
            </div>
          </CatalogCard>

          <CatalogCard title="QuiCk Toggle">
            <div className="flex flex-wrap gap-6">
              {quickToggleItems.map((item) => (
                <ExampleCell key={item.label} label={item.label}>
                  <Button {...item.props} />
                </ExampleCell>
              ))}
            </div>
          </CatalogCard>

          {styleSections.map((section) => (
            <CatalogCard key={section.title} title={section.title}>
              <div className="flex flex-wrap gap-6">
                <ExampleCell label="Interactive">
                  <Button {...section.active} />
                </ExampleCell>
                <ExampleCell label="Disabled">
                  <Button {...section.disabled} />
                </ExampleCell>
              </div>
            </CatalogCard>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
