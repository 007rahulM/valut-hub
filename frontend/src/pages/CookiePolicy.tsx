// ============================================================
// CookiePolicy — COOKIE POLICY
// Short and honest: we don't use cookies today.
// If that ever changes, this page gets updated FIRST.
// ============================================================
import { PageShell } from "../components/PageSheel";
import { Illustration } from "../components/Illustration";
import { Term } from "../components/Term";

export function CookiePolicy() {
  return (
    <PageShell title="Cookie Policy" subtitle="Last updated: July 29, 2026.">
      {/* New cookie illustration (brand orange) */}
      <Illustration src="/illustrations/cookie.svg" alt="A cookie" maxWidth={260} />

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        {/* Current state: no cookies */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800">Do we use cookies?</h2>
          <p>
            Not today. VaultHub has no accounts, no sessions, and no analytics or advertising trackers, so there is simply nothing that needs a cookie.
          </p>
        </section>

        {/* Future state: promise to update first */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800">If that changes</h2>
          <p>
            Some features we may add later (for example a{" "}
            <Term tip="A content delivery network: servers around the world that make a site load faster and absorb attacks. Some CDNs set one small technical cookie.">
              CDN
            </Term>{" "}
            or optional accounts) might set a small technical cookie. If that ever happens, we will update this page first, and list exactly what is set, why, and for how long.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800">Questions?</h2>
          <p>
            Email us at{" "}
            <a href="mailto:rk096327945@gmail.com" className="text-blue-600 hover:underline font-medium">rk096327945@gmail.com</a>.
          </p>
        </section>
      </div>
    </PageShell>
  );
}

export default CookiePolicy;