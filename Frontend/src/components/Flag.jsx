import { useEffect, useState } from "react";
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
  loading,
  onError,
  ...flagProps
}) {
  const resolvedCountryCode = normalizeCountryCode(countryCode);
  const [hasSvgError, setHasSvgError] = useState(false);

  useEffect(() => {
    setHasSvgError(false);
  }, [resolvedCountryCode, useSvg, cdnUrl, cdnSuffix]);

  if (!resolvedCountryCode) {
    return null;
  }

  const shouldUseSvg = useSvg && !hasSvgError;

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
        svg={shouldUseSvg}
        title={title}
        aria-label={title ?? resolvedCountryCode}
        {...(cdnUrl ? { cdnUrl } : {})}
        {...(cdnSuffix ? { cdnSuffix } : {})}
        {...(shouldUseSvg && loading ? { loading } : {})}
        {...(shouldUseSvg
          ? {
              onError: (event) => {
                setHasSvgError(true);
                onError?.(event);
              },
            }
          : {})}
        style={{
          ...(shouldUseSvg
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
