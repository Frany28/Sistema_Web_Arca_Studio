import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowSwapVertical,
  DocumentForward,
  Edit2,
  Eye,
  Filter,
  FilterRemove,
  GlobalEdit,
  More,
  SearchNormal1,
} from "iconsax-react";

import Avatar from "../../../components/ui/Avatar/Avatar.jsx";
import Alert from "../../../components/ui/Alert/Alert.jsx";
import AssigneeMultiSelect from "../../../components/ui/AssigneeMultiSelect/AssigneeMultiSelect.jsx";
import Badge from "../../../components/ui/Badge/Badge.jsx";
import Button from "../../../components/ui/Button/Button.jsx";
import Checkbox from "../../../components/ui/Checkbox/Checkbox.jsx";
import DropdownMenu from "../../../components/ui/DropdownMenu/DropdownMenu.jsx";
import EmptyState from "../../../components/ui/EmptyState/EmptyState.jsx";
import Input from "../../../components/ui/Input/Input.jsx";
import Loader from "../../../components/ui/Loader/Loader.jsx";
import ScrollBar from "../../../components/ui/ScrollBar/ScrollBar.jsx";
import Tag from "../../../components/ui/Tag/Tag.jsx";
import Tooltip from "../../../components/ui/Tooltip/Tooltip.jsx";
import { getAvatarPresentation } from "../../../utils/avatarPresentation.js";
import { getBulkActionAvailability } from "./adminProjectBulkActions.js";
import "./AdminActiveProjects.css";

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
  const name = client.name || project.clientName || "Sin cliente";
  const photo = client.profilePhotoUrl || client.avatarUrl || "";
  return {
    avatar: getAvatarPresentation({
      identity: client.id || project.clientId || name,
      name,
      roleCode: "client",
      src: photo,
    }),
    name,
  };
}

function getAssignees(project) {
  if (Array.isArray(project.assignees) && project.assignees.length) return project.assignees;
  if (Array.isArray(project.assignedArchitects) && project.assignedArchitects.length) {
    return project.assignedArchitects;
  }
  return project.assignedArchitect ? [project.assignedArchitect] : [];
}

function TableHeaderLabel({ children, filter = false }) {
  const Icon = filter ? Filter : ArrowSwapVertical;
  return (
    <span className="flex items-center gap-[8px] whitespace-nowrap">
      <span>{children}</span>
      <Icon size="16" variant="Linear" color="currentColor" aria-hidden="true" />
    </span>
  );
}

