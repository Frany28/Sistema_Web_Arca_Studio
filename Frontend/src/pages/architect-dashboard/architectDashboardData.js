import projectImage from "../../assets/fondos/Project Image.png";
import standImage from "../../assets/fondos/Property 1=Variant2.png";

export const ARCHITECT_NAVIGATION_ITEMS = [
  {
    id: "dashboard",
    label: "Panel",
    icon: "dashboard",
    wrapperHeight: "44px",
  },
  {
    id: "project-1",
    label: "Proyecto 1",
    icon: "project",
    wrapperHeight: "56px",
  },
  {
    id: "project-2",
    label: "Proyecto 2",
    icon: "project",
    wrapperHeight: "44px",
  },
  {
    id: "more-projects",
    label: "Ver más proyectos",
    icon: "discover",
    wrapperHeight: "56px",
  },
  {
    id: "settings",
    label: "Configuraciones",
    icon: "settings",
    wrapperHeight: "56px",
  },
];

export const ARCHITECT_DRAWER_COMMENTS = [
  {
    id: "architect-comment-1",
    name: "John Doe",
    timestamp: "Hace 2 horas",
    message: "¿Podemos ajustar la iluminación en esta área?",
    type: "comment",
  },
  {
    id: "architect-reply-1",
    name: "Tú",
    timestamp: "Hace 2 horas",
    message: "Sí, claro.",
    type: "reply",
  },
  {
    id: "architect-comment-2",
    name: "John Doe",
    timestamp: "Hace 2 horas",
    message: "¿Podemos ajustar la iluminación en esta área?",
    type: "comment",
  },
  {
    id: "architect-reply-2",
    name: "Tú",
    timestamp: "Hace 2 horas",
    message: "Sí, claro.",
    type: "reply",
  },
  {
    id: "architect-reply-3",
    name: "Arq. Wilmer",
    timestamp: "Hace 2 horas",
    message: "Sí, claro.",
    type: "reply",
  },
];

export const ARCHITECT_DRAWER_RECENT_ACTIVITY = [
  {
    id: "architect-activity-file-1",
    name: "Tú",
    action: "subiste un archivo",
    timestamp: "Hace 30 minutos",
    type: "file",
    fileType: "PDF",
    fileName: "Archivo.pdf",
    fileSize: "200KB",
    to: "/proyectos/quinta-bella-vista/documentos-vacio",
  },
  {
    id: "architect-activity-status-1",
    name: "Tú",
    action: "modificaste el estado a",
    timestamp: "Hace 30 minutos",
    type: "status",
    status: "En proceso",
    to: "/proyectos/quinta-bella-vista",
  },
  {
    id: "architect-activity-file-2",
    name: "Arq. Wilmer",
    action: "subió un archivo",
    timestamp: "Hace 30 minutos",
    type: "file",
    fileType: "PDF",
    fileName: "Archivo.pdf",
    fileSize: "200KB",
    to: "/proyectos/quinta-bella-vista/documentos-vacio",
  },
  {
    id: "architect-activity-status-2",
    name: "Arq. Wilmer",
    action: "modificó el estado a",
    timestamp: "Hace 30 minutos",
    type: "status",
    status: "En proceso",
    to: "/proyectos/quinta-bella-vista",
  },
];

export const ARCHITECT_PROJECT_GROUPS = [
  {
    id: "in-progress",
    status: "En Progreso",
    badgeClassName:
      "border-[var(--color-info-10)] bg-[var(--color-info-10)] text-[var(--color-info-100)]",
    projects: [
      {
        id: "stand-nexar-progress",
        title: "Stand Nexar 2026",
        image: standImage,
        editable: true,
      },
    ],
  },
  {
    id: "in-review",
    status: "En Revisión",
    badgeClassName:
      "border-[var(--color-primary-10)] bg-[var(--color-primary-10)] text-[var(--color-text-300)]",
    projects: [
      {
        id: "torre-nexar-review",
        title: "Torre Nexar 2026",
        image: projectImage,
        editable: true,
      },
    ],
  },
  {
    id: "approval",
    status: "En espera de Aprobación",
    badgeClassName:
      "border-[var(--color-neutral-600)] bg-[var(--color-neutral-100)] text-[var(--color-text-300)]",
    projects: [
      {
        id: "torre-nexar-approval",
        title: "Torre Nexar 2026",
        image: projectImage,
        editable: true,
      },
    ],
  },
  {
    id: "finished",
    status: "Finalizados",
    badgeClassName:
      "border-[var(--color-success-10)] bg-[var(--color-success-10)] text-[var(--color-success-200)]",
    projects: [
      {
        id: "stand-nexar-finished",
        title: "Stand Nexar 2026",
        image: standImage,
        editable: false,
      },
      {
        id: "torre-nexar-finished",
        title: "Torre Nexar 2026",
        image: projectImage,
        editable: false,
      },
    ],
  },
];
