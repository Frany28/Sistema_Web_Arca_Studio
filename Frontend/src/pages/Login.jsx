import { useMemo, useState } from "react";

import group1Logo from "../assets/logos/Group 1.svg";
import Button from "../components/ui/Button/Button.jsx";
import Input from "../components/ui/Input/Input.jsx";
import LoginBackgroundCarousel from "../components/ui/LoginBackgroundCarousel.jsx";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const emailHasError = touched.email && !isValidEmail(email);
  const passwordHasError = touched.password && password.trim().length < 8;

  const emailState = useMemo(() => {
    if (emailHasError) {
      return "Error";
    }

    return email.trim() ? "Filled" : "Default";
  }, [email, emailHasError]);

  const passwordState = useMemo(() => {
    if (passwordHasError) {
      return "Error";
    }

    return password.trim() ? "Filled" : "Default";
  }, [password, passwordHasError]);

  const handleSubmit = (event) => {
    event.preventDefault();

    setTouched({
      email: true,
      password: true,
    });
  };

  const showEmailHint = touched.email && emailHasError;
  const showPasswordHint = touched.password && passwordHasError;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fafaf8]">
      <LoginBackgroundCarousel />

      <div className="relative z-[1] flex min-h-screen items-center justify-center p-8">
        <section className="flex h-[544px] w-[581px]  items-center gap-[var(--spacing-spacing-gap-5,16px)] rounded-[var(--radius-radius-4,16px)] border border-[var(--Color-neutral-200,#E8E8E8)] bg-[var(--Color-neutral-100,#FFF)] p-[var(--spacing-spacing-gap-5,16px)] ">
          <div className="box-border flex-col items-start justify-center gap-4 p-[var(--spacing-spacing-gap-9,56px)]">
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-4"
            >
              <div className="flex w-full flex-col items-start gap-2 border-b border-[#E8E8E8] pb-4">
                <img
                  src={group1Logo}
                  alt="ARCA Studio"
                  className="h-12 w-[50.64px] object-contain"
                />
                <h1 className="text-heading-3 m-0 self-stretch text-[var(--Color-text-primary-300,#2A2929)]">
                  Accede a tu cuenta
                </h1>
              </div>

              <Input
                label="Correo Electronico"
                type="Default input"
                size="S"
                value={email}
                state={emailState}
                placeholder="ejemplo@dominio.com"
                showHint={showEmailHint}
                hintText="Este correo no se encuentra."
                showLabelInfo={false}
                required={false}
                showRightIcon={false}
                className="max-w-none w-full"
                onChange={(event) => setEmail(event.target.value)}
              />

              <Input
                label="Contrasena"
                type="Password"
                size="S"
                value={password}
                state={passwordState}
                showHint={showPasswordHint}
                hintText="Contraseña Incorrecta."
                showLabelInfo={false}
                required={false}
                showPasswordStrength={false}
                className="max-w-none w-full"
                onChange={(event) => setPassword(event.target.value)}
              />

              <div className="w-full">
                <Button
                  htmlType="submit"
                  theme="Primary"
                  type="Solid"
                  size="M"
                  fitContent={false}
                  showLeftIcon={false}
                  showRightIcon={false}
                  className="w-full"
                >
                  Iniciar sesion
                </Button>
              </div>

              <div className="flex w-full justify-center">
                <Button
                  theme="Primary"
                  type="Link"
                  size="M"
                  fitContent
                  showLeftIcon={false}
                  showRightIcon={false}
                >
                  Olvide mi contrasena
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
