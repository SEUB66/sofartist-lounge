import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuration S3 depuis les variables d'environnement Manus
// S3 is optional - if not configured, upload features will be disabled
const isS3Configured = !!(
  process.env.S3_ENDPOINT &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY &&
  process.env.S3_BUCKET_NAME &&
  process.env.S3_PUBLIC_URL
);

let s3Client: S3Client | null = null;
let BUCKET_NAME: string | null = null;

if (isS3Configured) {
  s3Client = new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
  BUCKET_NAME = process.env.S3_BUCKET_NAME!;
}

/**
 * Génère une URL présignée pour uploader un fichier vers S3
 * @param key - Clé S3 du fichier (chemin dans le bucket)
 * @param contentType - Type MIME du fichier
 * @param expiresIn - Durée de validité de l'URL en secondes (défaut: 5 minutes)
 * @returns URL présignée pour l'upload
 */
export async function getUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 1800
): Promise<string> {
  if (!s3Client || !BUCKET_NAME) {
    throw new Error('S3 is not configured. Please set S3 environment variables.');
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Génère une URL présignée pour télécharger un fichier depuis S3
 * @param key - Clé S3 du fichier
 * @param expiresIn - Durée de validité de l'URL en secondes (défaut: 1 heure)
 * @returns URL présignée pour le téléchargement
 */
export async function getDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!s3Client || !BUCKET_NAME) {
    throw new Error('S3 is not configured. Please set S3 environment variables.');
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Génère une clé S3 unique pour un fichier
 * @param userId - ID de l'utilisateur
 * @param type - Type de fichier ('music' ou 'image')
 * @param filename - Nom du fichier original
 * @returns Clé S3 unique
 */
export function generateS3Key(
  userId: number,
  type: 'music' | 'image',
  filename: string
): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${type}/${userId}/${timestamp}_${sanitizedFilename}`;
}

/**
 * Construit l'URL publique d'un fichier S3
 * @param key - Clé S3 du fichier
 * @returns URL publique du fichier
 */
export function getPublicUrl(key: string): string {
  if (!process.env.S3_PUBLIC_URL) {
    throw new Error('S3 is not configured. Please set S3_PUBLIC_URL environment variable.');
  }
  return `${process.env.S3_PUBLIC_URL}/${key}`;
}

/**
 * Check if S3 is configured and available
 * @returns true if S3 is configured, false otherwise
 */
export function isS3Available(): boolean {
  return isS3Configured;
}
