// import  Footer  from '../components/Footer';

// export function PrivacyPage() {
//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
//             <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
//               Privacy Policy
//             </h1>
//             <p className="text-sm text-gray-500 mb-10">Last Updated: July 29, 2026</p>

//             <div className="prose prose-gray max-w-none space-y-8">
//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">1. Introduction</h2>
//                 <p>
//                   VaultHub is a small, independently-run file-sharing project built around one core idea:
//                   files you choose to encrypt should be unreadable to us. If you enable encryption, your file
//                   is encrypted in your browser using AES-GCM before it ever reaches our servers — we never see
//                   the unencrypted content, and we never have your password.
//                 </p>
//                 <p>
//                   We are not a large company. This is currently operated by a small team as an early-stage
//                   product. We're telling you exactly what we collect and why, in plain language.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">2. What We Collect</h2>
//                 <ul className="list-disc pl-6 space-y-2">
//                   <li><strong>File metadata:</strong> filename, size, MIME type, upload timestamp, expiration date.</li>
//                   <li><strong>Encryption parameters (if encrypted):</strong> the IV and salt, stored as Base64. These are meaningless without your password — we don't have it and can't derive it.</li>
//                   <li><strong>IP address:</strong> retained internally, in partially-masked form, for up to 30 days. Used only to detect and rate-limit abuse (e.g. brute-force password attempts on encrypted files). It is not shown to any user, is not linked to your files in any user-facing way, and is only accessible to site administrators or disclosed if legally compelled by a valid law enforcement request.</li>
//                   <li><strong>Browser/device info:</strong> basic User-Agent string, for the same abuse-prevention purpose above.</li>
//                 </ul>
//                 <p className="mt-2 font-medium">We do NOT collect:</p>
//                 <ul className="list-disc pl-6 space-y-1">
//                   <li>The contents of your files, encrypted or not</li>
//                   <li>Passwords or encryption keys</li>
//                   <li>Any account information — VaultHub does not require or support accounts</li>
//                   <li>Analytics or advertising cookies</li>
//                 </ul>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">3. We Do Not Scan or Train On Your Files</h2>
//                 <p>
//                   Encrypted files are, by design, unreadable to us — there is nothing to scan. For
//                   unencrypted files, we do not open, inspect, or analyze contents; we only block a small
//                   set of file extensions (e.g. <code>.exe</code>, <code>.bat</code>) as a baseline precaution.
//                   We do not use any file you upload — encrypted or not — to train AI models, ours or
//                   anyone else's, and we do not sell or share file contents with any third party.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">4. How Files Are Deleted</h2>
//                 <p>
//                   Every file has an expiration date, set by the uploader and defaulting to 7 days. A
//                   scheduled cleanup job runs automatically (currently nightly) and permanently deletes
//                   expired files from our storage (AWS S3) and their corresponding records from our
//                   database (AWS RDS / PostgreSQL). This is fully automatic — there is currently no manual
//                   early-deletion option, and once a file is removed, we cannot recover it, for you or for
//                   anyone else.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">5. Download Limits</h2>
//                 <p>
//                   Each uploaded file currently allows up to 10 downloads by default before it becomes
//                   unavailable, in addition to its expiration date — whichever comes first.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">6. Data Sharing</h2>
//                 <p>We do not sell your data. We use the following infrastructure to run the service:</p>
//                 <ul className="list-disc pl-6 mt-2 space-y-1">
//                   <li><strong>AWS S3</strong> — encrypted/unencrypted file storage until expiration.</li>
//                   <li><strong>AWS RDS (PostgreSQL)</strong> — file metadata storage.</li>
//                   <li><strong>Legal authorities</strong> — only if legally required (e.g. valid court order or law enforcement request), and only to the extent required by law.</li>
//                 </ul>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">7. Advertising</h2>
//                 <p>
//                   We do not currently show advertising or use any advertising trackers. If we introduce
//                   advertising in the future (for example, non-tracking display ads to help cover
//                   infrastructure costs), we will update this policy before doing so.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">8. Cookies</h2>
//                 <p>
//                   VaultHub does not use accounts, sessions, or tracking cookies at this time. See our{' '}
//                   <a href="/cookies" className="text-blue-600 hover:underline font-medium">Cookie Policy</a>{' '}
//                   for details.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">9. Your Rights</h2>
//                 <p>
//                   Because we don't collect personal or account information, most data-subject requests
//                   (access, correction, portability) don't apply — there's no profile tied to you. If you
//                   have a specific concern about a file or IP data we may hold, contact us and we'll do our
//                   best to help within a reasonable time.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">10. Changes to This Policy</h2>
//                 <p>
//                   This is an early-stage product and this policy will evolve as we add features (e.g.
//                   accounts, paid plans, advertising). We'll update the "Last Updated" date above whenever
//                   we make material changes.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">11. Contact</h2>
//                 <p>
//                   Privacy questions: <a href="mailto:CONTACT_EMAIL_HERE" className="text-blue-600 hover:underline font-medium">CONTACT_EMAIL_HERE</a>
//                 </p>
//               </section>
//             </div>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// }


