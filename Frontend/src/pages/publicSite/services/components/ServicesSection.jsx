import ServicesCategoryShowcase from "./ServicesCategoryShowcase.jsx";
import ServicesHeading from "./ServicesHeading.jsx";
import "./ServicesSection.css";
import {
  SERVICES_CATEGORIES,
  SERVICES_HEADING,
} from "../servicesContent.js";

function ServicesSection({ onNextSection, onTitleRevealComplete }) {
  return (
    <section id="services" aria-label="Servicios" className="services-section dark flex min-h-dvh flex-col gap-[var(--spacing-gap-8)] bg-[var(--color-neutral-950-uniform)] pt-[var(--spacing-gap-9)] pb-[var(--spacing-gap-8)]">
      <ServicesHeading {...SERVICES_HEADING} onRevealComplete={() => onTitleRevealComplete?.("services")} />
      <ServicesCategoryShowcase
        categories={SERVICES_CATEGORIES}
        onNextSection={onNextSection}
      />
    </section>
  );
}

export default ServicesSection;
