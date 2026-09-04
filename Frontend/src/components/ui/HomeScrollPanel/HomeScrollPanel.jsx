import HomeHeroTitle from "../HomeHeroTitle/HomeHeroTitle.jsx";

function HomeScrollPanel({
  image,
  imageAlt,
  title,
  titleVisible = false,
}) {
  return (
    <section
      className="relative h-dvh w-full shrink-0 overflow-hidden bg-[var(--color-neutral-950-uniform)]"
      aria-label={title}
      data-home-panel
    >
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/5 to-black/20"
        aria-hidden="true"
      />
      <HomeHeroTitle title={title} visible={titleVisible} />
    </section>
  );
}

export default HomeScrollPanel;
