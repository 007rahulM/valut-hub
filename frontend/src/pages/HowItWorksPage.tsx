



// // // // import { PageShell } from "../components/PageSheel";
// // // // import { Illustration } from "../components/Illustration";
// // // // import { InfoBanner } from "../components/InfoBanner";
// // // // import { Term } from "../components/Term";
// // // // import { Box, Group, Paper, Stack, Text } from "@mantine/core";

// // // // export function HowItWorksPage() {
// // // //   return (
// // // //     <PageShell title="How it works" subtitle="Zero-knowledge encryption in four steps">
// // // //       <Illustration src="/illustrations/upload.svg" alt="Uploading a file to the cloud" maxWidth={320} />

// // // //       <Stack gap="md" mt="lg">
// // // //         <Group align="flex-start" wrap="nowrap">
// // // //           <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
// // // //             style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// // // //             <Text fw={700} fz="sm">1</Text>
// // // //           </Paper>
// // // //           <div>
// // // //             <Text fw={600} fz="sm">Select your file</Text>
// // // //             <Text fz="sm" c="dimmed">Drag and drop or click to choose a file from your device. We support files up to 500 MB.</Text>
// // // //           </div>
// // // //         </Group>

// // // //         <Group align="flex-start" wrap="nowrap">
// // // //           <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
// // // //             style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// // // //             <Text fw={700} fz="sm">2</Text>
// // // //           </Paper>
// // // //           <div>
// // // //             <Text fw={600} fz="sm">Encrypt in your browser</Text>
// // // //             <Text fz="sm" c="dimmed">
// // // //               Your file is locked on your device with{" "}
// // // //               <Term tip="The industry-standard lock for data — the same family of encryption online banking uses. If even one byte is tampered with, unlocking simply fails.">AES-GCM</Term>{" "}
// // // //               before it travels, and your password is turned into the key with{" "}
// // // //               <Term tip="Turns your password into the lock's key, and works deliberately slowly so guessing attacks become impractical.">PBKDF2</Term>.
// // // //               The password never leaves your hands.
// // // //             </Text>
// // // //           </div>
// // // //         </Group>

// // // //         <Group align="flex-start" wrap="nowrap">
// // // //           <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
// // // //             style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// // // //             <Text fw={700} fz="sm">3</Text>
// // // //           </Paper>
// // // //           <div>
// // // //             <Text fw={600} fz="sm">Upload to cloud storage</Text>
// // // //             <Text fz="sm" c="dimmed">
// // // //               Only the locked file is uploaded. Our server stores metadata — filename, size, expiry — never the content.
// // // //               That is what{" "}
// // // //               <Term tip="We store only what the service needs — never the password, never the content. Even a full server breach leaks only locked boxes.">zero-knowledge</Term>{" "}
// // // //               means.
// // // //             </Text>
// // // //           </div>
// // // //         </Group>

// // // //         <Group align="flex-start" wrap="nowrap">
// // // //           <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
// // // //             style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// // // //             <Text fw={700} fz="sm">4</Text>
// // // //           </Paper>
// // // //           <div>
// // // //             <Text fw={600} fz="sm">Share the link</Text>
// // // //             <Text fz="sm" c="dimmed">Send the link to your recipient and the password separately. Only someone with both can unlock the file.</Text>
// // // //           </div>
// // // //         </Group>
// // // //       </Stack>

// // // //       <Box mt="xl">
// // // //         <InfoBanner>
// // // //           When the recipient opens the link and enters the password, their browser downloads the locked
// // // //           file, derives the same key and unlocks it locally. Our server never sees the password or the
// // // //           unlocked file.
// // // //         </InfoBanner>
// // // //       </Box>
// // // //     </PageShell>
// // // //   );
// // // // }

// // // // export default HowItWorksPage;


