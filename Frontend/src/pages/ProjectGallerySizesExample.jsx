import { useEffect, useState } from "react";

import standAuraImage from "../assets/fondos/stand-aura-2026.png";
import projectImage from "../assets/fondos/Project Image.png";
import standImage from "../assets/fondos/Property 1=Variant2.png";
import { getPublicGalleryColumnCount } from "../utils/publicProjectGalleryLayout.js";
import { GalleryColumns } from "./PublicProjectsGallery.jsx";

const PROJECTS = [
  {
    id: "size-example-aura",
    name: "Stand Aura 2026",
    projectType: "commercial",
    image: standAuraImage,
    client: { name: "Aura Concept" },
  },
  {
    id: "size-example-bathroom",
    name: "Baño RD 2026",
    projectType: "residential",
    image: projectImage,
    client: { name: "Cliente RD" },
  },
  {
    id: "size-example-shaketopia",
    name: "Shaketopia 2026",
    projectType: "commercial",
    image: standImage,
    client: { name: "Shaketopia" },
  },
  {
    id: "size-example-office",
    name: "Oficinas Arca 2026",
    projectType: "corporate",
    image: projectImage,
    client: { name: "Arca Studio" },
  },
  {
    id: "size-example-home",
    name: "Casa Origen 2026",
    projectType: "residential",
    image: standAuraImage,
    client: { name: "Familia Origen" },
  },
];

const CASES = [
  {
    count: 5,
    description: "Desde cuatro proyectos se conserva el patrón alternado original.",
  },
  {
    count: 3,
    description: "Tres columnas uniformes de 479 px de alto.",
  },
  {
    count: 2,
    description: "Dos tarjetas equilibradas, sin alterar su altura.",
  },
  {
    count: 1,
    description: "Una sola tarjeta usa todo el ancho y crece a 560 px.",
  },
];

export default function ProjectGallerySizesExample() {
  const [columns, setColumns] = useState(() =>
    getPublicGalleryColumnCount(window.innerWidth),
  );

  useEffect(() => {
    const syncColumns = () =>
      setColumns(getPublicGalleryColumnCount(window.innerWidth));
    window.addEventListener("resize", syncColumns);
    return () => window.removeEventListener("resize", syncColumns);
  }, []);

  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] px-[16px] py-[48px] text-[var(--color-text-100)] min-[768px]:px-[24px] min-[1024px]:px-[48px]">
      <div className="mx-auto flex w-full max-w-[1104px] flex-col gap-[64px]">
        <header className="flex max-w-[720px] flex-col gap-[8px]">
          <p className="text-body-2 text-[var(--color-text-200)]">
            Ruta de revisión visual
          </p>
          <h1 className="text-heading-2">Tamaños de tarjetas de proyectos</h1>
          <p className="text-body-1 text-[var(--color-text-200)]">
            La cuadrícula real de “Ver más proyectos” se muestra aquí con sus
            tres cantidades principales.
          </p>
        </header>

        {CASES.map(({ count, description }) => (
          <section key={count} className="flex flex-col gap-[16px]">
            <div>
              <h2 className="text-heading-4">
                {count} {count === 1 ? "proyecto" : "proyectos"}
              </h2>
              <p className="text-body-2 text-[var(--color-text-200)]">
                {description}
              </p>
            </div>
            <GalleryColumns
              columns={columns}
              projects={PROJECTS.slice(0, count)}
              onOpen={() => {}}
            />
          </section>
        ))}
      </div>
    </main>
  );
}
