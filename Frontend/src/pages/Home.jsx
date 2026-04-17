function SectionBlock({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-6 shadow-[var(--shadow-e1)] transition-colors duration-200 md:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
          {eyebrow}
        </span>
        <h2 className="text-heading-4 text-[var(--color-text-50)]">{title}</h2>
        <p className="max-w-2xl text-body-4 text-[var(--color-text-200)]">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

function PlaceholderCard({ label }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-[20px] border border-dashed border-[var(--color-neutral-300)] bg-[var(--color-neutral-bg)] px-6 py-10">
      <span className="text-body-4 text-[var(--color-text-300)]">{label}</span>
    </div>
  );
}

function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] px-6 py-10 text-[var(--color-text-50)] transition-colors duration-200">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-6 shadow-[var(--shadow-e1)] transition-colors duration-200 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div className="flex flex-col gap-4">
              <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
                Home
              </span>
              <h1 className="text-heading-2 text-[var(--color-text-50)]">
                Estructura base de la pagina
              </h1>
              <p className="max-w-2xl text-body-3 text-[var(--color-text-200)]">
                Se elimino el contenido anterior para pasar a una maquetacion
                limpia. Desde aqui podemos construir cada bloque en el siguiente
                paso.
              </p>
            </div>

            <PlaceholderCard label="Espacio reservado para hero visual o resumen" />
          </div>
        </section>

        <SectionBlock
          eyebrow="Seccion 01"
          title="Header o navegacion principal"
          description="Base reservada para menu, acciones y contexto superior de la pagina."
        >
          <PlaceholderCard label="Placeholder de navegacion" />
        </SectionBlock>

        <SectionBlock
          eyebrow="Seccion 02"
          title="Contenido principal"
          description="Area central para propuesta de valor, modulos clave o bloques informativos."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <PlaceholderCard label="Bloque principal A" />
            <PlaceholderCard label="Bloque principal B" />
          </div>
        </SectionBlock>

        <SectionBlock
          eyebrow="Seccion 03"
          title="Seccion secundaria"
          description="Espacio preparado para contenido complementario, metricas o destacados."
        >
          <div className="grid gap-6 md:grid-cols-3">
            <PlaceholderCard label="Item 01" />
            <PlaceholderCard label="Item 02" />
            <PlaceholderCard label="Item 03" />
          </div>
        </SectionBlock>

        <SectionBlock
          eyebrow="Seccion 04"
          title="Footer"
          description="Bloque final reservado para enlaces, contacto o cierre de pagina."
        >
          <PlaceholderCard label="Placeholder de footer" />
        </SectionBlock>
      </div>
    </main>
  );
}

export default Home;
