// export function FAQPage() {
//   const faqs = [
//     { q: "Is my file really secure?", a: "If you enable encryption, your file is encrypted in your browser using AES-GCM before it's uploaded. We never see your password or the unencrypted file — not even during a data breach." },
//     { q: "What happens if I forget my password?", a: "We use zero-knowledge encryption, so we never store your password. If you lose it, the file cannot be decrypted by us or anyone else. Save it somewhere safe." },
//     { q: "What is the maximum file size?", a: "500MB per file, to keep browser-based encryption and upload fast and reliable." },
//     { q: "How long is my file available?", a: "By default, 7 days, or after 10 downloads — whichever happens first. Expired files are automatically and permanently deleted from our storage and database." },
//     { q: "Can I delete a file early?", a: "Not at the moment. Files clean up automatically once they expire. If you need something gone sooner, set a shorter expiration when you upload." },
//     { q: "Do you scan my files?", a: "No. Encrypted files are unreadable to us by design. For unencrypted files, we only block a few risky extensions (like .exe and .bat) — we don't open or inspect contents." },
//     { q: "Do you use my files to train AI?", a: "No, never. We don't use any uploaded file — encrypted or not — to train any AI model." },
//     { q: "Do I need an account?", a: "No. VaultHub works entirely without accounts or sign-ups." },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4">
//       <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-200">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>
//         <div className="space-y-6">
//           {faqs.map((faq, index) => (
//             <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
//               <p className="text-gray-600">{faq.a}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


import { PageShell } from "../components/PageSheel";
import { Text } from "@mantine/core";

export function FAQPage() {
  const faqs = [
    { q: "Is my file really secure?", a: "If you enable encryption, your file is encrypted in your browser using AES-GCM before it's uploaded. We never see your password or the unencrypted file — not even during a data breach." },
    { q: "What does my file look like on your server?", a: "If encrypted: random scrambled bytes. Without your password it's pure noise — to us, to hackers, to everyone." },
    { q: "What happens if I forget my password?", a: "We use zero-knowledge encryption, so we never store your password. If you lose it, the file cannot be decrypted by us or anyone else. Save it somewhere safe." },
    { q: "What is the maximum file size?", a: "500MB per file, to keep browser-based encryption and upload fast and reliable." },
    { q: "How long is my file available?", a: "By default, 1 day, or after 10 downloads — whichever happens first. Expired files are automatically and permanently deleted from our storage and database." },
    { q: "Can I delete a file early?", a: "Not at the moment. Files clean up automatically once they expire. If you need something gone sooner, set a shorter expiration when you upload." },
    { q: "Do you scan my files?", a: "No. Encrypted files are unreadable to us by design. For unencrypted files, we only block a few risky extensions (like .exe and .bat) — we don't open or inspect contents." },
    { q: "Do you use my files to train AI?", a: "No, never. We don't use any uploaded file — encrypted or not — to train any AI model." },
    { q: "Do I need an account?", a: "No. VaultHub works entirely without accounts or sign-ups." },
  ];

  return (
    <PageShell title="Frequently Asked Questions" subtitle="Everything you need to know about VaultHub.">
      <img src="/illustrations/faq.svg" alt="Question answered"
        style={{ maxWidth: 260, width: "100%", height: "auto", margin: "0 auto 24px", display: "block" }} />
      {faqs.map((faq, index) => (
        <div key={index} style={{ borderBottom: "1px solid var(--mantine-color-default-border)", paddingBottom: 16, marginBottom: 16 }}>
          <Text fw={600} mb={4}>{faq.q}</Text>
          <Text fz="sm" c="dimmed">{faq.a}</Text>
        </div>
      ))}
    </PageShell>
  );
}

export default FAQPage;