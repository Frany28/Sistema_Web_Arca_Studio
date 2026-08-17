import { useMemo, useState } from "react";
import { Edit2, Eye, FilterRemove, SearchNormal1 } from "iconsax-react";

import Avatar from "../../../components/ui/Avatar/Avatar.jsx";
import Badge from "../../../components/ui/Badge/Badge.jsx";
import Button from "../../../components/ui/Button/Button.jsx";
import DropdownMenu from "../../../components/ui/DropdownMenu/DropdownMenu.jsx";
import EmptyState from "../../../components/ui/EmptyState/EmptyState.jsx";
import Input from "../../../components/ui/Input/Input.jsx";
import Loader from "../../../components/ui/Loader/Loader.jsx";
import Tag from "../../../components/ui/Tag/Tag.jsx";
import Tooltip from "../../../components/ui/Tooltip/Tooltip.jsx";

const STATUS_DETAILS = {
  completed: { label: "Finalizado", theme: "Success" },
  finished: { label: "Finalizado", theme: "Success" },
  in_process: { label: "En progreso", theme: "Info" },
  in_review: { label: "En revisión", theme: "Brand 2" },
  pending_approval: { label: "Solicitud", theme: "Neutral" },
  request: { label: "Solicitud", theme: "Neutral" },
};

const STATUS_FILTER_ITEMS = [
  { id: "all", label: "Filtrar por status", type: "Text" },
  { id: "in_process", label: "En progreso", type: "Text" },
  { id: "in_review", label: "En revisión", type: "Text" },
  { id: "pending_approval", label: "Solicitud", type: "Text" },
  { id: "finished", label: "Finalizado", type: "Text" },
];

function getStatus(project) {
  return STATUS_DETAILS[project.status] || { label: "Solicitud", theme: "Neutral" };
}

function getClient(project) {
  const client = project.client || {};
  return {
    name: client.name || project.clientName || "Sin cliente",
    photo: client.profilePhotoUrl || client.avatarUrl || "",
  };
}

function getAssignees(project) {
  if (Array.isArray(project.assignedArchitects) && project.assignedArchitects.length) {
    return project.assignedArchitects;
  }
  return project.assignedArchitect ? [project.assignedArchitect] : [];
}

