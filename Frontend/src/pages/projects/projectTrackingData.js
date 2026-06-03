import fondoActualizarcontraseña from "../../assets/fondos/Property 1=actualizar contraseña.png";
import fondoVariante2 from "../../assets/fondos/Property 1=Variant2.png";

export const PROJECT_TRACKING_SUMMARY = [
  {
    id: "overall-progress",
    type: "progress",
    title: "Progreso General",
    description: "40% del proyecto finalizado",
    value: 40,
  },
  {
    id: "last-update",
    type: "info",
    icon: "clock",
    title: "Última actualización",
    description: "hace 2 días",
  },
  {
    id: "estimated-date",
    type: "info",
    icon: "calendar-tick",
    title: "Fecha Estimada",
    description: "20 Mar 2026",
  },
];

export const PROJECT_TRACKING_STAGES = [
  {
    id: "stage-1",
    title: "Levantamiento",
    subtitle: "Completado",
    dateRange: "01 Feb | 05 Feb",
    status: "completed",
  },
  {
    id: "stage-2",
    title: "Propuesta de diseño",
    subtitle: "En proceso",
    dateRange: "06 Feb | 09 Feb",
    status: "active",
  },
  {
    id: "stage-3",
    title: "Ejecución",
    subtitle: "Pendiente",
    dateRange: "10 Feb | 18 Feb",
    status: "pending",
  },
  {
    id: "stage-4",
    title: "Entrega final",
    subtitle: "Pendiente",
    dateRange: "19 Feb | 21 Feb",
    status: "pending",
  },
  {
    id: "stage-5",
    title: "Cierre",
    subtitle: "Pendiente",
    dateRange: "28 Feb",
    status: "pending",
  },
];

export const PROJECT_TRACKING_MILESTONES = [
  { id: "milestone-1", label: "Diseño de interiores", date: "08 Feb" },
  { id: "milestone-2", label: "Producción de muebles", date: "10 Feb" },
  { id: "milestone-3", label: "Logística de envíos", date: "17 Feb" },
  { id: "milestone-4", label: "Instalación en sitio", date: "19 Feb" },
  { id: "milestone-5", label: "Reunión de equipo", date: "28 Feb" },
];

export const PROJECT_TRACKING_COMPARISONS = [
  {
    id: "comparison-before",
    title: "Baño Principal",
    image: fondoActualizarcontraseña,
    selectedOptionId: "survey",
    options: [
      { id: "survey", label: "Levantamiento", type: "Text" },
      { id: "interior-design", label: "Diseño de interiores", type: "Text" },
      { id: "execution", label: "Ejecución", type: "Text" },
    ],
  },
  {
    id: "comparison-after",
    title: "Baño Principal",
    image: fondoVariante2,
    selectedOptionId: "render",
    options: [
      { id: "render", label: "Render", type: "Text" },
      { id: "final-photo", label: "Resultado final", type: "Text" },
      { id: "delivery", label: "Entrega", type: "Text" },
    ],
  },
];
