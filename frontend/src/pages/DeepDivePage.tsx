// // // // ============================================================
// // // // DeepDivePage — the technical walkthrough (real route: /deep-dive).
// // // // Linked from About and How it works. Good for SEO, no popups.
// // // // Zigzag layout: illustration left / right alternating.
// // // // Professional copy. No emojis. No marketing noise.
// // // // ============================================================
// // // import type { ReactNode } from "react";
// // // import { Link } from "react-router-dom";
// // // import { Box, Button, SimpleGrid, Text } from "@mantine/core";
// // // import { PageShell } from "../components/PageSheel";
// // // import { Illustration } from "../components/Illustration";
// // // import { Term } from "../components/Term";

// // // interface DeepRowProps {
// // //   title: string;
// // //   illustration: string;
// // //   alt: string;
// // //   flip?: boolean;
// // //   children: ReactNode;
// // // }

// // // function DeepRow({ title, illustration, alt, flip = false, children }: DeepRowProps) {
// // //   const art = (
// // //     <Box py="md">
// // //       <Illustration src={illustration} alt={alt} maxWidth={260} />
// // //     </Box>
// // //   );
// // //   const body = (
// // //     <Box py="md">
// // //       <Text fw={700} fz="md" c="var(--mantine-color-text)" mb="xs">
// // //         {title}
// // //       </Text>
// // //       <Text fz="sm" c="dimmed" lh={1.8}>
// // //         {children}
// // //       </Text>
// // //     </Box>
// // //   );

// // //   return (
// // //     <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" verticalAlign="center">
// // //       {flip ? (<>{body}{art}</>) : (<>{art}{body}</>)}
// // //     </SimpleGrid>
// // //   );
// // // }

// // // export function DeepDivePage() {
// // //   return (
// // //     <PageShell
// // //       title="How Sendly actually works"
// // //       subtitle="A plain-words technical walkthrough of what happens to your file, on your device, on our server, and in storage."
// // //     >
// // //       <DeepRow
// // //         title="A password becomes a key on your device"
// // //         illustration="/illustrations/enter-password2.svg"
// // //         alt="Choosing a password on the upload page"
// // //       >
// // //         When you protect a file, your browser mixes your password with a random salt using{" "}
// // //         <Term tip="A key derivation function. It repeats the mixing 100,000 times so guessing passwords is painfully slow.">PBKDF2</Term>{" "}
// // //         to produce a 256-bit encryption key. The password and the key never leave your device. The salt is stored with the file so the recipient's browser can repeat the same recipe and rebuild the same key.
// // //       </DeepRow>

// // //       <DeepRow
// // //         flip
// // //         title="The file is locked in small pieces"
// // //         illustration="/illustrations/secure-password.svg"
// // //         alt="Encrypted pieces travelling to cloud storage"
// // //       >
// // //         The file is split into 16 MB pieces. Each piece is sealed with{" "}
// // //         <Term tip="The industry-standard authenticated encryption. It scrambles the data and attaches a tamper-evident seal.">AES-GCM</Term>{" "}
// // //         using a unique nonce (a base IV plus the piece index), so no two pieces look alike. Every piece also carries a 16-byte authentication tag. The sealed pieces travel straight to cloud storage over short-lived signed URLs. Our server never sees the content.
// // //       </DeepRow>

// // //       <DeepRow
// // //         title="The link carries rules, not data"
// // //         illustration="/illustrations/share-link.svg"
// // //         alt="A share link being handed over"
// // //       >
// // //         The share link points to metadata only: an expiry date and a download limit. The password is not part of the link unless the sender explicitly embeds it, and the page warns about that trade-off. When the expiry or the limit is reached, the file is removed from storage.
// // //       </DeepRow>

// // //       <DeepRow
// // //         flip
// // //         title="The recipient unlocks it locally"
// // //         illustration="/illustrations/unlock.svg"
// // //         alt="The recipient unlocking the file on their device"
// // //       >
// // //         The recipient's browser downloads the sealed pieces, rebuilds the same key from the password and the salt, and verifies every authentication tag before reassembling the file on their device. If a single byte was changed anywhere, unlocking fails. Nothing unlocked ever touches our server.
// // //       </DeepRow>

// // //       <Box ta="center" mt="xl">
// // //         {/* If your How-it-works route is different, change this path only. */}
// // //         <Button component={Link} to="/how-it-works" variant="default" radius="md" size="sm">
// // //           Back to the quick version
// // //         </Button>
// // //       </Box>
// // //     </PageShell>
// // //   );
// // // }

