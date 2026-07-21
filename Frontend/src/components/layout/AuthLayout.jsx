import LoginBackgroundCarousel from "../ui/LoginBackgroundCarousel.jsx";

function AuthLayout({ children }) {
  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[var(--color-neutral-bg)]">
      <LoginBackgroundCarousel />

      <div className="relative z-[1] flex min-h-dvh items-center justify-center px-[16px] py-[72px] sm:px-[24px] lg:px-[32px]">
        {children}
      </div>
    </main>
  );
}

export default AuthLayout;
