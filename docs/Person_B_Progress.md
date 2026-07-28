# Person B Progress Log

## Week 1 & 2: Frontend Download UI & Backend S3 Integration

### What I Did
- Built the DownloadPage UI with state management for loading, errors, and password input
- Set up the Express+TS backend, configured Prisma ORM with PostgreSQL via Docker
- Built GET /api/file/:token to fetch file metadata and POST /api/download/:token to handle download requests
- Created AWS S3 bucket, IAM user, and built s3Service.ts to generate presigned download URLs.
- Fixed S3 CORS policies, backend password hashing (switched to Node.js createHash), and AWS region mismatches
- Successfully tested the end-to-end download flow for unencrypted files

### What I Learned
- How the client-server model works when connecting React to Express
- How to use Prisma ORM to safely query and update PostgreSQL
- How AWS S3 presigned URLs allow secure, direct file downloads without exposing server credentials
- The difference between browser-based crypto and Node.js server-side crypto

## Week 3: Client-Side Decryption & Binary Data Handling

### What I Did

- Built the decryptFile function using the browser's Web Crypto API (AES-GCM).
- Implemented PBKDF2 key derivation (100,000 iterations) to securely convert the user's password into an AES key.
- Created the base64ToUint8Array utility to translate Base64 text from the database back into raw binary data (Uint8Array) for the Crypto API
- Built triggerDownloadFromArrayBuffer to package the decrypted binary data into a Blob and save it to the user's computer
- Connected the full encrypted download flow in DownloadPage (Fetch from S3 → Decrypt in Browser → Save to Disk)

### What I Learned

- How symmetric encryption (AES-GCM) and key derivation (PBKDF2) work under the hood in the browser
- The critical difference between text-safe data (Base64 strings) and binary data (ArrayBuffer/Uint8Array)
- How the Web Crypto API's authentication tag protects files from being tampered with (and why fake test data throws an OperationError)

## Week 4: End-to-End Integration, Debugging & Git Merge Resolution

### What I Did

- Pulled Person A’s PR (S3 upload & client-side encryption) into a local test-s3 branch and resolved complex merge conflicts in api.ts and DownloadPage.tsx.
- Fixed a critical frontend bug where the download API response was being double-unwrapped (result.data.data), causing silent UI failures
- Resolved Windows-specific Prisma EPERM file-lock errors by clearing locked node.exe processes and regenerating the Prisma Client
- Added comprehensive step-by-step trace logs across frontend and backend to validate the entire system architecture
- Successfully merged the fully working S3 upload/download flow into the main branch and pushed to GitHub

### What I Learned

- Advanced Git Workflows: Navigated real-world merge conflicts, understood how Git tracks divergent histories, and safely concluded merges
- Defensive API Parsing: Reinforced the importance of strictly typing API responses in TypeScript. Assuming a data structure without verifying the actual return shape leads to silent, hard-to-debug UI failures

- Node.js & Windows Quirks: Learned how background processes can lock compiled binaries (like Prisma engines) and the proper protocol for clearing them

