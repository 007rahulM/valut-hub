
// // // // // ============================================================
// // // // // AboutPage — WHO WE ARE AND WHY WE BUILT THIS
// // // // // Four short sections: Mission, How we're different,
// // // // // Who it's for, and a light-hearted closing note.
// // // // // Tooltips (Term component) on: zero-knowledge, AES-GCM.
// // // // // ============================================================

// // // // import { PageShell } from "../components/PageSheel";
// // // // import { Text } from "@mantine/core";
// // // // import { Term } from "../components/Term";

// // // // export function AboutPage() {
// // // //   return (
// // // //     <PageShell title="About Sendly" subtitle="Privacy-first file sharing, for everyone.">
// // // //       <img src="/illustrations/about.svg" alt="A secure vault"
// // // //         style={{ maxWidth: 280, width: "100%", height: "auto", margin: "0 auto 28px", display: "block" }} />

// // // //       <Text fz="sm" c="dimmed" mb="md" lh={1.7}>
// // // //         <Text component="span" fw={700} c="var(--mantine-color-text)">Our Mission:</Text> your files should belong to you, not us. Most cloud storage services keep files indefinitely, and their terms often allow scanning and machine-learning on whatever you upload. Sendly does the opposite. Sharing a file is as easy as sending a link, and as private as handing someone a locked box
// // // //       </Text>

// // // //       <Text fz="sm" c="dimmed" mb="md" lh={1.7}>
// // // //         <Text component="span" fw={700} c="var(--mantine-color-text)">How we're different:</Text> Sendly uses{" "}
// // // //         <Term tip="A security model where the server only stores encrypted data and never possesses the keys to decrypt it. Even if our servers were compromised, your files would remain unreadable.">zero-knowledge</Term>{" "}
// // // //         architecture. Files are encrypted on your device with{" "}
// // // //         <Term tip="The industry-standard encryption used by banks and password managers. If even one byte is tampered with, unlocking simply fails.">AES-GCM</Term>{" "}
// // // //         before upload. We never scan your files, never train AI on them, and delete them automatically after their configured time or download limit, "Delete" actually means delete here.
// // // //       </Text>

// // // //       <Text fz="sm" c="dimmed" mb="md" lh={1.7}>
// // // //         <Text component="span" fw={700} c="var(--mantine-color-text)">Who it's for:</Text> Everyone. Students and teachers sharing coursework for a limited time. Freelancers delivering work to clients. Families sending photos without a permanent album. Developers sending credentials safely. Creators selling digital goods with limited downloads. Clinics and consultants sharing sensitive documents. And anyone who simply believes their documents shouldn't live on the internet forever.
// // // //       </Text>

// // // //       <Text fz="sm" c="dimmed" lh={1.7}>
// // // //         <Text component="span" fw={700} c="var(--mantine-color-text)">One light-hearted note:</Text> Sendly exists to keep private things private  so please don't use it to leak exam papers, spoilers, or anyone else's secrets without permission. Privacy is a right we protect, not a loophole we provide. 🙂
// // // //       </Text>
// // // //     </PageShell>
// // // //   );
// // // // }

// // // // export default AboutPage;


// // // // ============================================================
// // // // AboutPage — WHO WE ARE AND WHY WE BUILT THIS
// // // // Four short sections: Mission, How we're different,
// // // // Who it's for, and a light-hearted closing note.
// // // // Tooltips (Term component) on: zero-knowledge, AES-GCM.
// // // // Illustration now uses the shared Illustration box (same size
// // // // on phones as every other page).
// // // // ============================================================

// // // import { PageShell } from "../components/PageSheel";
// // // import { Illustration } from "../components/Illustration";
// // // import { Box, Text } from "@mantine/core";
// // // import { Term } from "../components/Term";

// // // export function AboutPage() {
// // //   return (
// // //     <PageShell title="About Sendly" subtitle="Privacy-first file sharing, for everyone.">
// // //       <Box mb="xl">
// // //         <Illustration src="/illustrations/about.svg" alt="A secure vault" maxWidth={280} />
// // //       </Box>

