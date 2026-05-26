import crypto from "crypto";
import { db, kybVerifications, kybStatusEnum, kybAuditLogs } from "../db";
import { eq } from "drizzle-orm";
import { ConflictError, NotFoundError } from "../utils/errors";
import { Logger } from "./logger.service";
import { KybUploadService } from "./kyb-upload.service";

export type KybStatus = (typeof kybStatusEnum.enumValues)[number];


export { KYB_REJECTION_CODES, type KybRejectionCode } from "@/types/kyb";

export class KybService {
  static async getStatus(userId: string) {
    const [verification] = await db
      .select()
      .from(kybVerifications)
      .where(eq(kybVerifications.userId, userId))
      .limit(1);

    if (!verification) {
      return {
        status: "not_started" as KybStatus,
        rejectionReason: null,
        rejectionCode: null,
        submittedAt: null,
      };
    }

    return {
      status: verification.status,
      rejectionReason: verification.rejectionReason,
      rejectionCode: verification.rejectionCode,
      submittedAt: verification.submittedAt,
    };
  }

  static async submit(data: {
    userId: string;
    registrationType: string;
    registrationNo: string;
    incorporationCertificatePath: string;
    incorporationCertificateUrl: string;
    memorandumArticlePath: string;
    memorandumArticleUrl: string;
    formC02C07Path: string | null;
    formC02C07Url: string | null;
  }) {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(kybVerifications)
        .where(eq(kybVerifications.userId, data.userId))
        .limit(1);

      if (existing) {
        if (existing.status === "verified") {
          throw new ConflictError("KYB verification already approved");
        }
        if (existing.status === "pending") {
          throw new ConflictError("A KYB verification is already pending review");
        }

        const oldKeys = [
          existing.incorporationCertificatePath,
          existing.memorandumArticlePath,
          existing.formC02C07Path,
        ].filter((key): key is string => key !== null);

        for (const key of oldKeys) {
          await KybUploadService.deleteFromS3(key);
        }

        await tx
          .delete(kybVerifications)
          .where(eq(kybVerifications.id, existing.id));
      }

      const [record] = await tx
        .insert(kybVerifications)
        .values({
          userId: data.userId,
          registrationType: data.registrationType,
          registrationNo: data.registrationNo,
          incorporationCertificatePath: data.incorporationCertificatePath,
          incorporationCertificateUrl: data.incorporationCertificateUrl,
          memorandumArticlePath: data.memorandumArticlePath,
          memorandumArticleUrl: data.memorandumArticleUrl,
          formC02C07Path: data.formC02C07Path,
          formC02C07Url: data.formC02C07Url,
          status: "pending",
        })
        .returning();

      await tx.insert(kybAuditLogs).values({
        entityType: "kyb_verification",
        entityId: record.id,
        action: "status_changed_to_pending",
        actorId: data.userId,
        metadata: { triggeredBy: "user_submission" },
      });

      return {
        id: record.id,
        status: record.status,
        registrationType: record.registrationType,
        registrationNo: record.registrationNo,
        createdAt: record.createdAt,
      };
    });
  }

  
  static async approve(data: { verificationId: string; adminUserId: string }) {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(kybVerifications)
        .where(eq(kybVerifications.id, data.verificationId))
        .limit(1);

      if (!existing) {
        throw new NotFoundError("KYB verification record not found");
      }

      
      if (existing.status !== "pending") {
        throw new ConflictError(
          `Cannot approve a verification that is already '${existing.status}'`,
        );
      }

      const previousStatus = existing.status;

      
      
      
      const [updated] = await tx
        .update(kybVerifications)
        .set({
          status: "verified",
          rejectionCode: null,
          rejectionReason: null,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          eq(kybVerifications.id, data.verificationId),
        )
        .returning();

      
      if (!updated) {
        throw new ConflictError(
          "KYB verification was modified concurrently; please retry",
        );
      }

      await tx.insert(kybAuditLogs).values({
        entityType: "kyb_verification",
        entityId: data.verificationId,
        action: "status_changed_to_verified",
        actorId: data.adminUserId,
        metadata: { previousStatus },
      });

      Logger.info("KYB verification approved", {
        verificationId: data.verificationId,
        adminUserId: data.adminUserId,
        previousStatus,
      });

      return {
        id: updated.id,
        status: updated.status,
        reviewedAt: updated.reviewedAt,
      };
    });
  }

  
  static async reject(data: {
    verificationId: string;
    adminUserId: string;
    rejectionCode: string;
    rejectionReason: string;
  }) {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(kybVerifications)
        .where(eq(kybVerifications.id, data.verificationId))
        .limit(1);

      if (!existing) {
        throw new NotFoundError("KYB verification record not found");
      }

      
      if (existing.status !== "pending") {
        throw new ConflictError(
          `Cannot reject a verification that is already '${existing.status}'`,
        );
      }

      const previousStatus = existing.status;

      
      
      
      const [updated] = await tx
        .update(kybVerifications)
        .set({
          status: "rejected",
          rejectionCode: data.rejectionCode,
          rejectionReason: data.rejectionReason,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(kybVerifications.id, data.verificationId))
        .returning();

      
      if (!updated) {
        throw new ConflictError(
          "KYB verification was modified concurrently; please retry",
        );
      }

      await tx.insert(kybAuditLogs).values({
        entityType: "kyb_verification",
        entityId: data.verificationId,
        action: "status_changed_to_rejected",
        actorId: data.adminUserId,
        metadata: {
          previousStatus,
          rejectionCode: data.rejectionCode,
          rejectionReason: data.rejectionReason,
        },
      });

      Logger.info("KYB verification rejected", {
        verificationId: data.verificationId,
        adminUserId: data.adminUserId,
        previousStatus,
        rejectionCode: data.rejectionCode,
      });

      return {
        id: updated.id,
        status: updated.status,
        rejectionCode: updated.rejectionCode,
        rejectionReason: updated.rejectionReason,
        reviewedAt: updated.reviewedAt,
      };
    });
  }
}
