import { useMemo, useState } from "react";
import { Buildings, CloseCircle, Sms, User } from "iconsax-react";

import Modal from "../../components/ui/Modal/Modal.jsx";
import Input from "../../components/ui/Input/Input.jsx";
import Label from "../../components/ui/Label/Label.jsx";
import HintText from "../../components/ui/HintText/HintText.jsx";
import DropdownMenu from "../../components/ui/DropdownMenu/DropdownMenu.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import PHONE_COUNTRY_OPTIONS from "../../components/ui/Input/phoneCountryOptions.js";

const INITIAL_VALUES = {
  companyName: "",
  email: "",
  fullName: "",
  phone: "",
  phonePrefix: "+1",
  roleCode: "",
  secondaryPhone: "",
  secondaryPhonePrefix: "+1",
  status: "active",
};

const STATUS_ITEMS = [
  { id: "active", label: "Activo", type: "Text" },
  { id: "blocked", label: "Suspendido", type: "Text" },
  { id: "inactive", label: "Deshabilitado", type: "Text" },
];

function splitPhone(value) {
  const normalized = String(value || "").replace(/\D/g, "");
  if (!normalized) return { countryCode: "US", number: "", prefix: "+1" };

  const option = [...PHONE_COUNTRY_OPTIONS]
    .sort((left, right) => right.dialCode.length - left.dialCode.length)
    .find((item) => normalized.startsWith(item.dialCode.replace(/\D/g, "")));
  const prefixDigits = option?.dialCode.replace(/\D/g, "") || "1";

  return {
    countryCode: option?.countryCode || "US",
    number: normalized.slice(prefixDigits.length),
    prefix: option?.dialCode || "+1",
  };
}

function getInitialValues(user, roles) {
  const phone = splitPhone(user?.phone);
  const secondaryPhone = splitPhone(user?.secondaryPhone);

  return {
    ...INITIAL_VALUES,
    companyName: user?.companyName || "",
    email: user?.email || "",
    fullName: user?.name || "",
    phone: phone.number,
    phoneCountryCode: phone.countryCode,
    phonePrefix: phone.prefix,
    roleCode: user?.role?.code || roles.find((role) => role.code === "client")?.code || roles[0]?.code || "",
    secondaryPhone: secondaryPhone.number,
    secondaryPhoneCountryCode: secondaryPhone.countryCode,
    secondaryPhonePrefix: secondaryPhone.prefix,
    status: user?.status || "active",
  };
}

function validate(values) {
  const errors = {};
  if (values.fullName.trim().split(/\s+/).filter(Boolean).length < 2) {
    errors.fullName = "Ingresa nombre y apellido.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Ingresa un correo electrónico válido.";
  }
  if (!values.roleCode) errors.roleCode = "Selecciona un rol.";
  if (!values.status) errors.status = "Selecciona un status.";

  for (const key of ["phone", "secondaryPhone"]) {
    const digits = values[key].replace(/\D/g, "");
    if (values[key] && (digits.length < 8 || digits.length > 15)) {
      errors[key] = "Ingresa un teléfono válido.";
    }
  }
  if (values.phone && values.secondaryPhone) {
    const primary = values.phone.replace(/\D/g, "");
    const secondary = values.secondaryPhone.replace(/\D/g, "");
    if (primary === secondary) errors.secondaryPhone = "Los teléfonos deben ser diferentes.";
  }
  return errors;
}

function apiFieldsToErrors(fields) {
  const next = {};
  for (const [path, message] of Object.entries(fields || {})) {
    const field = path.replace(/^body\./, "");
    if (field in INITIAL_VALUES) next[field] = message;
  }
  return next;
}

function SelectField({ error, items, label, onSelect, selectedItemId }) {
  return (
    <div className="flex min-w-0 flex-col gap-[8px]">
      <Label label={label} required information={false} />
      <DropdownMenu
        type="Text"
        label={`Seleccionar ${label.toLowerCase()}`}
        items={items}
        selectedItemId={selectedItemId}
        onItemSelect={onSelect}
        className="w-full"
        aria-label={label}
      />
      {error ? <HintText state="Error" hintText={error} role="alert" /> : null}
    </div>
  );
}

