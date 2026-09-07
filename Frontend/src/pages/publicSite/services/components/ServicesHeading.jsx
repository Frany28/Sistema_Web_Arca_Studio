import MovingGradientTitle from "./MovingGradientTitle.jsx";

function ServicesHeading({ eyebrow, title, description }) {
  return (
    <section
      className="relative flex h-dvh w-full shrink-0 justify-center overflow-hidden bg-[var(--color-neutral-950-uniform)] px-[16px] pt-[clamp(112px,18dvh,184px)] min-[768px]:px-[48px]"
      aria-label={eyebrow}
    >
      <div
        className="flex w-full max-w-[786px] flex-col items-center gap-[24px] text-center"
        data-node-id="4505:113281"
      >
        <p
          className="text-heading-4 text-[var(--color-neutral-100-uniform)]"
          data-node-id="4505:113286"
        >
          {eyebrow}
        </p>

        <MovingGradientTitle
          className="m-0 w-full text-[clamp(38px,4.45vw,64px)] font-bold leading-[clamp(46px,5.28vw,76px)] tracking-[clamp(-2px,-0.139vw,-1px)]"
          data-node-id="4505:113282"
        >
          {title}
        </MovingGradientTitle>

        <p
          className="text-heading-6 m-0 text-[var(--color-neutral-100-uniform)] opacity-60"
          data-node-id="4505:113283"
        >
          {description}
        </p>
      </div>
    </section>
  );
}

export default ServicesHeading;
