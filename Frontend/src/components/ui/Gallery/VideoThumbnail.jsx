import Loader from "../Loader/Loader.jsx";
import { useVideoThumbnailState } from "./useVideoThumbnail.js";

export default function VideoThumbnail({ alt = "", className, item }) {
  const { status, thumbnail } = useVideoThumbnailState(
    item?.video,
    item?.poster,
  );

  if (!item?.video && item?.image) {
    return <img src={item.image} alt={alt} className={className} />;
  }

  return status === "loading" ? (
    <Loader
      preset="videoThumbnail"
      label={`Cargando ${alt || "miniatura de video"}`}
      className={className}
    />
  ) : thumbnail ? (
    <img src={thumbnail} alt={alt} className={`${className || ""} content-reveal-media`} />
  ) : (
    <span
      className={`${className || ""} block bg-[radial-gradient(circle_at_50%_45%,var(--color-neutral-200)_0%,var(--color-neutral-10)_100%)]`}
      aria-hidden="true"
    />
  );
}
