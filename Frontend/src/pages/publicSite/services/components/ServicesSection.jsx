import ServicesCategoryShowcase from "./ServicesCategoryShowcase.jsx";
import ServicesHeading from "./ServicesHeading.jsx";
import {
  SERVICES_CATEGORIES,
  SERVICES_HEADING,
} from "../servicesContent.js";

function ServicesSection({ visible = false }) {
  return (
    <section id="services" aria-label="Servicios" className="dark flex min-h-dvh flex-col gap-[48px] bg-[var(--color-neutral-950-uniform)]">
      <ServicesHeading {...SERVICES_HEADING} visible={visible} />
      <ServicesCategoryShowcase categories={SERVICES_CATEGORIES} visible={visible} />
    </section>
  );
}

export default ServicesSection;
