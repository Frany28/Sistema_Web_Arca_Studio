export function resolveIconButtonTooltip({ ariaLabel, showText, tooltip }) {
  if (showText !== false) return null;

  const resolvedText = tooltip || ariaLabel;
  return typeof resolvedText === "string" && resolvedText.trim()
    ? resolvedText.trim()
    : null;
}
