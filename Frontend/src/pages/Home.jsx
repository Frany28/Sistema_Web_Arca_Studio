import { useEffect, useState } from "react";
import clsx from "clsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import Checkbox from "../components/ui/Checkbox/Checkbox.jsx";
import Toggle from "../components/ui/Toggle/Toggle.jsx";
import Modal from "../components/ui/Modal/Modal.jsx";
import HorizontalTabMenu from "../components/ui/HorizontalTabMenu.jsx";
import TabItem from "../components/ui/TabItem.jsx";
import ProgressBarLabel from "../components/ui/ProgressBarLabel.jsx";
import CircleProgressBarLabel from "../components/ui/CircleProgressBarLabel.jsx";
import {
  checkboxCheckedItems,
  checkboxMainComponent,
  checkboxReferenceRows,
  checkboxSizeItems,
  checkboxStateItems,
} from "../components/ui/Checkbox/checkboxShowcaseData.js";
import { modalAlignmentItems } from "../components/ui/Modal/modalShowcaseData.js";
import {
  toggleActivityItems,
  toggleMainComponent,
  toggleReferenceRows,
  toggleSizeItems,
  toggleStateItems,
} from "../components/ui/Toggle/toggleShowcaseData.js";
import {
  tabItemDividerExampleItem,
  tabItemDividerMainComponent,
  tabItemDividerSizeItems,
  tabItemDividerStateItems,
  tabItemExampleItem,
  tabItemMainComponent,
  tabItemSizeItems,
  tabItemStateItems,
  tabItemUnderlineExampleItem,
  tabItemUnderlineMainComponent,
  tabItemUnderlineSizeItems,
  tabItemUnderlineStateItems,
} from "../components/ui/TabItem/tabItemShowcaseData.js";
import {
  horizontalTabMenuFilledOnExampleItems,
  horizontalTabMenuFilledOnMainComponent,
  horizontalTabMenuMainComponent,
  horizontalTabMenuUnderlinedMainComponent,
} from "../components/ui/HorizontalTabMenu/horizontalTabMenuShowcaseData.js";
import {
  progressBarLabelExampleItem,
  progressBarLabelMainComponent,
  progressBarLabelPercentagePositionItems,
  progressBarLabelQuickToggleItems,
} from "../components/ui/ProgressBarLabel/progressBarLabelShowcaseData.js";
import {
  circleProgressBarLabelExampleItem,
  circleProgressBarLabelMainComponent,
  circleProgressBarLabelQuickToggleItems,
  circleProgressBarLabelReferenceItems,
} from "../components/ui/CircleProgressBarLabel/circleProgressBarLabelShowcaseData.js";

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

function MenuPreviewFrame({ children, className, innerClassName }) {
  return (
    <div
      className={clsx(
        "w-full overflow-x-auto rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[16px]",
        className,
      )}
    >
      <div className={clsx("min-w-max", innerClassName)}>{children}</div>
    </div>
  );
}

function ModalOverlayExample() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <div className="flex flex-col gap-[16px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[16px]">
        <div className="flex flex-col gap-[12px] sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-[540px]">
            <p className="text-body-4 text-[var(--color-text-300)]">
              Abre el modal para validar el main component fullscreen del nodo
              `2056:23761`, con overlay completo y respuesta al tema actual.
            </p>
          </div>

          <button
            type="button"
            className="rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] px-[14px] py-[8px] text-body-4 text-[var(--color-text-300)] transition-colors duration-200 hover:bg-[var(--color-neutral-100)]"
            onClick={() => setIsOpen(true)}
          >
            Mostrar modal
          </button>
        </div>
      </div>

      {isOpen ? (
        <Modal
          showDialog
          onClick={() => setIsOpen(false)}
          title="Titulo aqui"
          description="Horem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis."
          onClose={() => setIsOpen(false)}
          onSecondaryAction={() => setIsOpen(false)}
          onPrimaryAction={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
}

function ModalAlignmentPreview({ modalProps, frameClassName }) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-[var(--color-neutral-bg)] transition-colors duration-200",
        frameClassName,
      )}
    >
      <Modal {...modalProps} className="pointer-events-none" />
    </div>
  );
}