// // // export default DeepDivePage;



// // // ============================================================
// // // DeepDivePage - route /deep-dive
// // // The technical story in six numbered cards. On phones each card
// // // keeps its heading, illustration and paragraph together, so
// // // nothing ever mixes. On desktop the art alternates left/right.
// // // Back returns to the page the reader came from.
// // // ============================================================
// // import type { ReactNode } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { Button, Grid, Group, Paper, Stack, Text } from "@mantine/core";
// // import { ArrowLeft } from "lucide-react";
// // import { PageShell } from "../components/PageSheel";
// // import { Illustration } from "../components/Illustration";
// // import { Term } from "../components/Term";

// // interface DeepRowProps {
// //   number: number;
// //   title: string;
// //   illustration: string;
// //   alt: string;
// //   flip?: boolean;
// //   children: ReactNode;
// // }

// // function DeepRow({ number, title, illustration, alt, flip = false, children }: DeepRowProps) {
// //   return (
// //     <Paper withBorder radius="md" p={{ base: "md", sm: "lg" }}>
// //       <Group gap="sm" mb="xs" wrap="nowrap">
// //         <Paper w={32} h={32} radius="xl" bg="var(--mantine-color-brand-light)" c="brand"
// //           style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
// //           <Text fw={700} fz="sm">{number}</Text>
// //         </Paper>
// //         <Text fw={700} fz="md" c="var(--mantine-color-text)">{title}</Text>
// //       </Group>
// //       <Grid gutter="md">
// //         <Grid.Col span={{ base: 12, md: 5 }} order={{ base: 1, md: flip ? 2 : 1 }}>
// //           <Illustration src={illustration} alt={alt} maxWidth={280} />
// //         </Grid.Col>
// //         <Grid.Col span={{ base: 12, md: 7 }} order={{ base: 2, md: flip ? 1 : 2 }}>
// //           <Text fz="sm" c="dimmed" lh={1.8}>{children}</Text>
// //         </Grid.Col>
// //       </Grid>
// //     </Paper>
// //   );
// // }

// // export function DeepDivePage() {
// //   const navigate = useNavigate();
// //   const goBack = () => {
// //     if (window.history.length > 1) navigate(-1);
// //     else navigate("/how");
// //   };

// //   return (
// //     <PageShell title="How Sendly actually works" subtitle="The technical story, in plain words.">
// //       <Stack gap="md">
// //         <DeepRow number={1} title="You pick a file and a password" illustration="/illustrations/enter-password2.svg" alt="A person locking a phone with a key">
// //           You choose any file up to 500 MB and, if you want, a password. Nothing leaves your
// //           device yet. The password is used only on your device; we never receive it.
// //         </DeepRow>

// //         <DeepRow number={2} flip title="Your browser locks the file in small pieces" illustration="/illustrations/secure-password.svg" alt="A file sealed with a strong password">
// //           The password is mixed with a random salt using{" "}
// //           <Term tip="A key derivation function. It repeats the mixing 100,000 times so guessing passwords is painfully slow.">PBKDF2</Term>{" "}
// //           to produce a 256-bit key. The file is split into 16 MB pieces and each piece is sealed with{" "}
// //           <Term tip="The industry-standard authenticated encryption. It scrambles the data and attaches a tamper-evident seal.">AES-GCM</Term>{" "}
// //           using its own nonce (a base IV plus the piece number), so no two pieces look alike.
// //           Each piece also carries a 16-byte tamper seal.
// //         </DeepRow>

// //         <DeepRow number={3} title="The locked pieces travel straight to cloud storage" illustration="/illustrations/share-link.svg" alt="A person sending a file to the cloud">
// //           Your browser talks to storage directly using{" "}
// //           <Term tip="A temporary signed URL that allows one specific action on one specific object, then expires.">presigned URLs</Term>.
// //           Up to four pieces travel at the same time. If one piece fails, only that piece is
// //           retried. If your internet drops, finished pieces stay finished and the upload
// //           resumes. Our server coordinates but never sees the content.
// //         </DeepRow>

// //         <DeepRow number={4} flip title="The link carries rules, not data" illustration="/illustrations/short_lived_url.svg" alt="A short lived access link">
// //           The share link points to metadata only: an expiry date and a download limit. When
// //           either is reached, the link stops working. The password is not part of the link
// //           unless the sender explicitly embeds it, and the upload page warns about that
// //           trade-off.
// //         </DeepRow>

