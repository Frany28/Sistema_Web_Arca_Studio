import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ScrollBar from "../../../components/ui/ScrollBar.jsx";
import ProjectDocumentCard from "../components/ProjectDocumentCard.jsx";
import ProjectDocumentListCard from "../components/ProjectDocumentListCard.jsx";
import ProjectDocumentPreview from "../components/ProjectDocumentPreview.jsx";
import ProjectDocumentsToolbar from "../components/ProjectDocumentsToolbar.jsx";
import { PROJECT_DETAIL_DATA } from "../projectDetailsData.js";

export default function ProjectDocumentsPanel({
  documents = PROJECT_DETAIL_DATA.documents,
}) {
  const listViewportRef = useRef(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(documents[0]?.id);
  const [scrollState, setScrollState] = useState({
    length: 1,
    position: 0,
    height: 480,
  });

  const selectedDocument = useMemo(() => {
    return (
      documents.find((document) => document.id === selectedDocumentId) ??
      documents[0]
    );
  }, [documents, selectedDocumentId]);

  const syncScrollState = useCallback(() => {
    const element = listViewportRef.current;

    if (!element) return;

    const maxScrollTop = Math.max(
      element.scrollHeight - element.clientHeight,
      0,
    );
    const nextLength =
      element.scrollHeight > 0
        ? Math.min(element.clientHeight / element.scrollHeight, 1)
        : 1;
    const nextPosition =
      maxScrollTop > 0 ? element.scrollTop / maxScrollTop : 0;

    setScrollState({
      length: nextLength,
      position: nextPosition,
      height: element.clientHeight,
    });
  }, []);

  const handleScrollBarPositionChange = useCallback((nextPosition) => {
    const element = listViewportRef.current;

    if (!element) return;

    const maxScrollTop = Math.max(
      element.scrollHeight - element.clientHeight,
      0,
    );

    element.scrollTop = maxScrollTop * nextPosition;
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(syncScrollState);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [documents, syncScrollState]);

  useEffect(() => {
    if (!listViewportRef.current || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(syncScrollState);
    observer.observe(listViewportRef.current);

    return () => {
      observer.disconnect();
    };
  }, [syncScrollState]);

  return (
    <section className="grid w-full grid-cols-[minmax(0,1fr)_335px] gap-[20px] max-[1024px]:grid-cols-1">
      <div className="flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-3)] bg-[var(--color-neutral-100)] shadow-[var(--shadow-e1)]">
        <ProjectDocumentCard document={selectedDocument} />

        <div className="flex h-[34px] items-center gap-[12px] bg-[#333] px-[178px] text-[10px] text-[var(--color-neutral-100-uniform)] max-[720px]:px-[24px]">
          <span className="rounded-[2px] bg-[#111] px-[4px]">1</span>
          <span>/</span>
          <span>8</span>
          <span className="text-[var(--color-neutral-300)]">|</span>
          <span>-</span>
          <span className="rounded-[2px] bg-[#111] px-[4px]">100%</span>
          <span>+</span>
        </div>

        <ProjectDocumentPreview document={selectedDocument} />
      </div>

      <aside className="flex min-h-0 flex-col">
        <ProjectDocumentsToolbar />

        <div className="flex flex-col gap-[12px] py-[12px]">
          <p className="text-heading-8 text-[var(--color-text-200)]">
            Selecciona un documento para ver la previsualización
          </p>

          <div className="flex max-h-[480px] min-h-0 items-start">
            <div
              ref={listViewportRef}
              className="flex max-h-[480px] min-w-0 flex-1 flex-col gap-[12px] overflow-y-auto pr-[8px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              onScroll={syncScrollState}
            >
              {documents.map((document) => (
                <ProjectDocumentListCard
                  key={document.id}
                  document={document}
                  selected={document.id === selectedDocument?.id}
                  onClick={() => setSelectedDocumentId(document.id)}
                />
              ))}
            </div>

            <div className="flex shrink-0">
              <ScrollBar
                length={scrollState.length}
                position={scrollState.position}
                height={scrollState.height}
                interactive
                onPositionChange={handleScrollBarPositionChange}
              />
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-[12px] border-t border-[var(--color-neutral-200)] pt-[16px] text-body-3 text-[var(--color-text-200)]">
          <p>Última sincronización: hace 2 horas</p>
          <p>Todos los documentos están actualizados</p>
        </div>
      </aside>
    </section>
  );
}
