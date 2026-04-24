export const PROJECT_DETAIL_TABS = [
  "Información general",
  "Renders e Imágenes",
  "Documentos",
  "Seguimiento",
  "Garantías",
];

export const PROJECT_DETAIL_DATA = {
  id: "quinta-bella-vista",
  title: "Quinta Bella Vista",
  category: "Proyecto Residencial",
  progressValue: 40,
  stages: [
    {
      id: "survey",
      title: "Levantamiento",
      status: "Completado",
      tone: "completed",
    },
    {
      id: "design",
      title: "Propuesta de Diseno",
      status: "En proceso",
      tone: "active",
    },
    {
      id: "execution",
      title: "Ejecucion",
      status: "Pendiente",
      tone: "pending",
    },
    {
      id: "handoff",
      title: "Entrega Final",
      status: "Pendiente",
      tone: "pending",
    },
  ],
  overview: [
    { label: "Tipo", value: "Residencial" },
    { label: "Area General", value: "90 mts" },
    { label: "Area de Construccion", value: "70 mts" },
  ],
  location: {
    label: "Ubicacion",
    value: `Maracaibo | 10°39'55"N 71°35'45"W`,
  },
  requirements: [
    "Cocina Abierta",
    "Area social integrada",
    "Iluminacion calida",
    "Espacios funcionales",
    "Cocina Abierta",
    "Area social integrada",
    "Iluminacion calida",
    "Espacios funcionales",
  ],
};

export const TECHNICAL_ACCORDIONS = [
  {
    id: "zoning",
    title: "Zonificacion",
    defaultOpen: true,
    description: [
      "Habitacion principal: 18 mts",
      "Habitaciones secundarias: 15mts c/u",
      "Cocina: 10 mts",
      "Sala:",
      "Comedor:",
      "Lavanderia:",
    ],
  },
  {
    id: "procedures",
    title: "Procedimientos",
    defaultOpen: false,
    description: [
      "Revision de requerimientos del cliente.",
      "Validacion de materiales y cronograma.",
      "Coordinacion de aprobaciones previas a ejecucion.",
    ],
  },
];
