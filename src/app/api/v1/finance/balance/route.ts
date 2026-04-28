import { NextRequest } from "next/server";
import { ApiResponse } from "@/server/utils/api-response";
import { AppError } from "@/server/utils/errors";
import { AuthUtils } from "@/server/utils/auth";
import { FinanceWalletService } from "@/server/services/finance-wallet.service";

/**
 * @swagger
 * /finance/balance:
 *   get:
 *     summary: Get organization fiat balance
 *     description: Retrieve the authenticated organization's NGN fiat balance in kobo.
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: integer
 *                   description: Balance in kobo (NGN * 100)
 *       401:
 *         description: Unauthorized
 */
export async function GET(req: NextRequest) {
  try {
    const { user } = await AuthUtils.authenticateRequestOrRefreshCookie(req);
    const balance = await FinanceWalletService.getOrganizationFiatBalance(
      user.organizationId ?? "",
    );

    // Convert bigint to number for JSON serialization
    return ApiResponse.success(
      { balance: Number(balance) },
      "Balance retrieved successfully",
    );
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }

    console.error("[Finance Balance GET Error]", error);
    return ApiResponse.error("Internal server error", 500);
  }
}
