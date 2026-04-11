export const fileAttachmentIconsShowcaseItems = [
  "AI",
  "DOC",
  "GIF",
  "JPG",
  "MP4",
  "PDF",
  "PNG",
  "PPT",
  "PSD",
  "SVG",
  "TXT",
  "OBJ",
  "CAD",
  "SKP",
].map((type) => ({
  label: type === "CAD" ? "DWG" : type,
  type,
}));
