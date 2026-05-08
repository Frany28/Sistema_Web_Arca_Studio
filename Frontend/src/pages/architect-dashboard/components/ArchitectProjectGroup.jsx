import ArchitectProjectRow from "./ArchitectProjectRow.jsx";
import ArchitectStatusBadge from "./ArchitectStatusBadge.jsx";

function ArchitectProjectGroup({ group }) {
  return (
    <section className="flex flex-col">
      <div className="flex items-center gap-[8px]">
        <p className="text-body-3 text-[var(--color-text-300)]">Proyectos</p>
        <ArchitectStatusBadge className={group.badgeClassName}>
          {group.status}
        </ArchitectStatusBadge>
      </div>

      <div className="flex flex-col">
        {group.projects.map((project) => (
          <ArchitectProjectRow key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

export default ArchitectProjectGroup;