// // // // ============================================================
// // // // HowItWorksPage — FOUR STEPS IN PLAIN WORDS
// // // // Layout:
// // // //   - Hero illustration (shrinks on phones)
// // // //   - 4 numbered steps in a SimpleGrid:
// // // //     1 column on phones, 2 columns on bigger screens
// // // //     (so the page is much shorter on laptops)
// // // //   - Closing InfoBanner explaining the recipient's side
// // // // Tooltips (Term component) on: AES-GCM, PBKDF2, zero-knowledge
// // // // ============================================================
// // // import { PageShell } from "../components/PageSheel";
// // // import { Illustration } from "../components/Illustration";
// // // import { InfoBanner } from "../components/InfoBanner";
// // // import { Term } from "../components/Term";
// // // import { Box, Group, Paper, SimpleGrid, Text } from "@mantine/core";

// // // export function HowItWorksPage() {
// // //   return (
// // //     <PageShell title="How it works" subtitle="Zero-knowledge encryption in four steps">
// // //       <Illustration src="/illustrations/upload.svg" alt="Uploading a file to the cloud" maxWidth={320} />

// // //       {/* 1 column on phones, 2 columns on bigger screens (shorter page) */}
// // //       <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="lg">
// // //         <Group align="flex-start" wrap="nowrap">
// // //           <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
// // //             style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// // //             <Text fw={700} fz="sm">1</Text>
// // //           </Paper>
// // //           <div>
// // //             <Text fw={600} fz="sm">Select your file</Text>
// // //             <Text fz="sm" c="dimmed">Drag and drop or click to choose a file from your device. We support files up to 500 MB.</Text>
// // //           </div>
// // //         </Group>

// // //         <Group align="flex-start" wrap="nowrap">
// // //           <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
// // //             style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// // //             <Text fw={700} fz="sm">2</Text>
// // //           </Paper>
// // //           <div>
// // //             <Text fw={600} fz="sm">Encrypt in your browser</Text>
// // //             <Text fz="sm" c="dimmed">
// // //               Your file is locked on your device with{" "}
// // //               <Term tip="The industry-standard lock for data. The same family of encryption online banking uses. If even one byte is changed, unlocking simply fails.">AES-GCM</Term>{" "}
// // //               before it travels, and your password is turned into the key with{" "}
// // //               <Term tip="Turns your password into the lock's key, and works deliberately slowly so guessing attacks become impractical.">PBKDF2</Term>.
// // //               The password never leaves your hands.
// // //             </Text>
// // //           </div>
// // //         </Group>

// // //         <Group align="flex-start" wrap="nowrap">
// // //           <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
// // //             style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// // //             <Text fw={700} fz="sm">3</Text>
// // //           </Paper>
// // //           <div>
// // //             <Text fw={600} fz="sm">Upload to cloud storage</Text>
// // //             <Text fz="sm" c="dimmed">
// // //               Only the locked file is uploaded. Our server stores metadata (filename, size, expiry), never the content.
// // //               That is what{" "}
// // //               <Term tip="We store only what the service needs. Never the password, never the content. Even a full server breach leaks only locked boxes.">zero-knowledge</Term>{" "}
// // //               means.
// // //             </Text>
// // //           </div>
// // //         </Group>

// // //         <Group align="flex-start" wrap="nowrap">
// // //           <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
// // //             style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// // //             <Text fw={700} fz="sm">4</Text>
// // //           </Paper>
// // //           <div>
// // //             <Text fw={600} fz="sm">Share the link</Text>
// // //             <Text fz="sm" c="dimmed">Send the link to your recipient and the password separately. Only someone with both can unlock the file.</Text>
// // //           </div>
// // //         </Group>
// // //       </SimpleGrid>

// // //       <Box mt="xl">
// // //         <InfoBanner>
// // //           When the recipient opens the link and enters the password, their browser downloads the locked
// // //           file, derives the same key and unlocks it locally. Our server never sees the password or the
// // //           unlocked file.
// // //         </InfoBanner>
// // //       </Box>
// // //     </PageShell>
// // //   );
// // // }

// // // export default HowItWorksPage;

