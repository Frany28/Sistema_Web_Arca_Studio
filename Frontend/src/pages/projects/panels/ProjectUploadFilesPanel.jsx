import { CloudPlus, InfoCircle } from "iconsax-react";

import FileUploadSection from "../../../components/ui/FileUploadSection/FileUploadSection.jsx";

function UploadInfoIcon({ className }) {
  return (
    <InfoCircle
      size={14}
      variant="Linear"
      color="currentColor"
      className={className}
      aria-hidden="true"
    />
  );
}

function UploadCloudIcon({ className }) {
  return (
    <CloudPlus
      size={20}
      variant="Linear"
      color="currentColor"
      className={className}
      aria-hidden="true"
    />
  );
}

function UploadStatusNotification() {
  return (
    <aside
      className="pointer-events-none fixed right-[24px] top-[18px] z-40 w-[395px] max-w-[calc(100vw-48px)] p-[24px]"
      aria-label="Estado de subida de archivos"
    >
      <div className="flex w-full items-start gap-[16px] rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px] shadow-[0px_0px_2.5px_rgba(0,0,0,0.1)]">
        <span className="inline-flex size-[40px] shrink-0 items-center justify-center rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] text-[var(--color-text-300)] shadow-[var(--shadow-e1)]">
          <UploadCloudIcon className="size-5" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-[4px] tracking-[-0.5px]">
          <div className="flex w-full items-end gap-[4px]">
            <p className="shrink-0 text-[14px] font-medium leading-[17px] text-[var(--color-text-300)]">
              Tus archivos se est&aacute;n subiendo
            </p>
            <p className="min-w-0 flex-1 text-[10px] font-normal leading-[12px] text-[var(--color-text-100)]">
              Hace 2 min
            </p>
          </div>

          <p className="text-[14px] font-normal leading-[17px] text-[var(--color-text-200)]">
            Nuestro equipo proceder&aacute; a verificar la informaci&oacute;n
            para garantizar su seguridad; en breve estar&aacute; disponible para
            su visualizaci&oacute;n.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default function ProjectUploadFilesPanel() {
  return (
    <section
      className="relative flex w-full items-start justify-between gap-[48px] max-lg:flex-col"
      aria-label="Subir archivos"
    >
      <div className="flex max-w-[360px] flex-col gap-[2px] pt-[2px] tracking-[-0.5px]">
        <h2 className="text-[14px] font-medium leading-[17px] text-[var(--color-text-300)]">
          Subir im&aacute;genes o documentos
        </h2>
        <p className="flex items-center gap-[4px] text-[12px] font-normal leading-[14px] text-[var(--color-text-100)]">
          <UploadInfoIcon className="size-[14px] shrink-0" />
          <span>Todos los archivos ser&aacute;n verificados por nuestro equipo.</span>
        </p>
      </div>

      <div className="w-[364px] max-w-full shrink-0">
        <FileUploadSection
          className="w-full"
          title="Subir archivos"
          chooseFileLabel="Elige un archivo"
          separatorLabel="O"
          dropLabel="Arrastra y suelta"
          formatsLabel="Formatos JPEG, PNG, PDF y MP4, hasta 50 MB."
          viewportHeight={346}
          showUploadedFiles
        />
      </div>

      <UploadStatusNotification />
    </section>
  );
}
