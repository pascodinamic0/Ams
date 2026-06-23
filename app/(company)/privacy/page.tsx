import { LegalPage } from "@/components/company/legal-page";
import { companyIdentity } from "@/lib/company/identity";

const { productName } = companyIdentity;

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description={`How ${productName} collects, uses, and protects your school's data.`}
      lastUpdated="June 8, 2026"
    >
      <h2>1. Introduction</h2>
      <p>
        {companyIdentity.legalName} (&quot;Digni Digital&quot;, &quot;{productName}&quot;, &quot;we&quot;,
        &quot;us&quot;) provides a school management platform for administrators, teachers,
        parents, and students. We are headquartered in {companyIdentity.office.label}.
        This Privacy Policy explains how we handle personal information when you use
        our website and services.
      </p>

      <h2>2. Information we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> name, email address, role, and school
          affiliation when you register or are invited.
        </li>
        <li>
          <strong>School data:</strong> student records, attendance, grades, fees,
          timetables, and other information your school uploads to the platform.
        </li>
        <li>
          <strong>Usage data:</strong> log data, device type, browser, IP address,
          and pages visited to improve security and performance.
        </li>
        <li>
          <strong>Communications:</strong> messages sent through {productName} and support
          enquiries you submit to us.
        </li>
      </ul>

      <h2>3. How we use your information</h2>
      <p>We use collected data to:</p>
      <ul>
        <li>Provide, operate, and maintain the {productName} platform</li>
        <li>Authenticate users and enforce role-based access</li>
        <li>Process school workflows such as admissions, fees, and reporting</li>
        <li>Send service notifications, security alerts, and support responses</li>
        <li>Comply with legal obligations and prevent fraud or abuse</li>
      </ul>

      <h2>4. Data sharing</h2>
      <p>
        We do not sell personal data. We may share information with trusted
        subprocessors (such as hosting and email providers) under strict data
        processing agreements, or when required by law.
      </p>

      <h2>5. Data retention &amp; security</h2>
      <p>
        Data is retained for as long as your school&apos;s account is active or as
        needed to meet legal requirements. We apply encryption in transit,
        access controls, and audit logging to protect your information.
      </p>

      <h2>6. Your rights</h2>
      <p>
        Depending on your jurisdiction, you may request access, correction,
        export, or deletion of your personal data. School administrators can
        manage most user records directly; individual requests can be sent to{" "}
        <a href={`mailto:${companyIdentity.contact.privacyEmail}`}>
          {companyIdentity.contact.privacyEmail}
        </a>.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about this policy? Email{" "}
        <a href={`mailto:${companyIdentity.contact.privacyEmail}`}>
          {companyIdentity.contact.privacyEmail}
        </a>{" "}
        or visit our <a href="/contact">contact page</a>. Our office is located at{" "}
        {companyIdentity.office.addressFormatted}.
      </p>
    </LegalPage>
  );
}
