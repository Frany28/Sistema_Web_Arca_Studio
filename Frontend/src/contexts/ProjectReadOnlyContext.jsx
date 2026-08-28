/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

const ProjectReadOnlyContext = createContext({
  message: "",
  readOnly: false,
});

export function ProjectReadOnlyProvider({ children, message = "", readOnly = false }) {
  const value = readOnly
    ? {
        message: message || "El proyecto es de solo lectura.",
        readOnly: true,
      }
    : { message: "", readOnly: false };

  return (
    <ProjectReadOnlyContext.Provider value={value}>
      {children}
    </ProjectReadOnlyContext.Provider>
  );
}

export function useProjectReadOnly() {
  return useContext(ProjectReadOnlyContext);
}
