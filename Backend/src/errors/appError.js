export class AppError extends Error {
  constructor({ code, fields, message, status = 500, cause }) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.code = code;
    this.fields = fields;
    this.status = status;
    this.publicMessage = message;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Los datos enviados no son válidos.", fields) {
    super({ code: "VALIDATION_ERROR", fields, message, status: 400 });
  }
}

export class NotFoundError extends AppError {
  constructor(code, message) { super({ code, message, status: 404 }); }
}

export class ConflictError extends AppError {
  constructor(code, message, cause) { super({ code, message, status: 409, cause }); }
}

export function normalizeError(error) {
  if (error instanceof AppError) return error;
  if (error?.status && error?.publicMessage) return new AppError({ code: error.code || "REQUEST_ERROR", message: error.publicMessage, status: error.status, cause: error });
  if (error?.code === "23505") return new ConflictError("RESOURCE_CONFLICT", "El recurso ya existe o fue modificado simultáneamente.", error);
  if (error?.type === "entity.too.large") return new AppError({ code: "PAYLOAD_TOO_LARGE", message: "El contenido supera el tamaño permitido.", status: 413, cause: error });
  return new AppError({ code: error?.code || "INTERNAL_SERVER_ERROR", message: "Ocurrió un error inesperado.", status: error?.status || 500, cause: error });
}
