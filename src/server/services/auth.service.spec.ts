/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthService } from "./auth.service";
import { EmailVerificationService } from "./email-verification.service";
import { UserService } from "./user.service";
import { OTPService } from "./otp.service";
import { PasswordVerificationService } from "./password-verification.service";
import { createTransactionalMockDb } from "../test/db-utils";
import { ConflictError } from "../utils/errors";
import { RegisterInput } from "../validations/auth.schema";
type UserLookupResult = Awaited<ReturnType<typeof UserService.findByEmail>>;





vi.mock("./user.service");
vi.mock("./otp.service");
vi.mock("./password-verification.service");
vi.mock("./logger.service", () => ({
  Logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));


vi.mock("./email.service", () => ({
  EmailService: {
    sendVerificationOTPEmail: vi.fn().mockResolvedValue(undefined),
  },
}));


let mockDb: ReturnType<typeof createTransactionalMockDb>;

vi.mock("../db", () => {
  
  
  return {
    get db() {
      return mockDb;
    },
    
    
    emailVerifications: { tableName: "email_verifications" },
    users: { tableName: "users" },
    organizations: { tableName: "organizations" },
    loginAttempts: { tableName: "login_attempts" },
    biometricLogs: { tableName: "biometric_logs" },
    passkeyRegistrationChallenges: {
      tableName: "passkey_registration_challenges",
    },
  };
});





const VALID_REGISTER_INPUT: RegisterInput = {
  firstName: "Jane",
  lastName: "Doe",
  businessEmail: "jane.doe@example.com",
  password: "SecurePass123!",
  agreement: true,
  accountType: "employer",
  companyName: "Acme Corp",
  companySize: "50-99",
  companyIndustry: "Technology",
  headquarterCountry: "Nigeria",
};

const MOCK_OTP = "123456";
const MOCK_OTP_HASH = "bcrypt_hashed_otp_value";





describe("AuthService – registration + email-verification funnel (integration)", () => {
  beforeEach(() => {
    
    mockDb = createTransactionalMockDb();
    vi.clearAllMocks();

    
    vi.mocked(OTPService.generateOTP).mockReturnValue(MOCK_OTP);
    vi.mocked(OTPService.hashOTP).mockResolvedValue(MOCK_OTP_HASH);
    vi.mocked(OTPService.verifyOTP).mockResolvedValue(true);

    
    vi.mocked(PasswordVerificationService.hash).mockResolvedValue(
      "hashed_password",
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  
  
  

  describe("register", () => {
    it("should create a new user and persist a verification hash inside a transaction", async () => {
      
      vi.mocked(UserService.findByEmail).mockResolvedValue(null as any);

      const result = await AuthService.register(VALID_REGISTER_INPUT);

      
      expect(result).toMatchObject({
        email: VALID_REGISTER_INPUT.businessEmail.toLowerCase().trim(),
        message: "Verification email sent",
      });
      expect(result.userId).toBeDefined();

      
      expect(mockDb._store.users).toHaveLength(1);
      const persistedUser = mockDb._store.users[0];
      expect(persistedUser.email).toBe(
        VALID_REGISTER_INPUT.businessEmail.toLowerCase().trim(),
      );
      expect(persistedUser.status).toBe("pending_verification");

      
      expect(mockDb._store.emailVerifications).toHaveLength(1);
      const verificationRow = mockDb._store.emailVerifications[0];
      expect(verificationRow.otpHash).toBe(MOCK_OTP_HASH);
      expect(verificationRow.expiresAt).toBeInstanceOf(Date);

      
      expect(OTPService.generateOTP).toHaveBeenCalledOnce();
      expect(OTPService.hashOTP).toHaveBeenCalledWith(MOCK_OTP);
    });

    it("should persist an organization row when companyName is supplied", async () => {
      vi.mocked(UserService.findByEmail).mockResolvedValue(null as any);

      await AuthService.register(VALID_REGISTER_INPUT);

      expect(mockDb._store.organizations).toHaveLength(1);
      expect(mockDb._store.organizations[0].name).toBe(
        VALID_REGISTER_INPUT.companyName,
      );
    });

    it("should throw ConflictError when the email is already registered", async () => {
      const existingUser = {
        id: "existing-user-id",
        email: VALID_REGISTER_INPUT.businessEmail.toLowerCase().trim(),
        status: "active" as const,
        firstName: "Jane",
        lastName: "Doe",
        passwordHash: "hash",
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorEnabledAt: null,
        failedTwoFactorAttempts: 0,
        twoFactorLockoutUntil: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        oauthProvider: null,
        oauthId: null,
        signerType: "Email" as const,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(UserService.findByEmail).mockResolvedValue(
        existingUser as any,
      );

      await expect(
        AuthService.register(VALID_REGISTER_INPUT),
      ).rejects.toThrow(ConflictError);
      await expect(
        AuthService.register(VALID_REGISTER_INPUT),
      ).rejects.toThrow("Email already exists");

      
      expect(mockDb._store.users).toHaveLength(0);
      expect(mockDb._store.emailVerifications).toHaveLength(0);
    });

    it("should not write an organization row when companyName is absent", async () => {
      vi.mocked(UserService.findByEmail).mockResolvedValue(null as any);

      const inputWithoutCompany: RegisterInput = {
        ...VALID_REGISTER_INPUT,
        companyName: undefined,
        accountType: "employee",
      };

      await AuthService.register(inputWithoutCompany);

      expect(mockDb._store.organizations).toHaveLength(0);
      expect(mockDb._store.users).toHaveLength(1);
    });
  });

  
  
  

  describe("EmailVerificationService.getVerificationStatus – hash read-back", () => {
    it("should return the persisted verification record for the newly created user", async () => {
      vi.mocked(UserService.findByEmail).mockResolvedValue(null as any);

      const { userId } = await AuthService.register(VALID_REGISTER_INPUT);

      
      const storedRow = mockDb._store.emailVerifications[0];

      
      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([storedRow]),
            }),
          }),
        }),
      });
      mockDb.select = selectMock;

      const status =
        await EmailVerificationService.getVerificationStatus(userId);

      expect(status).toBeDefined();
      expect(status!.otpHash).toBe(MOCK_OTP_HASH);
      expect(status!.verified).toBe(false);
      expect(status!.attempts).toBe(0);
    });
  });

  
  
  

  describe("EmailVerificationService.verifyEmail – successful OTP claim", () => {
    it("should mark the verification record as verified and activate the user", async () => {
      

      vi.mocked(UserService.findByEmail).mockResolvedValue(null as any);

      
      const { userId, email } = await AuthService.register(
        VALID_REGISTER_INPUT,
      );

      const persistedVerification = mockDb._store.emailVerifications[0];

      
      
      const pendingUser = {
        id: userId,
        email,
        status: "pending_verification" as const,
        firstName: VALID_REGISTER_INPUT.firstName,
        lastName: VALID_REGISTER_INPUT.lastName,
        passwordHash: "hashed_password",
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorEnabledAt: null,
        failedTwoFactorAttempts: 0,
        twoFactorLockoutUntil: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        oauthProvider: null,
        oauthId: null,
        signerType: "Email" as const,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(UserService.findByEmail).mockResolvedValue(
        pendingUser as any,
      );

      
      const verificationQueryMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  ...persistedVerification,
                  verified: false,
                  attempts: 0,
                  expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                },
              ]),
            }),
          }),
        }),
      });
      mockDb.select = verificationQueryMock;

      
      
      const updateSpy = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      mockDb.transaction = vi.fn(
        async (callback: (tx: unknown) => Promise<unknown>) => {
          const txContext = {
            update: updateSpy,
          };
          return callback(txContext);
        },
      );

      

      const verifyResult = await EmailVerificationService.verifyEmail(
        email,
        MOCK_OTP,
      );

      

      
      expect(verifyResult).toEqual({
        success: true,
        message: "Email verified successfully",
        user: {
          id: userId,
          email,
          status: "active",
        },
      });

      
      expect(OTPService.verifyOTP).toHaveBeenCalledWith(
        MOCK_OTP,
        persistedVerification.otpHash,
      );

      
      expect(mockDb.transaction).toHaveBeenCalledOnce();

      
      
      
      expect(updateSpy).toHaveBeenCalledTimes(2);
    });
  });

  
  
  

  describe("post-verification state – restriction cleared", () => {
    it("should reflect no remaining pending verification constraint after successful verify", async () => {
      
      vi.mocked(UserService.findByEmail).mockResolvedValue(null as any);

      const { userId, email } = await AuthService.register(
        VALID_REGISTER_INPUT,
      );

      const persistedVerification = {
        ...mockDb._store.emailVerifications[0],
        verified: false,
        attempts: 0,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };

      
      const pendingUser = {
        id: userId,
        email,
        status: "pending_verification" as const,
        firstName: VALID_REGISTER_INPUT.firstName,
        lastName: VALID_REGISTER_INPUT.lastName,
        passwordHash: "hashed_password",
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorEnabledAt: null,
        failedTwoFactorAttempts: 0,
        twoFactorLockoutUntil: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        oauthProvider: null,
        oauthId: null,
        signerType: "Email" as const,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(UserService.findByEmail).mockResolvedValue(
        pendingUser as any,
      );

      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([persistedVerification]),
            }),
          }),
        }),
      });

      
      const capturedSetCalls: Record<string, unknown>[] = [];
      const updateSpy = vi.fn().mockReturnValue({
        set: vi.fn((fields: Record<string, unknown>) => {
          capturedSetCalls.push(fields);
          return { where: vi.fn().mockResolvedValue(undefined) };
        }),
      });

      mockDb.transaction = vi.fn(
        async (callback: (tx: unknown) => Promise<unknown>) =>
          callback({ update: updateSpy }),
      );

      
      await EmailVerificationService.verifyEmail(email, MOCK_OTP);

      
      expect(capturedSetCalls).toContainEqual(
        expect.objectContaining({ verified: true }),
      );

      
      expect(capturedSetCalls).toContainEqual(
        expect.objectContaining({ status: "active" }),
      );

      
      
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const clearedStatus =
        await EmailVerificationService.getVerificationStatus(userId);

      expect(clearedStatus).toBeNull();
    });
  });
});
