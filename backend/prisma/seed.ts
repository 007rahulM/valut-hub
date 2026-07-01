import prisma from "../src/lib/prisma";

async function main() {
  // Create a test file
  const file = await prisma.file.create({
    data: {
      token: "test123",
      originalName: "Project_Report_Final.pdf",
      storedName: "uuid-test-file.bin",
      mimeType: "application/pdf",
      sizeBytes: 1572864,
      isEncrypted: true,
      expiresAt: new Date("2026-12-31"),
      passwordHash: null,
      iv: "test-iv",
      salt: "test-salt",
    },
  });

  console.log("Created test file:", file.token);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });