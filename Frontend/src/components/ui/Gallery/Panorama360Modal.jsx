import { createPortal } from "react-dom";
import Button from "../Button/Button.jsx";
import Panorama360Viewer from "./Panorama360Viewer.jsx";

export default function Panorama360Modal({ focusedCommentId, item, onClose, projectId, visible }) {
  if (!visible || !item) return null;
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.72)] p-[24px] max-[640px]:p-[8px]" role="dialog" aria-modal="true" aria-label={`Panorámica 360 ${item.title}`} onClick={onClose}>
      <section className="relative flex h-[min(820px,calc(100vh-48px))] w-[min(1380px,calc(100vw-48px))] flex-col rounded-[var(--radius-3)] bg-[var(--color-neutral-bg)] p-[16px] shadow-[var(--shadow-e3)] max-[640px]:h-[calc(100vh-16px)] max-[640px]:w-[calc(100vw-16px)]" onClick={(event) => event.stopPropagation()}>
        <Button aria-label="Cerrar panorámica" className="absolute right-[20px] top-[20px] z-50" fitContent size="S" theme="Info" type="Outline" onClick={onClose}>Cerrar</Button>
        <Panorama360Viewer item={item} projectId={projectId} focusedCommentId={focusedCommentId} />
      </section>
    </div>,
    document.body,
  );
}
