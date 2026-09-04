

// ==========================================
// HELPERS
// ==========================================

// Convert Uint8Array to Base64 (to match your decryptFile)
 export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 to Uint8Array (Your excellent code!)
export function base64ToUint8Array(base64: string): Uint8Array {
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

//this is for the more thn 1 gb file or 500 file it suseing chunking so the  iv to be differnt for each intteation for that

export function generateSaltAndBaseIv(){
  const salt= window.crypto.getRandomValues(new Uint8Array(16));
  //8 bytes for the base IV  the remaining 4 bytes will be the chunk counter
  const baseIv= window.crypto.getRandomValues(new Uint8Array(8));
  return{salt,baseIv};
}


//this if the old  one its compatable with old singl put files so it still kep 
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
      salt: salt as unknown as BufferSource,
      iterations: 100000, // Matches your decryption!
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}


//exported so the uploadpage can derive the key once and use it for ll chunks
export async function deriveEncryptionKey(password:string, salt:Uint8Array):Promise<CryptoKey>{
  return getKey(password,salt);
}


//-----------------------------------------------------------------
//STREMING ENCRYPTION ( new for multiple >16MB)

//helper to build the 12-byte nonce for a specific chunk
function buildChunkNonce(baseIv:Uint8Array, chunkIndex:number):Uint8Array{
  const nonce= new Uint8Array(12);
  nonce.set(baseIv,0); //First 8 bytes are the random base

  //Last 4 bytes are the chunk index (Big Endian)
  //DataView is the safe, standard way to write  32-bit integers to a byte array
  const view=new DataView(nonce.buffer);
  view.setUint32(8,chunkIndex,false);  //false=big-endian

  return nonce;

}


/*
*Encrypts a single chunk of the file
* This is called inside a loop in the fronted
* RAM only holds this specific 16MB chunk , not the whole file

*/

export async function encryptChunk(
  chunkBuffer:ArrayBuffer,
  key:CryptoKey,
  baseIv:Uint8Array,
  chunkIndex:number
):Promise<ArrayBuffer>{
  const nonce=buildChunkNonce(baseIv,chunkIndex);

  return window.crypto.subtle.encrypt(
    {name:"AES-GCM", iv:nonce as unknown as BufferSource},
    key,
    chunkBuffer
  );
}


//---------------------------------------------
//Single file encryption (old one for file <= 16MB)
//---------------------------------------------


export async function encryptFile(file: File, password: string) {
  const { salt, iv } = generateSaltAndIV();
  const key = await getKey(password, salt);

  // Read file as ArrayBuffer
  const fileBuffer = await file.arrayBuffer();

  // Encrypt the data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
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
// DECRYPTION MODULE this stays exactly the same for now 
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



//-------------------------------------
// THE CHUNK SIZE LADDER (centralized)
// WHY HERE: upload and download MUST agree on the same ladder,
// otherwise the receiver cuts the ciphertext at wrong boundaries.
// (UploadPage now imports this instead of keeping its own copy.)
//-------------------------------------
export function getChunkSize(sizeBytes: number): number {
    const MB = 1024 * 1024;
    if (sizeBytes < 16 * MB) return 0;      // 0 = single PUT, no chunks
    if (sizeBytes <= 250 * MB) return 16 * MB;
    if (sizeBytes <= 500 * MB) return 32 * MB;
    return 50 * MB;
}

//-------------------------------------
// CHUNKED DECRYPTOR (mirror of encryptChunk)
// The downloaded object is: [ct0][ct1]...[ctN] where each
// ct = ciphertext + 16-byte GCM tag of ONE chunk.
// We walk the buffer chunk-by-chunk, rebuild each nonce
// (baseIV + index), decrypt, and stitch the plaintext back.
//-------------------------------------
export async function decryptChunkedFile(
  encryptedData: ArrayBuffer,
  password: string,
  saltBase64: string,
  baseIvBase64: string,
  originalFileSize: number
): Promise<ArrayBuffer> {
  const salt = base64ToUint8Array(saltBase64);
  const baseIv = base64ToUint8Array(baseIvBase64); // 8 bytes
  const key = await getKey(password, salt);         // derived ONCE, reused for all chunks

  const chunkSize = getChunkSize(originalFileSize);
  const totalChunks = Math.ceil(originalFileSize / chunkSize);
  const view = new Uint8Array(encryptedData);

  const plainChunks: Uint8Array[] = [];
  let offset = 0;

  for (let i = 0; i < totalChunks; i++) {
    // Plaintext length of this chunk (last chunk is smaller)
    const plainLen = Math.min(chunkSize, originalFileSize - i * chunkSize);
    const ctLen = plainLen + 16; // + GCM auth tag

    const slice = view.slice(offset, offset + ctLen);
    offset += ctLen;

    // Same nonce math as encryptChunk: baseIV (8B) + index (4B)
    const nonce = buildChunkNonce(baseIv, i);

    const dec = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce as unknown as BufferSource },
      key,
      slice as unknown as BufferSource
    );
    plainChunks.push(new Uint8Array(dec));
  }

  // Stitch plaintext back into one buffer
  const out = new Uint8Array(originalFileSize);
  let o = 0;
  for (const c of plainChunks) { out.set(c, o); o += c.length; }
  return out.buffer;
}

//-------------------------------------
// SMART DECRYPTOR: picks the right path automatically
// HOW IT KNOWS: the stored IV length is the fingerprint.
//   8 bytes  -> multipart upload (base IV)  -> chunked decrypt
//   12 bytes -> old single-PUT upload       -> whole-file decrypt
// This means OLD files (small or pre-multipart) keep working untouched.
//-------------------------------------
export async function decryptFileAuto(
  encryptedData: ArrayBuffer,
  password: string,
  saltBase64: string,
  ivBase64: string,
  originalFileSize: number
): Promise<ArrayBuffer> {
  const ivBytes = base64ToUint8Array(ivBase64);
  if (ivBytes.length === 8) {
    return decryptChunkedFile(encryptedData, password, saltBase64, ivBase64, originalFileSize);
  }
  return decryptFile(encryptedData, password, saltBase64, ivBase64);
}