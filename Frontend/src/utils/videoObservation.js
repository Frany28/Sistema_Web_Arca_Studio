export const VIDEO_TIME_SELECTION_KIND = "video-time";

export function formatVideoObservationTime(value) {
  const totalSeconds = Math.max(Math.floor(Number(value) || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function createVideoTimeSelection(timeSeconds, durationSeconds) {
  const time = Number(timeSeconds);
  const duration = Number(durationSeconds);

  if (
    !Number.isFinite(time) ||
    time < 0 ||
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return null;
  }

  return {
    durationSeconds: Math.round(duration * 10) / 10,
    kind: VIDEO_TIME_SELECTION_KIND,
    timeSeconds: Math.min(Math.round(time * 10) / 10, duration),
  };
}

export function getVideoObservationTiming(selection) {
  if (selection?.kind !== VIDEO_TIME_SELECTION_KIND) return null;

  if (
    typeof selection.timeSeconds !== "number" ||
    typeof selection.durationSeconds !== "number"
  ) {
    return null;
  }

  const timeSeconds = Number(selection.timeSeconds);
  const durationSeconds = Number(selection.durationSeconds);

  if (
    !Number.isFinite(timeSeconds) ||
    timeSeconds < 0 ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0 ||
    timeSeconds > durationSeconds
  ) {
    return null;
  }

  return {
    videoDurationSeconds: durationSeconds,
    videoTimeLabel: formatVideoObservationTime(timeSeconds),
    videoTimeSeconds: timeSeconds,
  };
}
