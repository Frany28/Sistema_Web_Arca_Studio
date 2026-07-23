import {
  createDocumentCommentRecord,
  listDocumentComments,
} from "../repositories/projectCommentRepository.js";

export function createDocumentComment(input) {
  return createDocumentCommentRecord(input);
}

export function getDocumentComments(input) {
  return listDocumentComments(input);
}
