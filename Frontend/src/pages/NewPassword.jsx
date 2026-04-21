import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import group1Logo from "../assets/logos/Group 1.svg";
import AuthLayout from "../components/layout/AuthLayout.jsx";
import Button from "../components/ui/Button/Button.jsx";
import Input from "../components/ui/Input/Input.jsx";

const PASSWORD_REQUIREMENTS = [
  {
    label: "Al menos 1 mayuscula",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    label: "Al menos 1 numero",
    test: (value) => /\d/.test(value),
  },
  {
    label: "Al menos 1 caracter especial",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
  {
    label: "Al menos 8 caracteres",
    test: (value) => String(value).trim().length >= 8,
  },
];

function getPasswordState(value, touched) {
  if (!touched) {
    return value.trim() ? "Filled" : "Default";
  }

  return PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(value))
    ? "Filled"
    : "Error";
}

function NewPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const passwordState = useMemo(
    () => getPasswordState(password, touched.password),
    [password, touched.password],
  );

  const confirmPasswordState = useMemo(() => {
    if (!touched.confirmPassword) {
      return confirmPassword.trim() ? "Filled" : "Default";
    }

    if (confirmPassword.trim() && confirmPassword === password) {
      return "Filled";
    }

    return "Error";
  }, [confirmPassword, password, touched.confirmPassword]);

  const showConfirmHint =
    touched.confirmPassword &&
    confirmPassword.trim().length > 0 &&
    confirmPassword !== password;
  const passwordIsValid = PASSWORD_REQUIREMENTS.every((requirement) =>
    requirement.test(password),
  );
  const passwordsMatch =
    confirmPassword.trim().length > 0 && confirmPassword === password;

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched({
      password: true,
      confirmPassword: true,
    });

    if (!passwordIsValid || !passwordsMatch) {
      return;
    }

    navigate("/", {
      state: {
        authToast: {
          id: Date.now(),
          title: "Contrasena restablecida",
          description:
            "Tu contrasena ha sido actualizada con exito. Por razones de seguridad, por favor verifica la actividad reciente.",
          icon: "lock",
        },
      },
    });
  };

  return (
    <AuthLayout>
      <section className="flex w-full max-w-[581px] items-center rounded-[var(--radius-4)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px] shadow-[var(--shadow-e2)]">
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
              label="Nueva contrasena"
              type="Password"
              size="S"
              value={password}
              state={passwordState}
              hintText="Ingresa una nueva contrasena"
              showHint
              showLabelInfo={false}
              required={false}
              showPasswordStrength
              passwordRequirements={PASSWORD_REQUIREMENTS}
              passwordHintTitle="Debe contener al menos;"
              className="w-full max-w-none"
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() =>
                setTouched((current) => ({
                  ...current,
                  password: true,
                }))
              }
            />

            <Input
              label="Confirmar contrasena"
              type="Password"
              size="S"
              value={confirmPassword}
              state={confirmPasswordState}
              showHint={showConfirmHint}
              hintText="Las contrasenas no coinciden."
              showLabelInfo={false}
              required={false}
              showPasswordStrength={false}
              className="w-full max-w-none"
              onChange={(event) => setConfirmPassword(event.target.value)}
              onBlur={() =>
                setTouched((current) => ({
                  ...current,
                  confirmPassword: true,
                }))
              }
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
              Actualizar contrasena
            </Button>
          </form>
        </div>
      </section>
    </AuthLayout>
  );
}

export default NewPassword;
