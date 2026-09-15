import { useEffect } from "react";

import Modal, {
  ModalCloseButton,
} from "../../../../components/ui/Modal/Modal.jsx";

function ProcessesVideoModal({ onClose, video, visible }) {
  useEffect(() => {
    if (!visible) return undefined;

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, visible]);

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
      contentClassName="!p-[16px] max-[640px]:!p-[8px]"
    >
      {video ? (
        <section
          className="relative flex h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[1200px] items-center justify-center overflow-hidden rounded-[var(--radius-3)] bg-[var(--color-neutral-950-uniform)] max-[640px]:h-[calc(100dvh-16px)] max-[640px]:w-[calc(100vw-16px)]"
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
          onClick={(event) => event.stopPropagation()}
        >
          <h2 className="sr-only">{video.title}</h2>
          <video
            key={video.id}
            className="size-full object-contain"
            poster={video.poster}
            autoPlay
            controls
            loop
            playsInline
            aria-label={video.description}
          >
            <source src={video.webm} type="video/webm" />
            <source src={video.mp4} type="video/mp4" />
          </video>

          <ModalCloseButton
            ariaLabel="Cerrar video"
            onClick={onClose}
            className="absolute right-[16px] top-[16px] z-10 bg-[var(--color-primary-300)] text-[var(--color-neutral-100-uniform)] shadow-[var(--shadow-e2)] hover:bg-[var(--color-primary-400)] hover:text-[var(--color-neutral-100-uniform)] max-[640px]:right-[8px] max-[640px]:top-[8px]"
          />
        </section>
      ) : null}
    </Modal>
  );
}

export default ProcessesVideoModal;
