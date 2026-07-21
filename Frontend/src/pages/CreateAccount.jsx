import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Buildings, Sms, User } from "iconsax-react";

import group1Logo from "../assets/logos/Group 1.svg";
import AuthLayout from "../components/layout/AuthLayout.jsx";
import Button from "../components/ui/Button/Button.jsx";
import HorizontalTabMenu from "../components/ui/HorizontalTabMenu/HorizontalTabMenu.jsx";
import Input from "../components/ui/Input/Input.jsx";

const referralItems = ["Instagram", "Referido", "WhatsApp", "Otro"];

function FieldIcon({ icon: Icon }) {
  return (
    <Icon
      size="20"
      variant="Linear"
      color="currentColor"
      className="size-5"
      aria-hidden="true"
    />
  );
}

function getInputState(value) {
  return String(value ?? "").trim() ? "Filled" : "Default";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function hasValidPhone(value) {
  return String(value).replace(/\D/g, "").length >= 7;
}

function CreateAccount() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [referralIndex, setReferralIndex] = useState(0);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !fullName.trim() ||
      !isValidEmail(email) ||
      !hasValidPhone(phone) ||
      !event.currentTarget.checkValidity()
    ) {
      event.currentTarget.reportValidity();
      return;
    }

    setShowEmailVerification(true);
  };

  if (showEmailVerification) {
    return (
      <AuthLayout>
        <section className="box-border flex w-full max-w-[579px] shrink-0 items-center rounded-[var(--radius-4)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px] shadow-[var(--shadow-e2)]">
          <div className="flex w-full flex-col items-start justify-center gap-[16px] p-[24px] sm:p-[40px] lg:p-[56px]">
            <div className="flex w-full flex-col items-start gap-[8px] border-b border-[var(--color-neutral-200)] pb-[16px]">
              <img
                src={group1Logo}
                alt="ARCA Studio"
                className="h-[48px] w-[50.64px] object-contain"
              />
              <h1 className="text-heading-3 m-0 text-[var(--color-text-300)] max-sm:text-[40px] max-sm:leading-[46px]">
                Verifica tu correo electrónico
              </h1>
            </div>

            <div className="flex w-full flex-col items-start gap-[4px] text-[var(--color-text-300)]">
              <p className="text-heading-6 m-0">
                Antes de continuar, necesitamos confirmar tu dirección de
                correo electrónico.
              </p>
              <p className="text-body-2 m-0">
                Hemos enviado un enlace de verificación a tu bandeja de
                entrada. Una vez confirmado, podrás crear tu contraseña y
                acceder a tu cuenta.
              </p>
            </div>

            <div className="flex w-full flex-col gap-[8px] sm:flex-row">
              <Button
                theme="Primary"
                type="Outline"
                size="L"
                fitContent={false}
                showLeftIcon={false}
                showRightIcon={false}
                className="w-full sm:flex-1"
              >
                Reenviar correo
              </Button>
              <Button
                theme="Primary"
                type="Solid"
                size="L"
                fitContent={false}
                showLeftIcon={false}
                showRightIcon={false}
                className="w-full sm:flex-1"
                onClick={() => navigate("/crear-contrasena")}
              >
                Entendido
              </Button>
            </div>

            <p className="text-body-2 m-0 w-full text-center text-[var(--color-text-200)]">
              ¿No encuentras el correo? Revisa tu carpeta de spam o solicita
              un nuevo enlace.
            </p>
          </div>
        </section>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <section className="box-border flex w-full max-w-[579px] shrink-0 items-center rounded-[var(--radius-4)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px] shadow-[var(--shadow-e2)]">
        <div className="flex w-full flex-col items-start justify-center gap-[16px] p-[24px] sm:p-[40px] lg:p-[56px]">
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-[16px]">
            <div className="flex w-full flex-col items-start gap-[8px] border-b border-[var(--color-neutral-200)] pb-[16px]">
              <img
                src={group1Logo}
                alt="ARCA Studio"
                className="h-[48px] w-[50.64px] object-contain"
              />
              <h1 className="text-heading-3 m-0 self-stretch text-[var(--color-text-300)] max-sm:text-[40px] max-sm:leading-[46px]">
                Crear cuenta
              </h1>
            </div>

            <Input
              label="Nombre Completo"
              type="Default input"
              size="S"
              value={fullName}
              state={getInputState(fullName)}
              placeholder="Escribe tu nombre y apellido"
              showHint={false}
              showLabelInfo={false}
              required
              showRightIcon={false}
              leftIcon={<FieldIcon icon={User} />}
              className="w-full max-w-none"
              onChange={(event) => setFullName(event.target.value)}
            />

            <Input
              label="Correo Electrónico"
              type="Default input"
              size="S"
              value={email}
              state={getInputState(email)}
              placeholder="ejemplo@dominio.com"
              showHint={false}
              showLabelInfo={false}
              required
              showRightIcon={false}
              leftIcon={<FieldIcon icon={Sms} />}
              className="w-full max-w-none"
              onChange={(event) => setEmail(event.target.value)}
            />

            <Input
              label="Empresa (opcional)"
              type="Default input"
              size="S"
              value={company}
              state={getInputState(company)}
              placeholder="Nombre de la empresa"
              showHint={false}
              showLabelInfo={false}
              required={false}
              showRightIcon={false}
              leftIcon={<FieldIcon icon={Buildings} />}
              className="w-full max-w-none"
              onChange={(event) => setCompany(event.target.value)}
            />

            <Input
              label="Número de teléfono"
              type="Phone number"
              size="S"
              value={phone}
              state={getInputState(phone)}
              placeholder="(414) 1234-5678"
              countryCode="VE"
              countryPrefix="+58"
              showHint={false}
              showLabelInfo={false}
              required
              showRightIcon={false}
              className="w-full max-w-none"
              onChange={(event) => setPhone(event.target.value)}
            />

            <div className="flex w-full flex-col items-start gap-[8px]">
              <p className="text-heading-8 m-0 text-[var(--color-text-300)]">
                ¿Cómo nos conoció?
              </p>
              <HorizontalTabMenu
                items={referralItems}
                activeIndex={referralIndex}
                interactive
                filled="off"
                style="Brand"
                aria-label="Cómo nos conoció"
                onChange={setReferralIndex}
              />
            </div>

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
              Continuar
            </Button>

            <Button
              theme="Primary"
              type="Ghost"
              size="M"
              fitContent={false}
              showLeftIcon={false}
              showRightIcon={false}
              className="h-[41px] w-full !bg-transparent !text-[var(--color-text-300)] hover:!bg-transparent hover:!text-[var(--color-text-50)]"
              onClick={() => navigate("/")}
            >
              Ya tengo una cuenta
            </Button>
          </form>
        </div>
      </section>
    </AuthLayout>
  );
}

export default CreateAccount;