// // //       <Text fz="sm" c="dimmed" mb="md" lh={1.7}>
// // //         <Text component="span" fw={700} c="var(--mantine-color-text)">Our Mission:</Text> your files should belong to you, not us. Most cloud storage services keep files indefinitely, and their terms often allow scanning and machine-learning on whatever you upload. Sendly does the opposite. Sharing a file is as easy as sending a link, and as private as handing someone a locked box
// // //       </Text>

// // //       <Text fz="sm" c="dimmed" mb="md" lh={1.7}>
// // //         <Text component="span" fw={700} c="var(--mantine-color-text)">How we're different:</Text> Sendly uses{" "}
// // //         <Term tip="A security model where the server only stores encrypted data and never possesses the keys to decrypt it. Even if our servers were compromised, your files would remain unreadable.">zero-knowledge</Term>{" "}
// // //         architecture. Files are encrypted on your device with{" "}
// // //         <Term tip="The industry-standard encryption used by banks and password managers. If even one byte is tampered with, unlocking simply fails.">AES-GCM</Term>{" "}
// // //         before upload. We never scan your files, never train AI on them, and delete them automatically after their configured time or download limit, "Delete" actually means delete here.
// // //       </Text>

// // //       <Text fz="sm" c="dimmed" mb="md" lh={1.7}>
// // //         <Text component="span" fw={700} c="var(--mantine-color-text)">Who it's for:</Text> Everyone. Students and teachers sharing coursework for a limited time. Freelancers delivering work to clients. Families sending photos without a permanent album. Developers sending credentials safely. Creators selling digital goods with limited downloads. Clinics and consultants sharing sensitive documents. And anyone who simply believes their documents shouldn't live on the internet forever.
// // //       </Text>

// // //       <Text fz="sm" c="dimmed" lh={1.7}>
// // //         <Text component="span" fw={700} c="var(--mantine-color-text)">One light-hearted note:</Text> Sendly exists to keep private things private  so please don't use it to leak exam papers, spoilers, or anyone else's secrets without permission. Privacy is a right we protect, not a loophole we provide. 🙂
// // //       </Text>
// // //     </PageShell>
// // //   );
// // // }

// // // export default AboutPage;

// // import { Box, Card, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
// // import { PageShell } from "../components/PageSheel";
// // import { Illustration } from "../components/Illustration";
// // import { ShieldCheck, Clock, Trash2, EyeOff, Cpu, UserX } from "lucide-react";

// // export function AboutPage() {
// //   return (
// //     <PageShell title="About Sendly" subtitle="A small team with one simple belief: your files belong to you.">
// //       <Stack gap="xl">
        
// //         {/* Hero / Mission */}
// //         <Paper withBorder p={{ base: 'md', md: 'xl' }} radius="md">
// //           <Group gap="xl" align="center" wrap="wrap">
// //             <Box style={{ flex: '1 1 200px', display: 'flex', justifyContent: 'center' }}>
// //               <Illustration src="/illustrations/team.svg" alt="The Sendly team" maxWidth={240} />
// //             </Box>
// //             <Stack gap="sm" style={{ flex: '2 1 300px' }}>
// //               <Title order={3} fz="h4">Who we are</Title>
// //               <Text fz="sm" c="dimmed" lh={1.8}>
// //                 Sendly is built by a small team that got tired of reading "we keep your files forever" in terms of service. We wanted the opposite: hand a file to someone, safely, and have it gone when done. We built the infrastructure to make temporary, private sharing the default, not the exception.
// //               </Text>
// //             </Stack>
// //           </Group>
// //         </Paper>

