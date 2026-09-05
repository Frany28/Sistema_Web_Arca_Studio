import { useNavigate } from "react-router-dom";

import PublicSiteHeader from "../components/PublicSiteHeader/PublicSiteHeader.jsx";
import ServicesCategoryShowcase from "./components/ServicesCategoryShowcase.jsx";
import ServicesHeading from "./components/ServicesHeading.jsx";
import {
  SERVICES_CATEGORIES,
  SERVICES_HEADING,
} from "./servicesContent.js";

function ServicesPage() {
  const navigate = useNavigate();

  return (
    <main className="dark min-h-dvh bg-[var(--color-neutral-950-uniform)]">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30">
        <PublicSiteHeader
          activeNavigationId="services"
          className="pointer-events-auto"
          onNavigate={(sectionId) => {
            if (sectionId === "services") navigate("/servicios");
          }}
          onRegister={() => navigate("/crear-cuenta")}
          onLogin={() => navigate("/login")}
        />
      </div>

      <ServicesHeading {...SERVICES_HEADING} />
      <ServicesCategoryShowcase categories={SERVICES_CATEGORIES} />
    </main>
  );
}

export default ServicesPage;
