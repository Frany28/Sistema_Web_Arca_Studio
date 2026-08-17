import { ArrowRight2, Eye, User } from "iconsax-react";

import Button from "../../../components/ui/Button/Button.jsx";
import EmptyState from "../../../components/ui/EmptyState/EmptyState.jsx";
import Input from "../../../components/ui/Input/Input.jsx";
import Label from "../../../components/ui/Label/Label.jsx";
import Loader from "../../../components/ui/Loader/Loader.jsx";
import Tag from "../../../components/ui/Tag/Tag.jsx";
import { getProjectTypeDisplay } from "../../../utils/projectTypeDisplay.js";

const activityTimeFormatter = new Intl.DateTimeFormat("es-VE", {
  hour: "2-digit",
  hour12: true,
  minute: "2-digit",
});

function formatActivityTime(value) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "--:--"
    : activityTimeFormatter.format(date).toUpperCase();
}

function ActivityRow({ activity, isLast, onSelect }) {
  return (
    <div
      className={`flex min-h-9 w-full items-center gap-[12px] ${
        isLast
          ? ""
          : "border-b border-[var(--color-neutral-200)] pb-[16px]"
      }`}
    >
      <span className="text-body-4 inline-flex h-9 w-[73px] shrink-0 items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-neutral-600)] text-[var(--color-text-300)]">
        {formatActivityTime(activity.createdAt)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <span className="text-body-3 truncate text-[var(--color-text-300)]">
          {activity.title}
        </span>
        <span className="text-body-4 truncate text-[var(--color-text-100)]">
          Por {activity.userName}
        </span>
      </span>
      <Tag
        label={activity.projectName}
        size="S"
        avatar={false}
        checkbox={false}
        closeIcon={false}
        count={false}
        className="max-w-[132px]"
      />
      <Button
        theme="Primary"
        type="Ghost"
        size="S"
        showText={false}
        showLeftIcon
        showRightIcon={false}
        iconLeft={<ArrowRight2 size="20" variant="Linear" color="currentColor" />}
        aria-label={`Ver actividad de ${activity.projectName}`}
        onClick={() => onSelect?.(activity)}
      />
    </div>
  );
}

function RequestRow({ isLast, request }) {
  return (
    <div
      className={`flex min-h-9 w-full items-center gap-[12px] ${
        isLast
          ? ""
          : "border-b border-[var(--color-neutral-200)] pb-[16px]"
      }`}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <span className="text-body-3 truncate text-[var(--color-text-300)]">
          {request.projectName}
        </span>
        <span className="text-body-4 truncate text-[var(--color-text-100)]">
          {getProjectTypeDisplay(request.projectType)}
        </span>
      </span>
      <Input
        type="Default input"
        size="S"
        value=""
        placeholder="Asignar responsables..."
        showLabel={false}
        showHint={false}
        showLeftIcon
        showRightIcon={false}
        leftIcon={<User size="20" variant="Linear" color="currentColor" />}
        className="w-full max-w-[252px]"
        aria-label={`Responsables de ${request.projectName}`}
        readOnly
      />
      <Button
        theme="Primary"
        type="Ghost"
        size="S"
        showText={false}
        showLeftIcon
        showRightIcon={false}
        iconLeft={<Eye size="20" variant="Linear" color="currentColor" />}
        aria-label={`Ver solicitud ${request.projectName} (próximamente)`}
        aria-disabled="true"
      />
    </div>
  );
}

function AdminDashboardOverview({
  error,
  loading,
  newRequests = [],
  onActivitySelect,
  onRetry,
  recentActivity = [],
}) {
  if (loading) {
    return (
      <section className="mx-auto w-full max-w-[1200px] px-[16px] pb-[24px] sm:px-[24px] lg:px-[48px]">
        <Loader preset="adminOverview" label="Cargando actividad y solicitudes" />
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-[24px] px-[16px] pb-[24px] sm:px-[24px] lg:grid-cols-2 lg:px-[48px]">
      <div className="flex min-w-0 flex-col gap-[16px] overflow-hidden rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-10)] p-[16px]">
        <Label label="Actividad reciente" required={false} information={false} />
        {error ? (
          <EmptyState
            title="No se pudo cargar la actividad"
            description={error}
            size="S"
            showFeaturedIcon={false}
            showActions
            primaryActionLabel="Reintentar"
            onPrimaryAction={onRetry}
          />
        ) : recentActivity.length ? (
          <div className="flex w-full flex-col gap-[16px]">
            {recentActivity.map((activity, index) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                isLast={index === recentActivity.length - 1}
                onSelect={onActivitySelect}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay actividad reciente"
            description="Los cambios de estado y archivos nuevos aparecerán aquí."
            size="S"
            showFeaturedIcon={false}
            showActions={false}
          />
        )}
        <div className="flex w-full justify-end">
          <Button
            theme="Primary"
            type="Ghost"
            size="S"
            fitContent
            showLeftIcon={false}
            showRightIcon={false}
            aria-disabled="true"
          >
            Ver todos
          </Button>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-[16px] overflow-hidden py-[16px]">
        <Label label="Nuevas solicitudes" required={false} information={false} />
        {error ? (
          <EmptyState
            title="No se pudieron cargar las solicitudes"
            description={error}
            size="S"
            showFeaturedIcon={false}
            showActions={false}
          />
        ) : newRequests.length ? (
          <div className="flex w-full flex-col gap-[16px]">
            {newRequests.map((request, index) => (
              <RequestRow
                key={request.id}
                request={request}
                isLast={index === newRequests.length - 1}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay solicitudes nuevas"
            description="Las solicitudes pendientes aparecerán aquí."
            size="S"
            showFeaturedIcon={false}
            showActions={false}
          />
        )}
      </div>
    </section>
  );
}

export default AdminDashboardOverview;
