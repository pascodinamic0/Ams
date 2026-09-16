import { getTranslations } from "next-intl/server";

export async function getActivityReportViewLabels(mode: "monthly" | "daily") {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const isDaily = mode === "daily";

  return {
    reportLabel: t(isDaily ? "dailyReportLabel" : "monthlyReportLabel"),
    summary: t(isDaily ? "dailySummary" : "monthlySummary"),
    tasksCompletedCount: t("tasksCompletedCount"),
    financeTasksCompletedCount: t("financeTasksCompletedCount"),
    expensesApprovedCount: t("expensesApprovedCount"),
    expensesRejectedCount: t("expensesRejectedCount"),
    approvedExpenseTotal: t("approvedExpenseTotal"),
    rejectedExpenseTotal: t("rejectedExpenseTotal"),
    incomeCollectedTotal: t("incomeCollectedTotal"),
    newEnrollmentIncomeTotal: t("newEnrollmentIncomeTotal"),
    netIncomeTotal: t("netIncomeTotal"),
    tasksCompletedSection: t("tasksCompletedSection"),
    expenseDecisionsSection: t("expenseDecisionsSection"),
    incomeSection: t("incomeSection"),
    noTasksCompleted: t(isDaily ? "noTasksCompletedDaily" : "noTasksCompleted"),
    noExpenseDecisions: t(
      isDaily ? "noExpenseDecisionsDaily" : "noExpenseDecisions"
    ),
    noIncomePayments: t(isDaily ? "noIncomePaymentsDaily" : "noIncomePayments"),
    colTask: t("colTask"),
    colDepartment: t("colDepartment"),
    colRelated: t("colRelated"),
    colCompleted: t("colCompleted"),
    colCategory: t("colCategory"),
    colAmount: t("colAmount"),
    colDecision: t("colDecision"),
    colReceipt: t("colReceipt"),
    colDecidedOn: t("colDecidedOn"),
    colStudent: t("colStudent"),
    colClass: t("colClass"),
    colMethod: t("colMethod"),
    colPaidOn: t("colPaidOn"),
    colIncomeLine: t("colIncomeLine"),
    incomeLineForStudent: t("incomeLineForStudent"),
    newEnrollmentBadge: t("newEnrollmentBadge"),
    reportFooter: t(isDaily ? "dailyReportFooter" : "monthlyReportFooter"),
    authorizedSignature: t("authorizedSignature"),
    issuedOn: t("issuedOn"),
    emptyDash: tc("emptyDash"),
  };
}