import { PageShell } from "../components/PageSheel";

export function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" subtitle="Last Updated: July 29, 2026">
      <img src="/illustrations/privacy.svg" alt="Private data protected"
        style={{ maxWidth: 280, width: "100%", height: "auto", margin: "0 auto 24px", display: "block" }} />

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-800">1. Introduction</h2>
          <p>VaultHub is a small, independently-run file-sharing project built around one core idea: files you choose to encrypt should be unreadable to us. If you enable encryption, your file is encrypted in your browser using AES-GCM before it ever reaches our servers — we never see the unencrypted content, and we never have your password.</p>
          <p className="mt-2">We are not a large company. This is currently operated by a small team as an early-stage product. We're telling you exactly what we collect and why, in plain language.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">2. What We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>File metadata:</strong> filename, size, MIME type, upload timestamp, expiration date.</li>
            <li><strong>Encryption parameters (if encrypted):</strong> the IV and salt, stored as Base64. These are meaningless without your password — we don't have it and can't derive it.</li>
            <li><strong>IP address:</strong> retained internally, in partially-masked form, for up to 30 days. Used only to detect and rate-limit abuse (e.g. brute-force password attempts on encrypted files). It is not shown to any user, is not linked to your files in any user-facing way, and is only accessible to site administrators or disclosed if legally compelled by a valid law enforcement request.</li>
            <li><strong>Browser/device info:</strong> basic User-Agent string, for the same abuse-prevention purpose above.</li>
          </ul>
          <p className="mt-2 font-medium">We do NOT collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The contents of your files, encrypted or not</li>
            <li>Passwords or encryption keys</li>
            <li>Any account information — VaultHub does not require or support accounts</li>
            <li>Analytics or advertising cookies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">3. We Do Not Scan or Train On Your Files</h2>
          <p>Encrypted files are, by design, unreadable to us — there is nothing to scan. For unencrypted files, we do not open, inspect, or analyze contents; we only block a small set of file extensions (e.g. <code>.exe</code>, <code>.bat</code>) as a baseline precaution. We do not use any file you upload — encrypted or not — to train AI models, ours or anyone else's, and we do not sell or share file contents with any third party.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">4. How Files Are Deleted</h2>
          <p>Every file has an expiration date, set by the uploader and defaulting to 1 day. A scheduled cleanup job runs automatically (currently nightly) and permanently deletes expired files from our storage (AWS S3) and their corresponding records from our database (AWS RDS / PostgreSQL). This is fully automatic — there is currently no manual early-deletion option, and once a file is removed, we cannot recover it, for you or for anyone else.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">5. Download Limits</h2>
          <p>Each uploaded file currently allows up to 10 downloads by default before it becomes unavailable, in addition to its expiration date — whichever comes first.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">6. Data Sharing</h2>
          <p>We do not sell your data. We use the following infrastructure to run the service:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>AWS S3</strong> — encrypted/unencrypted file storage until expiration.</li>
            <li><strong>AWS RDS (PostgreSQL)</strong> — file metadata storage.</li>
            <li><strong>Legal authorities</strong> — only if legally required (e.g. valid court order or law enforcement request), and only to the extent required by law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">7. Advertising</h2>
          <p>We do not currently show advertising or use any advertising trackers. If we introduce advertising in the future (for example, non-tracking display ads to help cover infrastructure costs), we will update this policy before doing so.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">8. Cookies</h2>
          <p>VaultHub does not use accounts, sessions, or tracking cookies at this time. See our{' '}
            <a href="/cookies" className="text-blue-600 hover:underline font-medium">Cookie Policy</a> for details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">9. Your Rights</h2>
          <p>Because we don't collect personal or account information, most data-subject requests (access, correction, portability) don't apply — there's no profile tied to you. If you have a specific concern about a file or IP data we may hold, contact us and we'll do our best to help within a reasonable time.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">10. Changes to This Policy</h2>
          <p>This is an early-stage product and this policy will evolve as we add features (e.g. accounts, paid plans, advertising). We'll update the "Last Updated" date above whenever we make material changes.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">11. Contact</h2>
          <p>Privacy questions: <a href="mailto:Crk096327945@gmail.com" className="text-blue-600 hover:underline font-medium">rk096327945@gmail.com</a></p>
        </section>
      </div>
    </PageShell>
  );
}

export default PrivacyPage;