import { db, invoices } from "@/server/db";
import { eq, and, inArray } from "drizzle-orm";
import { FiatDisbursementService } from "./fiat-disbursement.service";
import { createFiatProvider, type FiatProviderPreference } from "./fiat";
import { BadRequestError } from "@/server/utils/errors";
import { Logger } from "./logger.service";

export class PayrollService {
  
  static async runPayroll(
    organizationId: string,
    invoiceIds: string[],
    providerId: FiatProviderPreference
  ) {
    if (!invoiceIds || invoiceIds.length === 0) {
      throw new BadRequestError("No invoices provided for payroll run");
    }

    const provider = createFiatProvider(providerId);

    
    const invoicesToProcess = await db
      .select({
        id: invoices.id,
        amount: invoices.amount,
        status: invoices.status,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.organizationId, organizationId),
          inArray(invoices.id, invoiceIds),
          eq(invoices.status, "pending")
        )
      );

    if (invoicesToProcess.length === 0) {
      throw new BadRequestError("No valid pending invoices found for provided IDs");
    }

    const results = [];

    
    
    for (const invoice of invoicesToProcess) {
      try {
        
        
        
        
        

        
        await db
          .update(invoices)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(invoices.id, invoice.id));

        results.push({ invoiceId: invoice.id, status: "success" });
      } catch (error) {
        Logger.error(`Failed to process payroll for invoice ${invoice.id}`, { error: String(error) });
        results.push({ invoiceId: invoice.id, status: "failed", error: String(error) });
      }
    }

    return results;
  }
}