// //         <DeepRow number={5} title="The recipient unlocks it on their own device" illustration="/illustrations/unlock.svg" alt="A person receiving a file on their phone">
// //           The recipient's browser downloads the sealed pieces two at a time, rebuilds the same
// //           key from the password and the salt, checks every tamper seal, and reassembles the
// //           original file. If a single byte was changed anywhere, unlocking fails. The real
// //           limit here is the recipient's download speed; our side adds almost nothing.
// //         </DeepRow>

// //         <DeepRow number={6} flip title="When the link retires, deletion is real" illustration="/illustrations/link-expired.svg" alt="An expired link">
// //           At expiry or at the download limit, the server stops handing out passes and the
// //           stored object is removed from storage. Abandoned uploads are aborted and cleaned.
// //           Nothing stays online waiting to be found.
// //         </DeepRow>

// //         <Paper withBorder radius="md" p={{ base: "md", sm: "lg" }} bg="var(--mantine-color-gray-0)">
// //           <Text fw={700} fz="sm" mb="xs">The honest limits</Text>
// //           <Text fz="sm" c="dimmed" lh={1.8}>
// //             The main limit is always the user's own bandwidth; code cannot change that. What
// //             we control, we keep light: pieces stay at 16 MB so old phones work, finished
// //             pieces survive network drops, and a file never grows beyond 500 MB per share.
// //           </Text>
// //         </Paper>
// //       </Stack>

// //       <Group justify="center" mt="lg">
// //         <Button variant="default" radius="md" size="sm" leftSection={<ArrowLeft size={14} />} onClick={goBack}>
// //           Back
// //         </Button>
// //       </Group>
// //     </PageShell>
// //   );
// // }

// // export default DeepDivePage;


// import type { ReactNode } from "react";
// import { useNavigate } from "react-router-dom";
// import { Box, Button, Grid, Paper, Text } from "@mantine/core";
// import { ArrowLeft } from "lucide-react";
// import { PageShell } from "../components/PageSheel";
// import { Illustration } from "../components/Illustration";
// import { Term } from "../components/Term";

// interface DeepRowProps {
//   number: number;
//   title: string;
//   illustration: string;
//   alt: string;
//   flip?: boolean;
//   children: ReactNode;
// }

// function DeepRow({ number, title, illustration, alt, flip = false, children }: DeepRowProps) {
//   const art = (
//     <Box py="xs" ta="center">
//       <Illustration src={illustration} alt={alt} maxWidth={220} />
//     </Box>
//   );
//   const body = (
//     <Box py="xs">
//       <Text fw={700} fz="sm" c="var(--mantine-color-text)" mb={6}>
//         {number}. {title}
//       </Text>
//       <Text fz="sm" c="dimmed" lh={1.7}>{children}</Text>
//     </Box>
//   );
//   return (
//     <Paper withBorder radius="md" p="md">
//       <Grid gutter={{ base: "sm", md: "md" }} align="center">
//         <Grid.Col span={{ base: 12, md: 5 }} order={{ base: 1, md: flip ? 2 : 1 }}>{art}</Grid.Col>
//         <Grid.Col span={{ base: 12, md: 7 }} order={{ base: 2, md: flip ? 1 : 2 }}>{body}</Grid.Col>
//       </Grid>
//     </Paper>
//   );
// }

// export function DeepDivePage() {
//   const navigate = useNavigate();
//   const goBack = () => {
//     if (window.history.length > 1) navigate(-1);
//     else navigate("/how");
//   };

//   return (
//     <PageShell
     
//       title="How Sendly actually works"
//       subtitle="A plain-words walkthrough of what happens to your file, on your device, on our server, and in storage."
//     >
//       <Box mt="md" style={{ display: "grid", gap: 12 }}>
//         <DeepRow number={1} title="You pick a file and a password" illustration="/illustrations/enter-password2.svg" alt="Choosing a password on the upload page">
//           When you protect a file, your browser mixes your password with a random salt using{" "}
//           <Term tip="A key derivation function. It repeats the mixing 100,000 times so guessing passwords is painfully slow.">PBKDF2</Term>{" "}
//           to produce a 256-bit encryption key. The password and the key never leave your
//           device. The salt is stored with the file so the recipient's browser can repeat the
//           same recipe and rebuild the same key.
//         </DeepRow>

