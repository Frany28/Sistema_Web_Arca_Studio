import {
  ARCHITECTURAL_PROFILES,
} from "../../../utils/architecturalRendering.js";

export default function ArchitecturalSettingsPanel({
  error,
  isSaving,
  onChange,
  onSave,
  settings,
  materials = [],
}) {
  if (!settings?.canEdit) return null;
  const fieldClass =
    "h-9 rounded-[var(--radius-1)] border border-white/15 bg-black/45 px-[8px] text-[12px] text-white outline-none focus:border-[var(--color-primary-300)]";

  return (
    <div className="absolute bottom-[64px] left-[12px] z-20 flex w-[260px] flex-col gap-[8px] rounded-[var(--radius-2)] border border-white/15 bg-black/75 p-[12px] text-white shadow-[var(--shadow-e2)] backdrop-blur-md">
      <p className="text-heading-8">Iluminación arquitectónica</p>
      <label className="flex flex-col gap-[4px] text-[11px] text-white/75">
        Perfil
        <select
          className={fieldClass}
          value={settings.profile}
          onChange={(event) => onChange({ profile: event.target.value })}
        >
          {Object.entries(ARCHITECTURAL_PROFILES).map(([id, profile]) => (
            <option key={id} value={id}>{profile.label}</option>
          ))}
        </select>
      </label>
      {materials.length ? (
        <details className="max-h-[180px] overflow-auto rounded-[var(--radius-1)] border border-white/10 p-[6px]">
          <summary className="cursor-pointer text-[11px] text-white/80">
            Materiales ({materials.length})
          </summary>
          <div className="mt-[6px] flex flex-col gap-[6px]">
            {materials.map((material) => {
              const override = settings.materialOverrides?.[material.key] || {};
              return (
                <div key={material.key} className="grid grid-cols-[1fr_88px] gap-[4px]">
                  <label className="min-w-0 truncate text-[10px] text-white/70" title={material.name}>
                    <input
                      type="checkbox"
                      className="mr-[4px]"
                      checked={!override.excluded}
                      onChange={(event) =>
                        onChange({
                          materialOverrides: {
                            ...settings.materialOverrides,
                            [material.key]: {
                              ...override,
                              excluded: !event.target.checked,
                            },
                          },
                        })
                      }
                    />
                    {material.name}
                  </label>
                  <select
                    className="h-6 rounded border border-white/10 bg-black/60 px-[3px] text-[10px]"
                    value={override.category || material.category}
                    onChange={(event) =>
                      onChange({
                        materialOverrides: {
                          ...settings.materialOverrides,
                          [material.key]: {
                            ...override,
                            category: event.target.value,
                          },
                        },
                      })
                    }
                  >
                    <option value="opaque">Opaco</option>
                    <option value="glass">Vidrio</option>
                    <option value="metal">Metal</option>
                    <option value="emissive">Luz</option>
                    <option value="vegetation">Vegetación</option>
                  </select>
                </div>
              );
            })}
          </div>
        </details>
      ) : null}
      <label className="flex flex-col gap-[4px] text-[11px] text-white/75">
        Exposición: {Number(settings.exposure).toFixed(2)}
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.05"
          value={settings.exposure}
          onChange={(event) => onChange({ exposure: Number(event.target.value) })}
        />
      </label>
      <label className="flex flex-col gap-[4px] text-[11px] text-white/75">
        Sombras: {Number(settings.shadowIntensity).toFixed(2)}
        <input
          type="range"
          min="0"
          max="3"
          step="0.1"
          value={settings.shadowIntensity}
          onChange={(event) =>
            onChange({ shadowIntensity: Number(event.target.value) })
          }
        />
      </label>
      {error ? <p className="text-[11px] text-red-200">{error}</p> : null}
      <button
        type="button"
        className="h-9 cursor-pointer rounded-[var(--radius-1)] bg-[var(--color-primary-300)] px-[10px] text-heading-8 text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSaving}
        onClick={onSave}
      >
        {isSaving ? "Guardando…" : "Guardar apariencia"}
      </button>
    </div>
  );
}
