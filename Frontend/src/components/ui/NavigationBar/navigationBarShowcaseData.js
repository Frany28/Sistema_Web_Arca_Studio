import {
  createNavigationBarProps,
  createNavigationBarShowcaseItem,
} from "./navigationBarConfig.js";

export const navigationBarMainComponent = createNavigationBarProps({
  activeIndex: -1,
  defaultActiveIndex: -1,
});

export const navigationBarMobileComponent = createNavigationBarProps({
  variant: "mobile",
  showContactButton: false,
  showLoginButton: false,
});

export const navigationBarUtilityComponent = createNavigationBarProps({
  variant: "utility",
  showContactButton: false,
  showLoginButton: false,
  utilityText: "Lunes, 23 de Marzo",
});

export const navigationBarQuickToggleItems = [
  createNavigationBarShowcaseItem("Desktop", {}),
  createNavigationBarShowcaseItem("Mobile", {
    variant: "mobile",
    showContactButton: false,
    showLoginButton: false,
  }),
  createNavigationBarShowcaseItem("Utility", {
    variant: "utility",
    showContactButton: false,
    showLoginButton: false,
    utilityText: "Lunes, 23 de Marzo",
  }),
  createNavigationBarShowcaseItem("Sin botón contacto", {
    showContactButton: false,
  }),
  createNavigationBarShowcaseItem("Sin botón login", {
    showLoginButton: false,
  }),
  createNavigationBarShowcaseItem("Con item activo", {
    activeIndex: 0,
  }),
];