function AdminActiveProjects({ error, loading, onOpenProject, projects }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [personFilter, setPersonFilter] = useState("all");

  const personnel = useMemo(() => {
    const people = new Map();
    projects.forEach((project) => {
      getAssignees(project).forEach((person) => {
        if (person?.id || person?.name) people.set(String(person.id || person.name), person);
      });
    });
    return [...people.values()];
  }, [projects]);

  const personnelFilterItems = useMemo(() => [
    { id: "all", label: "Filtrar por personal", type: "Text" },
    ...personnel.map((person) => ({
      id: String(person.id || person.name),
      label: person.name,
      type: "Text",
    })),
  ], [personnel]);

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    return projects.filter((project) => {
      const assignees = getAssignees(project);
      const matchesQuery = !normalizedQuery || [project.title, project.name, getClient(project).name]
        .some((value) => String(value || "").toLocaleLowerCase("es").includes(normalizedQuery));
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesPerson = personFilter === "all" || assignees.some(
        (person) => String(person.id || person.name) === personFilter,
      );
      return matchesQuery && matchesStatus && matchesPerson;
    });
  }, [personFilter, projects, query, statusFilter]);

  const hasFilters = Boolean(query || statusFilter !== "all" || personFilter !== "all");
  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setPersonFilter("all");
  };

  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-col gap-[12px] px-[16px] pb-[48px] pt-[24px] sm:px-[24px] lg:px-[48px]" aria-labelledby="admin-active-projects-title">
      <h2 id="admin-active-projects-title" className="text-body-3 text-[var(--color-text-300)]">Proyectos activos</h2>

      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <Input
          type="Default input"
          size="S"
          value={query}
          placeholder="Buscar..."
          showLabel={false}
          showHint={false}
          showLeftIcon
          showRightIcon={false}
          leftIcon={<SearchNormal1 size="20" color="currentColor" />}
          className="w-full max-w-[320px]"
          aria-label="Buscar proyectos activos"
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-[12px]">
          <DropdownMenu
            type="Text"
            label="Filtrar por personal"
            items={personnelFilterItems}
            selectedItemId={personFilter}
            onItemSelect={(item) => setPersonFilter(item.id)}
            className="w-[180px] max-w-full"
            triggerWrapperClassName="h-[39px]"
            triggerHeightClassName="h-[37px]"
            triggerPaddingXClassName="px-[16px]"
            aria-label="Filtrar proyectos por personal"
          />
          <DropdownMenu
            type="Text"
            label="Filtrar por status"
            items={STATUS_FILTER_ITEMS}
            selectedItemId={statusFilter}
            onItemSelect={(item) => setStatusFilter(item.id)}
            className="w-[180px] max-w-full"
            triggerWrapperClassName="h-[39px]"
            triggerHeightClassName="h-[37px]"
            triggerPaddingXClassName="px-[16px]"
            aria-label="Filtrar proyectos por status"
          />
          <Button theme="Primary" type="Solid" size="S" fitContent showLeftIcon iconLeft={<FilterRemove size="20" color="currentColor" />} showRightIcon={false} disabled={!hasFilters} onClick={clearFilters}>Quitar filtros</Button>
        </div>
      </div>

      {loading ? <Loader preset="adminProjectTable" label="Cargando proyectos activos" /> : error ? (
        <EmptyState title="No se pudieron cargar los proyectos" description={error} size="S" showFeaturedIcon={false} showActions={false} />
      ) : visibleProjects.length ? (
        <div className="w-full overflow-x-auto rounded-[var(--radius-2)] border border-[var(--color-neutral-200)]">
          <table className="w-full min-w-[940px] border-collapse text-left">
            <thead className="bg-[var(--color-neutral-200)] text-[var(--color-text-300)]">
              <tr className="text-body-4"><th className="px-[24px] py-[12px]">Proyecto</th><th className="px-[24px] py-[12px]">Cliente</th><th className="px-[24px] py-[12px]">Personal responsable</th><th className="px-[24px] py-[12px]">Estatus</th><th className="px-[24px] py-[12px]">Progreso</th><th className="px-[24px] py-[12px]">Acciones</th></tr>
            </thead>
            <tbody>
              {visibleProjects.map((project) => {
                const client = getClient(project);
                const status = getStatus(project);
                const assignees = getAssignees(project);
                const progress = Math.min(100, Math.max(0, Number(project.progress) || 0));
                return (
                  <tr key={project.id} className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] last:border-b-0">
                    <td className="px-[24px] py-[12px]"><Tag label={project.title || project.name || "Proyecto"} size="S" avatar={false} closeIcon={false} count={false} /></td>
                    <td className="px-[24px] py-[12px]"><div className="flex items-center gap-[8px]"><Avatar size="S" name={client.name} src={client.photo} content={client.photo ? "Image" : "Text"} /><span className="text-body-4 text-[var(--color-text-300)]">{client.name}</span></div></td>
                    <td className="px-[24px] py-[12px]"><div className="flex max-w-[270px] flex-wrap gap-[4px]">{assignees.length ? assignees.map((person) => <Tag key={person.id || person.name} label={person.name || "Responsable"} size="S" avatar closeIcon={false} count={false} avatarText={String(person.name || "R").charAt(0)} />) : <span className="text-body-4 text-[var(--color-text-100)]">Sin asignar</span>}</div></td>
                    <td className="px-[24px] py-[12px]"><Badge label={status.label} theme={status.theme} variation="Simple" size="S" /></td>
                    <td className="px-[24px] py-[12px]"><Badge label={`${progress}%`} theme="Neutral" variation="Simple" size="S" /></td>
                    <td className="px-[24px] py-[12px]"><div className="flex items-center gap-[4px]"><Tooltip text="Ver proyecto" tipPosition="Top center" portal><Button theme="Primary" type="Ghost" size="S" showText={false} showLeftIcon iconLeft={<Eye size="20" color="currentColor" />} showRightIcon={false} aria-label={`Ver ${project.title || project.name}`} onClick={() => onOpenProject(project)} /></Tooltip><Tooltip text="Editar proyecto" tipPosition="Top center" portal><Button theme="Primary" type="Ghost" size="S" showText={false} showLeftIcon iconLeft={<Edit2 size="20" color="currentColor" />} showRightIcon={false} aria-label={`Editar ${project.title || project.name}`} disabled={!project.editable} onClick={() => onOpenProject(project)} /></Tooltip></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title={hasFilters ? "No hay coincidencias" : "No hay proyectos activos"} description={hasFilters ? "Ajusta o elimina los filtros para ver otros proyectos." : "Los proyectos aparecerán aquí cuando estén disponibles."} size="S" showFeaturedIcon={false} showActions={hasFilters} primaryActionLabel="Quitar filtros" onPrimaryAction={clearFilters} />}
    </section>
  );
}

export default AdminActiveProjects;
