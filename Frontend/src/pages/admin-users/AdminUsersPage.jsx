import { useEffect, useMemo, useState } from "react";
import {
  Add,
  ArrowSwapVertical,
  Edit2,
  Eye,
  Filter,
  FilterRemove,
  LockCircle,
  MinusCirlce,
  Profile2User,
  SearchNormal1,
  ShieldSecurity,
  TickCircle,
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
import Modal from "../../components/ui/Modal/Modal.jsx";
import AlertToast from "../../components/ui/AlertToast/AlertToast.jsx";
import SideNavigation from "../../components/ui/SideNavigation/SideNavigation.jsx";
import { getAvatarPresentation } from "../../utils/avatarPresentation.js";
import { formatHumanDate } from "../../utils/relativeTime.js";
import { createUserSideNavigationItems } from "../../utils/sideNavigationItems.js";
import CreateAdminUserModal from "./CreateAdminUserModal.jsx";
import EditAdminUserModal from "./EditAdminUserModal.jsx";
import AdminUserActionsMenu from "./AdminUserActionsMenu.jsx";
import AdminUserDetailsDrawer from "./AdminUserDetailsDrawer.jsx";
import AdminUserStatusModal from "./AdminUserStatusModal.jsx";
import { getBulkStatusTargets } from "./adminUserStatusPolicy.js";

const WEB_BREAKPOINT_PX = 1280;
const ADMIN_USERS_PAGE_SIZE = 10;
const STATUS_FILTER_ITEMS = [
  { id: "active", label: "Activo", type: "Checkbox" },
  { id: "blocked", label: "Suspendido", type: "Checkbox" },
  { id: "inactive", label: "Deshabilitado", type: "Checkbox" },
];
const STATUS_DETAILS = {
  active: { label: "Activo", theme: "Success" },
  blocked: { label: "Suspendido", theme: "Danger" },
  inactive: { label: "Deshabilitado", theme: "Disabled" },
};
const NUMBER_FORMATTER = new Intl.NumberFormat("es-VE");
const METRIC_BY_STATUS = {
  active: "active",
  blocked: "suspended",
  inactive: "disabled",
};
const BULK_STATUS_ACTIONS = [
  { icon: MinusCirlce, label: "Suspender", status: "blocked" },
  { icon: LockCircle, label: "Deshabilitar", status: "inactive" },
  { icon: TickCircle, label: "Activar", status: "active" },
];
const BULK_FEEDBACK = {
  active: { singular: "Usuario activado", plural: "Usuarios activados", singularVerb: "activó", pluralVerb: "activaron" },
  blocked: { singular: "Usuario suspendido", plural: "Usuarios suspendidos", singularVerb: "suspendió", pluralVerb: "suspendieron" },
  inactive: { singular: "Usuario deshabilitado", plural: "Usuarios deshabilitados", singularVerb: "deshabilitó", pluralVerb: "deshabilitaron" },
};

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
  const [roleFilterIds, setRoleFilterIds] = useState([]);
  const [statusFilterIds, setStatusFilterIds] = useState([]);
  const [cursorHistory, setCursorHistory] = useState([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState(() => new Set());
  const [loading, setLoading] = useState(!empty);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const [statusFeedback, setStatusFeedback] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [detailsUserId, setDetailsUserId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [loadingEditUserId, setLoadingEditUserId] = useState(null);

  const navigationItems = useMemo(
    () => createUserSideNavigationItems([], "admin"),
    [],
  );
  const roleItems = useMemo(() => roles.map((role) => ({
    id: role.code,
    label: role.name,
    type: "Checkbox",
    checked: roleFilterIds.includes(role.code) ? "Yes" : "No",
  })), [roleFilterIds, roles]);
  const statusItems = useMemo(() => STATUS_FILTER_ITEMS.map((item) => ({
    ...item,
    checked: statusFilterIds.includes(item.id) ? "Yes" : "No",
  })), [statusFilterIds]);
  const hasFilters = Boolean(query || roleFilterIds.length || statusFilterIds.length);
  const selectedCount = users.reduce(
    (count, listedUser) => count + (selectedUserIds.has(String(listedUser.id)) ? 1 : 0),
    0,
  );
  const allSelected = users.length > 0 && selectedCount === users.length;
  const headerChecked = allSelected ? "Yes" : selectedCount ? "Indeterminate" : "No";
  const bulkTargetsByStatus = useMemo(() => Object.fromEntries(
    BULK_STATUS_ACTIONS.map((action) => [
      action.status,
      getBulkStatusTargets({
        actorUserId: user?.id,
        selectedUserIds,
        status: action.status,
        users,
      }),
    ]),
  ), [selectedUserIds, user?.id, users]);

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
      limit: ADMIN_USERS_PAGE_SIZE,
      role: roleFilterIds.length ? roleFilterIds : undefined,
      search: debouncedQuery || undefined,
      signal: controller.signal,
      status: statusFilterIds.length ? statusFilterIds : undefined,
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
  }, [cursorHistory, debouncedQuery, empty, pageIndex, requestKey, roleFilterIds, statusFilterIds]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${WEB_BREAKPOINT_PX - 1}px)`);
    const syncSidebar = (event) => setIsSidebarExpanded(!event.matches);
    syncSidebar(mediaQuery);
    mediaQuery.addEventListener("change", syncSidebar);
    return () => mediaQuery.removeEventListener("change", syncSidebar);
  }, []);

  function clearFilters() {
    setQuery("");
    setRoleFilterIds([]);
    setStatusFilterIds([]);
    setCursorHistory([null]);
    setPageIndex(0);
    setSelectedUserIds(new Set());
  }

  function changeRoleFilters(nextItems) {
    setRoleFilterIds(nextItems
      .filter((item) => item.checked === "Yes")
      .map((item) => String(item.id)));
    setCursorHistory([null]);
    setPageIndex(0);
    setSelectedUserIds(new Set());
  }

  function changeStatusFilters(nextItems) {
    setStatusFilterIds(nextItems
      .filter((item) => item.checked === "Yes")
      .map((item) => String(item.id)));
    setCursorHistory([null]);
    setPageIndex(0);
    setSelectedUserIds(new Set());
  }

  function toggleAll() {
    if (isBulkUpdating) return;
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
    if (isBulkUpdating) return;
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
    setCreatedUser(response?.user || { email: payload.email });
    setIsCreateUserOpen(false);
    setCursorHistory([null]);
    setPageIndex(0);
    setRequestKey((key) => key + 1);
  }

  async function openUserEditor(listedUser) {
    if (loadingEditUserId !== null || isBulkUpdating || updatingUserId !== null) return;

    setLoadingEditUserId(String(listedUser.id));
    setStatusFeedback(null);
    try {
      const response = await api.admin.getUserDetails({ userId: listedUser.id });
      setEditingUser(response?.user || listedUser);
    } catch (requestError) {
      setStatusFeedback({
        tone: "danger",
        title: "No se pudo abrir la edición",
        message: requestError?.message || "No se pudieron cargar los datos del usuario.",
      });
    } finally {
      setLoadingEditUserId(null);
    }
  }

  async function updateEditedUser(payload) {
    const userId = editingUser?.id;
    if (!userId) return;

    setStatusFeedback(null);
    try {
      const response = await api.admin.updateUser({ payload, userId });
      const updatedUser = response?.user;
      setEditingUser(null);
      if (updatedUser) {
        setUsers((current) => current.map((listedUser) => (
          String(listedUser.id) === String(userId)
            ? { ...listedUser, ...updatedUser }
            : listedUser
        )));
      }
      setRequestKey((key) => key + 1);
      setStatusFeedback({
        tone: "success",
        title: "Usuario actualizado correctamente",
        message: "Los datos del usuario se guardaron correctamente.",
      });
    } catch (requestError) {
      setStatusFeedback({
        tone: "danger",
        title: "No se pudo actualizar el usuario",
        message: requestError?.message || "No se pudieron guardar los cambios del usuario.",
      });
      throw requestError;
    }
  }

  async function changeUserStatus(listedUser, status) {
    setUpdatingUserId(String(listedUser.id));
    setStatusFeedback(null);
    try {
      const response = await api.admin.updateUserStatus({ status, userId: listedUser.id });
      const updatedUser = response?.user || { ...listedUser, status };
      setUsers((current) => {
        if (statusFilterIds.length && !statusFilterIds.includes(status)) {
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
        return {
          ...current,
          [METRIC_BY_STATUS[listedUser.status]]: Math.max(0, current[METRIC_BY_STATUS[listedUser.status]] - 1),
          [METRIC_BY_STATUS[status]]: current[METRIC_BY_STATUS[status]] + 1,
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
              : "Usuario activado",
        message: status === "active"
          ? listedUser.status === "blocked"
            ? `${listedUser.name} recuperó el acceso al sistema.`
            : `${listedUser.name} fue activado y recuperó el acceso al sistema.`
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

  function requestBulkStatusChange(status) {
    const targets = bulkTargetsByStatus[status] || [];
    if (!targets.length || isBulkUpdating || updatingUserId !== null) return;
    setStatusFeedback(null);
    setPendingStatusChange({ users: targets, status });
  }

  async function changeUsersStatus(targets, status) {
    setIsBulkUpdating(true);
    setStatusFeedback(null);

    try {
      const results = await Promise.allSettled(targets.map(async (listedUser) => ({
        listedUser,
        response: await api.admin.updateUserStatus({ status, userId: listedUser.id }),
      })));
      const successfulChanges = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);
      const failedResults = results.filter((result) => result.status === "rejected");
      const successfulIds = new Set(successfulChanges.map(({ listedUser }) => String(listedUser.id)));
      const updatedById = new Map(successfulChanges.map(({ listedUser, response }) => [
        String(listedUser.id),
        response?.user || { ...listedUser, status },
      ]));

      if (successfulChanges.length) {
        setUsers((current) => current
          .filter((listedUser) => !(
            successfulIds.has(String(listedUser.id))
            && statusFilterIds.length
            && !statusFilterIds.includes(status)
          ))
          .map((listedUser) => updatedById.get(String(listedUser.id)) || listedUser));
        setSelectedUserIds((current) => {
          const next = new Set(current);
          successfulIds.forEach((id) => next.delete(id));
          return next;
        });
        setMetrics((current) => successfulChanges.reduce((nextMetrics, { listedUser }) => {
          if (!nextMetrics || listedUser.status === status) return nextMetrics;
          return {
            ...nextMetrics,
            [METRIC_BY_STATUS[listedUser.status]]: Math.max(
              0,
              nextMetrics[METRIC_BY_STATUS[listedUser.status]] - 1,
            ),
            [METRIC_BY_STATUS[status]]: nextMetrics[METRIC_BY_STATUS[status]] + 1,
          };
        }, current));
      }

      const feedback = BULK_FEEDBACK[status];
      if (!failedResults.length) {
        setStatusFeedback({
          tone: "success",
          title: successfulChanges.length === 1 ? feedback.singular : feedback.plural,
          message: `Se ${successfulChanges.length === 1 ? feedback.singularVerb : feedback.pluralVerb} ${successfulChanges.length} ${successfulChanges.length === 1 ? "usuario" : "usuarios"} correctamente.`,
        });
      } else {
        setStatusFeedback({
          tone: "danger",
          title: successfulChanges.length
            ? "Algunos usuarios no se pudieron actualizar"
            : "No se pudieron actualizar los usuarios",
          message: successfulChanges.length
            ? `${successfulChanges.length} ${successfulChanges.length === 1 ? "usuario fue actualizado" : "usuarios fueron actualizados"} y ${failedResults.length} ${failedResults.length === 1 ? "no pudo actualizarse" : "no pudieron actualizarse"}.`
            : failedResults[0]?.reason?.message || "No se pudo actualizar el estado de los usuarios seleccionados.",
        });
      }
    } finally {
      setIsBulkUpdating(false);
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
              <Button theme="Primary" type="Solid" size="M" fitContent showLeftIcon iconLeft={<Add size="20" color="currentColor" />} showRightIcon={false} onClick={() => { setCreatedUser(null); setIsCreateUserOpen(true); }}>
                Nuevo
              </Button>
            </div>

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
                <div className="grid w-full grid-cols-1 items-center gap-[12px] min-[560px]:grid-cols-3 min-[900px]:w-auto min-[900px]:grid-cols-[180px_180px_129px]">
                  <DropdownMenu
                    type="Text"
                    label="Filtrar por rol"
                    items={roleItems}
                    multiple
                    interactive={roleItems.length > 0}
                    onItemsChange={changeRoleFilters}
                    className="w-full min-[900px]:w-[180px]"
                    contentClassName="max-h-[168px] max-w-full overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-color:var(--color-neutral-400)_transparent] [scrollbar-width:thin]"
                    contentPaddingClassName="px-[4px] py-[8px]"
                    rowHeightClassName="h-[35px]"
                    aria-label="Filtrar usuarios por rol"
                  />
                  <DropdownMenu
                    type="Text"
                    label="Filtrar por status"
                    items={statusItems}
                    multiple
                    onItemsChange={changeStatusFilters}
                    className="w-full min-[900px]:w-[180px]"
                    contentClassName="max-h-[168px] max-w-full overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-color:var(--color-neutral-400)_transparent] [scrollbar-width:thin]"
                    contentPaddingClassName="px-[4px] py-[8px]"
                    rowHeightClassName="h-[35px]"
                    aria-label="Filtrar usuarios por status"
                  />
                  <Button theme="Primary" type="Solid" size="M" fitContent showLeftIcon iconLeft={<FilterRemove size="20" color="currentColor" />} showRightIcon={false} disabled={!hasFilters} className="w-full" onClick={clearFilters}>Quitar filtros</Button>
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
                          <th className="p-[16px]"><Checkbox size="S" checked={headerChecked} interactive={!isBulkUpdating} aria-label="Seleccionar todos los usuarios visibles" onCheckedChange={toggleAll} /></th>
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
                          const avatar = getAvatarPresentation({
                            identity: listedUser.id,
                            name: listedUser.name,
                            roleCode: listedUser.role?.code,
                            src: listedUser.profilePhotoUrl,
                          });
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
                              <td className="p-[16px]"><Checkbox size="S" checked={isSelected ? "Yes" : "No"} interactive={!isBulkUpdating} aria-label={`Seleccionar ${listedUser.name}`} onCheckedChange={() => toggleUser(listedUser.id)} /></td>
                              <td className="px-[24px] py-[16px]"><Badge label={listedUser.role?.name || "Sin rol"} theme="Brand 1" variation="Simple" size="S" /></td>
                              <td className="px-[24px] py-[16px]"><div className="flex min-w-0 items-center gap-[8px]"><Avatar size="S" name={listedUser.name} {...avatar} /><span className="text-body-4 truncate text-[var(--color-text-300)]">{listedUser.name}</span></div></td>
                              <td className="text-heading-8 truncate px-[24px] py-[16px] text-[var(--color-text-300)]">{listedUser.email}</td>
                              <td className="text-heading-8 px-[24px] py-[16px] text-[var(--color-text-300)]">{formatHumanDate(listedUser.lastLoginAt, undefined, "Sin acceso")}</td>
                              <td className="px-[24px] py-[16px]"><Badge label={status.label} theme={status.theme} variation="Simple" size="S" /></td>
                              <td className="px-[24px] py-[16px]"><div className="flex items-center gap-[8px]">
                                <Button
                                  theme="Primary"
                                  type="Ghost"
                                  size="S"
                                  showText={false}
                                  showLeftIcon
                                  iconLeft={<Eye size="20" color="currentColor" />}
                                  showRightIcon={false}
                                  tooltip="Detalles de usuario"
                                  aria-label={`Ver detalles de ${listedUser.name}`}
                                  onClick={() => setDetailsUserId(listedUser.id)}
                                />
                                <Button
                                  theme="Primary"
                                  type="Ghost"
                                  size="S"
                                  showText={false}
                                  showLeftIcon
                                  iconLeft={<Edit2 size="20" color="currentColor" />}
                                  showRightIcon={false}
                                  disabled={
                                    isBulkUpdating
                                    || updatingUserId !== null
                                    || loadingEditUserId !== null
                                  }
                                  tooltip={loadingEditUserId === String(listedUser.id) ? "Cargando usuario..." : "Editar usuario"}
                                  aria-label={`Editar ${listedUser.name}`}
                                  onClick={() => openUserEditor(listedUser)}
                                />
                                <AdminUserActionsMenu
                                  user={listedUser}
                                  disabled={
                                    isBulkUpdating
                                    || updatingUserId === String(listedUser.id)
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
                  <div className="grid w-full grid-cols-1 items-center gap-[12px] min-[900px]:grid-cols-[1fr_auto_1fr]">
                    <span className="text-heading-8 text-[var(--color-text-300)]">{selectedCount} de {users.length} seleccionados</span>
                    <div className="flex min-h-[44px] flex-wrap items-center justify-center gap-[8px]" aria-label="Acciones para usuarios seleccionados">
                      {selectedCount ? BULK_STATUS_ACTIONS.map((action) => {
                        const ActionIcon = action.icon;
                        const targets = bulkTargetsByStatus[action.status] || [];
                        return (
                          <Button
                            key={action.status}
                            theme="Primary"
                            type="Ghost"
                            size="M"
                            fitContent
                            showLeftIcon
                            iconLeft={<ActionIcon size="20" color="currentColor" />}
                            showRightIcon={false}
                            disabled={isBulkUpdating || updatingUserId !== null || targets.length === 0}
                            onClick={() => requestBulkStatusChange(action.status)}
                          >
                            {action.label}
                          </Button>
                        );
                      }) : null}
                    </div>
                    <div className="flex items-center gap-[8px] justify-self-end">
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
          <AdminUserDetailsDrawer
            open={detailsUserId !== null}
            userId={detailsUserId}
            roles={roles}
            onClose={() => setDetailsUserId(null)}
            onUserUpdated={() => setRequestKey((key) => key + 1)}
          />
          {isCreateUserOpen ? <CreateAdminUserModal open roles={roles} onClose={() => setIsCreateUserOpen(false)} onCreate={createUser} /> : null}
          {editingUser ? (
            <EditAdminUserModal
              open
              roles={roles}
              user={editingUser}
              onClose={() => setEditingUser(null)}
              onUpdate={updateEditedUser}
            />
          ) : null}
          <Modal
            mount="viewport"
            visible={Boolean(createdUser)}
            showDialog
            alignment="Centered"
            overlayVariant="blurred"
            transitionPreset="fade-scale"
            title="Usuario creado correctamente"
            description="El usuario quedó registrado. El enlace de activación se enviará cuando se habilite este flujo."
            secondaryActionLabel="Cancelar"
            primaryActionLabel="Aceptar"
            icon={<ShieldSecurity size="20" color="currentColor" />}
            onClose={() => setCreatedUser(null)}
            onSecondaryAction={() => setCreatedUser(null)}
            onPrimaryAction={() => setCreatedUser(null)}
            className="z-[90]"
            aria-label="Usuario creado correctamente"
          />
          <AdminUserStatusModal
            change={pendingStatusChange}
            onCancel={() => setPendingStatusChange(null)}
            onConfirm={() => {
              const change = pendingStatusChange;
              setPendingStatusChange(null);
              if (change?.users) changeUsersStatus(change.users, change.status);
              else if (change) changeUserStatus(change.user, change.status);
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
