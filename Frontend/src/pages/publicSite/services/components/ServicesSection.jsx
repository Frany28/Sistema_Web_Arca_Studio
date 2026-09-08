import ServicesCategoryShowcase from "./ServicesCategoryShowcase.jsx";
import ServicesHeading from "./ServicesHeading.jsx";
import Button from "../../../../components/ui/Button/Button.jsx";
import {
  SERVICES_CATEGORIES,
  SERVICES_HEADING,
} from "../servicesContent.js";

function ServicesSection({ step = 0, onRevealComplete, onCategoriesComplete, onExit }) {
  return (
    <section id="services" aria-label="Servicios" className="dark flex min-h-dvh flex-col gap-[var(--spacing-gap-8)] bg-[var(--color-neutral-950-uniform)] pt-[var(--spacing-gap-9)] pb-[var(--spacing-gap-8)]">
      <ServicesHeading {...SERVICES_HEADING} visible={step >= 1} onRevealComplete={onRevealComplete} />
      <ServicesCategoryShowcase categories={SERVICES_CATEGORIES} visible={step >= 2} onRevealComplete={onRevealComplete} onCategoriesComplete={onCategoriesComplete} />
      {step >= 2 && <div className="flex justify-center">
        <Button theme="Primary" type="Outline" size="S" fitContent onClick={() => onExit?.("home")}>
          Volver al inicio
        </Button>
      </div>}
    </section>
  );
}

export default ServicesSection;
