import LoginBackgroundCarousel from "../ui/LoginBackgroundCarousel.jsx";

function AuthLayout({ children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-neutral-bg)]">
      <LoginBackgroundCarousel />

      <div className="relative z-[1] flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </main>
  );
}

export default AuthLayout;