// //         {/* Beliefs */}
// //         <Stack gap="md">
// //           <Title order={3} fz="h4">What we believe</Title>
// //           <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
// //             <Card withBorder padding="lg" radius="md">
// //               <Clock size={24} color="var(--mantine-color-brand-6)" />
// //               <Text fw={600} mt="md" mb="xs">Temporary is healthy</Text>
// //               <Text fz="sm" c="dimmed" lh={1.7}>
// //                 Every link has an expiry and a download limit. When either is reached, deletion is real deletion. The internet doesn't need to remember every file ever sent.
// //               </Text>
// //             </Card>
// //             <Card withBorder padding="lg" radius="md">
// //               <UserX size={24} color="var(--mantine-color-brand-6)" />
// //               <Text fw={600} mt="md" mb="xs">Privacy without accounts</Text>
// //               <Text fz="sm" c="dimmed" lh={1.7}>
// //                 Privacy shouldn't require an account, a subscription, or a manual. Sendly works instantly. Open, send, done.
// //               </Text>
// //             </Card>
// //             <Card withBorder padding="lg" radius="md">
// //               <Trash2 size={24} color="var(--mantine-color-brand-6)" />
// //               <Text fw={600} mt="md" mb="xs">Deletion means deletion</Text>
// //               <Text fz="sm" c="dimmed" lh={1.7}>
// //                 We don't move expired files to a "trash" folder for 30 days. Automated cleanup removes the data and its metadata permanently.
// //               </Text>
// //             </Card>
// //           </SimpleGrid>
// //         </Stack>

// //         {/* Never Do */}
// //         <Paper withBorder p={{ base: 'md', md: 'xl' }} radius="md" bg="var(--mantine-color-gray-0)">
// //           <Title order={3} fz="h4" mb="md">What we never do</Title>
// //           <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
// //             <Group gap="sm" align="flex-start" wrap="nowrap">
// //               <EyeOff size={18} style={{ flexShrink: 0, marginTop: 2 }} color="var(--mantine-color-gray-6)" />
// //               <Text fz="sm" lh={1.7}>We do not scan your files or inspect their contents. Encrypted files are unreadable by design.</Text>
// //             </Group>
// //             <Group gap="sm" align="flex-start" wrap="nowrap">
// //               <Cpu size={18} style={{ flexShrink: 0, marginTop: 2 }} color="var(--mantine-color-gray-6)" />
// //               <Text fz="sm" lh={1.7}>We do not train AI models on your uploads, nor do we use them for advertising or analytics.</Text>
// //             </Group>
// //             <Group gap="sm" align="flex-start" wrap="nowrap">
// //               <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: 2 }} color="var(--mantine-color-gray-6)" />
// //               <Text fz="sm" lh={1.7}>We do not sell data, show ads, or track you across the web. The service is funded by keeping infrastructure costs low through automation.</Text>
// //             </Group>
// //              <Group gap="sm" align="flex-start" wrap="nowrap">
// //               <UserX size={18} style={{ flexShrink: 0, marginTop: 2 }} color="var(--mantine-color-gray-6)" />
// //               <Text fz="sm" lh={1.7}>We do not keep hidden copies of retired files. Once the system marks a share as expired, the cloud storage objects are purged.</Text>
// //             </Group>
// //           </SimpleGrid>
// //         </Paper>

// //       </Stack>
// //     </PageShell>
// //   );
// // }

// // export default AboutPage;


// // ============================================================
// // AboutPage - who we are, what we believe, what we never do.
// // Small team story. No vault, no emoji. Button leads to /how.
// // ============================================================
// import { Link } from "react-router-dom";
// import { Box, Button, Text } from "@mantine/core";
// import { ArrowRight } from "lucide-react";
// import { PageShell } from "../components/PageSheel";
// import { Illustration } from "../components/Illustration";
// import { Term } from "../components/Term";

// export function AboutPage() {
//   return (
//     <PageShell title="About Sendly" subtitle="A small team with one simple belief: your files belong to you.">
//       <Box mb="lg">
//         <Illustration src="/illustrations/about-us.svg" alt="The three people behind Sendly" maxWidth={300} />
//       </Box>

//       <Text fz="sm" c="dimmed" mb="md" lh={1.8}>
//         <Text component="span" fw={700} c="var(--mantine-color-text)">Who we are: </Text>
//         Sendly is built by a small team of three who got tired of cloud services that keep
//         files forever, scan them, or train on them. We wanted the opposite: hand a file to
//         someone, safely, and have it gone when done. So we built it.
//       </Text>

//       <Text fz="sm" c="dimmed" mb="md" lh={1.8}>
//         <Text component="span" fw={700} c="var(--mantine-color-text)">What we believe: </Text>
//         temporary is healthy. Every link has an expiry and a download limit, and when either
//         is reached, deletion is real deletion. Privacy should not require an account, a
//         subscription, or a manual. Files are locked on your device with{" "}
//         <Term tip="The industry-standard authenticated encryption. It scrambles the data and attaches a tamper-evident seal.">AES-GCM</Term>{" "}
//         before they travel, and only the people you choose can open them.
//       </Text>

