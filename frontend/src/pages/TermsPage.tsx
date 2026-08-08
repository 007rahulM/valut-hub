// import { Footer } from '../components/Footer';

// export function TermsPage() {
//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
//             <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
//               Terms of Service
//             </h1>
//             <p className="text-sm text-gray-500 mb-10">Last Updated: July 29, 2026</p>

//             <div className="prose prose-gray max-w-none space-y-8">
//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">1. Acceptance of Terms</h2>
//                 <p>
//                   By using VaultHub, you agree to these Terms. If you do not agree, please do not use the
//                   service. VaultHub is an early-stage, independently-operated project — these terms may be
//                   updated as the product develops.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">2. Description of Service</h2>
//                 <p>
//                   VaultHub is a free, no-account file-sharing tool with optional client-side (browser-based)
//                   encryption. Files up to 500 MB can be uploaded, with a default 7-day expiration and a
//                   default limit of 10 downloads. Files are automatically and permanently deleted once
//                   expired.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">3. User Responsibilities</h2>
//                 <p>You are solely responsible for:</p>
//                 <ul className="list-disc pl-6 space-y-1">
//                   <li>The content you upload and share.</li>
//                   <li>Keeping your encryption password safe — if you lose it, we cannot recover your file. We never store it.</li>
//                   <li>Sharing links responsibly and only with intended recipients.</li>
//                 </ul>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">4. Prohibited Content</h2>
//                 <p>You may not upload or share:</p>
//                 <ul className="list-disc pl-6 space-y-1">
//                   <li>Illegal material, including child exploitation content, in any form.</li>
//                   <li>Copyright-infringing works you don't have rights to distribute.</li>
//                   <li>Malware, viruses, or executable/script files intended to cause harm.</li>
//                   <li>Content used to harass, threaten, or defraud others.</li>
//                 </ul>
//                 <p className="mt-2 text-sm text-gray-600">
//                   Because encrypted files are unreadable to us, we cannot inspect encrypted content. We
//                   block certain unencrypted file types (e.g. <code>.exe</code>, <code>.bat</code>) as a
//                   baseline measure. We retain limited, partially-masked IP data for abuse detection — see
//                   our Privacy Policy — and will cooperate with valid legal requests regarding illegal content.
//                 </p>
//                 <p className="mt-2 font-semibold text-red-600">
//                   Violation of this section may result in immediate removal and, where legally required,
//                   cooperation with law enforcement.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">5. Intellectual Property</h2>
//                 <p>
//                   You retain all rights to your files. VaultHub's code, design, and branding remain the
//                   property of the project maintainers.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">6. Service Limitations</h2>
//                 <ul className="list-disc pl-6 space-y-1">
//                   <li>Max file size: 500 MB.</li>
//                   <li>Default expiration: 7 days (configurable at upload, up to the maximum allowed).</li>
//                   <li>Default download limit: 10 downloads per file.</li>
//                   <li>Files are automatically and permanently deleted upon expiration via a scheduled process. Manual early deletion is not currently supported.</li>
//                   <li>We reserve the right to limit, suspend, or terminate access for abuse of the service.</li>
//                   <li>As an early-stage service, uptime and storage capacity are not guaranteed at this time.</li>
//                 </ul>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">7. No Warranty / Limitation of Liability</h2>
//                 <p>
//                   VaultHub is provided "as is," without warranties of any kind, express or implied. To the
//                   fullest extent permitted by law, we are not liable for any loss of data, damages, or
//                   claims arising from your use of the service. This is an actively developed early-stage
//                   product — please do not rely on it as your only copy of anything important.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">8. Changes to the Service</h2>
//                 <p>
//                   We may change, suspend, or discontinue any part of the service at any time as we
//                   continue developing it, including limits on file size, storage duration, or download
//                   counts.
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">9. Governing Law</h2>
//                 <p>
//                   These Terms are governed by the laws applicable to the jurisdiction in which the service
//                   operator resides, without prejudice to any mandatory consumer-protection rights you may
//                   have under your local law. [To be finalized once the project's legal structure is set.]
//                 </p>
//               </section>

//               <section>
//                 <h2 className="text-xl font-semibold text-gray-800">10. Contact</h2>
//                 <p>
//                   Questions or legal inquiries: <a href="mailto:CONTACT_EMAIL_HERE" className="text-blue-600 hover:underline font-medium">CONTACT_EMAIL_HERE</a>
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
import { Illustration } from "../components/Illustration";

export function TermsPage() {
  return (
    <PageShell title="Terms of Service" subtitle="Last Updated: July 29, 2026 — written in plain language, on purpose.">
      <Illustration src="/illustrations/contract.svg" alt="A simple agreement" maxWidth={280} />

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-800">1. The short version</h2>
          <p>VaultHub is a free, no-account file-sharing tool with optional encryption in your browser. By using it, you agree to these simple terms. If you don't agree, please don't use the service — no hard feelings.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">2. What you can expect from us</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Files up to 500 MB, kept for 1 day or up to 10 downloads — whichever comes first.</li>
            <li>Automatic, permanent deletion when a link expires.</li>
            <li>If you encrypt a file, we technically cannot read it. Your password stays with you.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">3. What we ask of you</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Only share files you have the right to share.</li>
            <li>Keep your password safe — we can't recover it, and that's by design.</li>
            <li>Send links only to the people you intend to receive them.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">4. Keeping VaultHub safe for everyone</h2>
          <p>Please don't use VaultHub to share anything illegal, harmful, or abusive. We built this as a simple, trustworthy way to send files, and to keep it that way we may remove content that puts the service or its users at risk. That's it — no fine print, no gotchas.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">5. Your files are yours</h2>
          <p>You keep all rights to what you share. VaultHub's code, design and name belong to the project team.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">6. An honest note</h2>
          <p>VaultHub is an early-stage project provided "as is". We care a lot about doing the right thing, but please don't rely on it as the only copy of anything important.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">7. Questions?</h2>
          <p>We're happy to help: <a href="mailto:CONTACT_EMAIL_HERE" className="text-blue-600 hover:underline font-medium">CONTACT_EMAIL_HERE</a></p>
        </section>
      </div>
    </PageShell>
  );
}

export default TermsPage;