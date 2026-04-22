import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import ThemeSync from "./components/ui/ThemeSync.jsx";
import {
  EmptyProjectsExample,
  Home,
  InactiveAccount,
  Login,
  NewPassword,
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
        <Route path="/configuraciones" element={<Settings />} />
        <Route
          path="/dashboard-clientes-vacio"
          element={<EmptyProjectsExample />}
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