//       <Text fz="sm" c="dimmed" mb="md" lh={1.8}>
//         <Text component="span" fw={700} c="var(--mantine-color-text)">What we never do: </Text>
//         we do not scan your files or train anything on them. We do not sell data, show ads,
//         or track you across the web. We do not keep copies after a link retires. Our server
//         stores only the metadata needed to deliver the link, never the content. That is what{" "}
//         <Term tip="A security model where the server stores only locked data and never possesses the keys to decrypt it.">zero-knowledge</Term>{" "}
//         means for us.
//       </Text>

//       <Text fz="sm" c="dimmed" lh={1.8}>
//         If you want the technical story, what happens on your device, on our server, and in
//         storage, read the full walkthrough.
//       </Text>

//       <Box mt="lg">
//         <Button
//           component={Link}
//           to="/how"
//           variant="default"
//           radius="md"
//           size="sm"
//           rightSection={<ArrowRight size={14} />}
//         >
//           How Sendly works, step by step
//         </Button>
//       </Box>
//     </PageShell>
//   );
// }

// export default AboutPage;



import { Link } from "react-router-dom";
import { Box, Button, Stack, Text } from "@mantine/core";
import { PageShell } from "../components/PageSheel";
import { Illustration } from "../components/Illustration";
import { Term } from "../components/Term";

export function AboutPage() {
  return (
    <PageShell center title="About Sendly" subtitle="A small team with one simple belief: your files belong to you.">
     {/* 1. Increase maxWidth to make the illustration larger and fill the space */}
{/* Use transform: scale() to force the illustration to grow visually */}
{/* Use negative mt (margin-top) to pull it up, and standard mb (margin-bottom) for the space below */}
<Box mt={-20} mb={20} ta="center" style={{ transform: 'scale(1.4)', transformOrigin: 'center' }}>
  <Illustration src="/illustrations/about-us.svg" alt="The team behind Sendly" />
</Box>

      <Stack gap="md">
        <Text fz="sm" c="dimmed" lh={1.8}>
          <Text component="span" fw={700} c="var(--mantine-color-text)">Who we are: </Text>
          We are a small team , We built Sendly because we kept running into the same
          problem: every service we used for sending files kept the files forever, scanned
          them, or asked us to create an account first. We wanted the opposite: send a file,
          share a link, and have it disappear when done. So we built it ourselves.
        </Text>

        <Text fz="sm" c="dimmed" lh={1.8}>
          <Text component="span" fw={700} c="var(--mantine-color-text)">What we believe: </Text>
          A file you send is yours, not ours. We never read it, never scan it, and never train
          anything on it. Files are locked on your device with{" "}
          <Term tip="The industry-standard authenticated encryption. It scrambles the data and attaches a tamper-evident seal.">AES-GCM</Term>{" "}
          before they leave it, and only the people you choose can open them. When a link
          expires or reaches its download limit, the file is actually deleted, not hidden and
          not archived. Temporary is the point.
        </Text>

        <Text fz="sm" c="dimmed" lh={1.8}>
          <Text component="span" fw={700} c="var(--mantine-color-text)">Where the idea comes from: </Text>
          Sendly is inspired by Firefox Send, the service that showed the internet that a file
          can be shared as a link that expires. We built the same idea properly: encrypted on
          your device, shared as a link, expired on schedule, deleted for real.
        </Text>

        <Text fz="sm" c="dimmed" lh={1.8}>
          <Text component="span" fw={700} c="var(--mantine-color-text)">Who it is for: </Text>
          Students and teachers, freelancers and clients, families, developers, creators,
          clinics. Anyone who believes their documents should not live on the internet forever.
        </Text>
      </Stack>

     {/* 3. Add hover styles to turn the button text blue */}
<Box ta="center" mt="lg">
  <Button 
    component={Link} 
    to="/how" 
    variant="outline" 
    color="blue"
    radius="md" 
    size="sm"
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
    How Sendly works, step by step
  </Button>
</Box>
    </PageShell>
  );
}

export default AboutPage;