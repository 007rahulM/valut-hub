// // pages/HowItWorksPage.tsx
// export function HowItWorksPage() {
//   return (
//     <div className="max-w-3xl mx-auto">
//       <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 sm:p-8">
//         <h1 className="text-2xl font-bold text-slate-900 mb-1">How it works</h1>
//         <p className="text-sm text-slate-500 mb-6">Zero-knowledge encryption in four steps</p>

//         <div className="space-y-6">
//           <div className="flex gap-4">
//             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
//             <div>
//               <h4 className="text-sm font-semibold text-slate-800">Select your file</h4>
//               <p className="text-sm text-slate-500">Drag and drop or click to choose a file from your device. We support files up to 500 MB.</p>
//             </div>
//           </div>
//           <div className="flex gap-4">
//             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
//             <div>
//               <h4 className="text-sm font-semibold text-slate-800">Encrypt in your browser</h4>
//               <p className="text-sm text-slate-500">If you choose encryption, we use the Web Crypto API to encrypt your file with AES-GCM. A unique password is generated, or you can set your own. The password never leaves your device.</p>
//             </div>
//           </div>
//           <div className="flex gap-4">
//             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
//             <div>
//               <h4 className="text-sm font-semibold text-slate-800">Upload to cloud storage</h4>
//               <p className="text-sm text-slate-500">The encrypted file bytes are uploaded directly to secure cloud storage using a presigned URL. Our server only sees metadata — filename, size, and encryption parameters — never the actual content.</p>
//             </div>
//           </div>
//           <div className="flex gap-4">
//             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
//             <div>
//               <h4 className="text-sm font-semibold text-slate-800">Share the link</h4>
//               <p className="text-sm text-slate-500">You get a unique share link . Send the link to your recipient. Share the password separately. Only someone with both the link and password can decrypt and download the file.</p>
//             </div>
//           </div>
//         </div>

//         <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
//           <h3 className="text-sm font-semibold text-slate-800 mb-2">Decryption process</h3>
//           <p className="text-sm text-slate-500">When the recipient clicks the link, they enter the password. Their browser downloads the encrypted file, derives the same AES key using PBKDF2 with the stored salt, and decrypts the file locally. The decrypted file is then saved to their device. At no point does our server see the password or the unencrypted content.</p>
//         </div>
//       </div>
//     </div>
//   );
// }



import { PageShell } from "../components/PageSheel";
import { Illustration } from "../components/Illustration";
import { InfoBanner } from "../components/InfoBanner";
import { Term } from "../components/Term";
import { Box, Group, Paper, Stack, Text } from "@mantine/core";

export function HowItWorksPage() {
  return (
    <PageShell title="How it works" subtitle="Zero-knowledge encryption in four steps">
      <Illustration src="/illustrations/upload.svg" alt="Uploading a file to the cloud" maxWidth={320} />

      <Stack gap="md" mt="lg">
        <Group align="flex-start" wrap="nowrap">
          <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
            style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Text fw={700} fz="sm">1</Text>
          </Paper>
          <div>
            <Text fw={600} fz="sm">Select your file</Text>
            <Text fz="sm" c="dimmed">Drag and drop or click to choose a file from your device. We support files up to 500 MB.</Text>
          </div>
        </Group>

        <Group align="flex-start" wrap="nowrap">
          <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
            style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Text fw={700} fz="sm">2</Text>
          </Paper>
          <div>
            <Text fw={600} fz="sm">Encrypt in your browser</Text>
            <Text fz="sm" c="dimmed">
              Your file is locked on your device with{" "}
              <Term tip="The industry-standard lock for data — the same family of encryption online banking uses. If even one byte is tampered with, unlocking simply fails.">AES-GCM</Term>{" "}
              before it travels, and your password is turned into the key with{" "}
              <Term tip="Turns your password into the lock's key, and works deliberately slowly so guessing attacks become impractical.">PBKDF2</Term>.
              The password never leaves your hands.
            </Text>
          </div>
        </Group>

        <Group align="flex-start" wrap="nowrap">
          <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
            style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Text fw={700} fz="sm">3</Text>
          </Paper>
          <div>
            <Text fw={600} fz="sm">Upload to cloud storage</Text>
            <Text fz="sm" c="dimmed">
              Only the locked file is uploaded. Our server stores metadata — filename, size, expiry — never the content.
              That is what{" "}
              <Term tip="We store only what the service needs — never the password, never the content. Even a full server breach leaks only locked boxes.">zero-knowledge</Term>{" "}
              means.
            </Text>
          </div>
        </Group>

        <Group align="flex-start" wrap="nowrap">
          <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
            style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Text fw={700} fz="sm">4</Text>
          </Paper>
          <div>
            <Text fw={600} fz="sm">Share the link</Text>
            <Text fz="sm" c="dimmed">Send the link to your recipient and the password separately. Only someone with both can unlock the file.</Text>
          </div>
        </Group>
      </Stack>

      <Box mt="xl">
        <InfoBanner>
          When the recipient opens the link and enters the password, their browser downloads the locked
          file, derives the same key and unlocks it locally. Our server never sees the password or the
          unlocked file.
        </InfoBanner>
      </Box>
    </PageShell>
  );
}

export default HowItWorksPage;