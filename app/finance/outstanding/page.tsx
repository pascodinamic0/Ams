import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getOpenInvoices,
  getSchoolById,
  getSchoolCurrencyForSchool,
} from "@/lib/db";
import { OutstandingBoard } from "./outstanding-board";

export default async function OutstandingFeesPage() {
  const t = await getTranslations("finance");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const schoolId = profile?.school_id ?? undefined;
  const scope = {
    schoolId,
    branchId: profile?.branch_id ?? undefined,
  };

  const [invoices, currency, school] = await Promise.all([
    getOpenInvoices(scope),
    getSchoolCurrencyForSchool(schoolId),
    schoolId ? getSchoolById(schoolId) : Promise.resolve(null),
  ]);

  const issuedOn = format(new Date(), "yyyy-MM-dd");

  return (
    <OutstandingBoard
      invoices={invoices}
      school={
        school
          ? {
              name: school.name,
              logo_url: school.logo_url,
              address: school.address,
            }
          : null
      }
      currencyCode={currency.code}
      issuedOn={issuedOn}
      labels={{
        title: t("outstandingTitle"),
        subtitle: t("outstandingSubtitle"),
        searchPlaceholder: t("searchStudentsPlaceholder"),
        allClasses: t("allClasses"),
        overdueOnly: t("overdueOnly"),
        studentsWithDebt: t("studentsWithDebt"),
        openInvoices: t("openInvoicesCount"),
        totalOwed: t("totalOwed"),
        downloadInvoice: t("downloadInvoice"),
        noOutstanding: t("noOutstanding"),
        noOutstandingDesc: t("noOutstandingDesc"),
        colStudentId: t("colStudentId"),
        colStudent: t("colStudent"),
        colClass: t("colClass"),
        colFeeType: t("colFeeType"),
        colDueDate: t("colDueDate"),
        colActions: t("colActions"),
        amount: tc("amount"),
        paid: tc("paid"),
        balance: tc("balance"),
        status: tc("status"),
        overdue: tc("overdue"),
        pending: t("statusPending"),
        issuedOn: t("budgetIssuedOn"),
        pleaseSettle: t("pleaseSettleDebt"),
        invoiceTitle: t("invoiceDocumentTitle"),
        invoiceNumber: t("invoiceNumberLabel"),
        invoiceFooter: t("invoiceDocumentFooter"),
        emptyDash: tc("emptyDash"),
        classLabel: t("colClass"),
        filtersTitle: t("filtersTitle"),
        debtorsTitle: t("debtorsTitle"),
      }}
    />
  );
}
