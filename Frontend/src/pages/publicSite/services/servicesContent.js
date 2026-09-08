import residentialDesignImage from "../../../assets/services/residential-design.jpeg";
import commercialDesignImage from "../../../assets/services/commercial-design.png";
import institutionalDesignImage from "../../../assets/services/institutional-design.png";
import industrialDesignImage from "../../../assets/services/industrial-design.png";
import remodelingDesignImage from "../../../assets/services/remodeling-design.png";
import interiorDesignImage from "../../../assets/services/interior-design.png";
import constructionManagementImage from "../../../assets/services/construction-management.png";

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
    image: institutionalDesignImage,
    imageAlt: "Oficina con escritorio blanco y ventanales en un proyecto institucional",
  }),
  Object.freeze({
    id: "industrial",
    label: "Diseño industrial",
    image: industrialDesignImage,
    imageAlt: "Estructura industrial de varios niveles durante su construcción",
  }),
  Object.freeze({
    id: "remodeling",
    label: "Remodelaciones",
    image: remodelingDesignImage,
    imageAlt: "Baño remodelado con ducha acristalada y revestimientos cerámicos",
  }),
  Object.freeze({
    id: "interior-design",
    label: "Interiorismo",
    image: interiorDesignImage,
    imageAlt: "Dormitorio con cabecera tapizada, iluminación cálida y tonos neutros",
  }),
  Object.freeze({
    id: "construction-management",
    label: "Planificación, ejecución y supervisión de obra",
    image: constructionManagementImage,
    imageAlt: "Supervisión de trabajos en obra con casco y chaleco de seguridad",
  }),
]);

export { SERVICES_CATEGORIES, SERVICES_HEADING };