// // // ============================================================
// // // HowItWorksPage - route /how
// // // The four quick steps, exactly as before, plus one blue
// // // "Know more" button at the bottom that opens /deep-dive.
// // // ============================================================
// // import { Link } from "react-router-dom";
// // import { Box, Button, Group, Paper, SimpleGrid, Text } from "@mantine/core";
// // import { ArrowRight } from "lucide-react";
// // import { PageShell } from "../components/PageSheel";
// // import { Illustration } from "../components/Illustration";
// // import { InfoBanner } from "../components/InfoBanner";
// // import { Term } from "../components/Term";

// // export function HowItWorksPage() {
// //   return (
// //     <PageShell title="How it works" subtitle="Zero-knowledge encryption in four steps">
// //       <Illustration src="/illustrations/upload.svg" alt="Uploading a file to the cloud" maxWidth={320} />

// //       <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="lg">
// //         <Group align="flex-start" wrap="nowrap">
// //           <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
// //             style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// //             <Text fw={700} fz="sm">1</Text>
// //           </Paper>
// //           <div>
// //             <Text fw={600} fz="sm">Select your file</Text>
// //             <Text fz="sm" c="dimmed">Drag and drop or click to choose a file from your device. We support files up to 500 MB.</Text>
// //           </div>
// //         </Group>

// //         <Group align="flex-start" wrap="nowrap">
// //           <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
// //             style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// //             <Text fw={700} fz="sm">2</Text>
// //           </Paper>
// //           <div>
// //             <Text fw={600} fz="sm">Encrypt in your browser</Text>
// //             <Text fz="sm" c="dimmed">
// //               Your file is locked on your device with{" "}
// //               <Term tip="The industry-standard lock for data. The same family of encryption online banking uses. If even one byte is changed, unlocking simply fails.">AES-GCM</Term>{" "}
// //               before it travels, and your password is turned into the key with{" "}
// //               <Term tip="Turns your password into the lock's key, and works deliberately slowly so guessing attacks become impractical.">PBKDF2</Term>.
// //               The password never leaves your hands.
// //             </Text>
// //           </div>
// //         </Group>

// //         <Group align="flex-start" wrap="nowrap">
// //           <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
// //             style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// //             <Text fw={700} fz="sm">3</Text>
// //           </Paper>
// //           <div>
// //             <Text fw={600} fz="sm">Upload to cloud storage</Text>
// //             <Text fz="sm" c="dimmed">
// //               Only the locked file is uploaded. Our server stores metadata (filename, size, expiry), never the content.
// //               That is what{" "}
// //               <Term tip="We store only what the service needs. Never the password, never the content. Even a full server breach leaks only locked boxes.">zero-knowledge</Term>{" "}
// //               means.
// //             </Text>
// //           </div>
// //         </Group>

// //         <Group align="flex-start" wrap="nowrap">
// //           <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
// //             style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// //             <Text fw={700} fz="sm">4</Text>
// //           </Paper>
// //           <div>
// //             <Text fw={600} fz="sm">Share the link</Text>
// //             <Text fz="sm" c="dimmed">Send the link to your recipient and the password separately. Only someone with both can unlock the file.</Text>
// //           </div>
// //         </Group>
// //       </SimpleGrid>

// //       <Box mt="xl">
// //         <InfoBanner>
// //           When the recipient opens the link and enters the password, their browser downloads the locked
// //           file, derives the same key and unlocks it locally. Our server never sees the password or the
// //           unlocked file.
// //         </InfoBanner>
// //       </Box>

// //       <Box mt="md" ta="center">
// //         <Button
// //           component={Link}
// //           to="/deep-dive"
// //           variant="light"
// //           color="blue"
// //           radius="md"
// //           size="sm"
// //           rightSection={<ArrowRight size={14} />}
// //         >
// //           Know more: the technical deep dive
// //         </Button>
// //       </Box>
// //     </PageShell>
// //   );
// // }

// // export default HowItWorksPage;


