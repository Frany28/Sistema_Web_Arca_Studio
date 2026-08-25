export function updateDropdownCheckboxItems(items, selectedItemId, multiple) {
  return items.map((item) => ({
    ...item,
    checked: item.id === selectedItemId
      ? multiple && item.checked === "Yes"
        ? "No"
        : "Yes"
      : multiple
        ? item.checked ?? "No"
        : "No",
  }));
}