//         <DeepRow flip number={2} title="Your browser locks the file in small pieces" illustration="/illustrations/secure-password.svg" alt="A file locked with a key">
//           The file is split into 16 MB pieces. Each piece is sealed with{" "}
//           <Term tip="The industry-standard authenticated encryption. It scrambles the data and attaches a tamper-evident seal.">AES-GCM</Term>{" "}
//           using a unique nonce (a base IV plus the piece index), so no two pieces look alike.
//           Every piece also carries a 16-byte authentication tag.
//         </DeepRow>

//         <DeepRow number={3} title="The locked pieces travel on short-lived passes" illustration="/illustrations/tell.svg" alt="A short-lived access pass">
//           Your browser sends each sealed piece straight to cloud storage over a{" "}
//           <Term tip="A temporary signed URL that allows one single action on one single object, then expires.">presigned URL</Term>{" "}
//           that expires in minutes. Up to four pieces travel at the same time. If one piece
//           fails, only that piece is retried. Our server never sees the content.
//         </DeepRow>

//         <DeepRow flip number={4} title="The link carries rules, not data" illustration="/illustrations/share-link.svg" alt="A share link being handed over">
//           The share link points to metadata only: an expiry date and a download limit. The
//           password is not part of the link unless the sender explicitly embeds it, and the
//           upload page warns about that trade-off.
//         </DeepRow>

//         <DeepRow number={5} title="The recipient unlocks it on their own device" illustration="/illustrations/unlock.svg" alt="The recipient downloading the file">
//           The recipient's browser downloads the sealed pieces, rebuilds the same key from the
//           password and the salt, and verifies every authentication tag before reassembling the
//           file. If a single byte was changed anywhere, unlocking fails. Nothing unlocked ever
//           touches our server.
//         </DeepRow>

//         <DeepRow flip number={6} title="When the link retires, deletion is real" illustration="/illustrations/link-expired.svg" alt="An expired link being discarded">
//           When the expiry date or the download limit is reached, the server stops handing out
//           passes and the stored object is removed from storage. Abandoned uploads are aborted
//           and cleaned. Nothing stays online waiting to be found.
//         </DeepRow>

//         <Paper withBorder radius="md" p="md">
//           <Text fw={700} fz="sm" c="var(--mantine-color-text)" mb={6}>
//             The honest limits, in simple words
//           </Text>
//           <Text fz="sm" c="dimmed" lh={1.7}>
//             Your internet is the real limit, not our server. Most phones upload at 5 to 10
//             Mbps and download at 30 to 50 Mbps. A laptop on home fiber usually gets 20 to 50
//             Mbps upload and 100 to 300 Mbps download. Your router and Wi-Fi quality also
//             matter. In plain words: a 500 MB file on a phone with 10 Mbps upload takes around
//             7 minutes to upload, and around 15 seconds to download at 50 Mbps. On a laptop
//             with 50 Mbps upload it takes around 1.5 minutes. Our system can address files up
//             to around 160 GB (10,000 pieces of 16 MB), but we cap shares at 500 MB on
//             purpose: it keeps uploads finishable on normal connections and keeps storage
//             costs sane. Sendly is inspired by Firefox Send: encrypted on your device, shared
//             as a link, expired on schedule, deleted for real.
//           </Text>
//         </Paper>
//       </Box>

//       <Box ta="center" mt="md">
//         <Button variant="default" radius="md" size="sm" leftSection={<ArrowLeft size={14} />} onClick={goBack}>
//           Back
//         </Button>
//       </Box>
//     </PageShell>
//   );
// }

// export default DeepDivePage;


import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Paper, Text } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "../components/PageSheel";
import { Illustration } from "../components/Illustration";
import { Term } from "../components/Term";

interface DeepRowProps {
  number: number;
  title: string;
  illustration: string;
  alt: string;
  flip?: boolean;
  children: ReactNode;
}

function DeepRow({ number, title, illustration, alt, flip = false, children }: DeepRowProps) {
  const art = (
    <Box py="xs" ta="center">
      <Illustration src={illustration} alt={alt} maxWidth={220} />
    </Box>
  );
  const body = (
    <Box py="xs">
      <Text fw={700} fz="sm" c="var(--mantine-color-text)" mb={6}>
        {number}. {title}
      </Text>
      <Text fz="sm" c="dimmed" lh={1.7}>{children}</Text>
    </Box>
  );
  return (
    <Paper withBorder radius="md" p="md">
      <Grid align="center">
        <Grid.Col span={{ base: 12, md: 5 }} order={{ base: 1, md: flip ? 2 : 1 }}>{art}</Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }} order={{ base: 2, md: flip ? 1 : 2 }}>{body}</Grid.Col>
      </Grid>
    </Paper>
  );
}

