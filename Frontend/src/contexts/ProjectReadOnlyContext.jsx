/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

const ProjectReadOnlyContext = createContext({
  message: "",
  readOnly: false,
});

export function ProjectReadOnlyProvider({ children, readOnly = false }) {
  const value = readOnly
    ? {
        message: "Desarchiva el proyecto para realizar cambios.",
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
