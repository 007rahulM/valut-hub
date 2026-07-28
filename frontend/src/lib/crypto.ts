

// ==========================================
// HELPERS
// ==========================================

// Convert Uint8Array to Base64 (to match your decryptFile)
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 to Uint8Array (Your excellent code!)
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// ==========================================
// ENCRYPTION MODULE
// ==========================================

export function generateSaltAndIV() {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for AES-GCM
  return { salt, iv };
}

async function getKey(password: string, salt: Uint8Array) {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // Matches your decryption!
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptFile(file: File, password: string) {
  const { salt, iv } = generateSaltAndIV();
  const key = await getKey(password, salt);

  // Read file as ArrayBuffer
  const fileBuffer = await file.arrayBuffer();

  // Encrypt the data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    fileBuffer
  );

  // Convert to a new File object for S3 upload
  const encryptedFile = new File([encryptedBuffer], file.name, {
    type: "application/octet-stream",
  });

  // Convert salt and iv to Base64 strings to match your decryptFile!
  const saltBase64 = uint8ArrayToBase64(salt);
  const ivBase64 = uint8ArrayToBase64(iv);

  return {
    encryptedFile,
    salt: saltBase64,
    iv: ivBase64,
  };
  console.log("Encryption complete. Salt and IV generated.");
}

// ==========================================
// DECRYPTION MODULE (Your Code!)
// ==========================================

export async function decryptFile(
  encryptedData: ArrayBuffer,
  password: string,
  saltBase64: string,
  ivBase64: string
): Promise<ArrayBuffer> {
  
  // Step 1: Decode salt and IV from Base64 to binary
   // We use 'as unknown as BufferSource' to bypass TypeScript's strict SharedArrayBuffer quirk
    const salt = base64ToUint8Array(saltBase64) as unknown as BufferSource;
    const iv = base64ToUint8Array(ivBase64) as unknown as BufferSource;
  
  // Step 2: Encode password as bytes 
  const passwordBytes = new TextEncoder().encode(password);

  // Step 3: Import password as PBKDF2 key material
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Step 4: Derive the AES key using PBKDF2 
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  // Step 5: Decrypt the file using AES-GCM 
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    encryptedData
  );

  return decryptedData;
}