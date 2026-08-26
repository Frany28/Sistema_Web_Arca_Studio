import { useEffect, useRef } from "react";
import { Warning2 } from "iconsax-react";

import Modal from "../Modal/Modal.jsx";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function AssigneeRemovalModal({
  assigneeName,
  open,
  onCancel,
  onConfirm,
  projectName,
}) {
  const cancelRef = useRef(onCancel);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    cancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocusedRef.current = document.activeElement;
    const frameId = window.requestAnimationFrame(() => {
      const modal = document.querySelector("[data-assignee-removal-modal]");
      const focusableElements = Array.from(
        modal?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [],
      );
      const cancelButton = focusableElements.find(
        (element) => element.textContent?.trim() === "Cancelar",
      );

      cancelButton?.focus();
    });

    const handleKeyDown = (event) => {
      const modal = document.querySelector("[data-assignee-removal-modal]");

      if (event.key === "Escape") {
        event.preventDefault();
        cancelRef.current?.();
        return;
      }

      if (event.key !== "Tab" || !modal) return;

      const focusableElements = Array.from(
        modal.querySelectorAll(FOCUSABLE_SELECTOR),
      );

      if (!focusableElements.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("keydown", handleKeyDown);

      const previousElement = previouslyFocusedRef.current;
      if (
        previousElement instanceof HTMLElement
        && document.contains(previousElement)
      ) {
        previousElement.focus();
      }
    };
  }, [open]);

  const personReference = assigneeName ? ` a ${assigneeName}` : " al usuario";
  const projectReference = projectName ? ` “${projectName}”` : "";

  return (
    <Modal
      visible={open}
      showDialog
      alignment="Centered"
      overlayVariant="blurred"
      transitionPreset="fade-scale"
      title="¿Deseas retirar al usuario del proyecto?"
      description={`¿Estás seguro de que deseas retirar${personReference} del proyecto${projectReference}? Perderá acceso completo a toda la información y funciones relacionadas.`}
      secondaryActionLabel="Cancelar"
      primaryActionLabel="Confirmar"
      secondaryActionTheme="Danger"
      primaryActionTheme="Danger"
      icon={(
        <Warning2
          size="20"
          color="currentColor"
          className="size-5 text-[var(--color-danger-100)]"
        />
      )}
      onClose={onCancel}
      onSecondaryAction={onCancel}
      onPrimaryAction={onConfirm}
      className="z-[90]"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmar retiro del encargado"
      data-assignee-removal-modal
    />
  );
}

export default AssigneeRemovalModal;
