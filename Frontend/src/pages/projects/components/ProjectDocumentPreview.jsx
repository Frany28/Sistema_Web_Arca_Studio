import { useEffect, useMemo, useState } from "react";

import EmptyState from "../../../components/ui/EmptyState/EmptyState.jsx";
import Loader from "../../../components/ui/Loader/Loader.jsx";
import { getFileDisplayName } from "../../../utils/fileDisplayName.js";

const MIN_ZOOM = 75;
const MAX_ZOOM = 200;
const ZOOM_STEP = 25;

function getPdfPageCount(buffer) {
  const source = new TextDecoder("latin1").decode(buffer);
  const matches = source.match(/\/Type\s*\/Page\b/g);
  return Math.max(matches?.length || 1, 1);
}

function ViewerButton({ children, disabled, label, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      className="flex size-[22px] items-center justify-center rounded-[var(--radius-1)] text-[12px] text-[var(--color-neutral-100-uniform)] transition-colors hover:bg-black/25 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export default function ProjectDocumentPreview({ document }) {
  const source = document?.fileUrl || "";
  const isPdf = String(document?.fileType || "").toUpperCase() === "PDF";
  const [loadState, setLoadState] = useState({
    pageCount: 1,
    source,
    status: source && isPdf ? "loading" : "unsupported",
  });
  const [viewState, setViewState] = useState({ page: 1, source, zoom: 100 });
  const [retryKey, setRetryKey] = useState(0);
  const status = loadState.source === source
    ? loadState.status
    : source && isPdf
      ? "loading"
      : "unsupported";
  const pageCount = loadState.source === source ? loadState.pageCount : 1;
  const page = viewState.source === source ? viewState.page : 1;
  const zoom = viewState.source === source ? viewState.zoom : 100;

  useEffect(() => {
    if (!source || !isPdf) return undefined;

    const controller = new AbortController();

    fetch(source, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("DOCUMENT_LOAD_FAILED");
        return response.arrayBuffer();
      })
      .then((buffer) => {
        setLoadState({
          pageCount: getPdfPageCount(buffer),
          source,
          status: "loaded",
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setLoadState({ pageCount: 1, source, status: "error" });
        }
      });

    return () => controller.abort();
  }, [isPdf, retryKey, source]);

  const viewerUrl = useMemo(() => {
    if (!source) return "";
    return `${source}#page=${page}&zoom=${zoom}&toolbar=0&navpanes=0&view=FitH`;
  }, [page, source, zoom]);

  const updatePage = (nextPage) => {
    const normalizedPage = Math.min(Math.max(Number(nextPage) || 1, 1), pageCount);
    setViewState({ page: normalizedPage, source, zoom });
  };
  const updateZoom = (nextZoom) => {
    const normalizedZoom = Math.min(Math.max(nextZoom, MIN_ZOOM), MAX_ZOOM);
    setViewState({ page, source, zoom: normalizedZoom });
  };

  if (status === "loading") {
    return <Loader preset="documentPreview" label="Cargando documento" />;
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[554px] items-center justify-center rounded-b-[var(--radius-3)] bg-[var(--color-primary-300)] px-[24px]">
        <EmptyState
          title="No se pudo cargar el documento"
          description="Comprueba tu conexión e inténtalo nuevamente."
          size="S"
          showFeaturedIcon
          showActions
          showSecondaryAction={false}
          primaryActionLabel="Reintentar"
          onPrimaryAction={() => {
            setLoadState({ pageCount: 1, source, status: "loading" });
            setRetryKey((current) => current + 1);
          }}
        />
      </div>
    );
  }

  if (status === "unsupported") {
    return (
      <div className="flex min-h-[554px] items-center justify-center rounded-b-[var(--radius-3)] bg-[var(--color-primary-300)] px-[24px]">
        <EmptyState
          title="Vista previa no disponible"
          description="Este formato no puede visualizarse dentro del navegador."
          size="S"
          showFeaturedIcon
          showActions={false}
        />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[554px] min-w-0 flex-1 flex-col overflow-hidden rounded-b-[var(--radius-3)] bg-[var(--color-primary-300)]"
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="flex h-[34px] shrink-0 items-center justify-center gap-[8px] bg-[#333] px-[16px] text-[10px] text-[var(--color-neutral-100-uniform)]">
        <input
          type="number"
          min="1"
          max={pageCount}
          value={page}
          aria-label="Página actual"
          onChange={(event) => updatePage(event.target.value)}
          className="h-[18px] w-[30px] rounded-[2px] bg-[#111] px-[4px] text-center outline-none"
        />
        <span>/</span>
        <span>{pageCount}</span>
        <span className="mx-[4px] text-[var(--color-neutral-300)]">|</span>
        <ViewerButton label="Alejar" disabled={zoom <= MIN_ZOOM} onClick={() => updateZoom(zoom - ZOOM_STEP)}>−</ViewerButton>
        <span className="min-w-[42px] rounded-[2px] bg-[#111] px-[4px] py-[2px] text-center">{zoom}%</span>
        <ViewerButton label="Acercar" disabled={zoom >= MAX_ZOOM} onClick={() => updateZoom(zoom + ZOOM_STEP)}>+</ViewerButton>
      </div>

      <iframe
        key={`${source}-${page}-${zoom}`}
        src={viewerUrl}
        title={`Vista previa de ${getFileDisplayName(document?.name)}`}
        sandbox="allow-same-origin"
        tabIndex={-1}
        className="pointer-events-none min-h-[520px] w-full flex-1 select-none border-0 bg-[var(--color-primary-300)]"
      />
    </div>
  );
}
