import { useEffect } from "react";

import Modal from "../../../../components/ui/Modal/Modal.jsx";

function ProcessesVideoModal({ onClose, video, visible }) {
  useEffect(() => {
    if (!visible) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      mount="viewport"
      alignment="Centered"
      overlayVariant="blurred"
      transitionPreset="fade-scale"
      showDialog
      onClose={onClose}
      className="z-[60]"
      dialogShellClassName="!pb-0"
      contentClassName="!p-0"
    >
      {video ? (
        <div
          className="flex max-h-[calc(100dvh-32px)] max-w-[calc(100vw-32px)] items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <video
            key={video.id}
            className="block h-auto max-h-[calc(100dvh-32px)] w-auto max-w-[calc(100vw-32px)] cursor-pointer rounded-[var(--radius-3)] object-contain"
            poster={video.poster}
            autoPlay
            loop
            playsInline
            aria-label={video.description}
            onClick={onClose}
          >
            <source src={video.webm} type="video/webm" />
            <source src={video.mp4} type="video/mp4" />
          </video>
        </div>
      ) : null}
    </Modal>
  );
}

export default ProcessesVideoModal;