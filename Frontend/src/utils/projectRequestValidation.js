export const PROJECT_REQUEST_REQUIRED_FIELDS = [
  "projectName",
  "projectType",
  "location",
  "developmentMode",
  "investmentRange",
  "capitalAvailability",
  "startTime",
];

export function getProjectRequestRequiredFieldErrors(values = {}) {
  return PROJECT_REQUEST_REQUIRED_FIELDS.reduce((errors, field) => {
    if (!String(values[field] ?? "").trim()) {
      errors[field] = true;
    }

    return errors;
  }, {});
}
