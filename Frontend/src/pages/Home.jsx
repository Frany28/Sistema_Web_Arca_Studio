import Flag from "../components/Flag.jsx";
import Icon from "../components/Icon.jsx";
import { Home2, Setting2, Wallet1 } from "iconsax-react";

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
        <div className="mt-6 flex items-center gap-4 text-slate-700">
          <Icon icon={Home2} size={28} color="#2563eb" />
          <Icon icon={Wallet1} size={28} variant="Bulk" color="#0f172a" />
          <Flag countryCode="VE" title="Venezuela" />
        </div>
      </section>
    </main>
  );
}

export default Home;