function AdminActiveProjects({
  assignees: employeeOptions = [],
  assigneesLoading = false,
  error,
  loading,
  onOpenProject,
  onBulkAction,
  onProjectAssigneesChange,
  onRetry,
  projects,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [personFilter, setPersonFilter] = useState("all");
  const [selectedProjectIds, setSelectedProjectIds] = useState(() => new Set());
  const [bulkActionPending, setBulkActionPending] = useState("");
  const [bulkActionFeedback, setBulkActionFeedback] = useState(null);
  const bulkActionPendingRef = useRef(false);
  const tableViewportRef = useRef(null);
  const [tableScrollState, setTableScrollState] = useState({
    length: 1,
    position: 0,
    width: 0,
  });

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

  const selectedVisibleProjects = useMemo(
    () => visibleProjects.filter(
      (project) => selectedProjectIds.has(String(project.id)),
    ),
    [selectedProjectIds, visibleProjects],
  );
  const selectedVisibleCount = selectedVisibleProjects.length;
  const {
    canArchive,
    canChangeVisibility,
    canUnarchive,
  } = getBulkActionAvailability(selectedVisibleProjects);
  const allVisibleSelected = visibleProjects.length > 0
    && selectedVisibleCount === visibleProjects.length;
  const headerChecked = allVisibleSelected
    ? "Yes"
    : selectedVisibleCount > 0
      ? "Indeterminate"
      : "No";
  const hasFilters = Boolean(query || statusFilter !== "all" || personFilter !== "all");

  const syncTableScrollState = useCallback(() => {
    const viewport = tableViewportRef.current;

    if (!viewport) {
      return;
    }

    const maxScroll = Math.max(viewport.scrollWidth - viewport.clientWidth, 0);
    const nextState = {
      length: viewport.scrollWidth
        ? Math.min(viewport.clientWidth / viewport.scrollWidth, 1)
        : 1,
      position: maxScroll ? viewport.scrollLeft / maxScroll : 0,
      width: viewport.clientWidth,
    };

    setTableScrollState((current) =>
      Math.abs(current.length - nextState.length) < 0.001 &&
      Math.abs(current.position - nextState.position) < 0.001 &&
      current.width === nextState.width
        ? current
        : nextState,
    );
  }, []);

  useEffect(() => {
    const viewport = tableViewportRef.current;

    if (!viewport) {
      return undefined;
    }

    syncTableScrollState();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", syncTableScrollState);
      return () => window.removeEventListener("resize", syncTableScrollState);
    }

    const resizeObserver = new ResizeObserver(syncTableScrollState);
    resizeObserver.observe(viewport);

    return () => resizeObserver.disconnect();
  }, [error, loading, syncTableScrollState, visibleProjects.length]);

  const handleTableScrollPositionChange = useCallback(
    (position) => {
      const viewport = tableViewportRef.current;

      if (!viewport) {
        return;
      }

      const maxScroll = Math.max(viewport.scrollWidth - viewport.clientWidth, 0);
      viewport.scrollLeft = maxScroll * position;
      syncTableScrollState();
    },
    [syncTableScrollState],
  );

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setPersonFilter("all");
  };

  const toggleAllVisible = () => {
    setBulkActionFeedback(null);
    setSelectedProjectIds((current) => {
      const next = new Set(current);
      visibleProjects.forEach((project) => {
        const id = String(project.id);
        if (allVisibleSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const toggleProject = (projectId) => {
    setBulkActionFeedback(null);
    setSelectedProjectIds((current) => {
      const next = new Set(current);
      const id = String(projectId);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = async (action) => {
    const actionIsAllowed = {
      archive: canArchive,
      change_visibility: canChangeVisibility,
      unarchive: canUnarchive,
    }[action];

    if (!actionIsAllowed || bulkActionPendingRef.current || !onBulkAction) return;

    bulkActionPendingRef.current = true;
    setBulkActionPending(action);
    setBulkActionFeedback(null);

    try {
      await onBulkAction({ action, projects: selectedVisibleProjects });
      const successMessages = {
        archive: "Los proyectos seleccionados fueron archivados.",
        change_visibility: "La visibilidad de los proyectos fue actualizada.",
        unarchive: "Los proyectos seleccionados fueron desarchivados.",
      };
      setSelectedProjectIds(new Set());
      setBulkActionFeedback({ message: successMessages[action], type: "success" });
    } catch (actionError) {
      setBulkActionFeedback({
        message: actionError?.message || "No se pudieron actualizar los proyectos.",
        type: "error",
      });
    } finally {
      bulkActionPendingRef.current = false;
      setBulkActionPending("");
    }
  };

  return (
    <section
      className="admin-active-projects mx-auto flex w-full max-w-[1200px] flex-col gap-[16px] px-[16px] pb-[48px] pt-[24px] sm:px-[24px] lg:px-[48px]"
      aria-labelledby="admin-active-projects-title"
    >
      <h2 id="admin-active-projects-title" className="text-body-3 text-[var(--color-text-300)]">
        Proyectos activos
      </h2>

      <div className="admin-active-projects__toolbar">
        <Input
          type="Default input"
          size="M"
          value={query}
          placeholder="Buscar..."
          showLabel={false}
          showHint={false}
          showLeftIcon
          showRightIcon={false}
          leftIcon={<SearchNormal1 size="20" color="currentColor" />}
          className="w-full"
          aria-label="Buscar proyectos activos"
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="admin-active-projects__filters w-full">
          <DropdownMenu
            type="Text"
            label="Filtrar por personal"
            items={personnelFilterItems}
            selectedItemId={personFilter}
            onItemSelect={(item) => setPersonFilter(item.id)}
            className="w-full"
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
            className="w-full"
            triggerWrapperClassName="h-[39px]"
            triggerHeightClassName="h-[37px]"
            triggerPaddingXClassName="px-[16px]"
            aria-label="Filtrar proyectos por status"
          />
          <Button
            theme="Primary"
            type="Solid"
            size="M"
            fitContent
            showLeftIcon
            iconLeft={<FilterRemove size="20" color="currentColor" />}
            showRightIcon={false}
            disabled={!hasFilters}
            className="admin-active-projects__clear-filters w-full"
            onClick={clearFilters}
          >
            Quitar filtros
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader preset="adminProjectTable" label="Cargando proyectos activos" />
      ) : error ? (
        <div className="w-full rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] shadow-[var(--shadow-e1)]">
          <EmptyState
            title="No se pudieron cargar los proyectos"
            description={error}
            size="S"
            showFeaturedIcon={false}
            showActions
            showSecondaryAction={false}
            primaryActionLabel="Reintentar"
            onPrimaryAction={onRetry}
          />
        </div>
      ) : visibleProjects.length ? (
        <>
          <div className="w-full overflow-hidden rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)]">
            <div
              ref={tableViewportRef}
              className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              onScroll={syncTableScrollState}
            >
              <table className="w-full min-w-[1093px] table-fixed border-collapse text-left">
            <colgroup>
              <col className="w-[48px]" />
              <col className="w-[155px]" />
              <col className="w-[184px]" />
              <col className="w-[300px]" />
              <col className="w-[117px]" />
              <col className="w-[117px]" />
              <col className="w-[172px]" />
            </colgroup>
            <thead className="bg-[var(--color-neutral-200)] text-[var(--color-text-300)]">
              <tr className="h-[49px] text-body-4">
                <th className="p-[16px]">
                  <Checkbox size="S" checked={headerChecked} interactive aria-label="Seleccionar todos los proyectos visibles" onCheckedChange={toggleAllVisible} />
                </th>
                <th className="px-[24px] py-[16px]"><TableHeaderLabel>Proyecto</TableHeaderLabel></th>
                <th className="px-[24px] py-[16px]"><TableHeaderLabel>Cliente</TableHeaderLabel></th>
                <th className="px-[24px] py-[16px]"><TableHeaderLabel filter>Personal responsable</TableHeaderLabel></th>
                <th className="px-[24px] py-[16px]"><TableHeaderLabel filter>Status</TableHeaderLabel></th>
                <th className="px-[24px] py-[16px]"><TableHeaderLabel>Progreso</TableHeaderLabel></th>
                <th className="px-[24px] py-[16px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleProjects.map((project) => {
                const client = getClient(project);
                const status = getStatus(project);
                const assignees = getAssignees(project);
                const progress = Math.min(100, Math.max(0, Number(project.progress) || 0));
                const projectName = project.title || project.name || "Proyecto";
                const isSelected = selectedProjectIds.has(String(project.id));

                return (
                  <tr
                    key={project.id}
                    className={`h-[68px] transition-colors duration-150 ${
                      isSelected
                        ? "bg-[var(--color-neutral-300)]"
                        : "bg-[var(--color-neutral-100)]"
                    }`}
                    data-selected={isSelected ? "true" : undefined}
                  >
                    <td className="p-[16px]">
                      <Checkbox size="S" checked={isSelected ? "Yes" : "No"} interactive aria-label={`Seleccionar ${projectName}`} onCheckedChange={() => toggleProject(project.id)} />
                    </td>
                    <td className="px-[24px] py-[16px]">
                      <Tag label={projectName} size="M" avatar={false} checkbox={false} closeIcon={false} count={false} className="max-w-[107px]" />
                    </td>
                    <td className="px-[24px] py-[16px]">
                      <div className="flex min-w-0 items-center gap-[8px]">
                        <Avatar size="S" name={client.name} {...client.avatar} />
                        <span className="text-body-4 min-w-0 truncate text-[var(--color-text-300)]">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-[24px] py-[16px]">
                      <AssigneeMultiSelect value={assignees} options={employeeOptions} loading={assigneesLoading} className="w-[252px]" aria-label={`Responsables de ${projectName}`} onChange={(nextAssignees) => onProjectAssigneesChange?.(project, nextAssignees)} />
                    </td>
                    <td className="px-[24px] py-[16px]"><Badge label={status.label} theme={status.theme} variation="Simple" size="S" /></td>
                    <td className="px-[24px] py-[16px]"><Badge label={`${progress}%`} theme="Neutral" variation="Simple" size="S" /></td>
                    <td className="px-[24px] py-[16px]">
                      <div className="flex items-center gap-[8px]">
                        <Tooltip text="Ver proyecto" tipPosition="Top center" portal>
                          <Button theme="Primary" type="Ghost" size="S" showText={false} showLeftIcon iconLeft={<Eye size="20" color="currentColor" />} showRightIcon={false} aria-label={`Ver ${projectName}`} onClick={() => onOpenProject(project)} />
                        </Tooltip>
                        <Tooltip text="Editar proyecto" tipPosition="Top center" portal>
                          <Button theme="Primary" type="Ghost" size="S" showText={false} showLeftIcon iconLeft={<Edit2 size="20" color="currentColor" />} showRightIcon={false} aria-label={`Editar ${projectName}`} disabled={!project.editable} onClick={() => onOpenProject(project)} />
                        </Tooltip>
                        <Tooltip text="Más opciones" tipPosition="Top center" portal>
                          <Button theme="Primary" type="Ghost" size="S" showText={false} showLeftIcon iconLeft={<More size="20" color="currentColor" />} showRightIcon={false} aria-label={`Más opciones de ${projectName}`} aria-disabled="true" />
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
              </table>
            </div>
            {tableScrollState.length < 0.999 && tableScrollState.width > 0 ? (
              <ScrollBar
                orientation="horizontal"
                width={tableScrollState.width}
                length={tableScrollState.length}
                position={tableScrollState.position}
                interactive
                onPositionChange={handleTableScrollPositionChange}
                aria-label="Desplazar tabla de proyectos horizontalmente"
                className="block max-w-full"
              />
            ) : null}
          </div>

          {selectedVisibleCount > 0 ? (
            <footer
              className="flex w-full flex-wrap items-center justify-between gap-x-[12px] gap-y-[12px]"
              aria-label="Acciones para proyectos seleccionados"
              data-selection-footer="true"
            >
              <span
                className="text-heading-8 shrink-0 text-[var(--color-text-300)]"
                aria-live="polite"
              >
                {selectedVisibleCount} de {visibleProjects.length} seleccionados
              </span>

              <div className="flex flex-wrap items-center gap-[8px]">
                <Button
                  theme="Primary"
                  type="Ghost"
                  size="M"
                  fitContent
                  showLeftIcon
                  iconLeft={<GlobalEdit size="20" color="currentColor" />}
                  showRightIcon={false}
                  disabled={!canChangeVisibility || Boolean(bulkActionPending) || !onBulkAction}
                  aria-busy={bulkActionPending === "change_visibility"}
                  onClick={() => handleBulkAction("change_visibility")}
                >
                  Cambiar visibilidad
                </Button>
                <Button
                  theme="Primary"
                  type="Ghost"
                  size="M"
                  fitContent
                  showLeftIcon
                  iconLeft={<DocumentForward size="20" color="currentColor" />}
                  showRightIcon={false}
                  disabled={!canArchive || Boolean(bulkActionPending) || !onBulkAction}
                  aria-busy={bulkActionPending === "archive"}
                  onClick={() => handleBulkAction("archive")}
                >
                  Archivar
                </Button>
                <Button
                  theme="Primary"
                  type="Ghost"
                  size="M"
                  fitContent
                  showLeftIcon
                  iconLeft={<GlobalEdit size="20" color="currentColor" />}
                  showRightIcon={false}
                  disabled={!canUnarchive || Boolean(bulkActionPending) || !onBulkAction}
                  aria-busy={bulkActionPending === "unarchive"}
                  onClick={() => handleBulkAction("unarchive")}
                >
                  Desarchivar
                </Button>
              </div>

              <div className="flex items-center gap-[8px]">
                <Button
                  theme="Primary"
                  type="Outline"
                  size="M"
                  fitContent
                  showLeftIcon={false}
                  showRightIcon={false}
                >
                  Anterior
                </Button>
                <Button
                  theme="Primary"
                  type="Solid"
                  size="M"
                  fitContent
                  showLeftIcon={false}
                  showRightIcon={false}
                >
                  Siguiente pág.
                </Button>
              </div>
            </footer>
          ) : null}

          {bulkActionFeedback ? (
            <Alert
              visible
              theme={bulkActionFeedback.type === "error" ? "Danger" : "Success"}
              layout="Box"
              title={
                bulkActionFeedback.type === "error"
                  ? "No se pudo realizar el cambio"
                  : "Cambio realizado con \u00e9xito"
              }
              description={bulkActionFeedback.message}
              showIcon
              showText
              showActions={false}
              showCloseButton
              onDismiss={() => setBulkActionFeedback(null)}
              aria-label={
                bulkActionFeedback.type === "error"
                  ? "Error al actualizar los proyectos"
                  : "Proyectos actualizados correctamente"
              }
              className="max-w-full"
            />
          ) : null}
        </>
      ) : (
        <EmptyState title={hasFilters ? "No hay coincidencias" : "No hay proyectos activos"} description={hasFilters ? "Ajusta o elimina los filtros para ver otros proyectos." : "Los proyectos aparecerán aquí cuando estén disponibles."} size="S" showFeaturedIcon={!hasFilters} showActions={hasFilters} showSecondaryAction={false} primaryActionLabel="Quitar filtros" onPrimaryAction={clearFilters} />
      )}
    </section>
  );
}

export default AdminActiveProjects;
