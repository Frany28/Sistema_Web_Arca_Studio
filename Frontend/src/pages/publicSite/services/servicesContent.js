import residentialDesignImage from "../../../assets/services/residential-design.jpeg";
import commercialDesignImage from "../../../assets/services/commercial-design.png";

const SERVICES_HEADING = Object.freeze({
  eyebrow: "Servicios",
  title: "Soluciones adaptadas a cada proyecto.",
  description:
    "Diseñamos, planificamos y desarrollamos espacios funcionales, estéticos y técnicamente bien ejecutados, ajustándonos a las necesidades de cada cliente.",
});

const SERVICES_CATEGORIES = Object.freeze([
  Object.freeze({
    id: "residential",
    label: "Diseño residencial",
    image: residentialDesignImage,
    imageAlt: "Proyecto de diseño residencial de ARCA Studio",
  }),
  Object.freeze({
    id: "commercial",
    label: "Diseño comercial",
    image: commercialDesignImage,
    imageAlt: "Proyecto de diseño comercial de ARCA Studio",
  }),
  Object.freeze({
    id: "institutional",
    label: "Diseño institucional",
  }),
  Object.freeze({
    id: "industrial",
    label: "Diseño industrial",
  }),
  Object.freeze({
    id: "remodeling",
    label: "Remodelaciones",
  }),
  Object.freeze({
    id: "interior-design",
    label: "Interiorismo",
  }),
  Object.freeze({
    id: "construction-management",
    label: "Planificación, ejecución y supervisión de obra",
  }),
]);

export { SERVICES_CATEGORIES, SERVICES_HEADING };
