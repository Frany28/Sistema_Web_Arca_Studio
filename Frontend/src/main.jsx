import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import PublicOnlyRoute from "./auth/PublicOnlyRoute.jsx";
import ThemeSync from "./components/ui/ThemeSync.jsx";

const ArchitectDashboard = lazy(
  () => import("./pages/architect-dashboard/ArchitectDashboard.jsx"),
);
const CreateAccount = lazy(() => import("./pages/CreateAccount.jsx"));
const CreatePassword = lazy(() => import("./pages/CreatePassword.jsx"));
const EmptyArchitectDashboardExample = lazy(
  () => import("./pages/EmptyArchitectDashboardExample.jsx"),
);
const EmptyProjectDocumentsExample = lazy(
  () => import("./pages/EmptyProjectDocumentsExample.jsx"),
);
const EmptyProjectInfoExample = lazy(
  () => import("./pages/EmptyProjectInfoExample.jsx"),
);
const EmptyProjectRendersExample = lazy(
  () => import("./pages/EmptyProjectRendersExample.jsx"),
);
const EmptyProjectTrackingExample = lazy(
  () => import("./pages/EmptyProjectTrackingExample.jsx"),
);
const EmptyProjectWarrantiesExample = lazy(
  () => import("./pages/EmptyProjectWarrantiesExample.jsx"),
);
const EmptyProjectsExample = lazy(
  () => import("./pages/EmptyProjectsExample.jsx"),
);
const Home = lazy(() => import("./pages/Home.jsx"));
const InactiveAccount = lazy(() => import("./pages/InactiveAccount.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const NewArchitectProjectPage = lazy(
  () => import("./pages/architect-dashboard/NewArchitectProjectPage.jsx"),
);
const NewPassword = lazy(() => import("./pages/NewPassword.jsx"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails.jsx"));
const RecoverAccount = lazy(() => import("./pages/RecoverAccount.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));

function RouteFallback() {
  return <main className="min-h-screen bg-[var(--color-neutral-bg)]" />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ThemeSync />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/" element={<Login />} />
              <Route path="/crear-cuenta" element={<CreateAccount />} />
              <Route path="/crear-contrasena" element={<CreatePassword />} />
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
