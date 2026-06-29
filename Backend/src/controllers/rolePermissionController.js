import {
  getRolePermissionBoundary,
  getRolePermissionBoundaries,
  listPermissions,
  listRoles,
  replaceRolePermissions,
} from "../repositories/rolePermissionRepository.js";

function parseIncludeInactive(value) {
  return String(value || "").trim().toLowerCase() === "true";
}

export async function getRoles(_req, res, next) {
  try {
    const roles = await listRoles();

    res.status(200).json({ roles });
  } catch (error) {
    next(error);
  }
}

export async function getPermissions(req, res, next) {
  try {
    const permissions = await listPermissions({
      includeInactive: parseIncludeInactive(req.query?.includeInactive),
    });

    res.status(200).json({ permissions });
  } catch (error) {
    next(error);
  }
}

export async function getRolePermissionMatrix(req, res, next) {
  try {
    const roles = await getRolePermissionBoundaries({
      includeInactive: parseIncludeInactive(req.query?.includeInactive),
    });

    res.status(200).json({
      roles,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRolePermissions(req, res, next) {
  try {
    const roleCode = String(req.params?.roleCode || "").trim();
    const role = await getRolePermissionBoundary(roleCode);

    if (!role) {
      res.status(404).json({
        code: "ROLE_NOT_FOUND",
        message: "Rol no encontrado.",
      });
      return;
    }

    res.status(200).json({ role });
  } catch (error) {
    next(error);
  }
}

export async function updateRolePermissions(req, res, next) {
  try {
    const roleCode = String(req.params?.roleCode || "").trim();
    const permissionCodes = req.body?.permissionCodes;

    if (!Array.isArray(permissionCodes)) {
      res.status(400).json({
        code: "INVALID_PERMISSION_CODES",
        message: "permissionCodes debe ser un arreglo de códigos de permiso.",
      });
      return;
    }

    const result = await replaceRolePermissions(roleCode, permissionCodes);

    if (result.error === "ROLE_NOT_FOUND") {
      res.status(404).json({
        code: "ROLE_NOT_FOUND",
        message: "Rol no encontrado.",
      });
      return;
    }

    if (result.error === "PERMISSIONS_NOT_FOUND") {
      res.status(400).json({
        code: "PERMISSIONS_NOT_FOUND",
        message: "Uno o más permisos no existen o no están activos.",
        missingPermissionCodes: result.missingPermissionCodes,
      });
      return;
    }

    res.status(200).json({
      role: result.boundary,
    });
  } catch (error) {
    next(error);
  }
}