// import { Link } from "react-router-dom";
// import { Box, Button, Group, Paper, SimpleGrid, Text, useMantineTheme } from "@mantine/core";
// import { ArrowRight } from "lucide-react";
// import { PageShell } from "../components/PageSheel";
// import { Illustration } from "../components/Illustration";
// import { InfoBanner } from "../components/InfoBanner";
// import { Term } from "../components/Term";

// function StepBadge({ n }: { n: number }) {
//   return (
//     <Paper
//       w={32}
//       h={32}
//       radius="xl"
//       bg="var(--mantine-color-brand-6)"
//       c="white"
//       style={{ display: "grid", placeItems: "center", flexShrink: 0 }}
//     >
//       <Text fw={700} fz="sm">{n}</Text>
//     </Paper>
//   );
// }

// export function HowItWorksPage() {
//   const theme = useMantineTheme();
  
//   return (
    
//     <PageShell title="How it works" subtitle="Zero-knowledge encryption in four steps">
//       <Illustration src="/illustrations/upload.svg" alt="Uploading a file to the cloud" maxWidth={320} />

//       <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="lg">
//         <Group align="flex-start" wrap="nowrap">
//           <StepBadge n={1} />
//           <div>
//             <Text fw={600} fz="sm">Select your file</Text>
//             <Text fz="sm" c="dimmed">Drag and drop or click to choose a file from your device. We support files up to 500 MB.</Text>
//           </div>
//         </Group>

//         <Group align="flex-start" wrap="nowrap">
//           <StepBadge n={2} />
//           <div>
//             <Text fw={600} fz="sm">Encrypt in your browser</Text>
//             <Text fz="sm" c="dimmed">
//               Your file is locked on your device with{" "}
//               <Term tip="The industry-standard lock for data. The same family of encryption online banking uses. If even one byte is changed, unlocking simply fails.">AES-GCM</Term>{" "}
//               before it travels, and your password is turned into the key with{" "}
//               <Term tip="Turns your password into the lock's key, and works deliberately slowly so guessing attacks become impractical.">PBKDF2</Term>.
//               The password never leaves your hands.
//             </Text>
//           </div>
//         </Group>

//         <Group align="flex-start" wrap="nowrap">
//           <StepBadge n={3} />
//           <div>
//             <Text fw={600} fz="sm">Upload to cloud storage</Text>
//             <Text fz="sm" c="dimmed">
//               Only the locked file is uploaded. Our server stores metadata (filename, size, expiry), never the content.
//               That is what{" "}
//               <Term tip="We store only what the service needs. Never the password, never the content. Even a full server breach leaks only locked boxes.">zero-knowledge</Term>{" "}
//               means.
//             </Text>
//           </div>
//         </Group>

//         <Group align="flex-start" wrap="nowrap">
//           <StepBadge n={4} />
//           <div>
//             <Text fw={600} fz="sm">Share the link</Text>
//             <Text fz="sm" c="dimmed">Send the link to your recipient and the password separately. Only someone with both can unlock the file.</Text>
//           </div>
//         </Group>
//       </SimpleGrid>

//       <Box mt="xl">
//         <InfoBanner>
//           When the recipient opens the link and enters the password, their browser downloads the locked
//           file, derives the same key and unlocks it locally. Our server never sees the password or the
//           unlocked file.
//         </InfoBanner>
//       </Box>
// <Box ta="center" mt="md">
//   <Button
//     component={Link}
//     to="/deep-dive"
//     variant="outline"
//     color="blue"
//     radius="md"
//     size="sm"
//     rightSection={<ArrowRight size={14} />}
//     styles={{
//       root: {
//         borderColor: 'var(--mantine-color-blue-6)',
//         color: 'var(--mantine-color-blue-6)',
//         transition: 'all 0.2s ease',
//         ':hover': {
//           backgroundColor: 'var(--mantine-color-blue-6)',
//           color: 'white',
//           borderColor: 'var(--mantine-color-blue-6)',
//         },
//       },
//     }}
//   >
//     Know more: the technical deep dive
//   </Button>
// </Box>
//     </PageShell>
//   );
// }