function AdminUserFormModal({ mode = "create", onClose, onSubmit, open, roles = [], user = null }) {
  const editing = mode === "edit";
  const [values, setValues] = useState(() => getInitialValues(user, roles));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const roleItems = useMemo(
    () => roles.map((role) => ({ id: role.code, label: role.name, type: "Text" })),
    [roles],
  );

  const updateValue = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSubmitError("");
  };

  const validateField = (field) => {
    const nextErrors = validate(values);
    setErrors((current) => ({ ...current, [field]: nextErrors[field] || "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({
        companyName: values.companyName.trim() || undefined,
        email: values.email.trim().toLowerCase(),
        fullName: values.fullName.trim(),
        phone: values.phone ? `${values.phonePrefix}${values.phone}` : undefined,
        roleCode: values.roleCode,
        secondaryPhone: values.secondaryPhone
          ? `${values.secondaryPhonePrefix}${values.secondaryPhone}`
          : undefined,
        status: values.status,
      });
    } catch (error) {
      const fieldErrors = apiFieldsToErrors(error?.fields);
      if (Object.keys(fieldErrors).length) setErrors((current) => ({ ...current, ...fieldErrors }));
      setSubmitError(error?.message || (editing ? "No se pudo actualizar el usuario." : "No se pudo crear el usuario."));
    } finally {
      setSubmitting(false);
    }
  };

  const textInputProps = (field) => ({
    size: "S",
    value: values[field],
    state: errors[field] ? "Error" : "Default",
    showHint: Boolean(errors[field]),
    hintText: errors[field],
    onChange: (event) => updateValue(field, event.target.value),
    onBlur: () => validateField(field),
  });

  return (
    <Modal mount="viewport" visible={open} onClose={submitting ? undefined : onClose} className="z-[100]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${mode}-admin-user-title`}
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-[696px] flex-col overflow-hidden rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] shadow-[var(--shadow-e2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-[16px] border-b border-[var(--color-neutral-200)] p-[16px]">
          <div className="flex min-w-0 flex-col gap-[4px]">
            <h2 id={`${mode}-admin-user-title`} className="text-heading-6 text-[var(--color-text-300)]">{editing ? "Editar usuario" : "Nuevo usuario"}</h2>
            {!editing ? <p className="text-body-3 text-[var(--color-text-200)]">Completa la información para crear una cuenta en ARCA Studio.</p> : null}
          </div>
          <Button theme="Primary" type="Ghost" size="S" showText={false} showLeftIcon iconLeft={<CloseCircle size="20" color="currentColor" />} showRightIcon={false} disabled={submitting} aria-label={`Cerrar formulario de ${editing ? "edición" : "nuevo usuario"}`} tooltip={false} onClick={onClose} />
        </div>

        <form id={`${mode}-admin-user-form`} className="min-h-0 overflow-y-auto" onSubmit={handleSubmit} noValidate>
          <fieldset disabled={submitting} className="flex flex-col p-[16px]">
            <div className="grid grid-cols-1 gap-[16px] border-b border-[var(--color-neutral-200)] pb-[16px] sm:grid-cols-2 sm:gap-[24px]">
              <Input {...textInputProps("fullName")} label="Nombre" placeholder="John Doe" required showLabel showLabelInfo={false} showLeftIcon leftIcon={<User size="20" color="currentColor" />} showRightIcon={false} className="max-w-none" autoComplete="name" />
              <Input {...textInputProps("companyName")} label="Empresa" placeholder="Next C.A." required={false} showLabel showLabelInfo={false} showLeftIcon leftIcon={<Buildings size="20" color="currentColor" />} showRightIcon={false} showHint={Boolean(errors.companyName)} className="max-w-none" autoComplete="organization" />
            </div>

            <div className="grid grid-cols-1 gap-[16px] border-b border-[var(--color-neutral-200)] py-[16px] sm:grid-cols-2 sm:gap-[24px]">
              <Input {...textInputProps("email")} label="Email" placeholder="usuario@gmail.com" type="Default input" required showLabel showLabelInfo={false} showLeftIcon leftIcon={<Sms size="20" color="currentColor" />} showRightIcon={false} className="max-w-none" autoComplete="email" inputMode="email" />
              <SelectField error={errors.roleCode} items={roleItems} label="Rol" selectedItemId={values.roleCode} onSelect={(item) => updateValue("roleCode", item.id)} />
            </div>

            <div className="grid grid-cols-1 gap-[16px] border-b border-[var(--color-neutral-200)] py-[16px] sm:grid-cols-2 sm:gap-[24px]">
              <Input {...textInputProps("phone")} label="Teléfono" placeholder="(444) 1234-5678" type="Phone number" required={false} showLabel showLabelInfo={false} showLeftIcon={false} showRightIcon={false} showHint hintText={errors.phone || "Le enviaremos un código para la verificación."} className="max-w-none" countryCode={values.phoneCountryCode} countryPrefix={values.phonePrefix} onPhoneCountryChange={(country) => { updateValue("phonePrefix", country.dialCode); updateValue("phoneCountryCode", country.countryCode); }} autoComplete="tel" />
              <Input {...textInputProps("secondaryPhone")} label="Teléfono" placeholder="(444) 1234-5678" type="Phone number" required={false} showLabel showLabelInfo={false} showLeftIcon={false} showRightIcon={false} showHint hintText={errors.secondaryPhone || "Le enviaremos un código para la verificación."} className="max-w-none" countryCode={values.secondaryPhoneCountryCode} countryPrefix={values.secondaryPhonePrefix} onPhoneCountryChange={(country) => { updateValue("secondaryPhonePrefix", country.dialCode); updateValue("secondaryPhoneCountryCode", country.countryCode); }} autoComplete="tel" />
            </div>

            <div className="grid grid-cols-1 gap-[16px] pt-[16px] sm:grid-cols-2 sm:gap-[24px]">
              <SelectField error={errors.status} items={STATUS_ITEMS} label="Status" selectedItemId={values.status} onSelect={(item) => updateValue("status", item.id)} />
            </div>

            {submitError ? <p className="mt-[16px] text-body-3 text-[var(--color-danger-100)]" role="alert">{submitError}</p> : null}
          </fieldset>
        </form>

        <footer className="flex flex-col-reverse gap-[16px] border-t border-[var(--color-neutral-200)] p-[16px] sm:flex-row sm:items-center">
          <Button theme="Primary" type="Outline" size="M" showLeftIcon={false} showRightIcon={false} disabled={submitting} className="!w-full sm:min-w-0 sm:flex-1" onClick={onClose}>Cancelar</Button>
          <Button theme="Primary" type="Solid" size="M" showLeftIcon={false} showRightIcon={false} disabled={submitting || roles.length === 0} className="!w-full sm:min-w-0 sm:flex-1" htmlType="submit" form={`${mode}-admin-user-form`}>{submitting ? (editing ? "Guardando..." : "Creando...") : (editing ? "Siguiente" : "Crear usuario")}</Button>
        </footer>
      </div>
    </Modal>
  );
}

function CreateAdminUserModal(props) {
  return <AdminUserFormModal {...props} mode="create" onSubmit={props.onCreate} />;
}

export { AdminUserFormModal };
export default CreateAdminUserModal;
