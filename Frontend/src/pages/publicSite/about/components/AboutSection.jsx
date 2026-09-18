import SectionTitleReveal from "../../components/SectionTitleReveal.jsx";
import aboutHero from "../../../../assets/about/about-hero.webp";
import { ABOUT_CONTENT } from "../aboutContent.js";

function AboutSection({
  titleVisible = false,
}) {
  return (
    <section
      id="about"
      aria-label="Sobre nosotros"
      data-content-title-scope="about"
      className="
        dark
        flex
        w-full
        flex-col
        gap-[var(--spacing-gap-9)]
        bg-[var(--color-neutral-950-uniform)]
        pt-[var(--spacing-gap-9)]
      "
    >
      <SectionTitleReveal
        visible={titleVisible}
        className="
          mx-auto
          flex
          w-full
          max-w-[1200px]
          flex-col
          items-center
          gap-[48px]
          px-[16px]
          py-[48px]
          text-center
          text-[var(--color-neutral-100-uniform)]
          min-[768px]:px-[48px]
        "
        data-node-id="4856:5054"
      >
        <p
          className="text-heading-4 m-0 w-full"
          data-node-id="4856:5055"
        >
          {ABOUT_CONTENT.eyebrow}
        </p>

        <h2
          className="
            text-heading-1
            m-0
            w-full
            text-balance
            max-[767px]:text-[38px]
            max-[767px]:leading-[46px]
            max-[767px]:tracking-[-1px]
          "
          data-node-id="4856:5056"
        >
          {ABOUT_CONTENT.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
      </SectionTitleReveal>

      <div className="mx-auto w-full max-w-[1440px] overflow-hidden">
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          <img
            src={aboutHero}
            alt="Equipo de ARCA Studio"
            className="absolute inset-0 h-full w-full object-cover object-bottom"
          />
        </div>
      </div>
    </section>
  );
}

export default AboutSection;