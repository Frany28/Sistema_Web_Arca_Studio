import { useId, useState } from "react";
import clsx from "clsx";
import Label from "../Label/Label.jsx";
import HintText from "../HintText/HintText.jsx";
import {
  TEXT_AREA_INTERACTIVE_STYLES,
  TEXT_AREA_STATE_STYLES,
} from "./textAreaConfig.js";

function hasTextValue(value) {
  if (value == null) {
    return false;
  }

  return String(value).trim().length > 0;
}

function ResizeHandleIcon({ className }) {
  return (
    <svg
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2.2 7.1L7.1 2.2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M4.7 7.1L7.1 4.7"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TextArea({
  className,
  id,
  label = "Description",
  hintText = "Texto de ayuda para los usuarios",
  placeholder = "Texto de prueba",
  state = "Default",
  showLabel = true,
  showHint = true,
  showLabelInfo = true,
  required = false,
  disabled = false,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  rows = 5,
  minHeight = 130,
  resize = false,
  textareaClassName,
  style,
  ...props
}) {
  const generatedId = useId();
  const textAreaId = id ?? generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const isFilled = hasTextValue(currentValue);
  const baseState = disabled ? "Disabled" : state;
  const resolvedState =
    baseState === "Default"
      ? isFocused
        ? "Focused"
        : isFilled
          ? "Filled"
          : "Default"
      : baseState;
  const styles = TEXT_AREA_STATE_STYLES[resolvedState] ?? TEXT_AREA_STATE_STYLES.Default;

  const handleChange = (event) => {
    if (!isControlled) {
      setInternalValue(event.target.value);
    }

    onChange?.(event);
  };

  return (
    <div
      className={clsx("flex w-full max-w-[294px] flex-col items-start gap-[8px]", className)}
      style={style}
    >
      {showLabel ? (
        <Label
          htmlFor={textAreaId}
          label={label}
          required={required}
          information={showLabelInfo}
          state={styles.labelState}
        />
      ) : null}

      <div
        className={clsx(
          "relative flex w-full overflow-hidden rounded-[var(--radius-2)] transition-[border-color,box-shadow,background-color] duration-150",
          styles.shell,
          baseState === "Default" && !disabled && TEXT_AREA_INTERACTIVE_STYLES,
        )}
      >
        <div
          className={clsx(
            "relative flex min-h-px min-w-px flex-1 rounded-[inherit] px-[16px] py-[12px]",
            styles.field,
          )}
        >
          <textarea
            id={textAreaId}
            disabled={disabled}
            value={currentValue}
            placeholder={placeholder}
            rows={rows}
            className={clsx(
              "text-body-3 min-h-[var(--textarea-min-height)] w-full flex-1 border-0 bg-transparent p-0 tracking-[-0.5px] outline-none",
              resize ? "resize-y" : "resize-none",
              disabled ? "cursor-not-allowed" : "cursor-text",
              styles.text,
              textareaClassName,
            )}
            style={{ "--textarea-min-height": `${minHeight}px` }}
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

          <span
            className={clsx(
              "pointer-events-none absolute bottom-[12px] right-[12px] inline-flex size-[8px] items-center justify-center",
              styles.handle,
            )}
          >
            <ResizeHandleIcon className="size-[8px]" />
          </span>
        </div>
      </div>

      {showHint ? (
        <HintText state={styles.hintState} hintText={hintText} className="w-full" />
      ) : null}
    </div>
  );
}

export default TextArea;
