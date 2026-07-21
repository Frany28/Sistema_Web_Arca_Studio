import { useEffect, useState } from "react";
import { getVideoThumbnailTime } from "../../../utils/videoThumbnail.js";

const thumbnailCache = new Map();
const thumbnailRequests = new Map();

function captureVideoThumbnail(videoSrc) {
  if (thumbnailCache.has(videoSrc)) {
    return Promise.resolve(thumbnailCache.get(videoSrc));
  }
  if (thumbnailRequests.has(videoSrc)) return thumbnailRequests.get(videoSrc);

  const request = new Promise((resolve, reject) => {
    const video = document.createElement("video");
    let settled = false;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };
    const fail = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("VIDEO_THUMBNAIL_UNAVAILABLE"));
    };

    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.addEventListener("error", fail, { once: true });
    video.addEventListener(
      "loadedmetadata",
      () => {
        video.currentTime = getVideoThumbnailTime(video.duration);
      },
      { once: true },
    );
    video.addEventListener(
      "seeked",
      () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const context = canvas.getContext("2d");

          if (!context) {
            fail();
            return;
          }

          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL("image/jpeg", 0.82);
          settled = true;
          thumbnailCache.set(videoSrc, thumbnail);
          cleanup();
          resolve(thumbnail);
        } catch {
          fail();
        }
      },
      { once: true },
    );
    video.src = videoSrc;
  }).finally(() => thumbnailRequests.delete(videoSrc));

  thumbnailRequests.set(videoSrc, request);
  return request;
}

export function useVideoThumbnailState(videoSrc, providedPoster = "") {
  const [generatedThumbnail, setGeneratedThumbnail] = useState({
    source: "",
    status: "loading",
    thumbnail: "",
  });

  useEffect(() => {
    if (providedPoster || !videoSrc || typeof document === "undefined") return undefined;

    let active = true;
    captureVideoThumbnail(videoSrc)
      .then((nextThumbnail) => {
        if (active) {
          setGeneratedThumbnail({
            source: videoSrc,
            status: "loaded",
            thumbnail: nextThumbnail,
          });
        }
      })
      .catch(() => {
        if (active) {
          setGeneratedThumbnail({
            source: videoSrc,
            status: "error",
            thumbnail: "",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [providedPoster, videoSrc]);

  const thumbnail =
    providedPoster ||
    thumbnailCache.get(videoSrc) ||
    (generatedThumbnail.source === videoSrc
      ? generatedThumbnail.thumbnail
      : "");
  const status = thumbnail
    ? "loaded"
    : !videoSrc
      ? "error"
      : generatedThumbnail.source === videoSrc
        ? generatedThumbnail.status
        : "loading";

  return { status, thumbnail };
}

export function useVideoThumbnail(videoSrc, providedPoster = "") {
  return useVideoThumbnailState(videoSrc, providedPoster).thumbnail;
}
