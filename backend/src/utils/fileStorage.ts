import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type StorageProvider = "local" | "s3";

export interface UploadResult {
  url: string;
  key: string; // File identifier (path in S3 or filename locally)
  provider: StorageProvider;
}

export interface FileStorageConfig {
  provider: StorageProvider;
  // S3 Configuration
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  s3Endpoint?: string; // Optional custom endpoint (for S3-compatible services)
  // Local Configuration
  localUploadDir?: string;
  // URL Configuration
  publicUrl?: string; // Base URL for public file access (e.g., CDN URL or S3 public URL)
}

class FileStorageService {
  private config: FileStorageConfig;
  private s3Client: S3Client | null = null;

  constructor(config: FileStorageConfig) {
    this.config = config;

    // Initialize S3 client if using S3
    if (config.provider === "s3" && config.s3Bucket && config.s3Region) {
      this.s3Client = new S3Client({
        region: config.s3Region,
        credentials: config.s3AccessKeyId && config.s3SecretAccessKey
          ? {
            accessKeyId: config.s3AccessKeyId,
            secretAccessKey: config.s3SecretAccessKey,
          }
          : undefined,
        endpoint: config.s3Endpoint,
        forcePathStyle: config.s3Endpoint ? true : false, // Use path-style for S3-compatible services
      });
    }

    // Ensure local upload directory exists
    if (config.provider === "local" && config.localUploadDir) {
      const uploadDir = path.resolve(config.localUploadDir);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    }
  }

  /**
   * Upload a file to storage
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = "certificates",
    customFileName?: string
  ): Promise<UploadResult> {
    const fileExtension = path.extname(file.originalname);
    const fileName = customFileName || `${Date.now()}-${randomUUID()}${fileExtension}`;
    const fileKey = `${folder}/${fileName}`;

    if (this.config.provider === "s3") {
      return await this.uploadToS3(file.buffer, fileKey, file.mimetype);
    } else {
      return await this.uploadToLocal(file.buffer, fileKey);
    }
  }

  /**
   * Upload file buffer to S3
   */
  private async uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<UploadResult> {
    if (!this.s3Client || !this.config.s3Bucket) {
      throw new Error("S3 client not configured");
    }

    const command = new PutObjectCommand({
      Bucket: this.config.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Make file publicly readable (adjust ACL based on your needs)
      ACL: "public-read",
    });

    await this.s3Client.send(command);

    // Generate public URL
    const url = this.config.publicUrl
      ? `${this.config.publicUrl}/${key}`
      : `https://${this.config.s3Bucket}.s3.${this.config.s3Region}.amazonaws.com/${key}`;

    return {
      url,
      key,
      provider: "s3",
    };
  }

  /**
   * Upload file buffer to local filesystem
   */
  private async uploadToLocal(buffer: Buffer, key: string): Promise<UploadResult> {
    if (!this.config.localUploadDir) {
      throw new Error("Local upload directory not configured");
    }

    const filePath = path.join(this.config.localUploadDir, key);
    const fileDir = path.dirname(filePath);

    // Ensure directory exists
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, buffer);

    // Generate URL
    const url = this.config.publicUrl
      ? `${this.config.publicUrl}/uploads/${key}`
      : `/uploads/${key}`;

    return {
      url,
      key,
      provider: "local",
    };
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(key: string): Promise<void> {
    if (this.config.provider === "s3") {
      await this.deleteFromS3(key);
    } else {
      await this.deleteFromLocal(key);
    }
  }

  /**
   * Delete file from S3
   */
  private async deleteFromS3(key: string): Promise<void> {
    if (!this.s3Client || !this.config.s3Bucket) {
      throw new Error("S3 client not configured");
    }

    const command = new DeleteObjectCommand({
      Bucket: this.config.s3Bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * Delete file from local filesystem
   */
  private async deleteFromLocal(key: string): Promise<void> {
    if (!this.config.localUploadDir) {
      throw new Error("Local upload directory not configured");
    }

    const filePath = path.join(this.config.localUploadDir, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Generate a signed URL for private file access (S3 only)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.config.provider !== "s3" || !this.s3Client || !this.config.s3Bucket) {
      throw new Error("Signed URLs are only available for S3 storage");
    }

    const command = new GetObjectCommand({
      Bucket: this.config.s3Bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Extract file key from URL (for backward compatibility)
   */
  extractKeyFromUrl(url: string): string | null {
    if (this.config.provider === "s3") {
      // Extract key from S3 URL
      const s3UrlPattern = /https?:\/\/[^\/]+\/(.+)$/;
      const match = url.match(s3UrlPattern);
      return match ? match[1] : null;
    } else {
      // Extract key from local URL
      const localUrlPattern = /\/uploads\/(.+)$/;
      const match = url.match(localUrlPattern);
      return match ? match[1] : null;
    }
  }
}

// Initialize file storage service from environment variables
function createFileStorageService(): FileStorageService {
  const provider = (process.env.FILE_STORAGE_PROVIDER || "local") as StorageProvider;

  const config: FileStorageConfig = {
    provider,
    // S3 Configuration
    s3Bucket: process.env.S3_BUCKET_NAME,
    s3Region: process.env.S3_REGION || "us-east-1",
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    s3Endpoint: process.env.S3_ENDPOINT, // Optional, for S3-compatible services
    // Local Configuration
    localUploadDir: process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), "uploads"),
    // Public URL (for CDN or custom domain)
    publicUrl: process.env.FILE_PUBLIC_URL,
  };

  return new FileStorageService(config);
}

// Export singleton instance
export const fileStorage = createFileStorageService();
