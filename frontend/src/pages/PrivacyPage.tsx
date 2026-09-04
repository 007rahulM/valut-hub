// // ============================================================
// // PrivacyPage — PRIVACY POLICY
// // Structure:
// //   1. Short version banner (for the 90% who won't read further)
// //   2. Full policy with tooltips on every technical word
// // ============================================================
// import { PageShell } from "../components/PageSheel";
// import { Illustration } from "../components/Illustration";
// import { InfoBanner } from "../components/InfoBanner";
// import { Term } from "../components/Term";
// import { Group } from "@mantine/core";

// export function PrivacyPage() {
//   return (
//     <PageShell title="Privacy Policy" subtitle="Last updated: July 29, 2026.">
//       <Illustration src="/illustrations/privacy.svg" alt="Private data protected" maxWidth={280} />

//       {/* The 10-second summary */}
//       <Group mt="md">
//         <InfoBanner>
//           The short version: we can't read your files, we never store your password, we don't track you, and everything is deleted automatically after 1 day or 10 downloads.
//         </InfoBanner>
//       </Group>

//       <div className="space-y-8 text-sm text-gray-700 leading-relaxed mt-6">
//         {/* 1. Who we are */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">1. Introduction</h2>
//           <p>
//             Sendly is a small, independently-run file-sharing project built around one core idea: files you choose to encrypt should be unreadable to us. If you enable encryption, your file is encrypted in your browser using{" "}
//             <Term tip="The industry-standard lock for data. The same family of encryption online banking uses. If even one byte is changed, unlocking simply fails.">
//               AES-GCM
//             </Term>{" "}
//             before it ever reaches our servers. We never see the unencrypted content, and we never have your password.
//           </p>
//           <p className="mt-2">We are not a large company. This is run by a small team as an early-stage product. We're telling you exactly what we collect and why, in plain language.</p>
//         </section>

//         {/* 2. What we collect (and don't) */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">2. What we collect</h2>
//           <ul className="list-disc pl-6 space-y-2">
//             <li>
//               <strong>File{" "}
//               <Term tip="Basic facts about a file: its name, size, type, and upload time. Never the content itself.">
//                 metadata
//               </Term>:</strong>{" "}
//               filename, size, MIME type, upload timestamp, expiration date.
//             </li>
//             <li>
//               <strong>Encryption parameters (if encrypted):</strong> the{" "}
//               <Term tip="Random values that make every encryption unique, even for the same file. They are not secret, and they are useless without your password.">
//                 IV and salt
//               </Term>, stored as Base64. These are meaningless without your password. We don't have it and can't derive it.
//             </li>
//             <li><strong>IP address:</strong> retained internally, in partially-masked form, for up to 30 days. Used only to detect and rate-limit abuse (for example, brute-force password attempts). It is never shown to any user and never linked to your files in a user-facing way.</li>
//             <li><strong>Browser/device info:</strong> a basic User-Agent string, for the same abuse-prevention purpose.</li>
//           </ul>
//           <p className="mt-2 font-medium">We do NOT collect:</p>
//           <ul className="list-disc pl-6 space-y-1">
//             <li>The contents of your files, encrypted or not</li>
//             <li>Passwords or encryption keys</li>
//             <li>Any account information. Sendly does not require or support accounts</li>
//             <li>Analytics or advertising cookies</li>
//           </ul>
//         </section>

//         {/* 3. No scanning, no AI training */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">3. We do not scan or train on your files</h2>
//           <p>
//             Encrypted files are, by design, unreadable to us. There is nothing to scan. For unencrypted files, we do not open, inspect, or analyze contents. We only block a small set of file extensions (like <code>.exe</code>, <code>.bat</code>) as a baseline precaution. We do not use any file you upload to train AI models, and we do not sell or share file contents with any third party.
//           </p>
//         </section>

//         {/* 4. Deletion */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">4. How files are deleted</h2>
//           <p>
//             Every file has an expiration date, set by the uploader and defaulting to 1 day. A scheduled cleanup job runs automatically and permanently deletes expired files from our storage (AWS S3) and their records from our database (AWS RDS / PostgreSQL). Once a file is removed, we cannot recover it, for you or for anyone else.
//           </p>
//         </section>

//         {/* 5. Download limits */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">5. Download limits</h2>
//           <p>Each file allows up to 10 downloads by default before it becomes unavailable, in addition to its expiration date, whichever comes first.</p>
//         </section>

//         {/* 6. Who we share with (almost nobody) */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">6. Data sharing</h2>
//           <p>We do not sell your data. We use the following infrastructure to run the service:</p>
//           <ul className="list-disc pl-6 mt-2 space-y-1">
//             <li><strong>AWS S3</strong> for file storage until expiration.</li>
//             <li><strong>AWS RDS (PostgreSQL)</strong> for file metadata.</li>
//             <li><strong>Legal authorities</strong> only if legally required, and only to the extent required by law.</li>
//           </ul>
//         </section>

