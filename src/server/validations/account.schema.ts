import { z } from "zod";

export const accountTypeEnum = z
  .enum(["checking", "savings", "business", "other"])
  .describe(
    "Type of bank account. 'checking' = day-to-day transactional account; 'savings' = interest-bearing deposit account; 'business' = account registered to a company entity; 'other' = any account that does not fit the above categories.",
  );

export const validateAccountNumberSchema = z
  .object({
    accountNumber: z
      .string()
      .min(8, "Account number must be at least 8 characters")
      .max(25, "Account number cannot exceed 25 characters")
      .regex(/^[0-9]+$/, "Account number must contain only numbers")
      .describe(
        "The bank account number. Must be 8–25 numeric digits with no spaces or dashes.",
      ),
    routingNumber: z
      .string()
      .min(9, "Routing number must be exactly 9 digits")
      .max(9, "Routing number must be exactly 9 digits")
      .regex(/^[0-9]+$/, "Routing number must contain only numbers")
      .optional()
      .describe(
        "9-digit ABA routing number used for US bank transfers (ACH/wire). Required when bankCountry is 'US'.",
      ),
    sortCode: z
      .string()
      .min(6, "Sort code must be exactly 6 digits")
      .max(6, "Sort code must be exactly 6 digits")
      .regex(/^[0-9]+$/, "Sort code must contain only numbers")
      .optional()
      .describe(
        "6-digit UK sort code identifying the bank branch. Required when bankCountry is 'GB'.",
      ),
    iban: z
      .string()
      .min(15, "IBAN must be at least 15 characters")
      .max(34, "IBAN cannot exceed 34 characters")
      .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/i, "Invalid IBAN format")
      .optional()
      .describe(
        "International Bank Account Number (ISO 13616). Starts with a 2-letter country code followed by 2 check digits and up to 30 alphanumeric characters. Required for most European countries.",
      ),
    swiftCode: z
      .string()
      .min(8, "SWIFT code must be 8 or 11 characters")
      .max(11, "SWIFT code must be 8 or 11 characters")
      .regex(/^[A-Z]{6}[A-Z0-9]{2,5}$/i, "Invalid SWIFT code format")
      .optional()
      .describe(
        "SWIFT/BIC code (8 or 11 characters) that uniquely identifies the bank for international wire transfers. Format: AAAABB CC DDD where AAAA = bank code, BB = country, CC = location, DDD = branch (optional).",
      ),
    bankName: z
      .string()
      .min(2, "Bank name is required")
      .max(255, "Bank name cannot exceed 255 characters")
      .describe("Full legal name of the financial institution."),
    accountType: accountTypeEnum,
    accountHolderName: z
      .string()
      .min(2, "Account holder name is required")
      .max(255, "Account holder name cannot exceed 255 characters")
      .describe(
        "Full legal name of the person or entity that owns the bank account. Must match the name on file with the bank.",
      ),
    bankAddress: z
      .string()
      .max(500, "Bank address cannot exceed 500 characters")
      .optional()
      .describe("Street address of the bank branch. Optional."),
    bankCity: z
      .string()
      .max(255, "Bank city cannot exceed 255 characters")
      .optional()
      .describe("City where the bank branch is located. Optional."),
    bankCountry: z
      .string()
      .min(2, "Bank country is required")
      .max(255, "Bank country cannot exceed 255 characters")
      .describe(
        "ISO 3166-1 alpha-2 country code of the bank (e.g. 'US', 'GB', 'DE'). Determines which additional fields (routingNumber, sortCode, IBAN) are required.",
      ),
  })
  .refine(
    (data) => {
      
      if (data.bankCountry === "US" && !data.routingNumber) {
        return false;
      }
      
      if (data.bankCountry === "GB" && !data.sortCode) {
        return false;
      }
      
      if (
        [
          "DE",
          "FR",
          "IT",
          "ES",
          "NL",
          "BE",
          "AT",
          "PT",
          "IE",
          "FI",
          "GR",
          "LU",
          "CY",
          "MT",
          "SI",
          "SK",
          "EE",
          "LV",
          "LT",
          "HR",
          "BG",
          "RO",
          "CZ",
          "HU",
          "PL",
          "DK",
          "SE",
          "NO",
        ].includes(data.bankCountry) &&
        !data.iban
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Required banking details are missing for the selected country",
      path: ["routingNumber"],
    },
  )
  .describe(
    "Validates bank account details submitted by an employee. Country-specific fields are conditionally required: routingNumber for US, sortCode for GB, and IBAN for supported European countries.",
  );

export const updateEmployeeAccountSchema = z
  .object({
    bankName: z
      .string()
      .min(2, "Bank name is required")
      .max(255)
      .optional()
      .describe("Full legal name of the financial institution to update."),
    accountNumber: z
      .string()
      .min(8, "Account number must be at least 8 characters")
      .max(25, "Account number cannot exceed 25 characters")
      .regex(/^[0-9]+$/, "Account number must contain only numbers")
      .optional()
      .describe(
        "Updated bank account number. Must be 8–25 numeric digits with no spaces or dashes.",
      ),
    routingNumber: z
      .string()
      .min(9, "Routing number must be exactly 9 digits")
      .max(9, "Routing number must be exactly 9 digits")
      .regex(/^[0-9]+$/, "Routing number must contain only numbers")
      .optional()
      .describe(
        "Updated 9-digit ABA routing number. Applicable for US bank accounts only.",
      ),
    sortCode: z
      .string()
      .min(6, "Sort code must be exactly 6 digits")
      .max(6, "Sort code must be exactly 6 digits")
      .regex(/^[0-9]+$/, "Sort code must contain only numbers")
      .optional()
      .describe(
        "Updated 6-digit UK sort code. Applicable for GB bank accounts only.",
      ),
    iban: z
      .string()
      .min(15, "IBAN must be at least 15 characters")
      .max(34, "IBAN cannot exceed 34 characters")
      .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/i, "Invalid IBAN format")
      .optional()
      .describe(
        "Updated International Bank Account Number (ISO 13616). Applicable for European bank accounts.",
      ),
    swiftCode: z
      .string()
      .min(8, "SWIFT code must be 8 or 11 characters")
      .max(11, "SWIFT code must be 8 or 11 characters")
      .regex(/^[A-Z]{6}[A-Z0-9]{2,5}$/i, "Invalid SWIFT code format")
      .optional()
      .describe(
        "Updated SWIFT/BIC code (8 or 11 characters) for international wire transfers.",
      ),
    accountType: accountTypeEnum.optional(),
    accountHolderName: z
      .string()
      .min(2, "Account holder name is required")
      .max(255)
      .optional()
      .describe(
        "Updated legal name of the account holder. Must match name on file with the bank.",
      ),
    bankAddress: z
      .string()
      .max(500)
      .optional()
      .describe("Updated street address of the bank branch."),
    bankCity: z
      .string()
      .max(255)
      .optional()
      .describe("Updated city where the bank branch is located."),
    bankCountry: z
      .string()
      .min(2, "Bank country is required")
      .max(255)
      .optional()
      .describe(
        "Updated ISO 3166-1 alpha-2 country code of the bank (e.g. 'US', 'GB', 'DE').",
      ),
  })
  .describe(
    "Partial update schema for an employee's bank account. All fields are optional — only supply the fields that need to change.",
  );

export const verifyAccountSchema = z
  .object({
    employeeId: z
      .string()
      .uuid("Invalid employee ID")
      .describe(
        "UUID of the employee whose bank account is being verified. Must be a valid UUID v4.",
      ),
    accountNumber: z
      .string()
      .min(8, "Account number is required")
      .describe(
        "Bank account number to verify against the employee's stored payment details.",
      ),
    bankName: z
      .string()
      .min(2, "Bank name is required")
      .describe(
        "Name of the bank associated with the account being verified.",
      ),
  })
  .describe(
    "Verifies that a given account number and bank name match the employee's registered payment details before initiating a payout.",
  );

export type ValidateAccountNumberInput = z.infer<
  typeof validateAccountNumberSchema
>;
export type UpdateEmployeeAccountInput = z.infer<
  typeof updateEmployeeAccountSchema
>;
export type VerifyAccountInput = z.infer<typeof verifyAccountSchema>;
