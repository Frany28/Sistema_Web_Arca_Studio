import { useEffect, useState } from "react";
import { Add, Edit2, Minus, Trash } from "iconsax-react";

import { api } from "../../api/http.js";
import AlertToast from "../../components/ui/AlertToast/AlertToast.jsx";
import Badge from "../../components/ui/Badge/Badge.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import ComposerSubmitButton from "../../components/ui/ComposerSubmitButton.jsx";
import EmptyState from "../../components/ui/EmptyState/EmptyState.jsx";
import HintText from "../../components/ui/HintText/HintText.jsx";
import Loader from "../../components/ui/Loader/Loader.jsx";
import Modal from "../../components/ui/Modal/Modal.jsx";
import SideOverlayDrawer from "../../components/ui/SideOverlayDrawer.jsx";
import Tag from "../../components/ui/Tag/Tag.jsx";
import TextArea from "../../components/ui/TextArea/TextArea.jsx";
import { formatCalendarDate, formatHumanDate } from "../../utils/relativeTime.js";
import EditAdminUserModal from "./EditAdminUserModal.jsx";

function DetailField({ children, label }) {
  return <div className="flex min-w-0 flex-col gap-[8px]"><dt className="text-heading-8 text-[var(--color-text-300)]">{label}</dt><dd className="text-heading-8 m-0 break-words text-[var(--color-text-200)]">{children}</dd></div>;
}

