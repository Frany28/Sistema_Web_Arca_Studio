export const FOOTER_SECTION_DEFAULT_NAV_ITEMS = [
  "Proyectos Destacados",
  "Sobre Nosotros",
  "Nuestro Procesos",
  "Contacto",
];

export const FOOTER_SECTION_DEFAULT_SOCIAL_ITEMS = [
  { id: "instagram", label: "Instagram", icon: "instagram" },
  { id: "facebook", label: "Facebook", icon: "facebook" },
  { id: "tiktok", label: "TikTok", icon: "tiktok" },
  { id: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
  { id: "google", label: "Google", icon: "google" },
];

export const FOOTER_SECTION_DEFAULT_PROPS = {
  title: "Descubre nuevos proyectos y actualizaciones de nuestro estudio",
  emailPlaceholder: "Ingresa tu correo electrónico",
  buttonLabel: "Suscribirse",
  hintText: "Tu correo electrónico está seguro con nosotros.",
  navItems: FOOTER_SECTION_DEFAULT_NAV_ITEMS,
  activeNavIndex: -1,
  defaultActiveNavIndex: -1,
  socialItems: FOOTER_SECTION_DEFAULT_SOCIAL_ITEMS,
  copyrightText: "© 2026 ARCA Studio. Todos los derechos reservados.",
  variant: "desktop",
  "aria-label": "Footer section",
};

export function createFooterSectionProps(overrides = {}) {
  return {
    ...FOOTER_SECTION_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createFooterSectionShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createFooterSectionProps(overrides),
  };
}
