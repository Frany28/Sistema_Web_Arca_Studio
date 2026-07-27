import { useState } from "react";

import "../config/modelViewer.js";

const localModelPath = `${String(import.meta.env.BASE_URL || "/").replace(
  /\/?$/,
  "/",
)}models/3D-IHAD-MELI.glb`;

export default function LocalModelViewer() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [status, setStatus] = useState("loading");

  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] p-4 text-[var(--color-text-50)] md:p-8">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-4 md:min-h-[calc(100vh-4rem)]">
        <header>
          <h1 className="text-heading-4">Modelo 3D IHAD MELI</h1>
          <p className="text-body-2 mt-1 text-[var(--color-text-200)]">
            Visor local del archivo original de 128,31 MB.
          </p>
        </header>

        <div className="relative min-h-[32rem] flex-1 overflow-hidden rounded-[var(--radius-3)] border border-[var(--color-neutral-300)] bg-[var(--color-neutral-900)] shadow-[var(--shadow-e1)]">
          {status === "loading" && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-neutral-900)] text-[var(--color-neutral-100-uniform)]"
              role="status"
              aria-live="polite"
            >
              Cargando modelo… {loadProgress}%
            </div>
          )}

          {status === "error" && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center p-6 text-center text-[var(--color-neutral-100-uniform)]"
              role="alert"
            >
              No se pudo cargar el modelo. Comprueba que el archivo exista en
              Frontend/public/models/3D-IHAD-MELI.glb.
            </div>
          )}

          <model-viewer
            src={localModelPath}
            alt="Modelo arquitectónico 3D IHAD MELI"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            shadow-softness="0.8"
            exposure="1"
            tone-mapping="neutral"
            interaction-prompt="auto"
            loading="eager"
            reveal="auto"
            onProgress={(event) => {
              const progress = Math.round(
                (event.detail?.totalProgress || 0) * 100,
              );
              setLoadProgress(progress);
            }}
            onLoad={() => {
              setLoadProgress(100);
              setStatus("ready");
            }}
            onError={() => setStatus("error")}
            class="h-full min-h-[32rem] w-full"
            style={{
              background:
                "radial-gradient(circle at 50% 38%, #3b3b3b 0%, #232323 48%, #101010 100%)",
              display: "block",
            }}
          />
        </div>
      </section>
    </main>
  );
}
