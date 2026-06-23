import { LegalPage } from "@/components/company/legal-page";
import { companyIdentity } from "@/lib/company/identity";

const { productName } = companyIdentity;

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      description={`How ${productName} uses cookies and similar technologies on our website.`}
      lastUpdated="June 8, 2026"
    >
      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a
        website. They help us keep you signed in, remember preferences, and
        understand how the site is used.
      </p>

      <h2>2. Cookies we use</h2>
      <ul>
        <li>
          <strong>Essential cookies:</strong> required for authentication,
          session management, and security. The platform cannot function without
          these.
        </li>
        <li>
          <strong>Preference cookies:</strong> remember settings such as theme
          or language where supported.
        </li>
        <li>
          <strong>Analytics cookies:</strong> help us measure usage and improve
          performance. These are only set where consent or legitimate interest
          applies.
        </li>
      </ul>

      <h2>3. Third-party cookies</h2>
      <p>
        Some integrated services (such as authentication or error monitoring)
        may set their own cookies. We review subprocessors for compliance with
        our privacy standards.
      </p>

      <h2>4. Managing cookies</h2>
      <p>
        You can control cookies through your browser settings. Disabling
        essential cookies may prevent you from logging in or using core {productName}
        features.
      </p>

      <h2>5. Updates</h2>
      <p>
        We may update this policy as our technology changes. Material updates
        will be reflected on this page with a revised &quot;Last updated&quot; date.
      </p>

      <h2>6. Contact</h2>
      <p>
        Questions? Email{" "}
        <a href={`mailto:${companyIdentity.contact.privacyEmail}`}>
          {companyIdentity.contact.privacyEmail}
        </a>
        .
      </p>
    </LegalPage>
  );
}
