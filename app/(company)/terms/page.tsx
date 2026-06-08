import { LegalPage } from "@/components/company/legal-page";

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The agreement between your school and AMS when using our platform."
      lastUpdated="June 8, 2026"
    >
      <h2>1. Acceptance of terms</h2>
      <p>
        By creating an account, accessing AMS, or using any part of the service,
        you agree to these Terms of Service on behalf of yourself and your school.
        If you do not agree, do not use the platform.
      </p>

      <h2>2. The service</h2>
      <p>
        AMS provides cloud-based tools for academic management, finance, staff
        operations, parent communication, analytics, and school websites. Features
        may change as we improve the product.
      </p>

      <h2>3. Accounts &amp; responsibilities</h2>
      <ul>
        <li>School administrators are responsible for user invitations and permissions.</li>
        <li>Users must keep login credentials confidential.</li>
        <li>You are responsible for the accuracy of data entered into AMS.</li>
        <li>You must not misuse the platform, attempt unauthorized access, or violate applicable laws.</li>
      </ul>

      <h2>4. School data ownership</h2>
      <p>
        Your school retains ownership of the data you upload. AMS processes that
        data solely to provide the service. Upon termination, export options will
        be made available subject to your plan and applicable law.
      </p>

      <h2>5. Fees &amp; billing</h2>
      <p>
        Paid plans, if applicable, are billed according to the pricing agreed at
        signup. Failure to pay may result in suspension after reasonable notice.
        Taxes and payment processor fees may apply.
      </p>

      <h2>6. Availability &amp; support</h2>
      <p>
        We aim for high availability but do not guarantee uninterrupted service.
        Scheduled maintenance and force majeure events may cause temporary
        downtime. Support is provided via documentation and email during business
        hours.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, AMS is not liable for indirect,
        incidental, or consequential damages arising from use of the service. Our
        total liability is limited to fees paid in the twelve months preceding
        the claim.
      </p>

      <h2>8. Termination</h2>
      <p>
        Either party may terminate with written notice. We may suspend access
        immediately for security risks or material breach. Sections on data,
        liability, and governing law survive termination.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These terms are governed by the laws of the jurisdiction in which AMS
        Education Systems is registered, without regard to conflict-of-law
        principles.
      </p>

      <h2>10. Contact</h2>
      <p>
        Legal enquiries:{" "}
        <a href="mailto:legal@ams.education">legal@ams.education</a>
      </p>
    </LegalPage>
  );
}
