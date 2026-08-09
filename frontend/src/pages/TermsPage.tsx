// ============================================================
// TermsPage — TERMS OF SERVICE
// Written in plain language on purpose.
// Technical words get a dotted underline + tooltip (Term),
// so a first-time user can tap/hover and understand instantly.
// ============================================================
import { PageShell } from "../components/PageSheel";
import { Illustration } from "../components/Illustration";
import { Term } from "../components/Term";

export function TermsPage() {
  return (
    <PageShell title="Terms of Service" subtitle="Last updated: July 29, 2026. Written to be read, not skipped.">
      <Illustration src="/illustrations/contract.svg" alt="A simple agreement" maxWidth={280} />

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        {/* 1. The one-paragraph summary */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800">1. The short version</h2>
          <p>
            VaultHub is a free file-sharing tool with optional{" "}
            <Term tip="Encryption means your file is scrambled into unreadable noise before it leaves your device. Only the password can unscramble it.">
              encryption
            </Term>{" "}
            in your browser. By using it, you agree to these simple rules. If you don't agree, please don't use the service. No hard feelings.
          </p>
        </section>

        {/* 2. Our promises to the user */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800">2. What you can expect from us</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Files up to 500 MB, kept for 1 day or up to 10 downloads, whichever comes first.</li>
            <li>Automatic, permanent deletion when a link expires.</li>
            <li>
              If you encrypt a file, it is locked on your device with{" "}
              <Term tip="The industry-standard lock for data. The same family of encryption online banking uses. If even one byte is changed, unlocking simply fails.">
                AES-GCM
              </Term>{" "}
              before upload, so we technically cannot read it. Your password stays with you.
            </li>
          </ul>
        </section>

        {/* 3. The user's responsibilities */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800">3. What we ask of you</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Only share files you have the right to share.</li>
            <li>Keep your password safe. We can't recover it, and that's by design.</li>
            <li>Send links only to the people you intend to receive them.</li>
          </ul>
        </section>

        {/* 4. Abuse rules, in calm language */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800">4. Keeping VaultHub safe for everyone</h2>
          <p>
            Please don't use VaultHub to share anything illegal, harmful, or abusive. We built this as a simple, trustworthy way to send files, and to keep it that way we may remove content that puts the service or its users at risk. That's it. No fine print, no gotchas.
          </p>
        </section>

        {/* 5. Ownership */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800">5. Your files are yours</h2>
          <p>You keep all rights to what you share. VaultHub's code, design, and name belong to the project team.</p>
        </section>

        {/* 6. Honest limitation note */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800">6. An honest note</h2>
          <p>
            VaultHub is an early-stage project provided "as is". We care a lot about doing the right thing, but please don't rely on it as the only copy of anything important.
          </p>
        </section>

        {/* 7. Contact */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800">7. Questions?</h2>
          <p>
            We're happy to help:{" "}
            <a href="mailto:rk096327945@gmail.com" className="text-blue-600 hover:underline font-medium">rk096327945@gmail.com</a>
          </p>
        </section>
      </div>
    </PageShell>
  );
}

export default TermsPage;