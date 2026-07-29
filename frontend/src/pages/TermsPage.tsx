import { Footer } from '../components/Footer';

export function TermsPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-500 mb-10">Last Updated: July 29, 2026</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-800">1. Acceptance of Terms</h2>
                <p>
                  By using VaultHub, you agree to these Terms. If you do not agree, please do not use the
                  service. VaultHub is an early-stage, independently-operated project — these terms may be
                  updated as the product develops.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800">2. Description of Service</h2>
                <p>
                  VaultHub is a free, no-account file-sharing tool with optional client-side (browser-based)
                  encryption. Files up to 500 MB can be uploaded, with a default 7-day expiration and a
                  default limit of 10 downloads. Files are automatically and permanently deleted once
                  expired.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800">3. User Responsibilities</h2>
                <p>You are solely responsible for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>The content you upload and share.</li>
                  <li>Keeping your encryption password safe — if you lose it, we cannot recover your file. We never store it.</li>
                  <li>Sharing links responsibly and only with intended recipients.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800">4. Prohibited Content</h2>
                <p>You may not upload or share:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Illegal material, including child exploitation content, in any form.</li>
                  <li>Copyright-infringing works you don't have rights to distribute.</li>
                  <li>Malware, viruses, or executable/script files intended to cause harm.</li>
                  <li>Content used to harass, threaten, or defraud others.</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  Because encrypted files are unreadable to us, we cannot inspect encrypted content. We
                  block certain unencrypted file types (e.g. <code>.exe</code>, <code>.bat</code>) as a
                  baseline measure. We retain limited, partially-masked IP data for abuse detection — see
                  our Privacy Policy — and will cooperate with valid legal requests regarding illegal content.
                </p>
                <p className="mt-2 font-semibold text-red-600">
                  Violation of this section may result in immediate removal and, where legally required,
                  cooperation with law enforcement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800">5. Intellectual Property</h2>
                <p>
                  You retain all rights to your files. VaultHub's code, design, and branding remain the
                  property of the project maintainers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800">6. Service Limitations</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Max file size: 500 MB.</li>
                  <li>Default expiration: 7 days (configurable at upload, up to the maximum allowed).</li>
                  <li>Default download limit: 10 downloads per file.</li>
                  <li>Files are automatically and permanently deleted upon expiration via a scheduled process. Manual early deletion is not currently supported.</li>
                  <li>We reserve the right to limit, suspend, or terminate access for abuse of the service.</li>
                  <li>As an early-stage service, uptime and storage capacity are not guaranteed at this time.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800">7. No Warranty / Limitation of Liability</h2>
                <p>
                  VaultHub is provided "as is," without warranties of any kind, express or implied. To the
                  fullest extent permitted by law, we are not liable for any loss of data, damages, or
                  claims arising from your use of the service. This is an actively developed early-stage
                  product — please do not rely on it as your only copy of anything important.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800">8. Changes to the Service</h2>
                <p>
                  We may change, suspend, or discontinue any part of the service at any time as we
                  continue developing it, including limits on file size, storage duration, or download
                  counts.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800">9. Governing Law</h2>
                <p>
                  These Terms are governed by the laws applicable to the jurisdiction in which the service
                  operator resides, without prejudice to any mandatory consumer-protection rights you may
                  have under your local law. [To be finalized once the project's legal structure is set.]
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800">10. Contact</h2>
                <p>
                  Questions or legal inquiries: <a href="mailto:CONTACT_EMAIL_HERE" className="text-blue-600 hover:underline font-medium">CONTACT_EMAIL_HERE</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}