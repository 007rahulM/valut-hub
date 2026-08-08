import { PageShell } from "../components/PageSheel";

export function CookiePolicy() {
  return (
    <PageShell title="Cookie Policy" subtitle="Last Updated: July 29, 2026">
      <img src="/illustrations/terms.svg" alt="Policy documents"
        style={{ maxWidth: 260, width: "100%", height: "auto", margin: "0 auto 24px", display: "block" }} />

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-800">Do We Use Cookies?</h2>
          <p>Not currently. VaultHub has no accounts, no sessions, and no analytics or advertising trackers, so there is nothing that requires a cookie today.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">If This Changes</h2>
          <p>If we introduce features that require cookies in the future (for example, a CDN/security layer like Cloudflare, or optional accounts), we will update this page to list exactly what's set, why, and for how long — before those changes go live.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">Contact</h2>
          <p>Questions? Reach us at{' '}
            <a href="mailto:CONTACT_EMAIL_HERE" className="text-blue-600 hover:underline font-medium">CONTACT_EMAIL_HERE</a>.
          </p>
        </section>
      </div>
    </PageShell>
  );
}

export default CookiePolicy;