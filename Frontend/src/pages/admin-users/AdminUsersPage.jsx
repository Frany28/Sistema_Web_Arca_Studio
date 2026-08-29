import { useEffect, useMemo, useState } from "react";
import {
  Add,
  ArrowSwapVertical,
  Edit2,
  Eye,
  Filter,
  FilterRemove,
  Profile2User,
  SearchNormal1,
  UserMinus,
  UserRemove,
  UserTick,
} from "iconsax-react";
import { useNavigate } from "react-router-dom";

import { api } from "../../api/http.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { getUserDisplay } from "../../auth/userDisplay.js";
import NavigationBar from "../../components/EnvironmentNavigationBar.jsx";
import NotificationsDrawer from "../../components/EnvironmentNotificationsDrawer.jsx";
import Avatar from "../../components/ui/Avatar/Avatar.jsx";
import Badge from "../../components/ui/Badge/Badge.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import Checkbox from "../../components/ui/Checkbox/Checkbox.jsx";
import DropdownMenu from "../../components/ui/DropdownMenu/DropdownMenu.jsx";
import EmptyState from "../../components/ui/EmptyState/EmptyState.jsx";
import IconContainer from "../../components/ui/IconContainer/IconContainer.jsx";
import Input from "../../components/ui/Input/Input.jsx";
import Loader from "../../components/ui/Loader/Loader.jsx";
import AlertToast from "../../components/ui/AlertToast/AlertToast.jsx";
import SideNavigation from "../../components/ui/SideNavigation/SideNavigation.jsx";
import Tooltip from "../../components/ui/Tooltip/Tooltip.jsx";
import { getAvatarPresentation } from "../../utils/avatarPresentation.js";
import { formatRelativeTime } from "../../utils/relativeTime.js";
import { createUserSideNavigationItems } from "../../utils/sideNavigationItems.js";
import CreateAdminUserModal from "./CreateAdminUserModal.jsx";
import AdminUserActionsMenu from "./AdminUserActionsMenu.jsx";
import AdminUserStatusModal from "./AdminUserStatusModal.jsx";

const WEB_BREAKPOINT_PX = 1280;
const STATUS_FILTER_ITEMS = [
  { id: "all", label: "Filtrar por status", type: "Text" },
  { id: "active", label: "Activo", type: "Text" },
  { id: "blocked", label: "Suspendido", type: "Text" },
  { id: "inactive", label: "Deshabilitado", type: "Text" },
];
const STATUS_DETAILS = {
  active: { label: "Activo", theme: "Success" },
  blocked: { label: "Suspendido", theme: "Danger" },
  inactive: { label: "Deshabilitado", theme: "Disabled" },
};
const NUMBER_FORMATTER = new Intl.NumberFormat("es-VE");

function Metric({ icon, iconType, label, value }) {
  return (
    <article className="flex w-[235px] min-w-[120px] shrink-0 items-center gap-[12px] pr-[16px]">
      <IconContainer size="L" type={iconType} icon={icon} />
      <div className="flex min-w-0 flex-col items-start justify-center gap-[2px]">
        <h2 className="text-heading-8 m-0 whitespace-nowrap text-[var(--color-text-100)]">{label}</h2>
        <strong className="text-heading-4 text-[var(--color-text-200)]">
          {value === null || value === undefined ? "—" : NUMBER_FORMATTER.format(value)}
        </strong>
      </div>
    </article>
  );
}

function HeaderLabel({ children, filter = false }) {
  const Icon = filter ? Filter : ArrowSwapVertical;
  return (
    <span className="flex items-center gap-[8px] whitespace-nowrap">
      {children}
      <Icon size="16" variant="Linear" color="currentColor" aria-hidden="true" />
    </span>
  );
}

