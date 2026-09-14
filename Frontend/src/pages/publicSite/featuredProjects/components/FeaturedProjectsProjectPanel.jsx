import muelleZulima1 from "../../../../assets/featuredProjects/muelle-zulima-1.webp";
import muelleZulima2 from "../../../../assets/featuredProjects/muelle-zulima-2.webp";
import muelleZulima3 from "../../../../assets/featuredProjects/muelle-zulima-3.webp";
import muelleZulima4 from "../../../../assets/featuredProjects/muelle-zulima-4.webp";
import muelleZulima5 from "../../../../assets/featuredProjects/muelle-zulima-5.webp";
import muelleZulima6 from "../../../../assets/featuredProjects/muelle-zulima-6.webp";
import FeaturedProjectsGallery from "./FeaturedProjectsGallery.jsx";
import SectionTitleReveal from "../../components/SectionTitleReveal.jsx";

const MUELLE_ZULIMA_COLUMNS = [
  [
    { src: muelleZulima1, alt: "Sala de reuniones de Muelle Zulima", width: 1920, height: 1080 },
    { src: muelleZulima2, alt: "Mobiliario de oficina de Muelle Zulima", width: 1920, height: 1080 },
  ],
  [
    { src: muelleZulima3, alt: "Estaciones de trabajo de Muelle Zulima", width: 1920, height: 1080 },
    { src: muelleZulima6, alt: "Área de trabajo de Muelle Zulima", width: 1920, height: 1080 },
  ],
  [
    { src: muelleZulima4, alt: "Oficina privada de Muelle Zulima", width: 1920, height: 1080 },
    { src: muelleZulima5, alt: "Espacios operativos de Muelle Zulima", width: 1920, height: 1080 },
  ],
];

/**
 * Presenta el segundo proyecto destacado dentro del ciclo de paneles.
 * Reutiliza el revelado de títulos y la galería interactiva existentes.
 */
function FeaturedProjectsProjectPanel({ active = false }) {
  return (
    <article
      data-featured-next-project
      data-featured-project-panel
      data-node-id="4686:114353"
      data-navbar-background="light"
      aria-label="Proyecto destacado Muelle Zulima"
      aria-hidden={!active}
      inert={active ? undefined : ""}
      className="relative col-start-1 row-start-1 flex min-h-0 flex-col gap-[var(--spacing-gap-7)] bg-[var(--color-neutral-100-uniform)] pt-[var(--spacing-gap-8)] text-[var(--color-primary-300)]"
    >
      <SectionTitleReveal
        enabled={active}
        visible={active}
        className="mx-auto flex w-full shrink-0 max-w-[1200px] flex-col items-center gap-[24px] px-[16px] py-[var(--spacing-gap-7)] text-center min-[768px]:px-[var(--spacing-gap-7)]"
        data-node-id="4856:5037"
      >
        <p className="text-heading-4 m-0 w-full" data-node-id="4856:5038">
          Proyectos Destacados
        </p>
        <h2 className="text-heading-1 m-0 w-full max-[767px]:text-[38px] max-[767px]:leading-[46px]" data-node-id="4856:5039">
          Muelle Zulima
        </h2>
        <p className="text-heading-6 m-0 w-full max-w-[555px] opacity-60" data-node-id="4856:5040">
          Diseño arquitectónico y ejecución de proyecto industrial para una oficina taller de reparaciones marinas ubicada en Ciudad Ojeda.
        </p>
      </SectionTitleReveal>
      <FeaturedProjectsGallery
        backgroundClassName="bg-[var(--color-neutral-100-uniform)]"
        columns={MUELLE_ZULIMA_COLUMNS}
        galleryLabel="Galería de Muelle Zulima"
      />
    </article>
  );
}

export default FeaturedProjectsProjectPanel;
