import { useNavigate } from "react-router-dom";

import HomeHeader from "../../components/ui/HomeHeader/HomeHeader.jsx";
import ServicesHeading from "../../components/ui/ServicesHeading/ServicesHeading.jsx";
import { SERVICES_HEADING } from "./servicesContent.js";

function ServicesPage() {
  const navigate = useNavigate();

  return (
    <main className="dark min-h-dvh bg-[var(--color-neutral-950-uniform)]">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30">
        <HomeHeader
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
    </main>
  );
}

export default ServicesPage;
