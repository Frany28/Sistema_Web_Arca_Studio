import { useEffect, useState } from "react";

import { api } from "../../api/http.js";
import Badge from "../../components/ui/Badge/Badge.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import EmptyState from "../../components/ui/EmptyState/EmptyState.jsx";
import Loader from "../../components/ui/Loader/Loader.jsx";
import SideOverlayDrawer from "../../components/ui/SideOverlayDrawer.jsx";
import Tag from "../../components/ui/Tag/Tag.jsx";
import TextArea from "../../components/ui/TextArea/TextArea.jsx";
import { formatCalendarDate } from "../../utils/relativeTime.js";

function DetailField({ children, label }) {
  return (
    <div className="flex min-w-0 flex-col gap-[8px]">
      <dt className="text-heading-8 text-[var(--color-text-300)]">{label}</dt>
      <dd className="text-heading-8 m-0 break-words text-[var(--color-text-200)]">{children}</dd>
    </div>
  );
}

function UserDetails({ user }) {
  const projects = Array.isArray(user.projects) ? user.projects : [];

  return (
    <>
      <dl className="m-0 grid grid-cols-2 gap-[16px]">
        <DetailField label="Rol">
          <Badge label={user.role?.name || "Sin rol"} theme="Neutral" variation="Simple" size="S" />
        </DetailField>
        <DetailField label="Fecha de creación">{formatCalendarDate(user.createdAt)}</DetailField>
      </dl>

      <dl className="m-0 flex flex-col gap-[24px]">
        <DetailField label="Nombre">{user.name || "Sin nombre"}</DetailField>
        <DetailField label="Empresa">{user.companyName || "Sin empresa registrada"}</DetailField>
        <DetailField label="Correo">{user.email || "Sin correo registrado"}</DetailField>
        <DetailField label="Teléfono">{user.phone || user.secondaryPhone || "Sin teléfono registrado"}</DetailField>
      </dl>

      <div className="h-px w-full bg-[var(--color-neutral-200)]" aria-hidden="true" />

      <section className="flex flex-col gap-[8px]" aria-labelledby="admin-user-projects-title">
        <h3 id="admin-user-projects-title" className="text-heading-8 m-0 text-[var(--color-text-300)]">Proyectos</h3>
        {projects.length ? (
          <div className="flex flex-wrap gap-[8px]">
            {projects.map((project) => (
              <Tag
                key={project.id}
                label={project.name}
                size="S"
                avatar={false}
                checkbox={false}
                closeIcon={false}
                count={false}
                className="max-w-full"
              />
            ))}
          </div>
        ) : (
          <p className="text-heading-8 m-0 text-[var(--color-text-200)]">Sin proyectos asignados</p>
        )}
      </section>

      <TextArea
        label="Notas"
        value={user.notes || ""}
        placeholder="Sin anotaciones"
        hintText="Información interna visible para administradores."
        showLabelInfo={false}
        minHeight={130}
        readOnly
        className="max-w-none"
        aria-label="Notas internas del usuario"
      />

      <div className="h-px w-full bg-[var(--color-neutral-200)]" aria-hidden="true" />

      <Button
        theme="Primary"
        type="Solid"
        size="M"
        fitContent
        showLeftIcon={false}
        showRightIcon={false}
        disabled
        aria-label="Editar usuario; función no disponible"
        title="La edición de usuarios estará disponible en su flujo correspondiente."
      >
        Editar
      </Button>
    </>
  );
}

function AdminUserDetailsDrawer({ open, onClose, userId }) {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    if (!open || !userId) return undefined;

    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setDetails(null);
        setError("");
        setLoading(true);
      }
    });
    api.admin.getUserDetails({ signal: controller.signal, userId })
      .then((payload) => setDetails(payload?.user || null))
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") {
          setError(requestError?.message || "No se pudieron cargar los detalles del usuario.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [open, requestKey, userId]);

  return (
    <SideOverlayDrawer
      open={open}
      onClose={onClose}
      widthClassName="w-[min(312px,calc(100vw-32px))]"
      ariaLabel="Detalles de usuario"
      className="z-[90]"
    >
      <div className="flex h-full min-h-0 flex-col gap-[24px] overflow-y-auto p-[16px] [scrollbar-color:var(--color-neutral-400)_transparent] [scrollbar-width:thin]">
        <h2 className="text-heading-5 m-0 text-[var(--color-text-50)]">Detalles de Usuario</h2>
        <div className="h-px w-full shrink-0 bg-[var(--color-neutral-200)]" aria-hidden="true" />

        {loading ? (
          <Loader preset="adminUserDetails" label="Cargando detalles del usuario" />
        ) : error ? (
          <EmptyState
            title="No se pudieron cargar los detalles"
            description={error}
            size="S"
            showFeaturedIcon={false}
            showActions
            showSecondaryAction={false}
            primaryActionLabel="Reintentar"
            onPrimaryAction={() => setRequestKey((key) => key + 1)}
            className="min-h-[280px]"
          />
        ) : details ? (
          <UserDetails user={details} />
        ) : null}
      </div>
    </SideOverlayDrawer>
  );
}

export default AdminUserDetailsDrawer;