export function DeepDivePage() {
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/how");
  };

  return (
    <PageShell
      title="How Sendly actually works"
      subtitle="A walkthrough of what happens to your file, on your device, on our server, and in storage."
    >
      <Box mt="md" style={{ display: "grid", gap: 12 }}>
        <DeepRow number={1} title="You pick a file and a password" illustration="/illustrations/enter-password2.svg" alt="Choosing a password on the upload page">
          When you protect a file, your browser mixes your password with a random salt using{" "}
          <Term tip="A key derivation function. It repeats the mixing 100,000 times so guessing passwords is painfully slow.">PBKDF2</Term>{" "}
          to produce a 256-bit encryption key. The password and the key never leave your
          device. The salt is stored with the file so the recipient's browser can repeat the
          same recipe and rebuild the same key.
        </DeepRow>

        <DeepRow flip number={2} title="Your browser locks the file in small pieces" illustration="/illustrations/secure-password.svg" alt="A file locked with a key">
          The file is split into 16 MB pieces. Each piece is sealed with{" "}
          <Term tip="The industry-standard authenticated encryption. It scrambles the data and attaches a tamper-evident seal.">AES-GCM</Term>{" "}
          using a unique nonce (a base IV plus the piece index), so no two pieces look alike.
          Every piece also carries a 16-byte authentication tag.
        </DeepRow>

        <DeepRow number={3} title="The locked pieces travel on short-lived passes" illustration="/illustrations/tell.svg" alt="A short-lived access pass">
          Your browser sends each sealed piece straight to cloud storage over a{" "}
          <Term tip="A temporary signed URL that allows one single action on one single object, then expires.">presigned URL</Term>{" "}
          that expires in minutes. Up to four pieces travel at the same time. If one piece
          fails, only that piece is retried. Our server never sees the content.
        </DeepRow>

        <DeepRow flip number={4} title="The link carries rules, not data" illustration="/illustrations/share-link.svg" alt="A share link being handed over">
          The share link points to metadata only: an expiry date and a download limit. The
          password is not part of the link unless the sender explicitly embeds it, and the
          upload page warns about that trade-off.
        </DeepRow>

        <DeepRow number={5} title="The recipient unlocks it on their own device" illustration="/illustrations/unlock.svg" alt="The recipient downloading the file">
          The recipient's browser downloads the sealed pieces, rebuilds the same key from the
          password and the salt, and verifies every authentication tag before reassembling the
          file. If a single byte was changed anywhere, unlocking fails. Nothing unlocked ever
          touches our server.
        </DeepRow>

        <DeepRow flip number={6} title="When the link retires, deletion is real" illustration="/illustrations/link-expired.svg" alt="An expired link being discarded">
          When the expiry date or the download limit is reached, the server stops handing out
          passes and the stored object is removed from storage. Abandoned uploads are aborted
          and cleaned. Nothing stays online waiting to be found.
        </DeepRow>

               <Paper withBorder radius="md" p="md">
          <Text fw={700} fz="sm" c="var(--mantine-color-text)" mb={6}>
            The honest limits, in simple words
          </Text>
          <Text fz="sm" c="dimmed" lh={1.7}>
            The real limit is your internet connection, not our server. Most home and mobile
            internet connections are built to download data much faster than they upload it.
            This is why receiving a file usually feels instant, while sending a large file can
            take a few minutes. Your actual speed depends on your Internet Service Provider,
            your router, and your Wi-Fi signal.
          </Text>
          <Text fz="sm" c="dimmed" lh={1.7} mt="sm">
            We cap shares at 500 MB on purpose. This keeps uploads finishable on normal
            connections and ensures the service stays fast and reliable for everyone.
          </Text>
        </Paper>
      </Box>

      <Box ta="center" mt="md">
        <Button variant="default" radius="md" size="sm" leftSection={<ArrowLeft size={14} />} onClick={goBack}>
          Back
        </Button>
      </Box>
    </PageShell>
  );
}

export default DeepDivePage;