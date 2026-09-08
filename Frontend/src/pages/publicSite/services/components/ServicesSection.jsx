import ServicesCategoryShowcase from "./ServicesCategoryShowcase.jsx";
import ServicesHeading from "./ServicesHeading.jsx";
import {
  SERVICES_CATEGORIES,
  SERVICES_HEADING,
} from "../servicesContent.js";

function ServicesSection() {
  return (
    <section id="services" aria-label="Servicios" className="dark flex min-h-dvh flex-col gap-[48px] bg-[var(--color-neutral-950-uniform)]">
      <ServicesHeading {...SERVICES_HEADING} />
      <ServicesCategoryShowcase categories={SERVICES_CATEGORIES} />
    </section>
  );
}

export default ServicesSection;
