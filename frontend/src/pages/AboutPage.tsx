
// ============================================================
// AboutPage — WHO WE ARE AND WHY WE BUILT THIS
// Four short sections: Mission, How we're different,
// Who it's for, and a light-hearted closing note.
// Tooltips (Term component) on: zero-knowledge, AES-GCM.
// ============================================================

import { PageShell } from "../components/PageSheel";
import { Text } from "@mantine/core";
import { Term } from "../components/Term";

export function AboutPage() {
  return (
    <PageShell title="About VaultHub" subtitle="Privacy-first file sharing, for everyone.">
      <img src="/illustrations/about.svg" alt="A secure vault"
        style={{ maxWidth: 280, width: "100%", height: "auto", margin: "0 auto 28px", display: "block" }} />

      <Text fz="sm" c="dimmed" mb="md" lh={1.7}>
        <Text component="span" fw={700} c="var(--mantine-color-text)">Our Mission:</Text> your files should belong to you, not us. Most cloud storage services keep files indefinitely, and their terms often allow scanning and machine-learning on whatever you upload. VaultHub does the opposite. Sharing a file is as easy as sending a link, and as private as handing someone a locked box
      </Text>

      <Text fz="sm" c="dimmed" mb="md" lh={1.7}>
        <Text component="span" fw={700} c="var(--mantine-color-text)">How we're different:</Text> VaultHub uses{" "}
        <Term tip="A security model where the server only stores encrypted data and never possesses the keys to decrypt it. Even if our servers were compromised, your files would remain unreadable.">zero-knowledge</Term>{" "}
        architecture. Files are encrypted on your device with{" "}
        <Term tip="The industry-standard encryption used by banks and password managers. If even one byte is tampered with, unlocking simply fails.">AES-GCM</Term>{" "}
        before upload. We never scan your files, never train AI on them, and delete them automatically after 1 day or 10 downloads. "Delete" actually means delete here.
      </Text>

      <Text fz="sm" c="dimmed" mb="md" lh={1.7}>
        <Text component="span" fw={700} c="var(--mantine-color-text)">Who it's for:</Text> Everyone. Students and teachers sharing coursework for a limited time. Freelancers delivering work to clients. Families sending photos without a permanent album. Developers sending credentials safely. Creators selling digital goods with limited downloads. Clinics and consultants sharing sensitive documents. And anyone who simply believes their documents shouldn't live on the internet forever.
      </Text>

      <Text fz="sm" c="dimmed" lh={1.7}>
        <Text component="span" fw={700} c="var(--mantine-color-text)">One light-hearted note:</Text> VaultHub exists to keep private things private  so please don't use it to leak exam papers, spoilers, or anyone else's secrets without permission. Privacy is a right we protect, not a loophole we provide. 🙂
      </Text>
    </PageShell>
  );
}

export default AboutPage;