function AdminUsersPage({ empty = false }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const currentUser = getUserDisplay(user);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth >= WEB_BREAKPOINT_PX,
  );
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(() => empty
    ? { total: 0, active: 0, suspended: 0, disabled: 0 }
    : null);
  const [roles, setRoles] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cursorHistory, setCursorHistory] = useState([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState(() => new Set());
  const [loading, setLoading] = useState(!empty);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [creationMessage, setCreationMessage] = useState("");
  const [statusFeedback, setStatusFeedback] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  const navigationItems = useMemo(
    () => createUserSideNavigationItems([], "admin"),
    [],
  );
  const roleItems = useMemo(() => [
    { id: "all", label: "Filtrar por rol", type: "Text" },
    ...roles.map((role) => ({ id: role.code, label: role.name, type: "Text" })),
  ], [roles]);
  const hasFilters = Boolean(query || roleFilter !== "all" || statusFilter !== "all");
  const selectedCount = users.reduce(
    (count, listedUser) => count + (selectedUserIds.has(String(listedUser.id)) ? 1 : 0),
    0,
  );
  const allSelected = users.length > 0 && selectedCount === users.length;
  const headerChecked = allSelected ? "Yes" : selectedCount ? "Indeterminate" : "No";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
      setCursorHistory([null]);
      setPageIndex(0);
      setSelectedUserIds(new Set());
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (empty) return undefined;

    const controller = new AbortController();
    api.admin.listRoles({ signal: controller.signal })
      .then((payload) => setRoles(payload?.roles || []))
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") setRoles([]);
      });
    return () => controller.abort();
  }, [empty]);

  useEffect(() => {
    if (empty) return undefined;

    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setLoading(true);
        setError("");
      }
    });
    api.admin.listUsers({
      cursor: cursorHistory[pageIndex],
      limit: 10,
      role: roleFilter === "all" ? undefined : roleFilter,
      search: debouncedQuery || undefined,
      signal: controller.signal,
      status: statusFilter === "all" ? undefined : statusFilter,
    }).then((payload) => {
      setUsers(payload?.users || []);
      setMetrics(payload?.metrics || null);
      setNextCursor(payload?.nextCursor || null);
      setSelectedUserIds(new Set());
    }).catch((requestError) => {
      if (requestError?.name !== "AbortError") {
        setError(requestError?.message || "No se pudieron cargar los usuarios.");
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [cursorHistory, debouncedQuery, empty, pageIndex, requestKey, roleFilter, statusFilter]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${WEB_BREAKPOINT_PX - 1}px)`);
    const syncSidebar = (event) => setIsSidebarExpanded(!event.matches);
    syncSidebar(mediaQuery);
    mediaQuery.addEventListener("change", syncSidebar);
    return () => mediaQuery.removeEventListener("change", syncSidebar);
  }, []);

  function clearFilters() {
    setQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
    setCursorHistory([null]);
    setPageIndex(0);
    setSelectedUserIds(new Set());
  }

  function selectRoleFilter(item) {
    setRoleFilter(item.id);
    setCursorHistory([null]);
    setPageIndex(0);
    setSelectedUserIds(new Set());
  }

  function selectStatusFilter(item) {
    setStatusFilter(item.id);
    setCursorHistory([null]);
    setPageIndex(0);
    setSelectedUserIds(new Set());
  }

  function toggleAll() {
    setSelectedUserIds((current) => {
      const next = new Set(current);
      users.forEach((listedUser) => {
        if (allSelected) next.delete(String(listedUser.id));
        else next.add(String(listedUser.id));
      });
      return next;
    });
  }

  function toggleUser(userId) {
    setSelectedUserIds((current) => {
      const next = new Set(current);
      const id = String(userId);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function goNext() {
    if (!nextCursor) return;
    setCursorHistory((current) => [...current.slice(0, pageIndex + 1), nextCursor]);
    setPageIndex((current) => current + 1);
  }

  async function createUser(payload) {
    const response = await api.admin.createUser(payload);
    setCreationMessage(response?.message || "Usuario creado correctamente.");
    setIsCreateUserOpen(false);
    setCursorHistory([null]);
    setPageIndex(0);
    setRequestKey((key) => key + 1);
  }

  async function changeUserStatus(listedUser, status) {
    setUpdatingUserId(String(listedUser.id));
    setStatusFeedback(null);
    try {
      const response = await api.admin.updateUserStatus({ status, userId: listedUser.id });
      const updatedUser = response?.user || { ...listedUser, status };
      setUsers((current) => {
        if (statusFilter !== "all" && statusFilter !== status) {
          return current.filter((item) => String(item.id) !== String(listedUser.id));
        }
        return current.map((item) => (
          String(item.id) === String(listedUser.id) ? updatedUser : item
        ));
      });
      setSelectedUserIds((current) => {
        const next = new Set(current);
        next.delete(String(listedUser.id));
        return next;
      });
      setMetrics((current) => {
        if (!current || listedUser.status === status) return current;
        const metricByStatus = { active: "active", blocked: "suspended", inactive: "disabled" };
        return {
          ...current,
          [metricByStatus[listedUser.status]]: Math.max(0, current[metricByStatus[listedUser.status]] - 1),
          [metricByStatus[status]]: current[metricByStatus[status]] + 1,
        };
      });
      setStatusFeedback({
        tone: "success",
        title: status === "blocked"
          ? "Usuario suspendido"
          : status === "inactive"
            ? "Usuario deshabilitado"
            : listedUser.status === "blocked"
              ? "Usuario reactivado"
              : "Usuario habilitado",
        message: status === "active"
          ? listedUser.status === "blocked"
            ? `${listedUser.name} recuperó el acceso al sistema.`
            : `${listedUser.name} fue habilitado y recuperó el acceso al sistema.`
          : response?.message || `El estado de ${listedUser.name} fue actualizado.`,
      });
    } catch (requestError) {
      setStatusFeedback({
        tone: "danger",
        title: "No se pudo actualizar el usuario",
        message: requestError?.message || "No se pudo actualizar el estado del usuario.",
      });
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-[var(--color-neutral-bg)] transition-colors duration-200">
      <div className="flex h-full min-h-0 w-full items-stretch">
        <SideNavigation
          activeItemId="users"
          expanded={isSidebarExpanded}
          items={navigationItems}
          newOpportunityLabel="Nuevo proyecto"
          userName={currentUser.name}
          userEmail={currentUser.email}
          userAvatarSrc={currentUser.profilePhotoUrl}
          onExpandedChange={(expanded) => {
            if (window.innerWidth >= WEB_BREAKPOINT_PX) setIsSidebarExpanded(expanded);
          }}
          onItemSelect={(item) => item?.to && navigate(item.to)}
          onNewOpportunityClick={() => navigate("/dashboard-arquitecto/nuevo-proyecto")}
          onLogoutClick={() => { logout(); navigate("/"); }}
          className="h-screen shrink-0 self-stretch"
        />

        <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <NavigationBar
            utilityActionActive={isNotificationsOpen}
            onUtilityActionClick={() => setIsNotificationsOpen((open) => !open)}
          />

          <section className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col px-[16px] pb-[48px] sm:px-[24px] lg:px-[48px]" aria-labelledby="admin-users-title">
            <div className="flex flex-wrap items-center justify-between gap-[16px] pb-[24px]">
              <h1 id="admin-users-title" className="text-heading-3 m-0 text-[var(--color-text-50)] max-sm:text-[40px] max-sm:leading-[48px]">
                Gestión de usuarios
              </h1>
              <Button theme="Primary" type="Solid" size="M" fitContent showLeftIcon iconLeft={<Add size="20" color="currentColor" />} showRightIcon={false} onClick={() => { setCreationMessage(""); setIsCreateUserOpen(true); }}>
                Nuevo
              </Button>
            </div>

            {creationMessage ? <p className="mb-[16px] text-body-3 text-[var(--color-success-200)]" role="status">{creationMessage}</p> : null}
            {loading && !metrics ? (
              <Loader preset="adminUserMetrics" label="Cargando métricas de usuarios" />
            ) : (
              <div className="flex w-full flex-wrap content-center items-center gap-y-[16px] border-y border-[var(--color-neutral-200)] py-[24px]">
                <Metric label="Usuarios totales" value={metrics?.total} iconType="Accent" icon={<Profile2User size="24" color="currentColor" />} />
                <Metric label="Usuarios activos" value={metrics?.active} iconType="Success" icon={<UserTick size="24" color="currentColor" />} />
                <Metric label="Usuarios suspendidos" value={metrics?.suspended} iconType="Danger" icon={<UserMinus size="24" color="currentColor" />} />
                <Metric label="Usuarios Deshabilitados" value={metrics?.disabled} iconType="Disabled" icon={<UserRemove size="24" color="currentColor" />} />
              </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col gap-[16px] pt-[24px]">
              <div className="flex flex-col justify-between gap-[12px] min-[900px]:flex-row">
                <Input type="Default input" size="M" value={query} placeholder="Buscar..." showLabel={false} showHint={false} showLeftIcon showRightIcon={false} leftIcon={<SearchNormal1 size="20" color="currentColor" />} className="w-full min-[900px]:max-w-[320px]" aria-label="Buscar usuarios" onChange={(event) => setQuery(event.target.value)} />
                <div className="grid w-full grid-cols-1 gap-[8px] min-[560px]:grid-cols-3 min-[900px]:w-auto">
                  <DropdownMenu type="Text" label="Filtrar por rol" items={roleItems} selectedItemId={roleFilter} onItemSelect={selectRoleFilter} className="w-full min-[900px]:w-[180px]" aria-label="Filtrar usuarios por rol" />
                  <DropdownMenu type="Text" label="Filtrar por status" items={STATUS_FILTER_ITEMS} selectedItemId={statusFilter} onItemSelect={selectStatusFilter} className="w-full min-[900px]:w-[180px]" aria-label="Filtrar usuarios por status" />
                  <Button theme="Primary" type="Solid" size="S" fitContent showLeftIcon iconLeft={<FilterRemove size="20" color="currentColor" />} showRightIcon={false} disabled={!hasFilters} className="w-full" onClick={clearFilters}>Quitar filtros</Button>
                </div>
              </div>

              {loading ? (
                <Loader preset="adminUserTable" label="Cargando usuarios" />
              ) : error ? (
                <div className="rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)]">
                  <EmptyState
                    title="No se pudieron cargar los usuarios"
                    description={error}
                    size="S"
                    showFeaturedIcon={false}
                    showActions
                    showSecondaryAction={false}
                    primaryActionLabel="Reintentar"
                    onPrimaryAction={() => setRequestKey((key) => key + 1)}
                  />
                </div>
              ) : users.length ? (
                <>
                  <div className="w-full overflow-hidden rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)]">
                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-[1092px] table-fixed border-collapse text-left">
                      <colgroup><col className="w-[48px]" /><col className="w-[130px]" /><col className="w-[190px]" /><col className="w-[250px]" /><col className="w-[160px]" /><col className="w-[140px]" /><col className="w-[174px]" /></colgroup>
                      <thead className="bg-[var(--color-neutral-200)] text-[var(--color-text-300)]">
                        <tr className="h-[49px] text-body-4">
                          <th className="p-[16px]"><Checkbox size="S" checked={headerChecked} interactive aria-label="Seleccionar todos los usuarios visibles" onCheckedChange={toggleAll} /></th>
                          <th className="px-[24px] py-[16px]"><HeaderLabel filter>Rol</HeaderLabel></th>
                          <th className="px-[24px] py-[16px]"><HeaderLabel>Nombre</HeaderLabel></th>
                          <th className="px-[24px] py-[16px]">Correo</th>
                          <th className="px-[24px] py-[16px]"><HeaderLabel>Último acceso</HeaderLabel></th>
                          <th className="px-[24px] py-[16px]"><HeaderLabel filter>Status</HeaderLabel></th>
                          <th className="px-[24px] py-[16px]">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((listedUser) => {
                          const status = STATUS_DETAILS[listedUser.status] || STATUS_DETAILS.inactive;
                          const avatar = getAvatarPresentation({ identity: listedUser.id, name: listedUser.name, roleCode: listedUser.role?.code });
                          const isSelected = selectedUserIds.has(String(listedUser.id));
                          return (
                            <tr
                              key={listedUser.id}
                              className={`h-[68px] transition-colors duration-150 ${
                                isSelected
                                  ? "bg-[var(--color-neutral-300)]"
                                  : "bg-[var(--color-neutral-100)]"
                              }`}
                              data-selected={isSelected ? "true" : undefined}
                            >
                              <td className="p-[16px]"><Checkbox size="S" checked={isSelected ? "Yes" : "No"} interactive aria-label={`Seleccionar ${listedUser.name}`} onCheckedChange={() => toggleUser(listedUser.id)} /></td>
                              <td className="px-[24px] py-[16px]"><Badge label={listedUser.role?.name || "Sin rol"} theme="Neutral" variation="Simple" size="S" /></td>
                              <td className="px-[24px] py-[16px]"><div className="flex min-w-0 items-center gap-[8px]"><Avatar size="S" name={listedUser.name} {...avatar} /><span className="text-body-4 truncate text-[var(--color-text-300)]">{listedUser.name}</span></div></td>
                              <td className="text-heading-8 truncate px-[24px] py-[16px] text-[var(--color-text-300)]">{listedUser.email}</td>
                              <td className="text-heading-8 px-[24px] py-[16px] text-[var(--color-text-300)]">{formatRelativeTime(listedUser.lastLoginAt, undefined, "Sin acceso")}</td>
                              <td className="px-[24px] py-[16px]"><Badge label={status.label} theme={status.theme} variation="Simple" size="S" /></td>
                              <td className="px-[24px] py-[16px]"><div className="flex items-center gap-[8px]">
                                {[
                                  { icon: <Eye size="20" color="currentColor" />, label: "Ver" },
                                  { icon: <Edit2 size="20" color="currentColor" />, label: "Editar" },
                                ].map((action) => <Tooltip key={action.label} text={`${action.label}: disponible en una próxima sección`} tipPosition="Top center" portal><span><Button theme="Primary" type="Ghost" size="S" showText={false} showLeftIcon iconLeft={action.icon} showRightIcon={false} disabled aria-label={`${action.label} ${listedUser.name}`} /></span></Tooltip>)}
                                <AdminUserActionsMenu
                                  user={listedUser}
                                  disabled={
                                    updatingUserId === String(listedUser.id)
                                    || String(user?.id) === String(listedUser.id)
                                  }
                                  onStatusChange={(selectedUser, status) => {
                                    setStatusFeedback(null);
                                    setPendingStatusChange({ user: selectedUser, status });
                                  }}
                                />
                              </div></td>
                            </tr>
                          );
                        })}
                      </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="flex w-full flex-col items-start justify-between gap-[12px] min-[560px]:flex-row min-[560px]:items-center">
                    <span className="text-heading-8 text-[var(--color-text-300)]">{selectedCount} de {users.length} seleccionados</span>
                    <div className="flex items-center gap-[8px]">
                      <Button theme="Primary" type="Outline" size="M" fitContent showLeftIcon={false} showRightIcon={false} disabled={pageIndex === 0} className="disabled:!border-[var(--color-neutral-400)] disabled:!text-[var(--color-neutral-400)]" onClick={() => setPageIndex((index) => Math.max(index - 1, 0))}>Anterior</Button>
                      <Button theme="Primary" type="Solid" size="M" fitContent showLeftIcon={false} showRightIcon={false} disabled={!nextCursor} onClick={goNext}>Siguiente pág.</Button>
                    </div>
                  </div>
                </>
              ) : hasFilters ? (
                <EmptyState
                  title="No hay coincidencias"
                  description="Ajusta o elimina los filtros para ver otros usuarios."
                  size="S"
                  showFeaturedIcon={false}
                  showActions
                  showSecondaryAction={false}
                  primaryActionLabel="Quitar filtros"
                  onPrimaryAction={clearFilters}
                  className="min-h-[280px] flex-1"
                />
              ) : (
                <EmptyState
                  title="No hay usuarios registrados"
                  description="Los usuarios aparecerán aquí cuando estén disponibles."
                  size="M"
                  showFeaturedIcon
                  showActions
                  showSecondaryAction
                  secondaryActionLabel="Añadir"
                  primaryActionLabel="Actualizar"
                  onSecondaryAction={() => setIsCreateUserOpen(true)}
                  onPrimaryAction={() => {
                    if (empty) navigate("/usuarios");
                    else setRequestKey((key) => key + 1);
                  }}
                  className="min-h-[320px] flex-1"
                />
              )}
            </div>
          </section>

          <NotificationsDrawer open={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} recentActivity={[]} />
          {isCreateUserOpen ? <CreateAdminUserModal open roles={roles} onClose={() => setIsCreateUserOpen(false)} onCreate={createUser} /> : null}
          <AdminUserStatusModal
            change={pendingStatusChange}
            onCancel={() => setPendingStatusChange(null)}
            onConfirm={() => {
              const change = pendingStatusChange;
              setPendingStatusChange(null);
              if (change) changeUserStatus(change.user, change.status);
            }}
          />
          <AlertToast
            trigger={statusFeedback}
            title={statusFeedback?.title || "Estado del usuario actualizado"}
            description={statusFeedback?.message || ""}
            theme={statusFeedback?.tone === "danger" ? "Danger" : "Success"}
            aria-label={statusFeedback?.tone === "danger" ? "Error al actualizar el usuario" : "Usuario actualizado correctamente"}
            onDismiss={() => setStatusFeedback(null)}
          />
        </div>
      </div>
    </main>
  );
}

export default AdminUsersPage;
