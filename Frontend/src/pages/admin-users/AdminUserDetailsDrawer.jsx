import { useEffect, useState } from "react";
import { Add, Edit2 } from "iconsax-react";

import { api } from "../../api/http.js";
import AlertToast from "../../components/ui/AlertToast/AlertToast.jsx";
import Badge from "../../components/ui/Badge/Badge.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import EmptyState from "../../components/ui/EmptyState/EmptyState.jsx";
import Loader from "../../components/ui/Loader/Loader.jsx";
import SideOverlayDrawer from "../../components/ui/SideOverlayDrawer.jsx";
import Tag from "../../components/ui/Tag/Tag.jsx";
import TextArea from "../../components/ui/TextArea/TextArea.jsx";
import { formatCalendarDate, formatHumanDate } from "../../utils/relativeTime.js";

function DetailField({ children, label }) {
  return <div className="flex min-w-0 flex-col gap-[8px]"><dt className="text-heading-8 text-[var(--color-text-300)]">{label}</dt><dd className="text-heading-8 m-0 break-words text-[var(--color-text-200)]">{children}</dd></div>;
}

function UserNotes({ user }) {
  const [previewNotes, setPreviewNotes] = useState(Array.isArray(user.notes) ? user.notes : []);
  const [allNotes, setAllNotes] = useState([]);
  const [notesTotal, setNotesTotal] = useState(Number(user.notesTotal || 0));
  const [expanded, setExpanded] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editor, setEditor] = useState("new");
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
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

  const openEditor = (note = null) => {
    setEditor(note ? note.id : "new");
    setDraft(note?.content || "");
    requestAnimationFrame(() => {
      document.getElementById(`admin-user-note-${user.id}`)?.focus();
    });
  };

  const resetEditor = () => {
    setEditor("new");
    setDraft("");
  };

  const saveNote = async () => {
    const content = draft.trim();
    if (!content || saving) return;
    setSaving(true);
    try {
      const payload = editor === "new"
        ? await api.admin.createUserNote({ content, userId: user.id })
        : await api.admin.updateUserNote({ content, noteId: editor, userId: user.id });
      const saved = payload.note;
      if (editor === "new") {
        setPreviewNotes((current) => [saved, ...current].slice(0, 3));
        setAllNotes((current) => expanded ? [saved, ...current] : current);
        setNotesTotal((current) => current + 1);
      } else {
        const replace = (notes) => notes.map((note) => note.id === saved.id ? saved : note);
        setPreviewNotes(replace);
        setAllNotes(replace);
      }
      resetEditor();
      setFeedback({ id: Date.now(), theme: "Success", title: editor === "new" ? "Nota guardada" : "Nota actualizada", description: "La nota es privada y solo está disponible para ti." });
    } catch (error) {
      setFeedback({ id: Date.now(), theme: "Danger", title: "No se pudo guardar la nota", description: error.message });
    } finally { setSaving(false); }
  };

  return (
    <section className="flex flex-col gap-[12px]" aria-labelledby="admin-user-notes-title">
      <div className="flex items-center justify-between gap-[8px]">
        <h3 id="admin-user-notes-title" className="text-heading-8 m-0 text-[var(--color-text-300)]">Notas</h3>
        <Button theme="Primary" type="Link" size="S" fitContent iconLeft={<Add size="16" color="currentColor" />} showLeftIcon showRightIcon={false} disabled={saving} onClick={() => openEditor()}>Añadir nota</Button>
      </div>

      <div className="flex flex-col gap-[12px]">
        <TextArea
          id={`admin-user-note-${user.id}`}
          aria-label={editor === "new" ? "Nueva nota" : "Editar nota"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Anotaciones..."
          hintText="Solo visible para ti."
          showLabel={false}
          showLabelInfo={false}
          minHeight={104}
          maxLength={1000}
          className="max-w-none"
        />
        <div className="flex justify-end gap-[8px]">
          {draft || editor !== "new" ? <Button theme="Primary" type="Outline" size="S" fitContent showLeftIcon={false} showRightIcon={false} disabled={saving} onClick={resetEditor}>Cancelar</Button> : null}
          <Button theme="Primary" type="Solid" size="S" fitContent showLeftIcon={false} showRightIcon={false} disabled={!draft.trim() || saving} onClick={saveNote}>{saving ? "Guardando..." : editor === "new" ? "Guardar nota" : "Guardar cambios"}</Button>
        </div>
      </div>

      {loading && !visibleNotes.length ? <Loader preset="adminUserDetails" label="Cargando notas" /> : visibleNotes.length ? (
        <div className={expanded ? "max-h-[248px] overflow-y-auto pr-[4px] [scrollbar-color:var(--color-neutral-400)_transparent] [scrollbar-width:thin]" : ""}>
          <div className="flex flex-col">
            {visibleNotes.map((note) => (
              <article key={note.id} className="flex flex-col gap-[6px] border-b border-[var(--color-neutral-200)] py-[12px] first:pt-0 last:border-b-0">
                <p className="text-body-3 m-0 whitespace-pre-wrap break-words text-[var(--color-text-200)]">{note.content}</p>
                <div className="flex items-center justify-between gap-[8px]">
                  <time className="text-body-4 text-[var(--color-text-300)]" dateTime={note.updatedAt}>{formatHumanDate(note.updatedAt)}</time>
                  <Button theme="Primary" type="Ghost" size="S" showText={false} showLeftIcon iconLeft={<Edit2 size="16" color="currentColor" />} showRightIcon={false} aria-label="Editar nota" tooltip="Editar nota" onClick={() => openEditor(note)} />
                </div>
              </article>
            ))}
          </div>
          {expanded && nextCursor ? <Button theme="Primary" type="Link" size="S" fitContent showLeftIcon={false} showRightIcon={false} disabled={loading} onClick={() => loadNotes({ append: true, cursor: nextCursor })}>{loading ? "Cargando..." : "Cargar más"}</Button> : null}
        </div>
      ) : <p className="text-body-3 m-0 text-[var(--color-text-300)]">Sin anotaciones.</p>}
      {notesTotal > 3 ? <Button theme="Primary" type="Link" size="S" fitContent showLeftIcon={false} showRightIcon={false} onClick={toggleAllNotes}>{expanded ? "Ver recientes" : `Ver todas (${notesTotal})`}</Button> : null}
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
    <div className="h-px w-full bg-[var(--color-neutral-200)]" aria-hidden="true" />
    <Button theme="Primary" type="Solid" size="M" fitContent showLeftIcon={false} showRightIcon={false} disabled aria-label="Editar usuario; función no disponible" title="La edición de usuarios estará disponible en su flujo correspondiente.">Editar</Button>
  </>;
}

function AdminUserDetailsDrawer({ open, onClose, userId }) {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestKey, setRequestKey] = useState(0);
  useEffect(() => {
    if (!open || !userId) return undefined;
    const controller = new AbortController();
    queueMicrotask(() => { if (!controller.signal.aborted) { setDetails(null); setError(""); setLoading(true); } });
    api.admin.getUserDetails({ signal: controller.signal, userId }).then((payload) => setDetails(payload?.user || null)).catch((requestError) => { if (requestError?.name !== "AbortError") setError(requestError?.message || "No se pudieron cargar los detalles del usuario."); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, requestKey, userId]);
  return <SideOverlayDrawer open={open} onClose={onClose} widthClassName="w-[min(312px,calc(100vw-32px))]" ariaLabel="Detalles de usuario" className="z-[90]"><div className="flex h-full min-h-0 flex-col gap-[24px] overflow-y-auto p-[16px] [scrollbar-color:var(--color-neutral-400)_transparent] [scrollbar-width:thin]"><h2 className="text-heading-5 m-0 text-[var(--color-text-50)]">Detalles de Usuario</h2><div className="h-px w-full shrink-0 bg-[var(--color-neutral-200)]" aria-hidden="true" />{loading ? <Loader preset="adminUserDetails" label="Cargando detalles del usuario" /> : error ? <EmptyState title="No se pudieron cargar los detalles" description={error} size="S" showFeaturedIcon={false} showActions showSecondaryAction={false} primaryActionLabel="Reintentar" onPrimaryAction={() => setRequestKey((key) => key + 1)} className="min-h-[280px]" /> : details ? <UserDetails key={details.id} user={details} /> : null}</div></SideOverlayDrawer>;
}

export default AdminUserDetailsDrawer;
