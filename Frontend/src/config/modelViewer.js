import "@google/model-viewer";
import "@google/model-viewer-effects";

const ModelViewerElement = customElements.get("model-viewer");
const baseUrl = String(import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");

if (ModelViewerElement && !ModelViewerElement.meshoptDecoderLocation) {
  ModelViewerElement.meshoptDecoderLocation =
    `${baseUrl}meshopt-decoder-bootstrap.js`;
}
