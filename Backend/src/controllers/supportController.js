import {
  createSupportRequestForUser,
  findSupportRequestForUpload,
  uploadSupportRequestFile,
} from "../repositories/supportRepository.js";
import { runUpload, uploadPolicies } from "../services/fileUploadService.js";

const MAX_SUPPORT_SUBJECT_LENGTH = 150;
const MAX_SUPPORT_DESCRIPTION_LENGTH = 5000;
export async function createSupportRequest(req, res, next) {
  try {
    const subject = String(req.body?.subject || "").trim();
    const description = String(req.body?.description || "").trim();
    const issueType = String(req.body?.issueType || "").trim();

    if (!subject || subject.length > MAX_SUPPORT_SUBJECT_LENGTH) {
      res.status(400).json({
        code: "INVALID_SUPPORT_SUBJECT",
        message: `El asunto es obligatorio y no puede superar ${MAX_SUPPORT_SUBJECT_LENGTH} caracteres.`,
      });
      return;
    }

    if (!description || description.length > MAX_SUPPORT_DESCRIPTION_LENGTH) {
      res.status(400).json({
        code: "INVALID_SUPPORT_DESCRIPTION",
        message: `La descripcion es obligatoria y no puede superar ${MAX_SUPPORT_DESCRIPTION_LENGTH} caracteres.`,
      });
      return;
    }

    const supportRequest = await createSupportRequestForUser({
      description,
      issueType,
      subject,
      user: req.user,
    });

    res.status(201).json({ supportRequest });
  } catch (error) {
    next(error);
  }
}

export async function uploadSupportRequestAttachment(req, res, next) {
  try {
    const supportRequestId = Number(req.params.supportRequestId);

    if (!Number.isInteger(supportRequestId) || supportRequestId <= 0) {
      res.status(400).json({
        code: "INVALID_SUPPORT_REQUEST_ID",
        message: "La solicitud de soporte no es valida.",
      });
      return;
    }

    const supportRequest = await findSupportRequestForUpload(
      supportRequestId,
      req.user,
    );

    if (!supportRequest) {
      res.status(404).json({
        code: "SUPPORT_REQUEST_NOT_FOUND",
        message: "No se encontro la solicitud de soporte.",
      });
      return;
    }

    const file = await runUpload({ req, policy: uploadPolicies.document, operation: (upload) => uploadSupportRequestFile({ ...upload, supportRequestId, user: req.user }) });

    res.status(201).json({ file });
  } catch (error) {
    next(error);
  }
}
