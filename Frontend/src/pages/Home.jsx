import ThemeToggle from "../components/ui/ThemeToggle.jsx";

function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-neutral-bg)] px-6 py-10 text-[var(--color-text-50)] transition-colors duration-200">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-[24px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-8 shadow-[var(--shadow-e1)] transition-colors duration-200">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <section className="rounded-[20px] border border-dashed border-[var(--color-neutral-200)] bg-[var(--color-neutral-bg)] p-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-[12px] font-semibold uppercase tracking-[1.44px] text-[var(--color-text-300)]">
              Integracion en progreso
            </span>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Home;
