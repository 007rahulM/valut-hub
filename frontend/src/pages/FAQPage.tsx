
// ============================================================
// FAQPage — QUICK ANSWERS IN PLAIN WORDS
// Uses Mantine Accordion (variant: separated):
//   - One question open at a time
//   - defaultValue="q0" so the first one is open on load
//   - Touch-friendly on phones
// Illustration on top, then the accordion below.
// ============================================================

import { PageShell } from "../components/PageSheel";
import { Accordion, Text } from "@mantine/core";

export function FAQPage() {
  const faqs = [
    { q: "Is my file really secure?", a: "Yes. If you enable encryption, your file is locked in your browser with AES-GCM before it's uploaded. We never see your password or the unlocked file  not even during a data breach." },
    { q: "What does my file look like on your server?", a: "If encrypted: random scrambled bytes. Without your password it's pure noise to us, to hackers, to everyone." },
    { q: "What happens if I forget my password?", a: "We never store it, so we can't recover it. That's the point of zero-knowledge. Save it somewhere safe, or use the Copy button right after generating it." },
    { q: "What is the maximum file size?", a: "500 MB per file big enough for real work, small enough to stay fast on any connection." },
    { q: "How long is my file available?", a: "1 day, or 10 downloads whichever comes first. Then it's permanently deleted, automatically." },
    { q: "Do I need to delete anything myself?", a: "No. That's the whole idea: send it now, never think about it again. Expiry and deletion happen on schedule, every time." },
    { q: "Do you scan my files?", a: "No. Encrypted files are unreadable by design. For unencrypted files we only block a few risky extensions (like .exe)  we never open or inspect contents." },
    { q: "Do you use my files to train AI?", a: "No, never. Encrypted or not, your files are not used for AI training, advertising, or anything else." },
    { q: "Do I need an account?", a: "No. VaultHub works instantly  no sign-up, no email, no password you have to remember. Open, send, done." },
  ];

  return (
    <PageShell title="Frequently Asked Questions" subtitle="Quick answers, in plain words.">
      <img src="/illustrations/faq.svg" alt="Question answered"
        style={{ maxWidth: 240, width: "100%", height: "auto", margin: "0 auto 20px", display: "block" }} />

      {/* Accordion: opening one question automatically closes the others */}
      <Accordion defaultValue="q0" variant="separated" radius="md">
        {faqs.map((faq, i) => (
          <Accordion.Item key={i} value={`q${i}`}>
            <Accordion.Control>
              <Text fw={600} fz="sm">{faq.q}</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Text fz="sm" c="dimmed" lh={1.7}>{faq.a}</Text>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </PageShell>
  );
}

export default FAQPage;