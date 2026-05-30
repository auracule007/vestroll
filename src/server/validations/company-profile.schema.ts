import { z } from "zod";
import countries from "i18n-iso-countries";


countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

export const companyProfileSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .optional()
      .describe(
        "UUID v4 primary key of the company profile record. Omit when creating; required when updating.",
      ),

    userId: z
      .string()
      .uuid()
      .describe(
        "UUID of the user (admin/owner) who owns this company profile.",
      ),
    organizationId: z
      .string()
      .uuid()
      .describe(
        "UUID of the organisation entity this profile belongs to. Links the profile to the tenant record in the organisations table.",
      ),

    logoUrl: z
      .string()
      .url()
      .max(512)
      .optional()
      .describe(
        "Publicly accessible URL of the company's logo image (max 512 chars). Used in invoices, emails, and the employer dashboard.",
      ),

    brandName: z
      .string()
      .min(1)
      .max(255)
      .describe(
        "Trading name or brand name of the company as displayed to employees and on payslips (e.g. 'Acme Corp').",
      ),
    registeredName: z
      .string()
      .min(1)
      .max(255)
      .describe(
        "Full legal / registered name of the company as it appears in official filings (e.g. 'Acme Corporation Ltd.').",
      ),
    registrationNumber: z
      .string()
      .min(1)
      .max(255)
      .describe(
        "Official company registration number issued by the relevant government authority (e.g. Companies House number in the UK, EIN in the US).",
      ),

    country: z
      .string()
      .min(1)
      .max(255)
      .describe(
        "Country where the company is incorporated/registered. Used to determine applicable payroll rules and compliance requirements.",
      ),

    size: z
      .string()
      .max(100)
      .optional()
      .describe(
        "Approximate employee headcount band (e.g. '1-10', '11-50', '51-200', '201-500', '500+'). Used for analytics and feature-gating.",
      ),
    vatNumber: z
      .string()
      .max(255)
      .optional()
      .describe(
        "Value-Added Tax registration number of the company. Required for VAT-registered businesses; used on invoices.",
      ),
    website: z
      .string()
      .url()
      .max(512)
      .optional()
      .describe("Company's public website URL (max 512 chars). Optional."),

    address: z
      .string()
      .min(1)
      .max(500)
      .describe(
        "Primary registered street address of the company (line 1). Used in contracts and official documents.",
      ),
    altAddress: z
      .string()
      .max(500)
      .optional()
      .describe(
        "Secondary / alternative address line (e.g. suite, floor, building name). Optional.",
      ),

    city: z
      .string()
      .min(1)
      .max(255)
      .describe("City of the company's registered address."),
    region: z
      .string()
      .max(255)
      .optional()
      .describe(
        "State, province, or region of the company's registered address. Optional depending on country.",
      ),
    postalCode: z
      .string()
      .max(50)
      .optional()
      .describe(
        "Postal / ZIP code of the company's registered address. Optional depending on country.",
      ),

    billingAddress: z
      .string()
      .max(500)
      .optional()
      .describe(
        "Primary billing address line if different from the registered address. Used on invoices and receipts.",
      ),
    billingAltAddress: z
      .string()
      .max(500)
      .optional()
      .describe("Secondary billing address line (suite, floor, etc.). Optional."),
    billingCity: z
      .string()
      .max(255)
      .optional()
      .describe("City of the company's billing address. Optional."),
    billingRegion: z
      .string()
      .max(255)
      .optional()
      .describe(
        "State, province, or region of the billing address. Optional.",
      ),

    billingCountry: z
      .string()
      .length(2, "Must be a valid ISO alpha-2 country code")
      .transform((val) => val.toUpperCase())
      .refine((value) => countries.isValid(value), {
        message: "Invalid ISO 3166-1 alpha-2 country code",
      })
      .describe(
        "ISO 3166-1 alpha-2 country code of the billing address (e.g. 'US', 'GB', 'DE'). Validated against the full ISO 3166-1 country list. Automatically upper-cased.",
      ),

    billingPostalCode: z
      .string()
      .max(50)
      .optional()
      .describe("Postal / ZIP code of the billing address. Optional."),

    createdAt: z
      .date()
      .optional()
      .describe(
        "Timestamp when the company profile was first created. Managed by the database; omit on create/update requests.",
      ),
    updatedAt: z
      .date()
      .optional()
      .describe(
        "Timestamp of the most recent update to the company profile. Managed by the database; omit on create/update requests.",
      ),
  })
  .describe(
    "Full company profile schema covering registered details, address, and billing information. billingCountry must be a valid ISO 3166-1 alpha-2 code.",
  );