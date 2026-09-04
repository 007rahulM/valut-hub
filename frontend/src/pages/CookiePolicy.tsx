// // ============================================================
// // CookiePolicy — COOKIE POLICY
// // Short and honest: we don't use cookies today.
// // If that ever changes, this page gets updated FIRST.
// // ============================================================
// import { PageShell } from "../components/PageSheel";
// import { Illustration } from "../components/Illustration";
// import { Term } from "../components/Term";

// export function CookiePolicy() {
//   return (
//     <PageShell title="Cookie Policy" subtitle="Last updated: July 29, 2026.">
//       {/* New cookie illustration (brand orange) */}
//       <Illustration src="/illustrations/cookie.svg" alt="A cookie" maxWidth={260} />

//       <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
//         {/* Current state: no cookies */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">Do we use cookies?</h2>
//           <p>
//             Not today  Sendly has no accounts, no sessions, and no analytics or advertising trackers, so there is simply nothing that needs a cookie.
//           </p>
//         </section>

//         {/* Future state: promise to update first */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">If that changes</h2>
//           <p>
//             Some features we may add later (for example a{" "}
//             <Term tip="A content delivery network: servers around the world that make a site load faster and absorb attacks. Some CDNs set one small technical cookie.">
//               CDN
//             </Term>{" "}
//             or optional accounts) might set a small technical cookie. If that ever happens, we will update this page first, and list exactly what is set, why, and for how long.
//           </p>
//         </section>

//         {/* Contact */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800">Questions?</h2>
//           <p>
//             Email us at{" "}
//             <a href="mailto:rk096327945@gmail.com" className="text-blue-600 hover:underline font-medium">rk096327945@gmail.com</a>.
//           </p>
//         </section>
//       </div>
//     </PageShell>
//   );
// }

// export default CookiePolicy;


import { PageShell } from "../components/PageSheel";
import { Illustration } from "../components/Illustration";

export function CookiePolicy() {
  return (
    <PageShell title="Cookie Policy" subtitle="Last updated: August 25, 2026.">
      <Illustration src="/illustrations/cookie.svg" alt="A cookie and privacy controls" maxWidth={260} />

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-800">The short version</h2>
          <p>
            Sendly does not use advertising or analytics cookies. It does use a small number of technical browser mechanisms to keep the service safe, remember your display preference, and recover an interrupted upload when you ask it to.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">1. The Sendly identifier cookie</h2>
          <p>
            The backend may set an HTTP-only cookie named <code>sendly_id</code>. It contains a random identifier, not a username, password, or account profile. Sendly uses this identifier together with network information to help apply abuse-prevention and rate-limit rules. It is not used for advertising or cross-site tracking.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">2. IndexedDB upload checkpoints</h2>
          <p>
            When an upload needs to be resumed after a refresh, crash, or temporary connection problem, the browser can keep a checkpoint in IndexedDB. The checkpoint contains upload receipts and public upload parameters needed to continue the same transfer. It does not contain the password, a password hash, or the file bytes. Stale checkpoints are cleared after the application’s configured recovery period.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">3. Local display preference</h2>
          <p>
            The interface may store your light or dark theme choice in local browser storage so the next visit opens with the same appearance. This preference is not an account record and is not sent to Sendly as an advertising profile.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">4. Network and device information</h2>
          <p>
            Sendly may process an IP address and basic User-Agent information for rate limiting, password-attempt protection, and service abuse prevention. This information is used for operating and protecting the service, not for advertising. See the <a href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</a> for the broader data-handling explanation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">5. Your browser controls</h2>
          <p>
            You can clear cookies and site storage through your browser settings. Clearing IndexedDB removes any locally saved upload checkpoints, so an interrupted upload may need to start again. Blocking the technical cookie or browser storage may prevent rate-limit identification, theme persistence, or upload recovery from working as intended.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">Questions?</h2>
          <p>
            Email us at <a href="mailto:rk096327945@gmail.com" className="text-blue-600 hover:underline font-medium">rk096327945@gmail.com</a>.
          </p>
        </section>
      </div>
    </PageShell>
  );
}

export default CookiePolicy;
