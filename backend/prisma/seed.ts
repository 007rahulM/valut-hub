import prisma from "../src/lib/prisma";
import { createHash } from "crypto";

async function main() {
    // Delete old test files
    await prisma.file.deleteMany({
        where: { token: { in: ["testenc", "test123"] } }
    });

    // Create UNENCRYPTED test file (no password needed)
    await prisma.file.create({
        data: {
            token: "test123",
            originalName: "test-document.pdf",
            storedName: "test-document.pdf",
            mimeType: "application/pdf",
            sizeBytes: 1572864,
            isEncrypted: false,
            expiresAt: new Date("2026-12-31"),
            downloadCount: 0,
        }
    });
    console.log("Created unencrypted file: test123");

    // Create ENCRYPTED test file (password = "hello")
    const passwordHash = createHash("sha256").update("hello").digest("hex");
    
    await prisma.file.create({
        data: {
            token: "test007",
            originalName: "VaultHub_Lite_PRD.pdf",
            storedName: "VaultHub_Lite_PRD.pdf",
            mimeType: "application/pdf",
            sizeBytes: 2097152,
            isEncrypted: true,
            passwordHash: passwordHash,
            iv: "dGVzdGl2MTIzNDU2Nzg=",      // fake base64 IV
            salt: "dGVzdHNhbHQxMjM0NTY=",    // fake base64 salt
            expiresAt: new Date("2026-12-31"),
            downloadCount: 0,
        }
    });
    console.log("Created encrypted file: testenc (password: hello)");
}

main()
    .catch(e => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });