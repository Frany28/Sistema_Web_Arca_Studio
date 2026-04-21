import { useMemo, useState } from "react";

import group1Logo from "../assets/logos/Group 1.svg";
import AuthLayout from "../components/layout/AuthLayout.jsx";
import Button from "../components/ui/Button/Button.jsx";
import AuthToast, {
  AuthToastMailIcon,
} from "../components/ui/AuthToast/AuthToast.jsx";
import Input from "../components/ui/Input/Input.jsx";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function RecoverAccount() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [toastTrigger, setToastTrigger] = useState(null);

  const emailHasError = touched && !isValidEmail(email);
  const emailState = useMemo(() => {
    if (emailHasError) {
      return "Error";
    }

    return email.trim() ? "Filled" : "Default";
  }, [email, emailHasError]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched(true);

    if (!isValidEmail(email)) {
      return;
    }

    setToastTrigger(Date.now());
  };

  return (
    <AuthLayout>
      <AuthToast
        trigger={toastTrigger}
        title="Enlace enviado"
        description="Hemos enviado un enlace a tu correo electronico."
        leading={<AuthToastMailIcon />}
      />

      <section className="flex w-full max-w-[581px] items-center gap-[var(--spacing-gap-0)] rounded-[var(--radius-4)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px] shadow-[var(--shadow-e2)]">
        <div className="flex w-full flex-col items-start justify-center gap-[16px] p-[24px] sm:p-[40px] lg:p-[56px]">
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-[16px]">
            <div className="flex w-full flex-col items-start gap-[8px] border-b border-[var(--color-neutral-200)] pb-[16px]">
              <img
                src={group1Logo}
                alt="ARCA Studio"
                className="h-[48px] w-[50.64px] object-contain"
              />
              <h1 className="text-heading-3 m-0 text-[var(--color-text-300)] max-sm:text-[40px] max-sm:leading-[46px]">
                Recupera tu acceso
              </h1>
            </div>

            <Input
              label="Correo Electronico"
              type="Default input"
              size="S"
              value={email}
              state={emailState}
              placeholder="ejemplo@dominio.com"
              hintText={
                emailHasError
                  ? "Ingresa un correo electronico valido."
                  : "Te enviaremos un enlace para restablecer tu contrasena"
              }
              showHint
              showLabelInfo={false}
              required={false}
              showRightIcon={false}
              className="w-full max-w-none"
              onChange={(event) => setEmail(event.target.value)}
            />

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
              Enviar enlace
            </Button>
          </form>
        </div>
      </section>
    </AuthLayout>
  );
}

export default RecoverAccount;
