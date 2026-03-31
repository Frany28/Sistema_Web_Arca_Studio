import clsx from "clsx";
import Flag from "../components/Flag.jsx";
import Badge from "../components/ui/Badge/Badge.jsx";
import Button from "../components/ui/Button/Button.jsx";
import ButtonGroupItem, {
  ButtonGroup,
} from "../components/ui/ButtonGroupItem/ButtonGroupItem.jsx";
import HintText from "../components/ui/HintText/HintText.jsx";
import IconContainer from "../components/ui/IconContainer/IconContainer.jsx";
import Label from "../components/ui/Label/Label.jsx";
import Tag from "../components/ui/Tag/Tag.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import {
  badgeMatrixSizes,
  badgeMatrixThemes,
  badgeMatrixVariations,
  badgeQuickToggleItems,
  badgeSizeItems,
  badgeStatusItems,
  createBadgeMatrixProps,
} from "../components/ui/Badge/badgeShowcaseData.js";
import {
  buttonQuickToggleItems,
  buttonSizeItems,
  buttonStyleSections,
} from "../components/ui/Button/buttonShowcaseData.js";
import {
  buttonGroupCountItems,
  buttonGroupItemMainComponent,
  buttonGroupItemQuickToggleItems,
  buttonGroupItemStateSection,
  buttonGroupMainComponent,
} from "../components/ui/ButtonGroupItem/buttonGroupItemShowcaseData.js";
import {
  hintTextQuickToggleItems,
  hintTextStateItems,
  passwordHintItems,
} from "../components/ui/HintText/hintTextShowcaseData.js";
import {
  iconContainerMainComponent,
  iconContainerSizeItems,
  iconContainerTypeRows,
} from "../components/ui/IconContainer/iconContainerShowcaseData.js";
import { labelStateItems } from "../components/ui/Label/labelShowcaseData.js";
import {
  tagMainStackItems,
  tagQuickToggleItems,
} from "../components/ui/Tag/tagShowcaseData.js";

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

function ShowcasePanel({ title, children, className }) {
  return (
    <section
      className={clsx(
        "flex flex-col gap-3 rounded-[20px] bg-[var(--color-neutral-bg)] px-5 pb-[25px] shadow-[0px_1px_2px_0px_rgba(95,74,46,0.08),0px_4px_6px_0px_rgba(95,74,46,0.04),0px_24px_40px_0px_rgba(104,75,37,0.08)]",
        className,
      )}
    >
      <div className="flex flex-col items-start pb-[10px] pt-[20px]">
        <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
          {title}
        </span>
      </div>
      {children}
    </section>
  );
}

function ShowcaseSample({ label, children, className }) {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)]",
        className,
      )}
    >
      <div className="flex min-h-[73px] items-center justify-center p-4">
        {children}
      </div>
      <div className="border-t border-[var(--color-neutral-200)] px-2 py-[6px]">
        <span className="text-[12px] font-medium leading-5 text-[var(--color-text-300)]">
          {label}
        </span>
      </div>
    </div>
  );
}

