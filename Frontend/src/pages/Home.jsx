import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import Input from "../components/ui/Input/Input.jsx";
import TextArea from "../components/ui/TextArea/TextArea.jsx";
import Avatar from "../components/ui/Avatar/Avatar.jsx";
import AvatarLabel from "../components/ui/AvatarLabel/AvatarLabel.jsx";
import AvatarGroup from "../components/ui/AvatarGroup/AvatarGroup.jsx";
import ScrollBar from "../components/ui/ScrollBar/ScrollBar.jsx";
import PaginationDots from "../components/ui/PaginationDots/PaginationDots.jsx";
import Accordion from "../components/ui/Accordion/Accordion.jsx";
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
} from "../components/ui/TextArea/textAreaShowcaseData.js";
import {
  avatarLabelMainComponent,
  avatarLabelQuickToggleItems,
  avatarLabelSizeItems,
} from "../components/ui/AvatarLabel/avatarLabelShowcaseData.js";
import {
  avatarIconItems,
  avatarTextItems,
} from "../components/ui/Avatar/avatarShowcaseData.js";
import {
  avatarGroupMainComponent,
  avatarGroupQuickToggleItems,
  avatarGroupReferenceItems,
  avatarGroupSizeItems,
} from "../components/ui/AvatarGroup/avatarGroupShowcaseData.js";
import {
  scrollBarLengthItems,
  scrollBarMainComponent,
} from "../components/ui/ScrollBar/scrollBarShowcaseData.js";
import {
  paginationDotsMainComponent,
  paginationDotsTypeItems,
} from "../components/ui/PaginationDots/paginationDotsShowcaseData.js";
import {
  accordionMainComponent,
  accordionStateItems,
} from "../components/ui/Accordion/accordionShowcaseData.js";

function ShowcaseCard({ title, children, className }) {
  return (
    <section
      className={clsx(
        "flex flex-col gap-4 rounded-[20px] border border-(--color-neutral-200) bg-(--color-neutral-bg) p-6",
        className,
      )}
    >
      <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-(--color-text-300)">
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
        "flex min-h-33 flex-col gap-3 rounded-2xl border border-(--color-neutral-200) bg-(--color-neutral-100) p-4",
        className,
      )}
    >
      <span className="text-body-4 text-(--color-text-200)">{label}</span>
      <div className="flex flex-1 items-start justify-center">{children}</div>
    </div>
  );
}

function PreviewTile({ label, children, className, previewClassName }) {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)]",
        className,
      )}
    >
      <div
        className={clsx(
          "flex items-center justify-center p-[16px]",
          previewClassName,
        )}
      >
        {children}
      </div>

      <div className="border-t border-[var(--color-neutral-200)] px-[8px] py-[6px]">
        <span className="text-[12px] leading-[20px] font-medium tracking-[-0.5px] text-[var(--color-text-300)]">
          {label}
        </span>
      </div>
    </div>
  );
}

