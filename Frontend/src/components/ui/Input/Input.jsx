import { useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import Flag from "../../Flag.jsx";
import Tag from "../Tag/Tag.jsx";
import Label from "../Label/Label.jsx";
import HintText from "../HintText/HintText.jsx";
import {
  INPUT_INTERACTIVE_STYLES,
  INPUT_SIZE_STYLES,
  INPUT_STATE_STYLES,
  INPUT_TAG_DEFAULT_ITEMS,
  INPUT_TYPES,
  PHONE_COUNTRY_OPTIONS,
  PASSWORD_REQUIREMENT_RULES,
} from "./inputConfig.js";

function UserIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 10C11.933 10 13.5 8.433 13.5 6.5C13.5 4.567 11.933 3 10 3C8.067 3 6.5 4.567 6.5 6.5C6.5 8.433 8.067 10 10 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4.16669 16.1667C4.16669 13.8667 6.78335 12 10 12C13.2167 12 15.8334 13.8667 15.8334 16.1667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9.58335 15.8333C13.0351 15.8333 15.8334 13.0351 15.8334 9.58333C15.8334 6.13155 13.0351 3.33333 9.58335 3.33333C6.13157 3.33333 3.33335 6.13155 3.33335 9.58333C3.33335 13.0351 6.13157 15.8333 9.58335 15.8333Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.6667 16.6667L15 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5.83331 8.33333V6.66667C5.83331 4.36548 7.69879 2.5 9.99998 2.5C12.3012 2.5 14.1666 4.36548 14.1666 6.66667V8.33333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="4.16669"
        y="8.33333"
        width="11.6667"
        height="8.33333"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function EyeIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12.1083 10C12.1083 11.1646 11.1646 12.1083 10 12.1083C8.83538 12.1083 7.89166 11.1646 7.89166 10C7.89166 8.83537 8.83538 7.89166 10 7.89166C11.1646 7.89166 12.1083 8.83537 12.1083 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M17.2417 9.99999C16.275 12.9167 13.4167 15 10 15C6.58337 15 3.72504 12.9167 2.75837 9.99999C3.72504 7.08332 6.58337 5 10 5C13.4167 5 16.275 7.08332 17.2417 9.99999Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39762 14.6024 1.66666 10 1.66666C5.39763 1.66666 1.66667 5.39762 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7.57501 7.50001C7.77085 6.94384 8.15715 6.4749 8.66546 6.17783C9.17377 5.88076 9.77094 5.77475 10.3499 5.87864C10.9289 5.98253 11.4525 6.28952 11.8282 6.74544C12.2038 7.20137 12.4074 7.77594 12.4025 8.36816C12.4025 10.0417 9.89168 10.8333 9.89168 10.8333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14.1667H10.0083"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaymentBadge({ className, brand = "VISA" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-[4px] border font-semibold tracking-[0.5px]",
        "border-[#E1E4EA] bg-white text-[#1A1F71]",
        "dark:border-[var(--color-neutral-300)] dark:bg-[var(--color-neutral-200)] dark:text-[var(--color-neutral-1000)]",
        className,
      )}
      aria-hidden="true"
    >
      {brand}
    </span>
  );
}

function getDefaultLeftIcon(type) {
  if (type === "Search bar") {
    return <SearchIcon className="size-5" />;
  }

  if (type === "Password") {
    return <LockIcon className="size-5" />;
  }

  return <UserIcon className="size-5" />;
}

function getDefaultRightIcon(type, passwordVisible) {
  if (type === "Password") {
    return <EyeIcon className="size-5" data-visible={passwordVisible} />;
  }

  if (type === "Search bar" || type === "Tags") {
    return null;
  }

  return <HelpIcon className="size-5" />;
}

function hasTextValue(value) {
  if (value == null) {
    return false;
  }

  return String(value).trim().length > 0;
}

function getPhoneDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function normalizeDialCode(value) {
  const digits = getPhoneDigits(value);

  if (!digits) {
    return "+";
  }

  return `+${digits}`;
}

function formatPhoneNumber(value, option) {
  const digits = getPhoneDigits(value);
  const mask = option?.mask ?? "(###) ####-####";

  if (!digits) {
    return "";
  }

  let digitIndex = 0;
  let output = "";

  for (const character of mask) {
    if (character === "#") {
      if (digitIndex >= digits.length) {
        break;
      }

      output += digits[digitIndex];
      digitIndex += 1;
      continue;
    }

    if (digitIndex < digits.length) {
      output += character;
    }
  }

  return output;
}