//         {/* 7. Advertising */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">7. Advertising</h2>
//           <p>We do not currently show advertising or use advertising trackers. If that ever changes, we will update this policy before doing so.</p>
//         </section>

//         {/* 8. Cookies */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">8. Cookies</h2>
//           <p>
//             Sendly does not use accounts, sessions, or tracking cookies at this time. See our{" "}
//             <a href="/cookies" className="text-blue-600 hover:underline font-medium">Cookie Policy</a> for details.
//           </p>
//         </section>

//         {/* 9. Rights */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">9. Your rights</h2>
//           <p>Because we don't collect personal or account information, most data-subject requests (access, correction, portability) don't apply. There is no profile tied to you. If you have a specific concern, contact us and we'll do our best to help within a reasonable time.</p>
//         </section>

//         {/* 10. Changes */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">10. Changes to this policy</h2>
//           <p>This is an early-stage product and this policy will evolve as we add features. We'll update the "Last updated" date above whenever we make material changes.</p>
//         </section>

//         {/* 11. Contact */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">11. Contact</h2>
//           <p>
//             Privacy questions:{" "}
//             <a href="mailto:rk096327945@gmail.com" className="text-blue-600 hover:underline font-medium">rk096327945@gmail.com</a>
//           </p>
//         </section>
//       </div>
//     </PageShell>
//   );
// }

// export default PrivacyPage;


import { Group } from "@mantine/core";
import { PageShell } from "../components/PageSheel";
import { Illustration } from "../components/Illustration";
import { InfoBanner } from "../components/InfoBanner";
import { Term } from "../components/Term";

export function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" subtitle="Last updated: August 25, 2026.">
      <Illustration src="/illustrations/privacy.svg" alt="Private data protected" maxWidth={280} />

      <Group mt="md">
        <InfoBanner>
          The short version: Sendly does not receive your password or an unlocked encrypted file. We do not use uploaded files for AI training or advertising, and temporary shares are removed according to their configured limits.
        </InfoBanner>
      </Group>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed mt-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800">1. Introduction</h2>
          <p>
            Sendly is a file-sharing service designed to make temporary handoffs more private. When encryption is enabled, your browser protects the file with{" "}
            <Term tip="A modern authenticated encryption standard. It protects the file and detects tampering when the file is opened.">AES-GCM</Term>{" "}
            before upload. Sendly does not receive the password needed to unlock it.
          </p>
          <p className="mt-2">This policy explains what information the service handles, why it is needed, and what happens when a share reaches its limits.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">2. Information we handle</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>File metadata:</strong> filename, size, MIME type, upload timestamp, and expiration information.</li>
            <li><strong>Protected-file parameters:</strong> the IV and salt needed for browser-side decryption. These values are not the password and cannot unlock the file by themselves.</li>
            <li><strong>Abuse-prevention information:</strong> an IP address and basic User-Agent information may be processed for rate limiting and protection against repeated password attempts. The backend may also use a random HTTP-only <code>sendly_id</code> cookie as a browser identifier for these protections.</li>
          </ul>
          <p className="mt-2 font-medium">Sendly does not collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Passwords or encryption keys.</li>
            <li>Account information; Sendly does not require accounts.</li>
            <li>Advertising or analytics cookies.</li>
            <li>The password, password hash, or file bytes stored in your browser’s IndexedDB upload checkpoint.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">3. File contents and AI training</h2>
          <p>
            Encrypted files are unreadable to Sendly by design. For unencrypted files, the service does not open, inspect, or analyze the contents. A small set of risky file extensions may be blocked as a baseline safety measure. Uploaded files are not used to train AI models, sold, or shared for advertising.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">4. Retention and deletion</h2>
          <p>
<p>
  Temporary shares are kept only for the time and download count configured by the sender. Automated cleanup removes expired file data and its associated metadata. Once removed, a file cannot be recovered through Sendly.
</p>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">5. Service providers</h2>
          <p>Sendly uses infrastructure providers to operate the service, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Object storage for temporary file data.</li>
            <li>A database for file metadata and service operation.</li>
            <li>Legal authorities only when disclosure is required by law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">6. Advertising and cookies</h2>
          <p>
            Sendly does not currently show advertising or use advertising trackers. The service does not require login sessions. Technical browser storage is limited to features such as the theme preference and resumable-upload checkpoints. See the <a href="/cookies" className="text-blue-600 hover:underline font-medium">Cookie Policy</a> for details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">7. Your questions and rights</h2>
          <p>
            Because Sendly does not maintain user accounts, there is no profile for us to provide or correct. If you have a privacy concern or need help with a specific share, contact us and we will review it as far as the available information allows.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">8. Changes to this policy</h2>
          <p>We will update this page and its “Last updated” date when the service’s data practices materially change.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">9. Contact</h2>
          <p>
            Privacy questions: <a href="mailto:rk096327945@gmail.com" className="text-blue-600 hover:underline font-medium">rk096327945@gmail.com</a>
          </p>
        </section>
      </div>
    </PageShell>
  );
}

export default PrivacyPage;