function ReferenceFrame({ children, className }) {
  return (
    <div
      className={clsx(
        "rounded-[12px] border border-dashed border-[#8a48ff] p-[16px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function resolveAvatarLabelItemForTheme(item, isDarkMode) {
  if (!isDarkMode) {
    return item;
  }

  return {
    ...item,
    props: {
      ...item.props,
      avatarTheme: "Brand 1",
    },
  };
}

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function ScrollBarMovementDemo() {
  const viewportRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollLength, setScrollLength] = useState(0.42);

  useEffect(() => {
    function measure() {
      const element = viewportRef.current;

      if (!element) {
        return;
      }

      const maxScroll = Math.max(
        element.scrollHeight - element.clientHeight,
        0,
      );
      const nextLength =
        element.clientHeight / Math.max(element.scrollHeight, 1);
      const nextPosition =
        maxScroll === 0 ? 0 : clamp(element.scrollTop / maxScroll, 0, 1);

      setScrollLength(nextLength);
      setScrollPosition(nextPosition);
    }

    measure();

    const observer = new ResizeObserver(measure);

    if (viewportRef.current) {
      observer.observe(viewportRef.current);
    }

    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  function handleScroll() {
    const element = viewportRef.current;

    if (!element) {
      return;
    }

    const maxScroll = Math.max(element.scrollHeight - element.clientHeight, 0);
    const nextPosition =
      maxScroll === 0 ? 0 : clamp(element.scrollTop / maxScroll, 0, 1);

    setScrollPosition(nextPosition);
  }

  function handlePositionChange(nextPosition) {
    const element = viewportRef.current;

    if (!element) {
      return;
    }

    const maxScroll = Math.max(element.scrollHeight - element.clientHeight, 0);
    element.scrollTop = nextPosition * maxScroll;
    setScrollPosition(nextPosition);
  }

  return (
    <div className="flex items-start gap-[16px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[16px]">
      <div
        ref={viewportRef}
        className="h-[240px] w-[220px] overflow-y-auto pr-[4px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
      >
        <div className="flex flex-col gap-[12px]">
          {Array.from({ length: 9 }, (_, index) => (
            <div
              key={index}
              className="rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[12px]"
            >
              <p className="text-body-4 text-[var(--color-text-300)]">
                Elemento {index + 1}
              </p>
              <p className="mt-[4px] text-body-5 text-[var(--color-text-200)]">
                Desplaza este panel o arrastra la barra para ver el movimiento.
              </p>
            </div>
          ))}
        </div>
      </div>

      <ScrollBar
        interactive
        height={240}
        length={scrollLength}
        position={scrollPosition}
        onPositionChange={handlePositionChange}
      />
    </div>
  );
}

const PAGINATION_DOTS_EXAMPLE_STEPS = [
  {
    eyebrow: "Slide 01",
    title: "Explora componentes",
    description:
      "Cada dot representa una vista distinta. Haz clic en ellos para cambiar de estado.",
  },
  {
    eyebrow: "Slide 02",
    title: "Controla el avance",
    description:
      "La variante Both mantiene el foco visual del elemento activo y deja el resto en segundo plano.",
  },
  {
    eyebrow: "Slide 03",
    title: "Mantiene consistencia",
    description:
      "Puedes reutilizar el mismo componente en carruseles, pasos cortos o galerias.",
  },
];

function PaginationDotsExample() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = PAGINATION_DOTS_EXAMPLE_STEPS[activeIndex];
  const lastIndex = PAGINATION_DOTS_EXAMPLE_STEPS.length - 1;

  function goToPrevious() {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? lastIndex : currentIndex - 1,
    );
  }

  function goToNext() {
    setActiveIndex((currentIndex) =>
      currentIndex === lastIndex ? 0 : currentIndex + 1,
    );
  }

  return (
    <div className="flex flex-col gap-[16px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[16px]">
      <div className="rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[20px]">
        <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-200)]">
          {activeStep.eyebrow}
        </span>
        <h3 className="mt-[8px] text-heading-5 text-[var(--color-text-50)]">
          {activeStep.title}
        </h3>
        <p className="mt-[8px] max-w-[420px] text-body-4 text-[var(--color-text-200)]">
          {activeStep.description}
        </p>
      </div>

      <div className="flex flex-col gap-[12px] sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-[8px]">
          <button
            type="button"
            className="rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] px-[14px] py-[8px] text-body-4 text-[var(--color-text-300)] transition-colors duration-200 hover:bg-[var(--color-neutral-100)]"
            onClick={goToPrevious}
          >
            Anterior
          </button>
          <button
            type="button"
            className="rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] px-[14px] py-[8px] text-body-4 text-[var(--color-text-300)] transition-colors duration-200 hover:bg-[var(--color-neutral-100)]"
            onClick={goToNext}
          >
            Siguiente
          </button>
        </div>

        <PaginationDots
          interactive
          count={PAGINATION_DOTS_EXAMPLE_STEPS.length}
          activeIndex={activeIndex}
          type="Both"
          onChange={setActiveIndex}
        />
      </div>
    </div>
  );
}

function AccordionExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-[12px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[16px]">
      <Accordion
        interactive
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Los títulos del acordeón van aquí"
        description="La descripción del acordeón va aquí, se debe intentar mantenerla en menos de 2 líneas."
      />

      <p className="text-body-4 text-[var(--color-text-200)]">
        Pasa el cursor para ver el estado hover y haz click para abrir o cerrar
        el contenido.
      </p>
    </div>
  );
}

