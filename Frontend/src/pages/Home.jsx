import clsx from "clsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import Input from "../components/ui/Input/Input.jsx";
import TextArea from "../components/ui/TextArea/TextArea.jsx";
import {
  inputMainComponent,
  inputQuickToggleItems,
  inputSizeItems,
  inputStateItems,
  inputTypeStateItems,
  inputTypeItems,
} from "../components/ui/Input/inputShowcaseData.js";
import {
  textAreaFeedbackItems,
  textAreaMainComponent,
  textAreaQuickToggleItems,
  textAreaStateItems,
} from "../components/ui/TextArea/textAreaShowcaseData.js";

function ShowcaseCard({ title, children, className }) {
  return (
    <section
      className={clsx(
        "flex flex-col gap-4 rounded-[20px] border border-(--color-neutral-200) bg-(--color-neutral-bg) p-6",
        className,
      )}
    >
      <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
        {title}
      </span>
      {children}
    </section>
  );
}

function SampleCell({ label, children, className }) {
  return (
    <div
      className={clsx(
        "flex min-h-[132px] flex-col gap-3 rounded-[16px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-4",
        className,
      )}
    >
      <span className="text-body-4 text-[var(--color-text-200)]">{label}</span>
      <div className="flex flex-1 items-start justify-center">{children}</div>
    </div>
  );
}

function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] px-6 py-10 text-[var(--color-text-50)] transition-colors duration-200">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Input field
            </span>
            <h1 className="text-heading-4 text-[var(--color-text-50)]">
              Main component, size, quick toggle, state y type
            </h1>
            <p className="text-body-3 text-[var(--color-text-200)]">
              Vista recortada al alcance actual de Figma para integrar el
              componente paso a paso.
            </p>
          </div>

          <ThemeToggle />
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="h-fit xl:col-span-4">
            <Input {...inputMainComponent} />
          </ShowcaseCard>

          <ShowcaseCard title="Size" className="xl:col-span-8">
            <div className="grid gap-4 md:grid-cols-2 grid-cols-3">
              {inputSizeItems.map((item) => (
                <SampleCell key={item.label} label={item.label}>
                  <Input {...item.props} />
                </SampleCell>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Quick toggle" className="xl:col-span-12">
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {inputQuickToggleItems.map((item) => (
                <SampleCell key={item.label} label={item.label}>
                  <Input {...item.props} />
                </SampleCell>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="State" className="xl:col-span-12">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {inputStateItems.map((item) => (
                <SampleCell key={item.label} label={item.label}>
                  <Input {...item.props} />
                </SampleCell>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Type" className="xl:col-span-12">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-2">
              {inputTypeItems.map((item) => (
                <SampleCell key={item.label} label={item.label}>
                  <Input {...item.props} />
                </SampleCell>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Type states" className="xl:col-span-12">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-2">
              {inputTypeStateItems.map((item) => (
                <SampleCell key={item.label} label={item.label}>
                  <Input {...item.props} />
                </SampleCell>
              ))}
            </div>
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Text area input
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component, quick toggle y states
            </h2>
            <p className="text-body-3 text-[var(--color-text-200)]">
              Implementacion basada en el nodo `2061:22548` de Figma.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="h-fit xl:col-span-4">
            <TextArea {...textAreaMainComponent} />
          </ShowcaseCard>

          <ShowcaseCard title="Quick toggle" className="xl:col-span-8">
            <div className="grid gap-4 xl:grid-cols-3">
              {textAreaQuickToggleItems.map((item) => (
                <SampleCell key={item.label} label={item.label} className="min-h-[194px]">
                  <TextArea {...item.props} />
                </SampleCell>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="States" className="xl:col-span-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {textAreaStateItems.map((item) => (
                <SampleCell key={item.label} label={item.label} className="min-h-[245px]">
                  <TextArea {...item.props} />
                </SampleCell>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Feedback" className="xl:col-span-4">
            <div className="grid gap-4">
              {textAreaFeedbackItems.map((item) => (
                <SampleCell key={item.label} label={item.label} className="min-h-[245px]">
                  <TextArea {...item.props} />
                </SampleCell>
              ))}
            </div>
          </ShowcaseCard>
        </div>
      </section>
    </main>
  );
}

export default Home;
