import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSupabaseS3Client, getSupabaseStorageConfig } from "../config/storage.js";

class S3ObjectStorage {
    /**
   * Obtiene la configuración activa del adaptador de almacenamiento de objetos.
   * Mantiene los detalles del proveedor fuera de los servicios consumidores.
   *
   * @returns {unknown} Resultado producido por la operación.
   * @throws {Error} Cuando una validación o dependencia impide completar la operación.
   */
config() {
    const config = getSupabaseStorageConfig();
    if (!config.bucket) throw new Error("SUPABASE_STORAGE_BUCKET is required");
    return config;
  }

    /**
   * Elimina un objeto identificado por su clave del proveedor configurado.
   * Encapsula los comandos del SDK para evitar acoplar al resto del backend.
   *
   * @param {string} key - Valor de `key` requerido por esta operación.
   * @returns {unknown} Resultado producido por la operación.
   */
delete(key) {
    const { bucket } = this.config();
    return getSupabaseS3Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

    /**
   * Recupera un objeto, completo o por rango, desde el proveedor configurado.
   * Encapsula los comandos del SDK para evitar acoplar al resto del backend.
   *
   * @param {string} key - Valor de `key` requerido por esta operación.
   * @param {object} [options] - Opciones agrupadas necesarias para ejecutar la operación.
   * @param {string} options.range - Valor de `options.range` requerido por esta operación.
   * @returns {unknown} Resultado producido por la operación.
   */
get(key, { range } = {}) {
    const { bucket } = this.config();
    return getSupabaseS3Client().send(new GetObjectCommand({ Bucket: bucket, Key: key, Range: range || undefined }));
  }

    /**
   * Almacena un flujo o contenido en el proveedor S3 compatible.
   * Encapsula los comandos del SDK para evitar acoplar al resto del backend.
   *
   * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
   * @param {unknown} options.body - Valor de `options.body` requerido por esta operación.
   * @param {number} options.contentLength - Valor de `options.contentLength` requerido por esta operación.
   * @param {string} options.contentType - Valor de `options.contentType` requerido por esta operación.
   * @param {string} options.key - Valor de `options.key` requerido por esta operación.
   * @param {unknown} options.metadata - Valor de `options.metadata` requerido por esta operación.
   * @returns {unknown} Resultado producido por la operación.
   */
put({ body, contentLength, contentType, key, metadata }) {
    const { bucket } = this.config();
    return getSupabaseS3Client().send(new PutObjectCommand({
      Body: body, Bucket: bucket, ContentLength: contentLength, ContentType: contentType, Key: key, Metadata: metadata,
    }));
  }
}

export const objectStorage = new S3ObjectStorage();
