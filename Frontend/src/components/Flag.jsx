import ReactCountryFlag from "react-country-flag";

const SQUARE_FLAG_CDN_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/";

function Flag({
  countryCode,
  size = "var(--size-flag)",
  title,
  className,
  style,
  imgStyle,
  cdnUrl = SQUARE_FLAG_CDN_URL,
  cdnSuffix = "svg",
  ...flagProps
}) {
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
        countryCode={countryCode}
        svg
        title={title}
        aria-label={title ?? countryCode}
        cdnUrl={cdnUrl}
        cdnSuffix={cdnSuffix}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "cover",
          ...imgStyle,
        }}
        {...flagProps}
      />
    </span>
  );
}

export default Flag;
