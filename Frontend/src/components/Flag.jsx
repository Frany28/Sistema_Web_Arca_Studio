import ReactCountryFlag from "react-country-flag";

function normalizeCountryCode(countryCode) {
  return String(countryCode ?? "").trim().toUpperCase();
}

function Flag({
  countryCode,
  size = "var(--size-flag)",
  title,
  className,
  style,
  imgStyle,
  useSvg = true,
  cdnUrl,
  cdnSuffix,
  ...flagProps
}) {
  const resolvedCountryCode = normalizeCountryCode(countryCode);

  if (!resolvedCountryCode) {
    return null;
  }

  return (
    <span
      className={className}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
        borderRadius: "9999px",
        ...style,
      }}
    >
      <ReactCountryFlag
        countryCode={resolvedCountryCode}
        svg={useSvg}
        title={title}
        aria-label={title ?? resolvedCountryCode}
        {...(cdnUrl ? { cdnUrl } : {})}
        {...(cdnSuffix ? { cdnSuffix } : {})}
        style={{
          ...(useSvg
            ? {
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
              }
            : {
                display: "inline-block",
                fontSize: typeof size === "number" ? `${size}px` : size,
                lineHeight: 1,
              }),
          ...imgStyle,
        }}
        {...flagProps}
      />
    </span>
  );
}

export default Flag;
