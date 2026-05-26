import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { AppError } from "../utils/errors";


const S3_CONFIG = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
};

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "vestroll-assets";


const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "svg"];


const SIGNED_URL_EXPIRY = 300;

export interface SignedUploadUrl {
  signedUrl: string;
  key: string;
  expiresAt: Date;
}


function validateFileExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (!ext) {
    throw new AppError("File must have an extension", 400);
  }

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new AppError(
      `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
      400,
    );
  }

  return ext;
}


function validateContentType(contentType: string): void {
  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    throw new AppError(
      `Invalid content type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
      400,
    );
  }
}


export class LogoUploadService {
  private static s3Client: S3Client | null = null;

  
  private static getS3Client(): S3Client {
    if (!this.s3Client) {
      
      if (
        !S3_CONFIG.credentials.accessKeyId ||
        !S3_CONFIG.credentials.secretAccessKey
      ) {
        throw new AppError(
          "AWS S3 credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.",
          500,
        );
      }

      this.s3Client = new S3Client(S3_CONFIG);
    }
    return this.s3Client;
  }

  
  static async getSignedUploadUrl(
    organizationId: string,
    filename: string,
    contentType: string,
  ): Promise<SignedUploadUrl> {
    
    validateContentType(contentType);

    
    const extension = validateFileExtension(filename);

    
    const uniqueId = crypto.randomUUID();
    const key = `logos/${organizationId}/${uniqueId}.${extension}`;

    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    
    const signedUrl = await getSignedUrl(this.getS3Client(), command, {
      expiresIn: SIGNED_URL_EXPIRY,
    });

    const expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY * 1000);

    return {
      signedUrl,
      key,
      expiresAt,
    };
  }

  
  static getLogoUrl(key: string): string {
    const cdnUrl = process.env.CDN_URL;

    if (cdnUrl) {
      return `${cdnUrl}/${key}`;
    }

    
    return `https://${BUCKET_NAME}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;
  }
}
