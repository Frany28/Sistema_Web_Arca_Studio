import { useVideoThumbnail } from "./useVideoThumbnail.js";

export default function VideoThumbnail({ alt = "", className, item }) {
  const thumbnail = useVideoThumbnail(item?.video, item?.poster);

  if (!item?.video && item?.image) {
    return <img src={item.image} alt={alt} className={className} />;
  }

  return thumbnail ? (
    <img src={thumbnail} alt={alt} className={className} />
  ) : (
    <span
      className={`${className || ""} block bg-[radial-gradient(circle_at_50%_45%,var(--color-neutral-200)_0%,var(--color-neutral-10)_100%)]`}
      aria-hidden="true"
    />
  );
}
