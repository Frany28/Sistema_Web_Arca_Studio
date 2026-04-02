import rawPhoneCountryOptions from "./phoneCountryOptions.json";

const PHONE_MASK_OVERRIDES = {
  US: { mask: "(###) ####-####", placeholder: "(444) 1234-5678" },
  CA: { mask: "(###) ####-####", placeholder: "(416) 1234-5678" },
  VE: { mask: "(###) ###-####", placeholder: "(412) 123-4567" },
  CO: { mask: "(###) ###-####", placeholder: "(300) 123-4567" },
  MX: { mask: "(##) ####-####", placeholder: "(55) 1234-5678" },
  AR: { mask: "(##) ####-####", placeholder: "(11) 1234-5678" },
  ES: { mask: "### ### ###", placeholder: "612 345 678" },
  BR: { mask: "(##) #####-####", placeholder: "(11) 91234-5678" },
  CL: { mask: "# #### ####", placeholder: "9 1234 5678" },
  PE: { mask: "### ### ###", placeholder: "912 345 678" },
};

function createDefaultPhonePresentation(dialCode) {
  const digits = String(dialCode ?? "").replace(/\D/g, "");

  if (digits.length <= 1) {
    return {
      mask: "(###) ####-####",
      placeholder: "(444) 1234-5678",
    };
  }

  if (digits.length === 2) {
    return {
      mask: "(###) ###-####",
      placeholder: "(412) 123-4567",
    };
  }

  return {
    mask: "### ### ###",
    placeholder: "123 456 789",
  };
}

export const PHONE_COUNTRY_OPTIONS = rawPhoneCountryOptions
  .map((item) => {
    const normalizedCode = String(item.code ?? "").trim().toUpperCase();
    const override = PHONE_MASK_OVERRIDES[normalizedCode];
    const defaults = createDefaultPhonePresentation(item.dial_code);

    return {
      countryCode: normalizedCode,
      dialCode: item.dial_code,
      label: String(item.name ?? "").trim(),
      mask: override?.mask ?? defaults.mask,
      placeholder: override?.placeholder ?? defaults.placeholder,
    };
  })
  .filter((item) => item.countryCode && item.dialCode && item.label);

export default PHONE_COUNTRY_OPTIONS;
