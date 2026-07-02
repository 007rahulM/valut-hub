import prisma from "../src/lib/prisma";

async function main() {
  // Create a test file
  const file = await prisma.file.create({
    data: {
      token: "test12345",
      originalName: "valuthub-test-file-v4.pdf",
      storedName: "uuid-test-file-v4.bin",
      mimeType: "application/pdf",
      sizeBytes: 1572864,
      isEncrypted: true,
      downloadCount: 0,
      maxDownloads: 10,
      expiresAt: new Date("2026-12-21"),
      passwordHash: null,
      iv: "test-iv",
      salt: "test-salt",
    },
  });

  console.log("Created test file:", file.token);
}

main()
  .catch((e) => {
    console.log("Seed failed:");
    console.error(e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });