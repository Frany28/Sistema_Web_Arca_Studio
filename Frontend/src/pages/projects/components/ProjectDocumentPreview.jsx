import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import EmptyState from "../../../components/ui/EmptyState/EmptyState.jsx";
import Loader from "../../../components/ui/Loader/Loader.jsx";
import Tooltip from "../../../components/ui/Tooltip/Tooltip.jsx";
import { getFileDisplayName } from "../../../utils/fileDisplayName.js";

const MIN_ZOOM = 75;
const MAX_ZOOM = 200;
const ZOOM_STEP = 25;
const MODAL_TRANSITION_MS = 320;
const MODAL_EASING = "ease-in-out";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const ViewerButton = forwardRef(function ViewerButton(
  { children, disabled, label, onClick },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      className="flex size-[22px] items-center justify-center rounded-[var(--radius-1)] text-[12px] text-[var(--color-neutral-100-uniform)] transition-colors hover:bg-black/25 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
});

function ExpandIcon({ contracted = false }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-[14px]" aria-hidden="true">
      {contracted ? (
        <>
          <path d="M8 3V8H3M12 17V12H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.5 7.5L8 3M16.5 12.5L12 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M7 3H3V7M13 17H17V13M17 7V3H13M3 13V17H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.5 6.5L7 3M13 17L16.5 13.5M13 3L16.5 6.5M3.5 13.5L7 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-[14px]" aria-hidden="true">
      <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PdfToolbar({
  expandButtonRef,
  fullscreen = false,
  onClose,
  onExpand,
  page,
  pageCount,
  updatePage,
  updateZoom,
  zoom,
}) {
  return (
    <div className="flex h-[34px] shrink-0 items-center justify-center overflow-x-auto bg-[#333] px-[12px] text-[10px] text-[var(--color-neutral-100-uniform)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center gap-[8px]">
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
        <span className="mx-[4px] text-[var(--color-neutral-300)]">|</span>

        {fullscreen ? (
          <Tooltip text="Contraer visor" tipPosition="Bottom center" showTip portal>
            <ViewerButton label="Contraer visor" onClick={onClose}>
              <ExpandIcon contracted />
            </ViewerButton>
          </Tooltip>
        ) : (
          <Tooltip text="Ver en pantalla completa" tipPosition="Top center" showTip portal>
            <ViewerButton ref={expandButtonRef} label="Ver en pantalla completa" onClick={onExpand}>
              <ExpandIcon />
            </ViewerButton>
          </Tooltip>
        )}

        {fullscreen ? (
          <Tooltip text="Cerrar" tipPosition="Bottom center" showTip portal>
            <ViewerButton label="Cerrar visor" onClick={onClose}>
              <CloseIcon />
            </ViewerButton>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
}

function PdfPageCanvas({ documentProxy, page, title, zoom }) {
  const canvasRef = useRef(null);
  const [renderedKey, setRenderedKey] = useState("");
  const renderKey = `${page}-${zoom}`;

  useEffect(() => {
    if (!documentProxy || !canvasRef.current) return undefined;

    let cancelled = false;
    let renderTask;
    documentProxy.getPage(page).then((pdfPage) => {
      if (cancelled || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = pdfPage.getViewport({ scale: (zoom / 100) * 1.35 });
      const context = canvas.getContext("2d", { alpha: false });

      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      renderTask = pdfPage.render({
        canvas,
        canvasContext: context,
        transform: pixelRatio === 1 ? null : [pixelRatio, 0, 0, pixelRatio, 0, 0],
        viewport,
      });

      renderTask.promise
        .then(() => {
          if (!cancelled) setRenderedKey(renderKey);
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [documentProxy, page, renderKey, zoom]);

  return (
    <div className="relative shrink-0" data-pdf-page={page}>
      {renderedKey !== renderKey ? (
        <div className="pointer-events-none absolute inset-0 z-[1] skeleton-shimmer" aria-hidden="true" />
      ) : null}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${title}, página ${page}`}
        className="block max-w-none bg-white shadow-[0_2px_12px_rgba(0,0,0,0.18)]"
      />
    </div>
  );
}

const PdfPages = forwardRef(function PdfPages(
  { documentProxy, pageCount, title, zoom },
  ref,
) {
  const viewportRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollToPage(nextPage) {
      viewportRef.current
        ?.querySelector(`[data-pdf-page="${nextPage}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  }), []);

  return (
    <div
      ref={viewportRef}
      className="flex min-h-0 flex-1 flex-col items-center gap-[12px] overflow-auto bg-[#d8d8d8] p-[12px] max-[520px]:gap-[8px] max-[520px]:p-[8px]"
      onContextMenu={(event) => event.preventDefault()}
    >
      {Array.from({ length: pageCount }, (_, index) => {
        const pageNumber = index + 1;
        return (
          <PdfPageCanvas
            key={pageNumber}
            documentProxy={documentProxy}
            page={pageNumber}
            title={title}
            zoom={zoom}
          />
        );
      })}
    </div>
  );
});

function PdfViewerSurface({
  className,
  documentProxy,
  expandButtonRef,
  fullscreen = false,
  onClose,
  onExpand,
  page,
  pageCount,
  title,
  updatePage,
  updateZoom,
  zoom,
}) {
  const pagesRef = useRef(null);
  const handlePageChange = (nextPage) => {
    const normalizedPage = Math.min(Math.max(Number(nextPage) || 1, 1), pageCount);
    updatePage(normalizedPage);
    pagesRef.current?.scrollToPage(normalizedPage);
  };

  return (
    <div
      className={clsx(
        "flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--color-primary-300)]",
        className,
      )}
      onContextMenu={(event) => event.preventDefault()}
    >
      <PdfToolbar
        expandButtonRef={expandButtonRef}
        fullscreen={fullscreen}
        onClose={onClose}
        onExpand={onExpand}
        page={page}
        pageCount={pageCount}
        updatePage={handlePageChange}
        updateZoom={updateZoom}
        zoom={zoom}
      />
      <PdfPages
        ref={pagesRef}
        documentProxy={documentProxy}
        pageCount={pageCount}
        title={title}
        zoom={zoom}
      />
    </div>
  );
}

function DocumentFullscreenModal({ children, documentName, onClose, triggerRef, visible }) {
  const [shouldRender, setShouldRender] = useState(visible);
  const [isActive, setIsActive] = useState(false);
  const closeTimeoutRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    window.clearTimeout(closeTimeoutRef.current);
    window.cancelAnimationFrame(frameRef.current);

    if (visible) {
      queueMicrotask(() => {
        if (cancelled) return;
        setShouldRender(true);
        setIsActive(false);
        frameRef.current = window.requestAnimationFrame(() => {
          frameRef.current = window.requestAnimationFrame(() => setIsActive(true));
        });
      });
    } else {
      queueMicrotask(() => {
        if (cancelled) return;
        setIsActive(false);
        closeTimeoutRef.current = window.setTimeout(() => {
          setShouldRender(false);
          triggerRef.current?.focus();
        }, MODAL_TRANSITION_MS);
      });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(closeTimeoutRef.current);
      window.cancelAnimationFrame(frameRef.current);
    };
  }, [triggerRef, visible]);

  useEffect(() => {
    if (!visible) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, visible]);

  if (!shouldRender || typeof document === "undefined") return null;

  const transitionStyle = {
    transitionDuration: `${MODAL_TRANSITION_MS}ms`,
    transitionTimingFunction: MODAL_EASING,
  };

  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-[60] overflow-hidden bg-[rgba(0,0,0,0.42)] backdrop-blur-[10px] transition-opacity",
        isActive ? "opacity-100" : "opacity-0",
      )}
      style={transitionStyle}
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Vista completa de ${documentName}`}
        className={clsx(
          "flex h-dvh w-dvw p-[16px] transition-[opacity,transform] transform-gpu will-change-transform will-change-opacity max-[1024px]:p-[12px] max-[520px]:p-[8px] motion-reduce:transform-none motion-reduce:transition-none",
          isActive
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-[12px] scale-[0.985] opacity-0",
        )}
        style={transitionStyle}
      >
        <div
          className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-[var(--radius-3)] shadow-[var(--shadow-e2)]"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="pointer-events-none absolute left-[16px] top-[9px] z-[1] max-w-[28vw] truncate text-[11px] text-[var(--color-neutral-100-uniform)] max-[640px]:sr-only">
            {documentName}
          </span>
          {children}
        </div>
      </section>
    </div>,
    document.body,
  );
}

export default function ProjectDocumentPreview({ document }) {
  const source = document?.fileUrl || "";
  const isPdf = String(document?.fileType || "").toUpperCase() === "PDF";
  const [loadState, setLoadState] = useState({
    pageCount: 1,
    documentProxy: null,
    source,
    status: source && isPdf ? "loading" : "unsupported",
  });
  const [viewState, setViewState] = useState({ page: 1, source, zoom: 100 });
  const [retryKey, setRetryKey] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const expandButtonRef = useRef(null);
  const status = loadState.source === source
    ? loadState.status
    : source && isPdf
      ? "loading"
      : "unsupported";
  const pageCount = loadState.source === source ? loadState.pageCount : 1;
  const documentProxy = loadState.source === source
    ? loadState.documentProxy
    : null;
  const page = viewState.source === source ? viewState.page : 1;
  const zoom = viewState.source === source ? viewState.zoom : 100;
  const documentName = getFileDisplayName(document?.name);

  useEffect(() => {
    if (!source || !isPdf) return undefined;

    const controller = new AbortController();
    let cancelled = false;
    let loadingTask;

    fetch(source, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("DOCUMENT_LOAD_FAILED");
        return response.arrayBuffer();
      })
      .then((buffer) => {
        loadingTask = getDocument({ data: new Uint8Array(buffer) });
        return loadingTask.promise;
      })
      .then((pdfDocument) => {
        if (cancelled) return;
        setLoadState({
          documentProxy: pdfDocument,
          pageCount: pdfDocument.numPages,
          source,
          status: "loaded",
        });
      })
      .catch((error) => {
        if (!cancelled && error.name !== "AbortError") {
          setLoadState({
            documentProxy: null,
            pageCount: 1,
            source,
            status: "error",
          });
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
      loadingTask?.destroy();
    };
  }, [isPdf, retryKey, source]);

  const updatePage = (nextPage) => {
    const normalizedPage = Math.min(Math.max(Number(nextPage) || 1, 1), pageCount);
    setViewState({ page: normalizedPage, source, zoom });
  };
  const updateZoom = (nextZoom) => {
    const normalizedZoom = Math.min(Math.max(nextZoom, MIN_ZOOM), MAX_ZOOM);
    setViewState({ page, source, zoom: normalizedZoom });
  };
  const closeFullscreen = useCallback(() => setIsFullscreenOpen(false), []);

  useEffect(() => {
    const preventDocumentExport = (event) => {
      if ((event.ctrlKey || event.metaKey) && ["p", "s"].includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", preventDocumentExport, true);
    return () => window.removeEventListener("keydown", preventDocumentExport, true);
  }, []);

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
            setLoadState({
              documentProxy: null,
              pageCount: 1,
              source,
              status: "loading",
            });
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
    <>
      <PdfViewerSurface
        className="h-[554px] min-h-[554px] max-h-[554px] rounded-b-[var(--radius-3)]"
        documentProxy={documentProxy}
        expandButtonRef={expandButtonRef}
        onExpand={() => setIsFullscreenOpen(true)}
        page={page}
        pageCount={pageCount}
        title={`Vista previa de ${documentName}`}
        updatePage={updatePage}
        updateZoom={updateZoom}
        zoom={zoom}
      />

      <DocumentFullscreenModal
        documentName={documentName}
        onClose={closeFullscreen}
        triggerRef={expandButtonRef}
        visible={isFullscreenOpen}
      >
        <PdfViewerSurface
          className="size-full rounded-[var(--radius-3)]"
          documentProxy={documentProxy}
          fullscreen
          onClose={closeFullscreen}
          page={page}
          pageCount={pageCount}
          title={`Vista completa de ${documentName}`}
          updatePage={updatePage}
          updateZoom={updateZoom}
          zoom={zoom}
        />
      </DocumentFullscreenModal>
    </>
  );
}