// export default HowItWorksPage;


import { Link } from "react-router-dom";
import { Box, Button, Group, Paper, SimpleGrid, Text } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import { PageShell } from "../components/PageSheel";
import { Illustration } from "../components/Illustration";
import { InfoBanner } from "../components/InfoBanner";
import { Term } from "../components/Term";

function StepBadge({ n }: { n: number }) {
  return (
    <Paper
      w={32}
      h={32}
      radius="xl"
      bg="var(--mantine-color-brand-6)"
      c="white"
      style={{ display: "grid", placeItems: "center", flexShrink: 0 }}
    >
      <Text fw={700} fz="sm">{n}</Text>
    </Paper>
  );
}

export function HowItWorksPage() {
  return (
    <PageShell title="How it works" subtitle="Zero-knowledge encryption in four steps">
      <Illustration src="/illustrations/upload.svg" alt="Uploading a file to the cloud" maxWidth={320} />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="lg">
        <Group align="flex-start" wrap="nowrap">
          <StepBadge n={1} />
          <div>
            <Text fw={600} fz="sm">Select your file</Text>
            <Text fz="sm" c="dimmed">Drag and drop or click to choose a file from your device. We support files up to 500 MB.</Text>
          </div>
        </Group>

        <Group align="flex-start" wrap="nowrap">
          <StepBadge n={2} />
          <div>
            <Text fw={600} fz="sm">Encrypt in your browser</Text>
            <Text fz="sm" c="dimmed">
              Your file is locked on your device with{" "}
              <Term tip="The industry-standard lock for data. The same family of encryption online banking uses. If even one byte is changed, unlocking simply fails.">AES-GCM</Term>{" "}
              before it travels, and your password is turned into the key with{" "}
              <Term tip="Turns your password into the lock's key, and works deliberately slowly so guessing attacks become impractical.">PBKDF2</Term>.
              The password never leaves your hands.
            </Text>
          </div>
        </Group>

        <Group align="flex-start" wrap="nowrap">
          <StepBadge n={3} />
          <div>
            <Text fw={600} fz="sm">Upload to cloud storage</Text>
            <Text fz="sm" c="dimmed">
              Only the locked file is uploaded. Our server stores metadata (filename, size, expiry), never the content.
              That is what{" "}
              <Term tip="We store only what the service needs. Never the password, never the content. Even a full server breach leaks only locked boxes.">zero-knowledge</Term>{" "}
              means.
            </Text>
          </div>
        </Group>

        <Group align="flex-start" wrap="nowrap">
          <StepBadge n={4} />
          <div>
            <Text fw={600} fz="sm">Share the link</Text>
            <Text fz="sm" c="dimmed">Send the link to your recipient and the password separately. Only someone with both can unlock the file.</Text>
          </div>
        </Group>
      </SimpleGrid>

      <Box mt="xl">
        <InfoBanner>
          When the recipient opens the link and enters the password, their browser downloads the locked
          file, derives the same key and unlocks it locally. Our server never sees the password or the
          unlocked file.
        </InfoBanner>
      </Box>

      <Box ta="center" mt="md">
        <Button
          component={Link}
          to="/deep-dive"
          variant="outline"
          color="blue"
          radius="md"
          size="sm"
          rightSection={<ArrowRight size={14} />}
          styles={{
            root: {
              borderColor: 'var(--mantine-color-blue-6)',
              color: 'var(--mantine-color-blue-6)',
              transition: 'all 0.2s ease',
              ':hover': {
                backgroundColor: 'var(--mantine-color-blue-6)',
                color: 'white',
                borderColor: 'var(--mantine-color-blue-6)',
              },
            },
          }}
        >
          Know more: the technical deep dive
        </Button>
      </Box>
    </PageShell>
  );
}

export default HowItWorksPage;