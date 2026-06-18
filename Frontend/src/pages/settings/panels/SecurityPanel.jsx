import Input from "../../../components/ui/Input/Input.jsx";
import Button from "../../../components/ui/Button/Button.jsx";

export default function SecurityPanel({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordRequirements,
  onSubmit,
  isSubmitting = false,
  validationErrors = {},
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-4">
      <div className="flex w-[664px] max-w-full items-start gap-[24px] border-b border-[var(--color-neutral-200)] pb-[16px]">
        <Input
          label="Contraseña actual"
          required={false}
          information={false}
          showLabelInfo={false}
          showHint={false}
          size="S"
          type="Password"
          state={
            validationErrors.currentPassword
              ? "Error"
              : currentPassword
                ? "Filled"
                : "Default"
          }
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          disabled={isSubmitting}
        />
        <div className="w-[320px]" />
      </div>

      <div className="flex w-[664px] max-w-full items-start gap-[24px] pb-[16px] border-b border-[var(--color-neutral-200)]">
        <Input
          label="Nueva contraseña"
          required={false}
          information={false}
          showLabelInfo={false}
          showHint={false}
          size="S"
          type="Password"
          state={
            validationErrors.newPassword
              ? "Error"
              : newPassword
                ? "Filled"
                : "Default"
          }
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          showPasswordStrength
          passwordRequirements={passwordRequirements}
          passwordHintTitle="Debe contener al menos:"
          className="w-[320px] max-w-none"
          disabled={isSubmitting}
        />
        <Input
          label="Confirmar contraseña"
          required={false}
          information={false}
          showLabelInfo={false}
          showHint={false}
          size="S"
          type="Password"
          state={
            validationErrors.confirmPassword
              ? "Error"
              : confirmPassword
                ? "Filled"
                : "Default"
          }
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-[320px] max-w-none"
          disabled={isSubmitting}
        />
      </div>
      <div className="flex w-[664px] max-w-full items-end justify-end gap-[24px] ">
        <Button
          theme="Primary"
          type="Solid"
          size="M"
          fitContent
          showLeftIcon={false}
          showRightIcon={false}
          className="shrink-0"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          Cambiar contraseña
        </Button>
      </div>
    </div>
  );
}