function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] px-6 py-10 text-[var(--color-text-50)] transition-colors duration-200">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <ThemeToggle />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <CatalogCard title="Sizes">
            <div className="flex flex-wrap gap-6">
              {buttonSizeItems.map((item) => (
                <ExampleCell key={item.label} label={item.label}>
                  <Button {...item.props} />
                </ExampleCell>
              ))}
            </div>
          </CatalogCard>

          <CatalogCard title="QuiCk Toggle">
            <div className="flex flex-wrap gap-6">
              {buttonQuickToggleItems.map((item) => (
                <ExampleCell key={item.label} label={item.label}>
                  <Button {...item.props} />
                </ExampleCell>
              ))}
            </div>
          </CatalogCard>

          {buttonStyleSections.map((section) => (
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

        <section className="grid gap-8 border-t border-[var(--color-neutral-200)] pt-8 xl:grid-cols-[310px_minmax(0,1fr)]">
          <div className="border border-[var(--color-neutral-200)] p-[10px]">
            <h2 className="text-heading-3 leading-[1.12] text-[var(--color-text-300)]">
              Button group item
            </h2>
          </div>
          <div className="border border-[var(--color-neutral-200)] p-4">
            <div className="flex flex-col gap-4 rounded-[24px] bg-[var(--color-neutral-bg)] p-4">
              <ShowcasePanel title="Main component" className="w-fit">
                <div className="flex items-start">
                  <ShowcaseSample
                    label="Button group item"
                    className="w-[120px]"
                  >
                    <ButtonGroupItem {...buttonGroupItemMainComponent} />
                  </ShowcaseSample>
                </div>
              </ShowcasePanel>

              <ShowcasePanel title="State">
                <div className="flex flex-wrap gap-3">
                  <ShowcaseSample label="Interactive" className="w-[119px]">
                    <ButtonGroupItem
                      {...buttonGroupItemStateSection.interactive}
                      interactive
                    />
                  </ShowcaseSample>
                  <ShowcaseSample label="Disabled" className="w-[119px]">
                    <ButtonGroupItem
                      {...buttonGroupItemStateSection.disabled}
                    />
                  </ShowcaseSample>
                </div>
              </ShowcasePanel>

              <ShowcasePanel title="QuiCk Toggle" className="w-fit">
                <div className="flex flex-wrap gap-3">
                  {buttonGroupItemQuickToggleItems.map((item) => (
                    <ShowcaseSample
                      key={item.label}
                      label={item.label}
                      className={
                        item.label === "Text" ? "w-[91px]" : "w-[84px]"
                      }
                    >
                      <ButtonGroupItem {...item.props} />
                    </ShowcaseSample>
                  ))}
                </div>
              </ShowcasePanel>
            </div>
          </div>
        </section>

        <section className="grid gap-8 border-t border-[var(--color-neutral-200)] pt-8 xl:grid-cols-[310px_minmax(0,1fr)]">
          <div className="border border-[var(--color-neutral-200)] p-[10px]">
            <h2 className="text-heading-3 leading-[1.12] text-[var(--color-text-300)]">
              Button group
            </h2>
          </div>
          <div className="border border-[var(--color-neutral-200)] p-4">
            <div className="flex flex-col gap-4 rounded-[24px] bg-[var(--color-neutral-bg)] p-4">
              <ShowcasePanel title="Main component" className="w-fit">
                <div className="flex items-start">
                  <ShowcaseSample label="Button group" className="w-[305px]">
                    <ButtonGroup {...buttonGroupMainComponent} />
                  </ShowcaseSample>
                </div>
              </ShowcasePanel>

              <ShowcasePanel title="Count">
                <div className="flex flex-wrap gap-3">
                  {buttonGroupCountItems.map((item) => (
                    <ShowcaseSample key={item.label} label={item.label}>
                      <ButtonGroup {...item.props} />
                    </ShowcaseSample>
                  ))}
                </div>
              </ShowcasePanel>
            </div>
          </div>
        </section>

        <section className="grid gap-8 border-t border-[var(--color-neutral-200)] pt-8 xl:grid-cols-[310px_minmax(0,1fr)]">
          <div className="border border-[var(--color-neutral-200)] p-[10px]">
            <h2 className="text-heading-3 leading-[1.12] text-[var(--color-text-300)]">
              Badge
            </h2>
          </div>
          <div className="border border-[var(--color-neutral-200)] p-4">
            <div className="flex flex-col gap-4 rounded-[24px] bg-[var(--color-neutral-bg)] p-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <ShowcasePanel title="Sizes">
                  <div className="flex flex-wrap gap-3">
                    {badgeSizeItems.map((item) => (
                      <ShowcaseSample
                        key={item.label}
                        label={item.label}
                        className="w-[82px]"
                      >
                        <Badge {...item.props} />
                      </ShowcaseSample>
                    ))}
                  </div>
                </ShowcasePanel>

                <ShowcasePanel title="QuiCk Toggle">
                  <div className="flex flex-wrap gap-3">
                    {badgeQuickToggleItems.map((item) => (
                      <ShowcaseSample
                        key={item.label}
                        label={item.label}
                        className={clsx(
                          item.label === "Text" && "w-[77px]",
                          item.label === "Status Dot" && "w-[89px]",
                          item.label === "Flag / Avatar" && "w-[93px]",
                        )}
                      >
                        <Badge {...item.props} />
                      </ShowcaseSample>
                    ))}
                  </div>
                </ShowcasePanel>
              </div>

              <ShowcasePanel title="styles / status">
                <div className="flex flex-wrap gap-3">
                  {badgeStatusItems.map((item) => (
                    <ShowcaseSample
                      key={item.label}
                      label={item.label}
                      className="w-[82px]"
                    >
                      <Badge {...item.props} />
                    </ShowcaseSample>
                  ))}
                </div>
              </ShowcasePanel>

              <div className="rounded-[8px] border border-dashed border-[#8b5cf6] p-6">
                <div className="flex flex-col gap-4">
                  {badgeMatrixThemes.map((theme) => (
                    <div key={theme} className="flex flex-wrap gap-3">
                      {badgeMatrixVariations.flatMap((variation) =>
                        badgeMatrixSizes.map((size) => (
                          <Badge
                            key={`${theme}-${variation}-${size}`}
                            {...createBadgeMatrixProps(theme, variation, size)}
                          />
                        )),
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 border-t border-[var(--color-neutral-200)] pt-8 xl:grid-cols-[310px_minmax(0,1fr)]">
          <div className="border border-[var(--color-neutral-200)] p-[10px]">
            <h2 className="text-heading-3 leading-[1.12] text-[var(--color-text-300)]">
              Icon container
            </h2>
          </div>
          <div className="border border-[var(--color-neutral-200)] p-4">
            <div className="flex flex-col gap-4 rounded-[24px] bg-[var(--color-neutral-bg)] p-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <ShowcasePanel title="Main component" className="w-fit">
                  <div className="flex items-start">
                    <ShowcaseSample
                      label="type=Outline, size=S"
                      className="w-[120px]"
                    >
                      <IconContainer {...iconContainerMainComponent} />
                    </ShowcaseSample>
                  </div>
                </ShowcasePanel>

                <ShowcasePanel title="Sizes">
                  <div className="flex flex-wrap gap-3">
                    {iconContainerSizeItems.map((item) => (
                      <ShowcaseSample
                        key={item.label}
                        label={item.label}
                        className="w-[82px]"
                      >
                        <IconContainer {...item.props} />
                      </ShowcaseSample>
                    ))}
                  </div>
                </ShowcasePanel>
              </div>

              <ShowcasePanel title="Styles">
                <div className="rounded-[8px] border border-dashed border-[#8b5cf6] p-6">
                  <div className="flex flex-col gap-4">
                    {iconContainerTypeRows.map((row) => (
                      <div key={row.label} className="flex flex-wrap gap-3">
                        {row.items.map((item) => (
                          <IconContainer
                            key={`${row.label}-${item.label}`}
                            {...item.props}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </ShowcasePanel>
            </div>
          </div>
        </section>

        <section className="grid gap-8 border-t border-[var(--color-neutral-200)] pt-8 xl:grid-cols-[310px_minmax(0,1fr)]">
          <div className="border border-[var(--color-neutral-200)] p-[10px]">
            <h2 className="text-heading-3 leading-[1.12] text-[var(--color-text-300)]">
              Hint text
            </h2>
          </div>
          <div className="border border-[var(--color-neutral-200)] p-4">
            <div className="flex flex-col gap-4 rounded-[24px] bg-[var(--color-neutral-bg)] p-4">
              <ShowcasePanel title="Hint / State">
                <div className="flex flex-wrap gap-3">
                  {hintTextStateItems.map((item) => (
                    <ShowcaseSample
                      key={item.label}
                      label={item.label}
                      className="w-[224px]"
                    >
                      <HintText {...item.props} />
                    </ShowcaseSample>
                  ))}
                </div>
              </ShowcasePanel>

              <ShowcasePanel title="Hint / QuiCk Toggle">
                <div className="flex flex-wrap gap-3">
                  {hintTextQuickToggleItems.map((item) => (
                    <ShowcaseSample
                      key={item.label}
                      label={item.label}
                      className={clsx(
                        item.label === "Text" && "w-[210px]",
                        item.label === "Icon" && "w-[82px]",
                      )}
                    >
                      <HintText {...item.props} />
                    </ShowcaseSample>
                  ))}
                </div>
              </ShowcasePanel>

              <ShowcasePanel title="Password / State">
                <div className="flex flex-wrap gap-3">
                  {passwordHintItems.map((item) => (
                    <ShowcaseSample
                      key={item.label}
                      label={item.label}
                      className="w-[332px]"
                    >
                      <HintText {...item.props} />
                    </ShowcaseSample>
                  ))}
                </div>
              </ShowcasePanel>
            </div>
          </div>
        </section>

        <section className="grid gap-8 border-t border-[var(--color-neutral-200)] pt-8 xl:grid-cols-[310px_minmax(0,1fr)]">
          <div className="border border-[var(--color-neutral-200)] p-[10px]">
            <h2 className="text-heading-3 leading-[1.12] text-[var(--color-text-300)]">
              Label
            </h2>
          </div>
          <div className="border border-[var(--color-neutral-200)] p-4">
            <div className="flex flex-col gap-4 rounded-[24px] bg-[var(--color-neutral-bg)] p-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <ShowcasePanel title="State">
                  <div className="flex flex-wrap gap-3">
                    {labelStateItems.map((item) => (
                      <ShowcaseSample
                        key={item.label}
                        label={item.label}
                        className="w-[120px]"
                      >
                        <Label {...item.props} />
                      </ShowcaseSample>
                    ))}
                  </div>
                </ShowcasePanel>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 border-t border-[var(--color-neutral-200)] pt-8 xl:grid-cols-[310px_minmax(0,1fr)]">
          <div className="border border-[var(--color-neutral-200)] p-[10px]">
            <h2 className="text-heading-3 leading-[1.12] text-[var(--color-text-300)]">
              Tag
            </h2>
          </div>
          <div className="border border-[var(--color-neutral-200)] p-4">
            <div className="flex flex-col gap-4 rounded-[24px] bg-[var(--color-neutral-bg)] p-4">
              <ShowcasePanel title="QuiCk Toggle">
                <div className="flex flex-wrap gap-3">
                  {tagQuickToggleItems.map((item) => (
                    <ShowcaseSample
                      key={item.label}
                      label={item.label}
                      className={clsx(
                        item.label === "Text" && "w-[69px]",
                        item.label === "Status Dot" && "w-[89px]",
                        item.label === "Flag / Avatar" && "w-[89px]",
                        item.label === "Close Icon" && "w-[85px]",
                        item.label === "Count" && "w-[89px]",
                      )}
                    >
                      <Tag {...item.props} />
                    </ShowcaseSample>
                  ))}
                </div>
              </ShowcasePanel>

              <div className="w-fit rounded-[8px] border border-dashed border-[#8b5cf6] p-6">
                <div className="flex flex-col gap-4">
                  {tagMainStackItems.map((item, index) => (
                    <Tag key={`${item.size}-${index}`} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Home;
