function connectStatementPlayback(video, { active, enabled, playing, documentTarget = document }) {
  const synchronize = () => {
    if (!active || !enabled || !playing || documentTarget.hidden) {
      video.pause();
      return;
    }
    video.defaultMuted = true;
    video.muted = true;
    video.play()?.catch(() => undefined);
  };
  video.addEventListener("canplay", synchronize);
  documentTarget.addEventListener("visibilitychange", synchronize);
  synchronize();
  return () => {
    video.removeEventListener("canplay", synchronize);
    documentTarget.removeEventListener("visibilitychange", synchronize);
    video.pause();
  };
}

export { connectStatementPlayback };
