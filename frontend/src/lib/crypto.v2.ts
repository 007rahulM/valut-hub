const PBKDF2_ITERATIONS_V2 = 100_000;
const AES_KEY_LENGTH_V2 = 256;
const SALT_BYTES_V2 = 16;
const BASE_IV_BYTES_V2 = 8;
const NONCE_BYTES_V2 = 12;
const GCM_TAG_BYTES_V2 = 16;

export function uint8ArrayToBase64V2(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return window.btoa(binary);
}

export function base64ToUint8ArrayV2(value: string): Uint8Array {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export type V2EncryptionMaterial = {
  salt: Uint8Array;
  baseIv: Uint8Array;
  saltBase64: string;
  baseIvBase64: string;
};

export function createEncryptionMaterialV2(): V2EncryptionMaterial {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES_V2));
  const baseIv = crypto.getRandomValues(new Uint8Array(BASE_IV_BYTES_V2));
  return {
    salt,
    baseIv,
    saltBase64: uint8ArrayToBase64V2(salt),
    baseIvBase64: uint8ArrayToBase64V2(baseIv),
  };
}

export async function hashPasswordV2(password: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function deriveEncryptionKeyV2(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS_V2,
      hash: "SHA-256",
    },
    passwordMaterial,
    { name: "AES-GCM", length: AES_KEY_LENGTH_V2 },
    false,
    ["encrypt", "decrypt"],
  );
}

function buildNonceV2(baseIv: Uint8Array, partIndex: number): Uint8Array {
  if (baseIv.length !== BASE_IV_BYTES_V2) throw new Error("V2 base IV must be 8 bytes");
  if (!Number.isInteger(partIndex) || partIndex < 0 || partIndex > 0xffffffff) {
    throw new Error("V2 part index is outside the nonce range");
  }
  const nonce = new Uint8Array(NONCE_BYTES_V2);
  nonce.set(baseIv, 0);
  new DataView(nonce.buffer).setUint32(BASE_IV_BYTES_V2, partIndex, false);
  return nonce;
}

export async function encryptPartV2(
  plaintext: ArrayBuffer,
  key: CryptoKey,
  baseIv: Uint8Array,
  partIndex: number,
): Promise<Blob> {
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: buildNonceV2(baseIv, partIndex) as BufferSource },
    key,
    plaintext,
  );
  return new Blob([ciphertext], { type: "application/octet-stream" });
}

export function encryptedPartSizeV2(plaintextBytes: number): number {
  return plaintextBytes + GCM_TAG_BYTES_V2;
}

export async function decryptChunkedFileV2(
  encryptedData: ArrayBuffer,
  password: string,
  saltBase64: string,
  baseIvBase64: string,
  originalFileSize: number,
): Promise<ArrayBuffer> {
  const salt = base64ToUint8ArrayV2(saltBase64);
  const baseIv = base64ToUint8ArrayV2(baseIvBase64);
  const key = await deriveEncryptionKeyV2(password, salt);
  const totalParts = Math.ceil(originalFileSize / (16 * 1024 * 1024));
  const encrypted = new Uint8Array(encryptedData);
  const plainParts: Uint8Array[] = [];
  let offset = 0;

  for (let index = 0; index < totalParts; index += 1) {
    const plainLength = Math.min(16 * 1024 * 1024, originalFileSize - index * 16 * 1024 * 1024);
    const encryptedLength = plainLength + GCM_TAG_BYTES_V2;
    const part = encrypted.slice(offset, offset + encryptedLength);
    if (part.byteLength !== encryptedLength) throw new Error(`Encrypted part ${index + 1} is incomplete`);
    const nonce = new Uint8Array(NONCE_BYTES_V2);
    nonce.set(baseIv, 0);
    new DataView(nonce.buffer).setUint32(BASE_IV_BYTES_V2, index, false);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce as BufferSource }, key, part);
    plainParts.push(new Uint8Array(decrypted));
    offset += encryptedLength;
  }

  const output = new Uint8Array(originalFileSize);
  let outputOffset = 0;
  for (const part of plainParts) {
    output.set(part, outputOffset);
    outputOffset += part.byteLength;
  }
  return output.buffer;
}

export const V2_CRYPTO_CONSTANTS = {
  PBKDF2_ITERATIONS: PBKDF2_ITERATIONS_V2,
  GCM_TAG_BYTES: GCM_TAG_BYTES_V2,
  BASE_IV_BYTES: BASE_IV_BYTES_V2,
};
