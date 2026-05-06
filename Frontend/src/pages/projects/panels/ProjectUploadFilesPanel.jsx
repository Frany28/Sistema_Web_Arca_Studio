import FileUploadSection from "../../../components/ui/FileUploadSection/FileUploadSection.jsx";
import HintText from "../../../components/ui/HintText/HintText.jsx";
import Notification from "../../../components/ui/Notification/Notification.jsx";

function UploadStatusNotification() {
  return (
    <aside
      className="pointer-events-none fixed right-[24px] top-[18px] z-40 w-[395px] max-w-[calc(100vw-48px)] p-[24px]"
      aria-label="Estado de subida de archivos"
    >
      <Notification
        title="Tus archivos se est&aacute;n subiendo"
        timestamp="Hace 2 min"
        description={
          <>
            Nuestro equipo proceder&aacute; a verificar la informaci&oacute;n
            para garantizar su seguridad; en breve estar&aacute; disponible para
            su visualizaci&oacute;n.
          </>
        }
        leadingType="Featured icon"
        showCloseButton={false}
        showActions={false}
        className="max-w-[347px]"
      />
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
        <HintText
          state="Default"
          hintText="Todos los archivos ser&aacute;n verificados por nuestro equipo."
          className="[&>p]:text-[14px] [&>p]:font-normal [&>p]:leading-[17px] [&>p]:tracking-[-0.5px] [&>p]:text-[var(--color-text-100)]"
        />
      </div>

      <div className="w-[528px] max-w-full shrink-0">
        <FileUploadSection
          className="w-full"
          title="Subir archivos"
          chooseFileLabel="Elige un archivo"
          separatorLabel="O"
          dropLabel="Arrastra y suelta"
          formatsLabel="Formatos JPEG, PNG, PDF y MP4, hasta 50 MB."
          viewportHeight={null}
          fileListViewportHeight={292}
          showUploadedFiles
        />
      </div>

      <UploadStatusNotification />
    </section>
  );
}