function Home() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }

    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const root = document.documentElement;
    const updateTheme = () => {
      setIsDarkMode(root.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const resolvedTextAreaMainComponent = isDarkMode
    ? {
        ...textAreaMainComponent,
        state: "Focused",
        defaultValue: "Texto de prueba",
      }
    : textAreaMainComponent;

  const resolvedTextAreaQuickToggleItems = isDarkMode
    ? textAreaQuickToggleItems.map((item) => ({
        ...item,
        props: {
          ...item.props,
          state: "Hover",
          defaultValue: "Texto de prueba",
        },
      }))
    : textAreaQuickToggleItems;

  const resolvedAvatarLabelMainComponent = isDarkMode
    ? {
        ...avatarLabelMainComponent,
        avatarTheme: "Brand 1",
      }
    : avatarLabelMainComponent;

  const resolvedAvatarLabelQuickToggleItems = isDarkMode
    ? avatarLabelQuickToggleItems.map((item) =>
        resolveAvatarLabelItemForTheme(item, true),
      )
    : avatarLabelQuickToggleItems;

  const resolvedAvatarLabelSizeItems = isDarkMode
    ? avatarLabelSizeItems.map((item) =>
        resolveAvatarLabelItemForTheme(item, true),
      )
    : avatarLabelSizeItems;

  const avatarReferenceTextItems = avatarTextItems;
  const avatarReferenceIconItems = avatarIconItems;
  const avatarLabelReferenceItems = isDarkMode
    ? [
        {
          size: "S",
          showLabel: true,
          showSubtitle: false,
          avatarTheme: "Brand 1",
        },
        {
          size: "M",
          showLabel: true,
          showSubtitle: true,
          avatarTheme: "Brand 1",
        },
        {
          size: "L",
          showLabel: true,
          showSubtitle: true,
          avatarTheme: "Brand 1",
        },
      ]
    : [
        {
          size: "S",
          showLabel: true,
          showSubtitle: false,
          avatarTheme: "Neutral",
        },
        {
          size: "M",
          showLabel: true,
          showSubtitle: true,
          avatarTheme: "Neutral",
        },
        {
          size: "L",
          showLabel: true,
          showSubtitle: true,
          avatarTheme: "Neutral",
        },
      ];

  return (
    <main className="min-h-screen bg-(--color-neutral-bg) px-6 py-10 text-[var(--color-text-50)] transition-colors duration-200">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Input field
            </span>
            <h1 className="text-heading-4 text-(--color-text-50)">
              Main component, size, quick toggle, state y type
            </h1>
            <p className="text-body-3 text-(--color-text-200)">
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
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="h-fit xl:col-span-4">
            <TextArea {...resolvedTextAreaMainComponent} />
          </ShowcaseCard>

          <ShowcaseCard title="Quick toggle" className="xl:col-span-8">
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {resolvedTextAreaQuickToggleItems.map((item) => (
                <SampleCell
                  key={item.label}
                  label={item.label}
                  className="min-h-[194px]"
                >
                  <TextArea {...item.props} />
                </SampleCell>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Feedback" className="xl:col-span-12">
            <div className="grid gap-4 md:grid-cols-2">
              {textAreaFeedbackItems.map((item) => (
                <SampleCell
                  key={item.label}
                  label={item.label}
                  className="min-h-[245px]"
                >
                  <TextArea {...item.props} />
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
              Avatar label
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="h-fit xl:col-span-4">
            <PreviewTile
              label="Avatar Label"
              className="w-[166px]"
              previewClassName="w-[166px]"
            >
              <AvatarLabel {...resolvedAvatarLabelMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Quick toggle" className="xl:col-span-8">
            <div className="flex flex-wrap items-start gap-[12px]">
              {resolvedAvatarLabelQuickToggleItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={item.previewWidthClassName}
                  previewClassName={item.previewWidthClassName}
                >
                  <AvatarLabel {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Size" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {resolvedAvatarLabelSizeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={item.previewWidthClassName}
                  previewClassName={item.previewWidthClassName}
                >
                  <AvatarLabel {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Combinations" className="xl:col-span-12">
            <div className="flex flex-col gap-[18px]">
              <ReferenceFrame className="max-w-[382px]">
                <div className="flex flex-col gap-[48px]">
                  <div className="flex flex-wrap items-center gap-[20px]">
                    {avatarReferenceTextItems.map((item) => (
                      <Avatar
                        key={`reference-text-${item.label}`}
                        {...item.props}
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-[20px]">
                    {avatarReferenceIconItems.map((item) => (
                      <Avatar
                        key={`reference-icon-${item.label}`}
                        {...item.props}
                      />
                    ))}
                  </div>
                </div>
              </ReferenceFrame>

              <ReferenceFrame className="max-w-[466px]">
                <div className="flex flex-wrap items-center gap-[20px]">
                  {avatarLabelReferenceItems.map((item, index) => (
                    <AvatarLabel
                      key={`reference-avatar-label-${index}`}
                      {...item}
                    />
                  ))}
                </div>
              </ReferenceFrame>
            </div>
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Avatar group
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component, quick toggle y size
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="h-fit xl:col-span-4">
            <PreviewTile
              label="Avatar Group"
              className="w-[110px]"
              previewClassName="w-[110px]"
            >
              <AvatarGroup {...avatarGroupMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Quick toggle" className="xl:col-span-8">
            <div className="flex flex-wrap items-start gap-[12px]">
              {avatarGroupQuickToggleItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={item.previewWidthClassName}
                  previewClassName={item.previewWidthClassName}
                >
                  <AvatarGroup {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Size" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {avatarGroupSizeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={item.previewWidthClassName}
                  previewClassName={item.previewWidthClassName}
                >
                  <AvatarGroup {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Combinations" className="xl:col-span-12">
            <ReferenceFrame className="max-w-[256px]">
              <div className="flex flex-col gap-[40px]">
                {avatarGroupReferenceItems.map((item, index) => (
                  <AvatarGroup
                    key={`avatar-group-reference-${index}`}
                    {...item}
                  />
                ))}
              </div>
            </ReferenceFrame>
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Scroll bar
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component, length y movement
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="h-fit xl:col-span-4">
            <PreviewTile
              label="Scroll bar"
              className="w-[71px]"
              previewClassName="w-[71px]"
            >
              <ScrollBar {...scrollBarMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Length" className="xl:col-span-8">
            <div className="flex flex-wrap items-start gap-[12px]">
              {scrollBarLengthItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-[48px]"
                  previewClassName="w-[48px]"
                >
                  <ScrollBar {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Movement example" className="xl:col-span-12">
            <ScrollBarMovementDemo />
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Pagination dots
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component, type y example
            </h2>
            <p className="text-body-3 text-[var(--color-text-200)]">
              Implementacion basada en el nodo `2061:23838` de Figma.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="h-fit xl:col-span-4">
            <PreviewTile
              label="Pagination dots"
              className="w-[120px]"
              previewClassName="w-[120px]"
            >
              <PaginationDots {...paginationDotsMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Type" className="xl:col-span-8">
            <div className="flex flex-wrap items-start gap-[12px]">
              {paginationDotsTypeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={item.previewWidthClassName}
                  previewClassName={item.previewWidthClassName}
                >
                  <PaginationDots {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Example" className="xl:col-span-12">
            <PaginationDotsExample />
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Accordion
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component, states y example
            </h2>
            <p className="text-body-3 text-[var(--color-text-200)]">
              Implementacion basada en el nodo `2061:23879` de Figma.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Accordion"
              className="w-full max-w-[472px]"
              previewClassName="w-full max-w-[472px]"
            >
              <Accordion {...accordionMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="State" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {accordionStateItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={item.previewWidthClassName}
                  previewClassName={item.previewWidthClassName}
                >
                  <Accordion {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Example" className="xl:col-span-12">
            <AccordionExample />
          </ShowcaseCard>
        </div>
      </section>
    </main>
  );
}

export default Home;
