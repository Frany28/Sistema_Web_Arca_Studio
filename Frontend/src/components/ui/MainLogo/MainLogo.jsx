import clsx from "clsx";
import { MAIN_LOGO_ASSETS, MAIN_LOGO_SIZES } from "../../../assets/logos/mainLogoAssets.js";

function renderSegments(segments, keyPrefix) {
  return segments.map((segment, index) => (
    <img
      key={`${keyPrefix}-${index}`}
      alt=""
      aria-hidden="true"
      className="absolute block max-w-none"
      src={segment.src}
      style={{
        left: segment.left,
        top: segment.top,
        width: segment.width,
        height: segment.height,
      }}
    />
  ));
}

export default function MainLogo({
  className,
  size = "64px",
  icon = true,
  showText = true,
  showYear = true,
  ...props
}) {
  const resolvedSize = MAIN_LOGO_SIZES.includes(size) ? size : "64px";
  const logo = MAIN_LOGO_ASSETS[resolvedSize];

  return (
    <div
      className={clsx("relative shrink-0", className)}
      style={{
        width: logo.wrapper.width,
        height: logo.wrapper.height,
      }}
      {...props}
    >
      {icon ? (
        <>
          <img
            alt=""
            aria-hidden="true"
            className="absolute block max-w-none"
            src={logo.icon.src}
            style={logo.icon.style}
          />
          <img
            alt=""
            aria-hidden="true"
            className="absolute block max-w-none"
            src={logo.vector.src}
            style={logo.vector.style}
          />
        </>
      ) : null}

      {showText ? (
        <div className="absolute" style={logo.textContainer.style}>
          <div
            className="relative"
            style={{
              width: logo.textContainer.wordmarkWidth,
              height: logo.textContainer.wordmarkHeight,
            }}
          >
            {renderSegments(logo.wordSegments, `${resolvedSize}-word`)}
          </div>

          {showYear ? (
            <div
              className="relative"
              style={{
                width: logo.textContainer.yearWidth,
                height: logo.textContainer.yearHeight,
                marginTop: logo.textContainer.gap,
              }}
            >
              {renderSegments(logo.yearSegments, `${resolvedSize}-year`)}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

