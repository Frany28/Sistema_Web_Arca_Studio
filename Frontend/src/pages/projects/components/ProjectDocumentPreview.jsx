export default function ProjectDocumentPreview({ document }) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden rounded-b-[var(--radius-3)] bg-[var(--color-primary-300)]">
      <aside className="w-[50px] shrink-0 bg-[var(--color-primary-300)]" />

      <div className="flex min-w-0 flex-1 justify-center overflow-auto bg-[var(--color-primary-300)] px-[36px] py-[36px]">
        <div className="min-h-[520px] w-full max-w-[488px] bg-[var(--color-neutral-100-uniform)] px-[56px] py-[64px] text-[#111] shadow-[0_1px_3px_rgba(0,0,0,0.18)]">
          <h2 className="mb-[28px] text-[14px] font-bold leading-[20px]">
            Propuesta de Sistema Web para la Gestión y Visualización de
            Proyectos Arquitectónicos
          </h2>

          <h3 className="mb-[16px] text-[14px] font-bold leading-[20px]">
            1. Descripción general
          </h3>

          <p className="mb-[14px] text-[11px] leading-[17px]">
            El sistema propuesto es una plataforma web integral diseñada para
            gestionar, visualizar y controlar proyectos arquitectónicos,
            combinando la administración técnica de documentos con una
            experiencia visual orientada al cliente.
          </p>

          <p className="mb-[10px] text-[11px] leading-[17px]">
            A diferencia de soluciones tradicionales centradas únicamente en
            almacenamiento de archivos, esta plataforma transforma la gestión de
            proyectos en un entorno estratégico que permite:
          </p>

          <ul className="mb-[14px] list-disc space-y-[6px] pl-[18px] text-[11px] leading-[16px]">
            <li>Control total de versiones de documentos técnicos</li>
            <li>Visualización del avance de obra</li>
            <li>Presentación profesional de proyectos para clientes</li>
            <li>Trazabilidad completa de acciones</li>
            <li>Centralización de la información en un solo sistema</li>
          </ul>

          <p className="text-[11px] leading-[17px]">
            Documento seleccionado: {document?.name}
          </p>
        </div>
      </div>

      <aside className="w-[50px] shrink-0 bg-[var(--color-primary-300)]" />
    </div>
  );
}
