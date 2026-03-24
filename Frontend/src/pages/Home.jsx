function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-lg ring-1 ring-slate-200">
        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          Tailwind instalado
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900">
          React y Tailwind funcionando
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Este archivo ya esta listo.
        </p>
      </section>
    </main>
  );
}

export default Home;