function CheckboxReferenceMatrix() {
  return (
    <ReferenceFrame className="w-fit">
      <div className="grid grid-cols-2 justify-items-center gap-x-[20px] gap-y-[16px]">
        {checkboxReferenceRows.map((row, rowIndex) => (
          <div key={rowIndex} className="contents">
            {row.map((item, itemIndex) => (
              <div
                key={`${rowIndex}-${itemIndex}`}
                className="flex h-[28px] w-[28px] items-center justify-center"
              >
                <Checkbox {...item} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </ReferenceFrame>
  );
}

function ToggleReferenceMatrix() {
  return (
    <ReferenceFrame className="w-fit">
      <div className="grid grid-cols-3 justify-items-center gap-x-[28px] gap-y-[20px]">
        {toggleReferenceRows.map((row, rowIndex) => (
          <div key={rowIndex} className="contents">
            {row.map((item, itemIndex) => (
              <div
                key={`${rowIndex}-${itemIndex}`}
                className="flex min-h-[32px] min-w-[54px] items-center justify-center"
              >
                <Toggle {...item} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </ReferenceFrame>
  );
}

function ToggleFunctionalExample() {
  const [isActive, setIsActive] = useState(true);
  const [size, setSize] = useState("M");
  const [state, setState] = useState(undefined);

  const stateOptions = [
    { label: "Interactive", value: undefined },
    { label: "Default", value: "Default" },
    { label: "Hover", value: "Hover" },
    { label: "Focused", value: "Focused" },
    { label: "Disabled", value: "Disabled" },
  ];

  return (
    <div className="flex flex-col gap-[20px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[16px]">
      <div className="flex flex-col gap-[10px]">
        <p className="text-body-4 text-[var(--color-text-300)]">
          Toggle funcional con click, foco y hover reales.
        </p>
        <div className="flex flex-wrap gap-[8px]">
          {["S", "M", "L"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSize(item)}
              className={clsx(
                "rounded-full border px-[12px] py-[6px] text-[12px] leading-[20px] font-medium transition-colors duration-150",
                size === item
                  ? "border-[var(--color-primary-300)] bg-[var(--color-primary-10)] text-[var(--color-text-200)]"
                  : "border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] text-[var(--color-text-300)] hover:bg-[var(--color-neutral-100)]",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-[16px]">
        <div className="flex min-w-[120px] items-center justify-center rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-[16px] py-[20px]">
          <Toggle
            size={size}
            active={isActive}
            state={state}
            interactive={state === undefined}
            onActiveChange={setIsActive}
          />
        </div>

        <div className="flex flex-col gap-[4px]">
          <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
            Status
          </span>
          <span className="text-body-3 text-[var(--color-text-200)]">
            {isActive ? "Active" : "Inactive"} · Size {size} ·{" "}
            {state ?? "Interactive"}
          </span>
          <span className="text-body-4 text-[var(--color-text-300)]">
            Usa tab para validar foco y cursor para hover.
          </span>
        </div>
      </div>
    </div>
  );
}

function HorizontalTabMenuSetExample() {
  const [brandOffIndex, setBrandOffIndex] = useState(0);
  const [brandOnIndex, setBrandOnIndex] = useState(0);
  const [underlinedOffIndex, setUnderlinedOffIndex] = useState(0);
  const [underlinedOnIndex, setUnderlinedOnIndex] = useState(0);

  return (
    <MenuPreviewFrame>
      <div className="flex min-w-[960px] flex-col gap-[32px]">
        <HorizontalTabMenu
          {...horizontalTabMenuMainComponent}
          interactive
          activeIndex={brandOffIndex}
          onChange={setBrandOffIndex}
        />
        <HorizontalTabMenu
          {...horizontalTabMenuFilledOnMainComponent}
          interactive
          activeIndex={brandOnIndex}
          onChange={setBrandOnIndex}
        />
        <HorizontalTabMenu
          {...horizontalTabMenuUnderlinedMainComponent}
          interactive
          activeIndex={underlinedOffIndex}
          onChange={setUnderlinedOffIndex}
        />
        <HorizontalTabMenu
          style="Underlined"
          filled="on"
          items={horizontalTabMenuFilledOnExampleItems.items}
          interactive
          activeIndex={underlinedOnIndex}
          onChange={setUnderlinedOnIndex}
        />
      </div>
    </MenuPreviewFrame>
  );
}

function TabItemFunctionalExample() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const items = [
    { label: "item 1", size: "S" },
    { label: "item 2", size: "S" },
    { label: "item 3", size: "M" },
  ];

  return (
    <div className="flex flex-col gap-[20px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[16px]">
      <div className="flex flex-col gap-[10px]">
        <p className="text-body-4 text-[var(--color-text-300)]">
          Tab item funcional con seleccion por click y hover real.
        </p>
      </div>

      <div className="flex flex-col gap-[16px]">
        <div className="flex flex-wrap gap-[12px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px]">
          {items.map((item, index) => (
            <TabItem
              key={`${item.label}-${index}`}
              {...tabItemExampleItem}
              label={item.label}
              size={item.size}
              selected={selectedIndex === index}
              onSelectedChange={() => setSelectedIndex(index)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-[4px]">
          <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
            Status
          </span>
          <span className="text-body-3 text-[var(--color-text-200)]">
            Selected: {items[selectedIndex].label}
          </span>
          <span className="text-body-4 text-[var(--color-text-300)]">
            Cambia el tema global para validar la lectura del modo oscuro.
          </span>
        </div>
      </div>
    </div>
  );
}

function TabItemUnderlineFunctionalExample() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const items = [
    { label: "item 1", size: "S" },
    { label: "item 2", size: "S" },
    { label: "item 3", size: "M" },
  ];

  return (
    <div className="flex flex-col gap-[20px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[16px]">
      <div className="flex flex-col gap-[10px]">
        <p className="text-body-4 text-[var(--color-text-300)]">
          Variante underline funcional con seleccion por click y hover real.
        </p>
      </div>

      <div className="flex flex-col gap-[16px]">
        <div className="flex flex-wrap items-end gap-[16px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px]">
          {items.map((item, index) => (
            <TabItem
              key={`${item.label}-${index}`}
              {...tabItemUnderlineExampleItem}
              label={item.label}
              size={item.size}
              selected={selectedIndex === index}
              onSelectedChange={() => setSelectedIndex(index)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-[4px]">
          <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
            Status
          </span>
          <span className="text-body-3 text-[var(--color-text-200)]">
            Selected: {items[selectedIndex].label}
          </span>
          <span className="text-body-4 text-[var(--color-text-300)]">
            Cambia el tema global para validar el indicador inferior en oscuro.
          </span>
        </div>
      </div>
    </div>
  );
}

function TabItemDividerFunctionalExample() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const items = [
    { label: "item 1", size: "S" },
    { label: "item 2", size: "S" },
    { label: "item 3", size: "M" },
  ];

  return (
    <div className="flex flex-col gap-[20px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[16px]">
      <div className="flex flex-col gap-[10px]">
        <p className="text-body-4 text-[var(--color-text-300)]">
          Variante divider funcional con seleccion por click y hover real.
        </p>
      </div>

      <div className="flex flex-col gap-[16px]">
        <div className="flex flex-wrap items-center gap-[16px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px]">
          {items.map((item, index) => (
            <TabItem
              key={`${item.label}-${index}`}
              {...tabItemDividerExampleItem}
              label={item.label}
              size={item.size}
              selected={selectedIndex === index}
              onSelectedChange={() => setSelectedIndex(index)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-[4px]">
          <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
            Status
          </span>
          <span className="text-body-3 text-[var(--color-text-200)]">
            Selected: {items[selectedIndex].label}
          </span>
          <span className="text-body-4 text-[var(--color-text-300)]">
            Cambia el tema global para validar el divisor izquierdo en oscuro.
          </span>
        </div>
      </div>
    </div>
  );
}

function ProgressBarLabelFunctionalExample() {
  const [position, setPosition] = useState(
    progressBarLabelExampleItem.position,
  );
  const [value, setValue] = useState(progressBarLabelExampleItem.value);
  const [showTitle, setShowTitle] = useState(
    progressBarLabelExampleItem.showTitle,
  );
  const [showSublabel, setShowSublabel] = useState(
    progressBarLabelExampleItem.showSublabel,
  );

  return (
    <div className="flex flex-col gap-[20px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[16px]">
      <div className="flex flex-col gap-[10px]">
        <p className="text-body-4 text-[var(--color-text-300)]">
          Controla la posicion del porcentaje y la visibilidad de los labels.
        </p>

        <div className="flex flex-wrap gap-[8px]">
          {[
            { label: "On top", value: "top" },
            { label: "On side", value: "side" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPosition(item.value)}
              className={clsx(
                "rounded-full border px-[12px] py-[6px] text-[12px] leading-[20px] font-medium transition-colors duration-150",
                position === item.value
                  ? "border-[var(--color-primary-300)] bg-[var(--color-primary-10)] text-[var(--color-text-200)]"
                  : "border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] text-[var(--color-text-300)] hover:bg-[var(--color-neutral-100)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-[8px]">
          {[
            {
              label: "Title",
              active: showTitle,
              onClick: () => setShowTitle((current) => !current),
            },
            {
              label: "Sub label",
              active: showSublabel,
              onClick: () => setShowSublabel((current) => !current),
            },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={clsx(
                "rounded-full border px-[12px] py-[6px] text-[12px] leading-[20px] font-medium transition-colors duration-150",
                item.active
                  ? "border-[var(--color-primary-300)] bg-[var(--color-primary-10)] text-[var(--color-text-200)]"
                  : "border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] text-[var(--color-text-300)] hover:bg-[var(--color-neutral-100)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[12px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px]">
        <label className="flex flex-col gap-[8px]">
          <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
            Percentage
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
            className="w-full accent-[var(--color-text-300)]"
          />
        </label>

        <div className="rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[16px]">
          <ProgressBarLabel
            {...progressBarLabelExampleItem}
            position={position}
            value={value}
            showTitle={showTitle}
            showSublabel={showSublabel}
          />
        </div>
      </div>
    </div>
  );
}

function CircleProgressBarLabelFunctionalExample() {
  const [size, setSize] = useState(circleProgressBarLabelExampleItem.size);
  const [value, setValue] = useState(circleProgressBarLabelExampleItem.value);
  const [showText, setShowText] = useState(
    circleProgressBarLabelExampleItem.showText,
  );

  return (
    <div className="flex flex-col gap-[20px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[16px]">
      <div className="flex flex-col gap-[10px]">
        <p className="text-body-4 text-[var(--color-text-300)]">
          Ajusta porcentaje, tamaño y visibilidad del bloque de texto.
        </p>

        <div className="flex flex-wrap gap-[8px]">
          {["S", "M", "L"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSize(item)}
              className={clsx(
                "rounded-full border px-[12px] py-[6px] text-[12px] leading-[20px] font-medium transition-colors duration-150",
                size === item
                  ? "border-[var(--color-primary-300)] bg-[var(--color-primary-10)] text-[var(--color-text-200)]"
                  : "border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] text-[var(--color-text-300)] hover:bg-[var(--color-neutral-100)]",
              )}
            >
              {item}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowText((current) => !current)}
            className={clsx(
              "rounded-full border px-[12px] py-[6px] text-[12px] leading-[20px] font-medium transition-colors duration-150",
              showText
                ? "border-[var(--color-primary-300)] bg-[var(--color-primary-10)] text-[var(--color-text-200)]"
                : "border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] text-[var(--color-text-300)] hover:bg-[var(--color-neutral-100)]",
            )}
          >
            Text
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[12px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px]">
        <label className="flex flex-col gap-[8px]">
          <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
            Percentage
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
            className="w-full accent-[var(--color-text-300)]"
          />
        </label>

        <div className="rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-[16px]">
          <CircleProgressBarLabel
            {...circleProgressBarLabelExampleItem}
            size={size}
            value={value}
            showText={showText}
          />
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <main className="min-h-screen bg-(--color-neutral-bg) px-6 py-10 text-[var(--color-text-50)] transition-colors duration-200">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Modal overlay
            </span>
            <h1 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h1>
          </div>

          <ThemeToggle />
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Alignment" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {modalAlignmentItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[464px]"
                  previewClassName="w-full"
                >
                  <ModalAlignmentPreview
                    modalProps={item.props}
                    frameClassName={
                      item.label === "Horizontal split"
                        ? "h-[320px] w-full"
                        : "h-[310px] w-full"
                    }
                  />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Example" className="xl:col-span-12">
            <ModalOverlayExample />
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Checkbox
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Checkbox"
              className="w-full max-w-[74px]"
              previewClassName="min-h-[52px] w-full"
            >
              <Checkbox {...checkboxMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Size" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {checkboxSizeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={
                    item.label === "S"
                      ? "w-full max-w-[48px]"
                      : "w-full max-w-[52px]"
                  }
                  previewClassName={
                    item.label === "S"
                      ? "min-h-[48px] w-full"
                      : "min-h-[52px] w-full"
                  }
                >
                  <Checkbox {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Checked" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {checkboxCheckedItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={
                    item.label === "Indeterminate"
                      ? "w-full max-w-[97px]"
                      : "w-full max-w-[52px]"
                  }
                  previewClassName="min-h-[52px] w-full"
                >
                  <Checkbox {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="State" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {checkboxStateItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={clsx(
                    "w-full",
                    item.label === "Default" && "max-w-[58px]",
                    item.label === "Hover" && "max-w-[52px]",
                    item.label === "Focused" && "max-w-[65px]",
                    item.label === "Disabled" && "max-w-[66px]",
                  )}
                  previewClassName="min-h-[52px] w-full"
                >
                  <Checkbox {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="All forms" className="xl:col-span-12">
            <CheckboxReferenceMatrix />
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Toggle
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Toggle"
              className="w-full max-w-[76px]"
              previewClassName="min-h-[56px] w-full"
            >
              <Toggle {...toggleMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Toggle" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {toggleActivityItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[76px]"
                  previewClassName="min-h-[56px] w-full"
                >
                  <Toggle {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Size" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {toggleSizeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={clsx(
                    "w-full",
                    item.label === "S" && "max-w-[68px]",
                    item.label === "M" && "max-w-[76px]",
                    item.label === "L" && "max-w-[86px]",
                  )}
                  previewClassName="min-h-[64px] w-full"
                >
                  <Toggle {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="State" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {toggleStateItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={clsx(
                    "w-full",
                    item.label === "Default" && "max-w-[68px]",
                    item.label === "Hover" && "max-w-[76px]",
                    item.label === "Focused" && "max-w-[76px]",
                    item.label === "Disabled" && "max-w-[76px]",
                  )}
                  previewClassName="min-h-[64px] w-full"
                >
                  <Toggle {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="All forms" className="xl:col-span-12">
            <ToggleReferenceMatrix />
          </ShowcaseCard>

          <ShowcaseCard title="Example" className="xl:col-span-12">
            <ToggleFunctionalExample />
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Horizontal tab menu
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Example" className="xl:col-span-12">
            <HorizontalTabMenuSetExample />
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Tab item
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Tab item"
              className="w-full max-w-[154px]"
              previewClassName="min-h-[72px] w-full"
            >
              <TabItem {...tabItemMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Size" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {tabItemSizeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[154px]"
                  previewClassName="min-h-[80px] w-full"
                >
                  <TabItem {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="State" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {tabItemStateItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[154px]"
                  previewClassName="min-h-[72px] w-full"
                >
                  <TabItem {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Example" className="xl:col-span-12">
            <TabItemFunctionalExample />
          </ShowcaseCard>

          <ShowcaseCard
            title="Underline / Main component"
            className="xl:col-span-12"
          >
            <PreviewTile
              label="Tab item"
              className="w-full max-w-[138px]"
              previewClassName="min-h-[72px] w-full"
            >
              <TabItem {...tabItemUnderlineMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Underline / Size" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {tabItemUnderlineSizeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[138px]"
                  previewClassName="min-h-[80px] w-full"
                >
                  <TabItem {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Underline / State" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {tabItemUnderlineStateItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[138px]"
                  previewClassName="min-h-[72px] w-full"
                >
                  <TabItem {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Underline / Example" className="xl:col-span-12">
            <TabItemUnderlineFunctionalExample />
          </ShowcaseCard>

          <ShowcaseCard
            title="Divider / Main component"
            className="xl:col-span-12"
          >
            <PreviewTile
              label="Tab item"
              className="w-full max-w-[154px]"
              previewClassName="min-h-[80px] w-full"
            >
              <TabItem {...tabItemDividerMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Divider / Size" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {tabItemDividerSizeItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[154px]"
                  previewClassName="min-h-[88px] w-full"
                >
                  <TabItem {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Divider / State" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {tabItemDividerStateItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[154px]"
                  previewClassName="min-h-[80px] w-full"
                >
                  <TabItem {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Divider / Example" className="xl:col-span-12">
            <TabItemDividerFunctionalExample />
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Progress bar label
            </span>
            <h2 className="text-heading-4 text-[var(--color-text-50)]">
              Main component
            </h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Progress bar label"
              className="w-full max-w-[352px]"
              previewClassName="min-h-[79px] w-full"
            >
              <ProgressBarLabel {...progressBarLabelMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Quick Toggle" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {progressBarLabelQuickToggleItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[352px]"
                  previewClassName="min-h-[99px] w-full"
                >
                  <ProgressBarLabel {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Percentage position" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {progressBarLabelPercentagePositionItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className="w-full max-w-[352px]"
                  previewClassName="min-h-[120px] w-full"
                >
                  <ProgressBarLabel {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Example" className="xl:col-span-12">
            <ProgressBarLabelFunctionalExample />
          </ShowcaseCard>
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Circle progress bar label
            </span>
          
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <ShowcaseCard title="Main component" className="xl:col-span-12">
            <PreviewTile
              label="Circle Progress bar label"
              className="w-full max-w-[332px]"
              previewClassName="min-h-[96px] w-full"
            >
              <CircleProgressBarLabel {...circleProgressBarLabelMainComponent} />
            </PreviewTile>
          </ShowcaseCard>

          <ShowcaseCard title="Quick Toggle" className="xl:col-span-12">
            <div className="flex flex-wrap items-start gap-[12px]">
              {circleProgressBarLabelQuickToggleItems.map((item) => (
                <PreviewTile
                  key={item.label}
                  label={item.label}
                  className={clsx(
                    "w-full",
                    item.label === "Base"
                      ? "max-w-[96px]"
                      : "max-w-[332px]",
                  )}
                  previewClassName="min-h-[96px] w-full"
                >
                  <CircleProgressBarLabel {...item.props} />
                </PreviewTile>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="Reference" className="xl:col-span-12">
            <ReferenceFrame className="w-full">
              <div className="flex flex-col gap-[20px]">
                {circleProgressBarLabelReferenceItems.map((item) => (
                  <CircleProgressBarLabel
                    key={item.label}
                    {...item.props}
                  />
                ))}
              </div>
            </ReferenceFrame>
          </ShowcaseCard>

          <ShowcaseCard title="Example" className="xl:col-span-12">
            <CircleProgressBarLabelFunctionalExample />
          </ShowcaseCard>
        </div>
      </section>
    </main>
  );
}

export default Home;
