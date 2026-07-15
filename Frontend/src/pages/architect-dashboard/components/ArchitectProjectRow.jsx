import { useNavigate } from "react-router-dom";

import AvatarGroup from "../../../components/ui/AvatarGroup/AvatarGroup.jsx";
import Button from "../../../components/ui/Button/Button.jsx";
import Tooltip from "../../../components/ui/Tooltip/Tooltip.jsx";
import { getProjectPath } from "../../../utils/projectRoutes.js";
import ArchitectProjectProgress from "./ArchitectProjectProgress.jsx";

function ArchitectProjectRow({
  canManagePublication = false,
  onPublicationChange,
  project,
}) {
  const navigate = useNavigate();

  const handleOpenProject = () => {
    navigate(getProjectPath(project));
  };

  return (
    <article className="flex flex-col gap-[16px] border-b border-[var(--color-neutral-200)] py-[16px] lg:flex-row lg:items-center lg:gap-[24px]">
      <div className="h-[80px] w-[140px] shrink-0 overflow-hidden rounded-[var(--radius-2)]">
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        <div className="flex min-w-0 items-center gap-[8px]">
          <h2 className="min-w-0 text-heading-4 text-[var(--color-text-50)]">
            {project.title}
          </h2>
          <span className="text-body-4 rounded-[var(--radius-1)] border border-[var(--color-neutral-200)] px-[8px] py-[2px] text-[var(--color-text-200)]">
            {project.isPublic ? "Publico" : "Privado"}
          </span>
          {project.assigneeAvatars?.length ? (
            <Tooltip text={project.assigneeAvatars[0].name} tipPosition="Top center">
              <AvatarGroup size="S" items={project.assigneeAvatars} tabIndex={0} />
            </Tooltip>
          ) : null}
        </div>

        <ArchitectProjectProgress />
      </div>

      <div className="flex shrink-0 items-center gap-[8px]">
        {canManagePublication ? (
          <Button
            theme="Primary"
            type="Outline"
            size="M"
            fitContent
            showLeftIcon={false}
            showRightIcon={false}
            onClick={() => onPublicationChange?.(project)}
          >
            {project.isPublic ? "Ocultar" : "Publicar"}
          </Button>
        ) : null}
        <Button
          theme="Primary"
          type="Outline"
          size="M"
          fitContent
          showLeftIcon={false}
          showRightIcon={false}
          onClick={handleOpenProject}
        >
          Ver
        </Button>
        <Button
          theme="Primary"
          type="Solid"
          size="M"
          fitContent
          showLeftIcon={false}
          showRightIcon={false}
          disabled={!project.editable}
          onClick={handleOpenProject}
        >
          Editar
        </Button>
      </div>
    </article>
  );
}

export default ArchitectProjectRow;
