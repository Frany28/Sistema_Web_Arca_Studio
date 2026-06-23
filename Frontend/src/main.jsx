import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import PublicOnlyRoute from "./auth/PublicOnlyRoute.jsx";
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
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ThemeSync />
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/" element={<Login />} />
          </Route>

          <Route path="/cuenta-inactiva" element={<InactiveAccount />} />
          <Route path="/recuperar-cuenta" element={<RecoverAccount />} />
          <Route path="/nueva-contraseña" element={<NewPassword />} />

          <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
            <Route path="/dashboard-clientes" element={<Home />} />
            <Route
              path="/dashboard-clientes-vacio"
              element={<EmptyProjectsExample />}
            />
          </Route>

          <Route
            element={<ProtectedRoute allowedRoles={["admin", "architect"]} />}
          >
            <Route
              path="/dashboard-arquitecto"
              element={<ArchitectDashboard />}
            />
            <Route
              path="/dashboard-arquitecto/nuevo-proyecto"
              element={<NewArchitectProjectPage />}
            />
            <Route
              path="/dashboard-arquitecto-vacio"
              element={<EmptyArchitectDashboardExample />}
            />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route
              path="/proyectos/quinta-bella-vista"
              element={<Navigate to="/proyectos/1" replace />}
            />
            <Route path="/proyectos/:projectId" element={<ProjectDetails />} />
            <Route path="/configuraciones" element={<Settings />} />
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
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