function UserNotes({ user }) {
  const [previewNotes, setPreviewNotes] = useState(Array.isArray(user.notes) ? user.notes.slice(0, 2) : []);
  const [allNotes, setAllNotes] = useState([]);
  const [notesTotal, setNotesTotal] = useState(Number(user.notesTotal || 0));
  const [expanded, setExpanded] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editor, setEditor] = useState("new");
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const visibleNotes = expanded ? allNotes : previewNotes;

  const loadNotes = async ({ append = false, cursor = null } = {}) => {
    setLoading(true);
    try {
      const payload = await api.admin.listUserNotes({ cursor, userId: user.id });
      setAllNotes((current) => append ? [...current, ...(payload.notes || [])] : (payload.notes || []));
      setNextCursor(payload.nextCursor || null);
    } catch (error) {
      setFeedback({ id: Date.now(), theme: "Danger", title: "No se pudieron cargar las notas", description: error.message });
    } finally { setLoading(false); }
  };

  const toggleAllNotes = async () => {
    if (expanded) return setExpanded(false);
    setExpanded(true);
    if (!allNotes.length && notesTotal) await loadNotes();
  };

  const openEditor = (note) => {
    setEditor(note.id);
    setDraft(note.content || "");
    requestAnimationFrame(() => document.getElementById(`admin-user-note-${user.id}`)?.focus());
  };

  const resetEditor = () => {
    setEditor("new");
    setDraft("");
  };

  const saveNote = async () => {
    const content = draft.trim();
    if (!content || saving) return;
    setFeedback(null);
    setSaving(true);
    try {
      const payload = editor === "new"
        ? await api.admin.createUserNote({ content, userId: user.id })
        : await api.admin.updateUserNote({ content, noteId: editor, userId: user.id });
      const saved = payload.note;
      if (editor === "new") {
        setPreviewNotes((current) => [saved, ...current].slice(0, 2));
        setAllNotes((current) => expanded ? [saved, ...current] : current);
        setNotesTotal((current) => current + 1);
      } else {
        const replace = (notes) => notes.map((note) => note.id === saved.id ? saved : note);
        setPreviewNotes(replace);
        setAllNotes(replace);
      }
      resetEditor();
    } catch (error) {
      setFeedback({ id: Date.now(), theme: "Danger", title: "No se pudo guardar la nota", description: error.message });
    } finally { setSaving(false); }
  };

  const deleteNote = async () => {
    if (!pendingDelete || deletingNoteId) return;
    const noteId = pendingDelete.id;
    setFeedback(null);
    setDeletingNoteId(noteId);
    try {
      await api.admin.deleteUserNote({ noteId, userId: user.id });
      setPreviewNotes((current) => current.filter((note) => note.id !== noteId));
      setAllNotes((current) => current.filter((note) => note.id !== noteId));
      setNotesTotal((current) => Math.max(0, current - 1));
      if (editor === noteId) resetEditor();
      setPendingDelete(null);

      try {
        const payload = await api.admin.listUserNotes({ limit: 2, userId: user.id });
        setPreviewNotes(payload.notes || []);
      } catch (refreshError) {
        setFeedback({ id: Date.now(), theme: "Danger", title: "La nota se eliminó, pero no se pudo actualizar la lista", description: refreshError.message });
      }
    } catch (error) {
      setFeedback({ id: Date.now(), theme: "Danger", title: "No se pudo eliminar la nota", description: error.message });
    } finally {
      setDeletingNoteId(null);
    }
  };

  return (
    <section className="flex flex-col gap-[12px]" aria-labelledby="admin-user-notes-title">
      <h3 id="admin-user-notes-title" className="text-heading-8 m-0 text-[var(--color-text-300)]">Notas</h3>

      <div className="flex flex-col gap-[12px]">
        <TextArea
          id={`admin-user-note-${user.id}`}
          aria-label={editor === "new" ? "Nueva nota" : "Editar nota"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Anotaciones..."
          showHint={false}
          showLabel={false}
          showLabelInfo={false}
          minHeight={104}
          maxLength={1000}
          className="max-w-none"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              saveNote();
            }
          }}
        />
        <div className="flex min-w-0 items-start justify-between gap-[8px]">
          <HintText hintText="Solo visible para ti." className="min-w-0 flex-1" />
          <ComposerSubmitButton
            ariaLabel={editor === "new" ? "Guardar nota" : "Guardar cambios"}
            disabled={!draft.trim() || saving}
            onClick={saveNote}
          />
        </div>
      </div>

      {loading && !visibleNotes.length ? <Loader preset="adminUserDetails" label="Cargando notas" /> : visibleNotes.length ? (
        <div className="flex flex-col gap-[4px]">
          <div className={expanded ? "max-h-[248px] overflow-y-auto pr-[4px] [scrollbar-color:var(--color-neutral-400)_transparent] [scrollbar-width:thin]" : ""}>
            <div className="overflow-hidden rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)]">
              {visibleNotes.map((note) => (
                <article key={note.id} className="flex min-w-0 items-center justify-between gap-[8px] border-b border-[var(--color-neutral-200)] px-[8px] py-[6px] transition-colors duration-150 last:border-b-0 hover:bg-[var(--color-neutral-10)] motion-reduce:transition-none">
                  <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                    <p className="text-body-4 m-0 truncate text-[var(--color-text-200)]" title={note.content}>{note.content}</p>
                    <time className="text-body-4 min-w-0 truncate text-[var(--color-text-100)]" dateTime={note.updatedAt}>{formatHumanDate(note.updatedAt)}</time>
                  </div>
                  <div className="flex shrink-0 items-center gap-[2px]">
                    <Button theme="Primary" type="Ghost" size="S" className="!size-7 !p-[5px]" showText={false} showLeftIcon iconLeft={<Edit2 size="13" color="currentColor" />} showRightIcon={false} aria-label="Editar nota" tooltip="Editar nota" tooltipPosition="Top right" disabled={Boolean(deletingNoteId)} onClick={() => openEditor(note)} />
                    <Button theme="Primary" type="Ghost" size="S" className="!size-7 !p-[5px] text-[var(--color-danger-100)] hover:!text-[var(--color-danger-100)]" showText={false} showLeftIcon iconLeft={<Trash size="13" color="currentColor" />} showRightIcon={false} aria-label="Eliminar nota" tooltip="Eliminar nota" tooltipPosition="Top right" disabled={Boolean(deletingNoteId)} onClick={() => setPendingDelete(note)} />
                  </div>
                </article>
              ))}
            </div>
            {expanded && nextCursor ? <Button theme="Primary" type="Link" size="S" fitContent showLeftIcon={false} showRightIcon={false} disabled={loading} onClick={() => loadNotes({ append: true, cursor: nextCursor })}>{loading ? "Cargando..." : "Cargar más"}</Button> : null}
          </div>
          {notesTotal > 2 ? <Button theme="Primary" type="Link" size="S" fitContent iconLeft={expanded ? <Minus size="16" color="currentColor" /> : <Add size="16" color="currentColor" />} showLeftIcon showRightIcon={false} onClick={toggleAllNotes}>{expanded ? "Mostrar menos" : `Mostrar más (${notesTotal - 2})`}</Button> : null}
        </div>
      ) : <p className="text-body-3 m-0 text-[var(--color-text-300)]">Sin anotaciones.</p>}
      <Modal
        mount="viewport"
        visible={Boolean(pendingDelete)}
        title="Eliminar nota"
        description="Esta acción no se puede deshacer."
        primaryActionLabel={deletingNoteId ? "Eliminando..." : "Eliminar"}
        secondaryActionLabel="Conservar"
        primaryActionTheme="Danger"
        icon={<Trash size="20" color="currentColor" />}
        onClose={() => { if (!deletingNoteId) setPendingDelete(null); }}
        onSecondaryAction={() => { if (!deletingNoteId) setPendingDelete(null); }}
        onPrimaryAction={deleteNote}
      />
      <AlertToast trigger={feedback?.id} theme={feedback?.theme} title={feedback?.title} description={feedback?.description} onDismiss={() => setFeedback(null)} />
    </section>
  );
}

