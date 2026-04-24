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
      title: "Propuesta de Diseño",
      status: "En proceso",
      tone: "active",
    },
    {
      id: "execution",
      title: "Ejecución",
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
    { label: "Área General", value: "90 mts" },
    { label: "Área de Construcción", value: "70 mts" },
  ],
  location: {
    label: "Ubicación",
    value: `Maracaibo | 10°39'55"N 71°35'45"W`,
  },
  requirements: [
    "Cocina Abierta",
    "Área social integrada",
    "Iluminación cálida",
    "Espacios funcionales",
    "Cocina Abierta",
    "Área social integrada",
    "Iluminación cálida",
    "Espacios funcionales",
  ],
  documents: [
    {
      id: "minutes",
      name: "Acta de Inicio.pdf",
      size: "200KB",
      owner: "Armando Carroz",
      fileType: "PDF",
    },
    {
      id: "brief",
      name: "Memoria descriptiva.pdf",
      size: "200KB",
      owner: "Armando Carroz",
      fileType: "PDF",
    },
    {
      id: "survey-record",
      name: "Registro de levantamiento.pdf",
      size: "200KB",
      owner: "Armando Carroz",
      fileType: "PDF",
    },
  ],
};

export const TECHNICAL_ACCORDIONS = [
  {
    id: "zoning",
    title: "Zonificación",
    defaultOpen: true,
    description: [
      "Habitación principal: 18 mts",
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
      "Revisión de requerimientos del cliente.",
      "Validación de materiales y cronograma.",
      "Coordinación de aprobaciones previas a ejecución.",
    ],
  },
  {
    id: "conditions",
    title: "Condiciones",
    defaultOpen: false,
    description: [
      "Condiciones de iluminación natural y asoleamiento.",
      "Condiciones de ventilación y circulación interior.",
      "Condiciones del entorno inmediato y accesos.",
    ],
  },
  {
    id: "equipment",
    title: "Equipo utilizado",
    defaultOpen: false,
    description:
      "La descripción del acordeon va aqui, se debe intentar mantenerla en menos de 2 lineas.",
  },
];
