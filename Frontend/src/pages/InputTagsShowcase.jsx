import { useMemo, useState } from "react";

import avatarOne from "../assets/input-tags/avatar-1.jpeg";
import avatarTwo from "../assets/input-tags/avatar-2.jpeg";
import Button from "../components/ui/Button/Button.jsx";
import Input from "../components/ui/Input/Input.jsx";
import { createInputTagShowcaseMatrix } from "../components/ui/Input/inputShowcaseData.js";
import {
  applyThemePreference,
  getThemePreferenceFromDocument,
} from "./settings/themeUtils.js";

const FIGMA_TAGS = [
  { id: "figma-tag-1", label: "Label", avatarText: "L", avatarSrc: avatarOne },
  { id: "figma-tag-2", label: "Label", avatarText: "L", avatarSrc: avatarTwo },
  { id: "figma-tag-3", label: "Label", avatarText: "L", avatarSrc: avatarOne },
];

const INTERACTIVE_OPTIONS = [
  { id: "tag-andrea", label: "Andrea", avatarText: "A", avatarSrc: avatarOne },
  { id: "tag-carlos", label: "Carlos", avatarText: "C", avatarSrc: avatarTwo },
  { id: "tag-lucia", label: "Lucía", avatarText: "L", avatarSrc: avatarOne },
  { id: "tag-mateo", label: "Mateo", avatarText: "M", avatarSrc: avatarTwo },
  { id: "tag-sofia", label: "Sofía", avatarText: "S", avatarSrc: avatarOne },
  { id: "tag-daniel", label: "Daniel", avatarText: "D", avatarSrc: avatarTwo },
  { id: "tag-valentina", label: "Valentina", avatarText: "V", avatarSrc: avatarOne },
];

function getLiveState({ disabled, error, focused, hovered, tags }) {
  if (disabled) return "Disabled";
  if (error) return "Error";
  if (focused) return "Focused";
  if (tags.length > 0) return "Filled";
  if (hovered) return "Hover";
  return "Default";
}

function InputTagsShowcase() {
  const [size, setSize] = useState("S");
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [theme, setTheme] = useState(getThemePreferenceFromDocument);
  const matrix = useMemo(() => createInputTagShowcaseMatrix(FIGMA_TAGS), []);

  const liveState = getLiveState({
    disabled,
    error,
    focused,
    hovered,
    tags: selectedTags,
  });

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
    applyThemePreference(nextTheme);
  };

  const handleTagsChange = (nextTags) => {
    setSelectedTags(nextTags);
    setQuery("");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-neutral-bg)] px-[16px] py-[32px] text-[var(--color-text-300)] sm:px-[32px] lg:px-[48px]">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-[40px]">
        <header className="flex flex-col gap-[12px]">
          <span className="text-body-4 w-fit rounded-full border border-[var(--color-warning-100)] bg-[var(--color-warning-10)] px-[8px] py-[4px] text-[var(--color-text-200)]">
            Demo / staging
          </span>
          <div className="flex flex-col gap-[8px]">
            <h1 className="text-heading-3">Input field · Tags</h1>
            <p className="text-body-2 max-w-[760px] text-[var(--color-text-200)]">
              Verificación de los tamaños S, M y L y de los seis estados definidos
              en Figma. Enfoca el ejemplo para mover las etiquetas a la fila inferior.
            </p>
          </div>
          <div className="flex flex-wrap gap-[8px]" aria-label="Tema de la demostración">
            {["claro", "oscuro"].map((option) => (
              <Button
                key={option}
                type={theme === option ? "Solid" : "Outline"}
                fitContent
                onClick={() => handleThemeChange(option)}
                aria-pressed={theme === option}
              >
                {option === "claro" ? "Tema claro" : "Tema oscuro"}
              </Button>
            ))}
          </div>
        </header>

        <section className="flex flex-col gap-[20px]" aria-labelledby="interactive-title">
          <div className="flex flex-col gap-[4px]">
            <h2 id="interactive-title" className="text-heading-5">
              Ejemplo interactivo
            </h2>
            <p className="text-body-3 text-[var(--color-text-100)]" aria-live="polite">
              Estado actual: {liveState}
            </p>
          </div>

          <div className="grid gap-[24px] rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px] sm:p-[24px] lg:grid-cols-[320px_1fr]">
            <div
              className="w-full max-w-[320px]"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <Input
                type="Tags"
                size={size}
                state={error ? "Error" : "Default"}
                value={query}
                tags={selectedTags}
                tagOptions={INTERACTIVE_OPTIONS}
                tagGroupAriaLabel="Personas disponibles y seleccionadas"
                showTagOptionsOnFocus
                disabled={disabled}
                hintText={error ? "Selecciona al menos una persona" : "Texto de ayuda para los usuarios"}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(event) => setQuery(event.target.value)}
                onTagsChange={handleTagsChange}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-[16px]">
              <div className="flex flex-col gap-[8px]">
                <span className="text-heading-8">Tamaño</span>
                <div className="flex flex-wrap gap-[8px]">
                  {["S", "M", "L"].map((option) => (
                    <Button
                      key={option}
                      type={size === option ? "Solid" : "Outline"}
                      fitContent
                      onClick={() => setSize(option)}
                      aria-pressed={size === option}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-[8px]">
                <Button
                  theme="Danger"
                  type={error ? "Solid" : "Outline"}
                  fitContent
                  onClick={() => setError((current) => !current)}
                  aria-pressed={error}
                >
                  {error ? "Quitar error" : "Mostrar error"}
                </Button>
                <Button
                  type={disabled ? "Solid" : "Outline"}
                  fitContent
                  onClick={() => setDisabled((current) => !current)}
                  aria-pressed={disabled}
                >
                  {disabled ? "Habilitar" : "Deshabilitar"}
                </Button>
                <Button
                  type="Ghost"
                  fitContent
                  onClick={() => {
                    setSelectedTags([]);
                    setQuery("");
                    setError(false);
                  }}
                >
                  Limpiar
                </Button>
              </div>

              <p className="text-body-3 max-w-[620px] text-[var(--color-text-100)]">
                También puedes escribir y confirmar con Enter o coma, eliminar la
                última etiqueta con Backspace y recorrer todos los controles con teclado.
                Se muestran hasta tres opciones; al seleccionar una aparece la siguiente.
              </p>
              <p className="text-body-3 text-[var(--color-text-200)]" aria-live="polite">
                {selectedTags.length === 0
                  ? "Ninguna persona seleccionada."
                  : `${selectedTags.length} ${selectedTags.length === 1 ? "persona seleccionada" : "personas seleccionadas"}.`}
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-[20px]" aria-labelledby="matrix-title">
          <div className="flex flex-col gap-[4px]">
            <h2 id="matrix-title" className="text-heading-5">
              Matriz de estados
            </h2>
            <p className="text-body-3 text-[var(--color-text-100)]">
              18 combinaciones estáticas para comparación directa con Figma.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 xl:grid-cols-3">
            {matrix.map((item) => (
              <article
                key={item.id}
                className="flex min-w-0 flex-col gap-[16px] rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px] sm:p-[20px]"
              >
                <div className="flex items-center justify-between gap-[12px]">
                  <h3 className="text-heading-8">{item.state}</h3>
                  <span className="text-body-4 rounded-full bg-[var(--color-neutral-200)] px-[8px] py-[4px] text-[var(--color-text-200)]">
                    Size {item.size}
                  </span>
                </div>
                <div className="pointer-events-none min-w-0" aria-hidden="true" inert="">
                  <Input {...item.props} readOnly tabIndex={-1} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default InputTagsShowcase;
