import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import ThemeSync from "./components/ui/ThemeSync.jsx";
import {
  EmptyProjectDocumentsExample,
  EmptyProjectInfoExample,
  EmptyProjectRendersExample,
  EmptyProjectTrackingExample,
  EmptyProjectWarrantiesExample,
  EmptyProjectsExample,
  ArchitectDashboard,
  EmptyArchitectDashboardExample,
  Home,
  InactiveAccount,
  Login,
  NewArchitectProjectPage,
  NewPassword,
  ProjectDetails,
  RecoverAccount,
  Settings,
} from "./pages/pages.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeSync />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cuenta-inactiva" element={<InactiveAccount />} />
        <Route path="/recuperar-cuenta" element={<RecoverAccount />} />
        <Route path="/nueva-contrasena" element={<NewPassword />} />
        <Route path="/dashboard-clientes" element={<Home />} />
        <Route path="/dashboard-arquitecto" element={<ArchitectDashboard />} />
        <Route
          path="/dashboard-arquitecto/nuevo-proyecto"
          element={<NewArchitectProjectPage />}
        />
        <Route
          path="/dashboard-arquitecto-vacio"
          element={<EmptyArchitectDashboardExample />}
        />
        <Route
          path="/proyectos/quinta-bella-vista"
          element={<ProjectDetails />}
        />
        <Route path="/configuraciones" element={<Settings />} />
        <Route
          path="/dashboard-clientes-vacio"
          element={<EmptyProjectsExample />}
        />
        <Route
          path="/proyectos/quinta-bella-vista/renders-imagenes-vacio"
          element={<EmptyProjectRendersExample />}
        />
        <Route
          path="/proyectos/quinta-bella-vista/informacion-general-vacio"
          element={<EmptyProjectInfoExample />}
        />
        <Route
          path="/proyectos/quinta-bella-vista/documentos-vacio"
          element={<EmptyProjectDocumentsExample />}
        />
        <Route
          path="/proyectos/quinta-bella-vista/seguimiento-vacio"
          element={<EmptyProjectTrackingExample />}
        />
        <Route
          path="/proyectos/quinta-bella-vista/garantias-vacio"
          element={<EmptyProjectWarrantiesExample />}
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
