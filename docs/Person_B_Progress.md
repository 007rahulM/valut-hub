Person B Progress Log
Week 1 & 2: Frontend, Backend, and S3 Integration (Days 1-10)
What I Did
Initialized React+TS frontend with Vite/Router and built the DownloadPage UI with state management.
Set up Express+TS backend, configured Prisma ORM with PostgreSQL via Docker.
Built GET /api/file/:token to fetch file metadata and POST /api/download/:token to handle download requests.
Created AWS S3 bucket, IAM user, and built s3Service.ts to generate presigned download URLs.
Fixed S3 CORS policies, backend password hashing (switched to Node.js createHash), and AWS region mismatches.
Successfully tested the end-to-end download flow for unencrypted files.
What I Learned
How the client-server model works when connecting React to Express.
How to use Prisma ORM to safely query and update PostgreSQL.
How AWS S3 presigned URLs allow secure, direct file downloads without exposing server credentials.
The difference between browser-based crypto and Node.js server-side crypto.


Week 3: Client-Side Decryption (Days 11-14)
What I Did
Built the decryptFile function using the browser's Web Crypto API (AES-GCM).
Implemented PBKDF2 key derivation (100,000 iterations) to securely convert the user's password into an AES key.
Created the base64ToUint8Array utility to translate Base64 text from the database back into raw binary data (Uint8Array) for the Crypto API.
Built triggerDownloadFromArrayBuffer to package the decrypted binary data into a Blob and save it to the user's computer.
Connected the full encrypted download flow in DownloadPage (Fetch from S3 → Decrypt in Browser → Save to Disk).
Current Status: Decryption code is fully written. End-to-end testing is paused until Person A uploads a real encrypted file.
What I Learned
How symmetric encryption (AES-GCM) and key derivation (PBKDF2) work under the hood in the browser.
The critical difference between text-safe data (Base64 strings) and binary data (ArrayBuffer/Uint8Array).
How the Web Crypto API's authentication tag protects files from being tampered with (and why fake test data throws an OperationError).