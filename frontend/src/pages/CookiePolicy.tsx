import { Footer } from '../components/Footer';

export function CookiePolicy() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Cookie Policy
            </h1>
            <p className="text-sm text-gray-500 mb-10">Last Updated: July 29, 2026</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-800">Do We Use Cookies?</h2>
                <p>
                  Not currently. VaultHub has no accounts, no sessions, and no analytics or advertising
                  trackers, so there is nothing that requires a cookie today.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800">If This Changes</h2>
                <p>
                  If we introduce features that require cookies in the future (for example, a CDN/security
                  layer like Cloudflare, or optional accounts), we will update this page to list exactly
                  what's set, why, and for how long — before those changes go live.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800">Contact</h2>
                <p>
                  Questions? Reach us at{' '}
                  <a href="mailto:CONTACT_EMAIL_HERE" className="text-blue-600 hover:underline font-medium">
                    CONTACT_EMAIL_HERE
                  </a>.
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