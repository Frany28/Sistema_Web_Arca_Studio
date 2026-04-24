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
  {
    id: "conditions",
    title: "Condiciones",
    defaultOpen: false,
    description: [
      "Condiciones de iluminacion natural y asoleamiento.",
      "Condiciones de ventilacion y circulacion interior.",
      "Condiciones del entorno inmediato y accesos.",
    ],
  },
  {
    id: "equipment",
    title: "Equipo utilizado",
    defaultOpen: false,
    description:
      "La descripcion del acordeon va aqui, se debe intentar mantenerla en menos de 2 lineas.",
  },
];
