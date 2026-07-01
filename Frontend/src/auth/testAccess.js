// Temporary testing switch: set to false to restore route auth guards.
export const ROUTE_AUTH_DISABLED_FOR_TESTS = true;

export const TEST_AUTH_USER = {
  clientId: null,
  email: "pruebas@arca.local",
  firstName: "Usuario",
  id: 1,
  lastName: "Pruebas",
  name: "Usuario Pruebas",
  permissionCodes: ["projects.read", "projects.publish"],
  phone: "",
  profilePhotoUrl: "",
  role: "admin",
  roleDetails: {
    code: "admin",
    id: 1,
    name: "Administrador",
  },
  status: "active",
};
