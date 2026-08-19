const INTERNAL_ROLE_CODES = new Set([
  "admin",
  "architect",
  "employee",
  "staff",
  "collaborator",
]);

const CLIENT_FALLBACK_THEMES = ["Brand 1", "Neutral"];

function normalizeRoleCode(value) {
  return String(value || "").trim().toLocaleLowerCase("en");
}

export function getAvatarInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

function getStableThemeIndex(identity) {
  const value = String(identity || "cliente");
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.codePointAt(0)) >>> 0;
  }

  return hash % CLIENT_FALLBACK_THEMES.length;
}

export function getAvatarPresentation({
  identity,
  name,
  roleCode,
  src,
} = {}) {
  const imageSrc = String(src || "").trim();
  const initials = getAvatarInitials(name);
  const isInternalUser = INTERNAL_ROLE_CODES.has(normalizeRoleCode(roleCode));

  if (imageSrc) {
    return {
      content: "Image",
      initials,
      src: imageSrc,
      theme: isInternalUser
        ? "Neutral"
        : CLIENT_FALLBACK_THEMES[getStableThemeIndex(identity || name)],
    };
  }

  if (isInternalUser && initials) {
    return {
      content: "Text",
      initials,
      src: "",
      theme: "Neutral",
    };
  }

  return {
    content: "Icon",
    initials: "",
    src: "",
    theme: CLIENT_FALLBACK_THEMES[getStableThemeIndex(identity || name)],
  };
}