function UserDetails({ user }) {
  const projects = Array.isArray(user.projects) ? user.projects : [];
  return <>
    <dl className="m-0 grid grid-cols-2 gap-[16px]"><DetailField label="Rol"><Badge label={user.role?.name || "Sin rol"} theme="Neutral" variation="Simple" size="S" /></DetailField><DetailField label="Fecha de creación">{formatCalendarDate(user.createdAt)}</DetailField></dl>
    <dl className="m-0 flex flex-col gap-[24px]"><DetailField label="Nombre">{user.name || "Sin nombre"}</DetailField><DetailField label="Empresa">{user.companyName || "Sin empresa registrada"}</DetailField><DetailField label="Correo">{user.email || "Sin correo registrado"}</DetailField><DetailField label="Teléfono">{user.phone || user.secondaryPhone || "Sin teléfono registrado"}</DetailField></dl>
    <div className="h-px w-full bg-[var(--color-neutral-200)]" aria-hidden="true" />
    <section className="flex flex-col gap-[8px]" aria-labelledby="admin-user-projects-title"><h3 id="admin-user-projects-title" className="text-heading-8 m-0 text-[var(--color-text-300)]">Proyectos</h3>{projects.length ? <div className="flex flex-wrap gap-[8px]">{projects.map((project) => <Tag key={project.id} label={project.name} size="S" avatar={false} checkbox={false} closeIcon={false} count={false} className="max-w-full" />)}</div> : <p className="text-heading-8 m-0 text-[var(--color-text-200)]">Sin proyectos asignados</p>}</section>
    <div className="h-px w-full bg-[var(--color-neutral-200)]" aria-hidden="true" />
    <UserNotes user={user} />
  </>;
}

function AdminUserDetailsDrawer({ onUserUpdated, open, onClose, roles = [], userId }) {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestKey, setRequestKey] = useState(0);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!open || !userId) return undefined;
    const controller = new AbortController();
    queueMicrotask(() => { if (!controller.signal.aborted) { setDetails(null); setError(""); setLoading(true); } });
    api.admin.getUserDetails({ signal: controller.signal, userId }).then((payload) => setDetails(payload?.user || null)).catch((requestError) => { if (requestError?.name !== "AbortError") setError(requestError?.message || "No se pudieron cargar los detalles del usuario."); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, requestKey, userId]);
  const updateUser = async (payload) => {
    const response = await api.admin.updateUser({ payload, userId });
    setEditing(false);
    setRequestKey((key) => key + 1);
    onUserUpdated?.(response?.user);
  };
  const closeDrawer = () => {
    setEditing(false);
    onClose();
  };

  return (
    <>
    <SideOverlayDrawer open={open} onClose={closeDrawer} widthClassName="w-[min(312px,calc(100vw-32px))]" ariaLabel="Detalles de usuario" className="z-[90]">
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 flex-col gap-[24px] px-[16px] pt-[16px]">
          <h2 className="text-heading-5 m-0 text-[var(--color-text-50)]">Detalles de Usuario</h2>
          <div className="h-px w-full bg-[var(--color-neutral-200)]" aria-hidden="true" />
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-[24px] overflow-y-auto px-[16px] py-[24px] [scrollbar-color:var(--color-neutral-400)_transparent] [scrollbar-width:thin]">
          {loading ? <Loader preset="adminUserDetails" label="Cargando detalles del usuario" /> : error ? <EmptyState title="No se pudieron cargar los detalles" description={error} size="S" showFeaturedIcon={false} showActions showSecondaryAction={false} primaryActionLabel="Reintentar" onPrimaryAction={() => setRequestKey((key) => key + 1)} className="min-h-[280px]" /> : details ? <UserDetails key={details.id} user={details} /> : null}
        </div>

        <footer className="flex shrink-0 border-t border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px]">
          <Button theme="Primary" type="Solid" size="M" fitContent showLeftIcon={false} showRightIcon={false} disabled={!details || loading} onClick={() => setEditing(true)}>Editar</Button>
        </footer>
      </div>
    </SideOverlayDrawer>
    {editing && details ? (
      <EditAdminUserModal
        open
        roles={roles}
        user={details}
        onClose={() => setEditing(false)}
        onUpdate={updateUser}
      />
    ) : null}
    </>
  );
}

export default AdminUserDetailsDrawer;