function Input({
  className,
  id,
  label = "Label",
  hintText = "Texto de ayuda para los usuarios",
  placeholder,
  size = "S",
  state = "Default",
  type = "Default input",
  showLabel = true,
  showHint = true,
  showLeftIcon = true,
  showRightIcon = true,
  showLabelInfo = true,
  required = true,
  leftIcon = null,
  rightIcon = null,
  paymentIcon = false,
  paymentBrand = "VISA",
  countryCode = "US",
  countryPrefix = "+1",
  phoneOptions = PHONE_COUNTRY_OPTIONS,
  tags = INPUT_TAG_DEFAULT_ITEMS,
  showPasswordStrength = false,
  passwordRequirements,
  passwordHintTitle,
  disabled = false,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  onClickRightIcon,
  inputClassName,
  style,
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [isPhoneMenuOpen, setIsPhoneMenuOpen] = useState(false);
  const [selectedPhoneOption, setSelectedPhoneOption] = useState(() => {
    const preferredByCountry = phoneOptions.find(
      (option) => option.countryCode === countryCode,
    );
    const fallbackByPrefix = phoneOptions.find(
      (option) => option.dialCode === countryPrefix,
    );

    return (
      preferredByCountry ??
      fallbackByPrefix ??
      phoneOptions[0]
    );
  });
  const [phonePrefixValue, setPhonePrefixValue] = useState(() =>
    normalizeDialCode(countryPrefix || phoneOptions[0]?.dialCode),
  );
  const phoneMenuRef = useRef(null);

  const resolvedSize = INPUT_SIZE_STYLES[size] ? size : "S";
  const resolvedType = INPUT_TYPES[type] ? type : "Default input";
  const baseState = disabled ? "Disabled" : state;
  const resolvedState =
    baseState === "Default" && isFocused ? "Focused" : baseState;
  const stateStyles = INPUT_STATE_STYLES[resolvedState];
  const sizing = INPUT_SIZE_STYLES[resolvedSize];
  const typeConfig = INPUT_TYPES[resolvedType];
  const isControlled = value !== undefined;
  const fieldValue = isControlled ? value : internalValue;

  const currentValue = fieldValue ?? "";
  const isFilled = hasTextValue(currentValue) || resolvedState === "Filled";
  const showTags = resolvedType === "Tags" && tags?.length > 0;
  const resolvedPhoneOption = selectedPhoneOption ?? phoneOptions[0];
  const normalizedPhonePrefix = normalizeDialCode(phonePrefixValue);
  const filteredPhoneOptions =
    resolvedType === "Phone number"
      ? phoneOptions.filter((option) => {
          const optionDigits = getPhoneDigits(option.dialCode);
          const prefixDigits = getPhoneDigits(normalizedPhonePrefix);

          if (!prefixDigits) {
            return true;
          }

          return optionDigits.startsWith(prefixDigits);
        })
      : phoneOptions;
  const resolvedPlaceholder =
    resolvedType === "Phone number"
      ? placeholder ?? resolvedPhoneOption?.placeholder ?? typeConfig.placeholder
      : placeholder ?? typeConfig.placeholder;

  const inputType = useMemo(() => {
    if (resolvedType !== "Password") {
      return typeConfig.inputType;
    }

    return passwordVisible ? "text" : "password";
  }, [passwordVisible, resolvedType, typeConfig.inputType]);

  const leadingIcon = leftIcon ?? getDefaultLeftIcon(resolvedType);
  const trailingIcon =
    rightIcon ?? getDefaultRightIcon(resolvedType, passwordVisible);
  const passwordRequirementItems =
    resolvedType === "Password" && showPasswordStrength
      ? (passwordRequirements ?? PASSWORD_REQUIREMENT_RULES).map(
          (requirement) => ({
            label: requirement.label,
            met: requirement.test ? requirement.test(String(currentValue)) : false,
          }),
        )
      : passwordRequirements;
  const passwordProgressCount = Array.isArray(passwordRequirementItems)
    ? passwordRequirementItems.filter((item) => item.met).length
    : 0;
  const passwordStrengthState = disabled
    ? "Disabled"
    : passwordProgressCount === 0
      ? "Default"
      : passwordProgressCount >= (passwordRequirementItems?.length ?? 0)
        ? "Success"
        : passwordProgressCount >= 2
          ? "Warning"
          : "Error";

  const handleRightIconClick = () => {
    if (resolvedType === "Password" && !disabled) {
      setPasswordVisible((current) => !current);
    }

    onClickRightIcon?.();
  };

  const handleChange = (event) => {
    if (resolvedType === "Phone number") {
      const formattedValue = formatPhoneNumber(
        event.target.value,
        resolvedPhoneOption,
      );

      if (!isControlled) {
        setInternalValue(formattedValue);
      }

      event.target.value = formattedValue;
      onChange?.(event);
      return;
    }

    if (!isControlled) {
      setInternalValue(event.target.value);
    }

    onChange?.(event);
  };

  useEffect(() => {
    if (!isPhoneMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!phoneMenuRef.current?.contains(event.target)) {
        setIsPhoneMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isPhoneMenuOpen]);

  const content = (
    <div
      className={clsx(
        "flex w-full items-center rounded-[var(--radius-2)] transition-[border-color,box-shadow,background-color] duration-150",
        resolvedType === "Phone number" ? "overflow-visible" : "overflow-hidden",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        sizing.shell,
        stateStyles.shell,
        baseState === "Default" && !disabled && INPUT_INTERACTIVE_STYLES,
      )}
    >
      {resolvedType === "Phone number" ? (
        <>
          <div
            ref={phoneMenuRef}
            className="relative"
          >
            <div
              className={clsx(
                "flex shrink-0 items-center gap-[8px] rounded-[inherit] border-r border-[var(--color-neutral-200)]",
                disabled ? "cursor-not-allowed" : "cursor-pointer",
                sizing.phonePrefix,
                stateStyles.contentBorder,
              )}
            >
              <Flag
                countryCode={resolvedPhoneOption.countryCode}
                size="20px"
                title={resolvedPhoneOption.label}
                useSvg
                loading="lazy"
              />
              <input
                type="text"
                value={normalizedPhonePrefix}
                disabled={disabled}
                className={clsx(
                  "text-body-3 w-[44px] border-0 bg-transparent tracking-[0px] outline-none",
                  disabled ? "cursor-not-allowed" : "cursor-text",
                  stateStyles.prefix,
                )}
                onFocus={() => {
                  if (!disabled) {
                    setIsPhoneMenuOpen(true);
                  }
                }}
                onChange={(event) => {
                  const nextPrefix = normalizeDialCode(event.target.value);
                  setPhonePrefixValue(nextPrefix);
                  const exactMatch = phoneOptions.find(
                    (option) => option.dialCode === nextPrefix,
                  );

                  if (exactMatch) {
                    setSelectedPhoneOption(exactMatch);

                    if (!isControlled) {
                      setInternalValue((current) =>
                        formatPhoneNumber(current, exactMatch),
                      );
                    }
                  }

                  if (!disabled) {
                    setIsPhoneMenuOpen(true);
                  }
                }}
                aria-label="Codigo de pais"
              />
              <button
                type="button"
                className={clsx(
                  "inline-flex size-5 items-center justify-center",
                  disabled ? "cursor-not-allowed" : "cursor-pointer",
                  stateStyles.trailingIcon,
                )}
                onClick={() => {
                  if (!disabled) {
                    setIsPhoneMenuOpen((current) => !current);
                  }
                }}
                disabled={disabled}
                aria-label="Mostrar sugerencias de pais"
                aria-expanded={isPhoneMenuOpen}
              >
                <ChevronDownIcon className="size-5" />
              </button>
            </div>

            {isPhoneMenuOpen ? (
              <div className="absolute left-0 top-[calc(100%+8px)] z-20 flex min-w-[190px] flex-col overflow-hidden rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] shadow-[0px_8px_24px_rgba(27,28,29,0.08)]">
                {filteredPhoneOptions.map((option) => (
                  <button
                    key={`${option.countryCode}-${option.dialCode}`}
                    type="button"
                    className={clsx(
                      "flex items-center gap-[8px] px-3 py-2 text-left transition-colors",
                      option.countryCode === resolvedPhoneOption.countryCode &&
                        option.dialCode === resolvedPhoneOption.dialCode
                        ? "bg-[var(--color-neutral-200)]"
                        : "hover:bg-[var(--color-neutral-200)]",
                    )}
                    onClick={() => {
                      setSelectedPhoneOption(option);
                      setPhonePrefixValue(option.dialCode);
                      if (resolvedType === "Phone number") {
                        const reformattedValue = formatPhoneNumber(
                          currentValue,
                          option,
                        );

                        if (!isControlled) {
                          setInternalValue(reformattedValue);
                        }
                      }
                      setIsPhoneMenuOpen(false);
                    }}
                  >
                    <Flag
                      countryCode={option.countryCode}
                      size="20px"
                      title={option.label}
                      useSvg
                      loading="lazy"
                    />
                    <span className="text-body-3 text-[var(--color-text-300)]">
                      {option.dialCode}
                    </span>
                    <span className="text-body-4 text-[var(--color-text-200)]">
                      {option.label}
                    </span>
                  </button>
                ))}
                {filteredPhoneOptions.length === 0 ? (
                  <div className="px-3 py-2 text-body-4 text-[var(--color-text-100)]">
                    Sin coincidencias
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div
            className={clsx(
              "flex min-w-0 flex-1 items-center gap-[8px] rounded-[inherit]",
              sizing.field,
              stateStyles.contentBorder,
            )}
          >
            <input
              id={inputId}
              type={inputType}
              disabled={disabled}
              value={fieldValue}
              placeholder={resolvedPlaceholder}
                className={clsx(
                  "text-body-3 min-w-0 flex-1 border-0 bg-transparent tracking-[-0.5px] outline-none",
                  disabled ? "cursor-not-allowed" : "cursor-text",
                  stateStyles.inputText,
                  stateStyles.placeholder,
                inputClassName,
              )}
              onFocus={(event) => {
                setIsFocused(true);
                onFocus?.(event);
              }}
              onBlur={(event) => {
                setIsFocused(false);
                onBlur?.(event);
              }}
              onChange={handleChange}
              {...props}
            />
            {showRightIcon && trailingIcon ? (
              <button
                type="button"
                className={clsx(
                  "inline-flex size-5 shrink-0 items-center justify-center",
                  stateStyles.trailingIcon,
                  disabled ? "cursor-not-allowed" : "cursor-pointer",
                )}
                onClick={handleRightIconClick}
                disabled={disabled}
                aria-label="Accion del campo"
              >
                {trailingIcon}
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <div
          className={clsx(
            "flex min-w-0 flex-1 items-center gap-[8px] rounded-[inherit]",
            sizing.field,
            stateStyles.contentBorder,
          )}
        >
          {showLeftIcon && leadingIcon ? (
            <span
              className={clsx(
                "inline-flex size-5 shrink-0 items-center justify-center",
                stateStyles.leadingIcon,
              )}
            >
              {leadingIcon}
            </span>
          ) : null}

          {showTags ? (
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-[4px]">
              {tags.map((tag, index) => (
                <Tag
                  key={`${tag.label}-${index}`}
                  size={sizing.tagSize}
                  label={tag.label}
                  avatar={tag.avatar ?? true}
                  avatarText={tag.avatarText ?? "A"}
                  closeIcon={tag.closeIcon ?? true}
                  count={false}
                  className="max-w-full"
                />
              ))}
            </div>
          ) : (
            <input
              id={inputId}
              type={inputType}
              disabled={disabled}
              value={fieldValue}
              placeholder={resolvedPlaceholder}
              className={clsx(
                "text-body-3 min-w-0 flex-1 border-0 bg-transparent tracking-[-0.5px] outline-none",
                disabled ? "cursor-not-allowed" : "cursor-text",
                isFilled ? stateStyles.inputText : stateStyles.placeholder,
                stateStyles.placeholder,
                inputClassName,
              )}
              onFocus={(event) => {
                setIsFocused(true);
                onFocus?.(event);
              }}
              onBlur={(event) => {
                setIsFocused(false);
                onBlur?.(event);
              }}
              onChange={handleChange}
              {...props}
            />
          )}

          {paymentIcon ? (
            <PaymentBadge className={sizing.paymentBadge} brand={paymentBrand} />
          ) : null}

          {showRightIcon && trailingIcon ? (
            <button
              type="button"
              className={clsx(
                "inline-flex size-5 shrink-0 items-center justify-center",
                stateStyles.trailingIcon,
                disabled ? "cursor-not-allowed" : "cursor-pointer",
              )}
              onClick={handleRightIconClick}
              disabled={disabled}
              aria-label="Accion del campo"
            >
              {trailingIcon}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={clsx(
        "flex w-full max-w-[320px] flex-col items-start gap-[8px]",
        className,
      )}
      style={style}
    >
      {showLabel ? (
        <Label
          htmlFor={inputId}
          label={label}
          required={required}
          information={showLabelInfo}
          state={stateStyles.labelState}
        />
      ) : null}

      {content}

      {showHint ? (
        <HintText
          state={stateStyles.hintState}
          hintText={hintText}
          className="w-full"
        />
      ) : null}

      {showPasswordStrength ? (
        <HintText
          type="Password"
          state={passwordStrengthState}
          passwordTitle={passwordHintTitle}
          requirements={passwordRequirementItems}
          passwordProgress={passwordProgressCount}
          className="w-full"
        />
      ) : null}
    </div>
  );
}

export default Input;
