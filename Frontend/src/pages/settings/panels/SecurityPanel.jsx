import Input from "../../../components/ui/Input/Input.jsx";

export default function SecurityPanel({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordRequirements,
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-4">
      <div className="flex w-[664px] max-w-full items-start gap-[24px] border-b border-[var(--color-neutral-200)] pb-[16px]">
        <Input
          label="Contrasena actual"
          required={false}
          information={false}
          showLabelInfo={false}
          showHint={false}
          size="S"
          type="Password"
          state={currentPassword ? "Filled" : "Default"}
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className="w-[320px] max-w-none"
        />
        <div className="w-[320px]" />
      </div>

      <div className="flex w-[664px] max-w-full items-start gap-[24px] pb-[16px]">
        <Input
          label="Nueva contrasena"
          required={false}
          information={false}
          showLabelInfo={false}
          showHint={false}
          size="S"
          type="Password"
          state={newPassword ? "Filled" : "Default"}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          showPasswordStrength
          passwordRequirements={passwordRequirements}
          passwordHintTitle="Debe contener al menos;"
          className="w-[320px] max-w-none"
        />
        <Input
          label="Confirmar contrasena"
          required={false}
          information={false}
          showLabelInfo={false}
          showHint={false}
          size="S"
          type="Password"
          state={confirmPassword ? "Filled" : "Default"}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-[320px] max-w-none"
        />
      </div>
    </div>
  );
}
