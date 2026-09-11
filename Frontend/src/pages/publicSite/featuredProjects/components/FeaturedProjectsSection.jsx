import FeaturedProjectsGallery from "./FeaturedProjectsGallery.jsx";
import FeaturedProjectsProjectPanel from "./FeaturedProjectsProjectPanel.jsx";
import SectionTitleReveal from "../../components/SectionTitleReveal.jsx";

function FeaturedProjectsSection({ step = 1, onRevealComplete, titleVisible, onTitleRevealComplete }) {
  return (
    <section
      id="featured-projects"
      aria-label="Proyectos destacados"
      className="dark min-h-dvh bg-[var(--color-neutral-950-uniform)] pt-[var(--spacing-gap-9)]"
    >
      <SectionTitleReveal
        visible={titleVisible}
        onRevealComplete={() => onTitleRevealComplete?.("featured-projects")}
        className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-[24px] px-[16px] py-[var(--spacing-gap-8)] text-center text-[var(--color-neutral-100-uniform)] min-[768px]:px-[var(--spacing-gap-8)]"
        data-node-id="4856:5032"
      >
        <p className="text-heading-4 m-0 w-full" data-node-id="4856:5033">
          Proyectos Destacados
        </p>
        <h2 className="text-heading-1 m-0 w-full max-[767px]:text-[38px] max-[767px]:leading-[46px]" data-node-id="4856:5034">
          Quinta Bella Vista
        </h2>
        <p className="text-heading-6 m-0 w-full max-w-[520px] opacity-60" data-node-id="4856:5035">
          Diseño arquitectónico y ejecución integral para una residencia contemporánea ubicada en Maracaibo.
        </p>
      </SectionTitleReveal>
      <FeaturedProjectsGallery visible={step === 2} onRevealComplete={onRevealComplete} />
      <FeaturedProjectsProjectPanel />
    </section>
  );
}

export default FeaturedProjectsSection;
