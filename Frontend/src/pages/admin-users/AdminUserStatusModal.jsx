import { Warning2 } from "iconsax-react";

import Modal from "../../components/ui/Modal/Modal.jsx";

const ACTION_DETAILS = {
  activeFromBlocked: {
    title: "¿Deseas reactivar al usuario?",
    description: "El usuario recuperará el acceso al sistema y podrá volver a realizar las acciones permitidas por su rol.",
    ariaLabel: "Confirmar reactivación del usuario",
  },
  activeFromInactive: {
    title: "¿Deseas activar al usuario?",
    description: "La cuenta volverá a estar activa y el usuario recuperará el acceso al sistema.",
    ariaLabel: "Confirmar activación del usuario",
  },
  blocked: {
    title: "¿Deseas suspender al usuario?",
    description: "El usuario perderá temporalmente el acceso al sistema hasta que un administrador lo reactive.",
    ariaLabel: "Confirmar suspensión del usuario",
  },
  inactive: {
    title: "¿Deseas deshabilitar al usuario?",
    description: "El usuario perderá el acceso al sistema y no estará disponible para nuevas asignaciones. Su historial se conservará.",
    ariaLabel: "Confirmar deshabilitación del usuario",
  },
};

function getBulkActionDetails(change) {
  const count = change.users.length;
  const isPlural = count !== 1;
  const subject = count === 1 ? "a 1 usuario" : `a ${count} usuarios`;

  if (change.status === "blocked") {
    return {
      title: `¿Deseas suspender ${subject}?`,
      description: `${isPlural ? "Perderán" : "Perderá"} temporalmente el acceso al sistema hasta que un administrador ${isPlural ? "los reactive" : "lo reactive"}.`,
      ariaLabel: "Confirmar suspensión de usuarios seleccionados",
    };
  }

  if (change.status === "inactive") {
    return {
      title: `¿Deseas deshabilitar ${subject}?`,
      description: `${isPlural ? "Perderán" : "Perderá"} el acceso y no ${isPlural ? "estarán disponibles" : "estará disponible"} para nuevas asignaciones. Su historial se conservará.`,
      ariaLabel: "Confirmar deshabilitación de usuarios seleccionados",
    };
  }

  return {
    title: `¿Deseas activar ${subject}?`,
    description: `${isPlural ? "Recuperarán" : "Recuperará"} el acceso al sistema y ${isPlural ? "podrán" : "podrá"} volver a realizar las acciones permitidas por su rol.`,
    ariaLabel: "Confirmar activación de usuarios seleccionados",
  };
}

function AdminUserStatusModal({ change, onCancel, onConfirm }) {
  if (!change) return null;

  const isBulkChange = Array.isArray(change.users);
  const actionKey = !isBulkChange && change.status === "active"
    ? `activeFrom${change.user.status === "blocked" ? "Blocked" : "Inactive"}`
    : change.status;
  const details = isBulkChange ? getBulkActionDetails(change) : ACTION_DETAILS[actionKey];

  return (
    <Modal
      mount="viewport"
      visible
      showDialog
      alignment="Centered"
      overlayVariant="blurred"
      transitionPreset="fade-scale"
      title={details.title}
      description={details.description}
      secondaryActionLabel="Cancelar"
      primaryActionLabel="Confirmar"
      secondaryActionTheme="Danger"
      primaryActionTheme={change.status === "active" ? "Primary" : "Danger"}
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
      aria-label={details.ariaLabel}
      data-admin-user-status-modal
    />
  );
}

export default AdminUserStatusModal;
