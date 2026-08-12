#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Replace hardcoded English action errors with actionError()/zodIssueError()."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ACTIONS = ROOT / "lib" / "actions"
AUTH = ROOT / "lib" / "auth"

ERROR_MAP = {
    "Not authenticated": "notAuthenticated",
    "Profile not found": "profileNotFound",
    "School not found": "schoolNotFound",
    "Your account is not linked to a school": "noSchoolLinked",
    "No school linked to your account": "noSchoolLinkedShort",
    "No school linked to this account": "noSchoolLinkedShort",
    "Invalid input": "invalidInput",
    "Invalid password": "invalidPassword",
    "Invalid language": "invalidLanguage",
    "Invalid locale": "invalidLanguage",
    "Not authorized": "notAuthorized",
    "Task not found": "taskNotFound",
    "Invoice not found": "invoiceNotFound",
    "Expense not found": "expenseNotFound",
    "Staff member not found": "staffNotFound",
    "Selected staff member was not found": "selectedStaffNotFound",
    "Team member not found": "teamMemberNotFound",
    "This user is not a school team member": "notSchoolTeamMember",
    "You can only manage team members at your school": "onlyOwnSchoolTeam",
    "You do not have permission to manage team members": "cannotManageTeam",
    "Your school must be approved before you can manage team members": "schoolMustBeApprovedTeam",
    "You cannot remove yourself from the team": "cannotRemoveSelf",
    "This account belongs to a platform administrator and cannot be changed": "platformAdminCannotChange",
    "This account belongs to a platform administrator and cannot be removed": "platformAdminCannotRemove",
    "This email belongs to a platform administrator and cannot be added to a school": "platformAdminCannotAdd",
    "This email is already linked to another school": "emailLinkedOtherSchool",
    "This email is already a member of your school with this role": "emailAlreadyMember",
    "This email is already registered with a different access level. Ask them to sign in with their existing account, or use a different email.": "emailDifferentAccess",
    "Failed to send invitation email": "inviteEmailFailed",
    "Failed to create the invitation link": "inviteLinkFailed",
    "This invite link is invalid or expired. Ask your admin to send a new invitation.": "inviteExpired",
    "Academic admin role cannot be changed to a different role": "lastAcademicAdminChange",
    "Cannot remove the last academic admin for this school": "lastAcademicAdminRemove",
    "Payroll record not found": "payrollNotFound",
    "Only finance admins can manage payroll amounts": "onlyFinancePayroll",
    "You can only sync staff for your school": "onlyOwnSchoolStaffSync",
    "Staff member is not in your school": "staffNotInSchool",
    "Only pending payroll amounts can be edited": "onlyPendingPayrollEdit",
    "Payroll record is not in your school": "payrollNotInSchool",
    "You can only manage payroll for your school": "onlyOwnSchoolPayroll",
    "Staff member is not in this school": "staffNotInThisSchool",
    "This person is already paid for this month. Undo payment before excluding them.": "alreadyPaidUndoFirst",
    "School is required to generate payroll": "schoolRequiredGeneratePayroll",
    "No active staff found for payroll generation": "noActiveStaffPayroll",
    "School is required to exclude someone from payroll": "schoolRequiredExcludePayroll",
    "SMS campaigns are not available yet. Use WhatsApp or in-app alerts.": "smsCampaignsUnavailable",
    "Campaign not found": "campaignNotFound",
    "Campaign already sent": "campaignAlreadySent",
    "Approved expenses cannot be edited. Reject and resubmit if needed.": "approvedExpenseNoEdit",
    "Reject or approve this expense instead of deleting the task": "rejectOrApproveExpense",
    "Discipline is only available on teacher-level accounts": "disciplineTeacherOnly",
    "Invalid task": "invalidTask",
    "Invalid incident": "invalidIncident",
    "This event or visit slot is no longer available.": "slotUnavailable",
    "Booking is closed for this slot.": "bookingClosed",
    "This event is not open for online booking.": "eventNotOpenBooking",
    "Online booking is not available for this school.": "onlineBookingUnavailable",
    "Application not found. Please submit enrollment again.": "applicationNotFoundEnroll",
    "Email does not match your enrollment application.": "emailMismatchEnrollment",
    "This application is not eligible for campus visit booking.": "applicationNotEligibleVisit",
    "Visit slot not found.": "visitSlotNotFound",
    "This slot is not available for enrollment visits.": "slotNotForEnrollmentVisits",
    "A campus visit is already booked for this application.": "visitAlreadyBooked",
    "School and branch context are required": "schoolAndBranchRequired",
    "Only school administrators can manage the setup guide": "onlyAdminsSetupGuide",
    "Fee structure and due date are required": "feeStructureDueRequired",
    "No active students found to invoice": "noActiveStudentsInvoice",
    "Account could not be verified. If you already have an account, sign in and complete school setup.": "accountNotVerified",
    "This account is already linked to a school.": "accountAlreadyLinkedSchool",
    "You have already registered a school with this account.": "alreadyRegisteredSchool",
    "Only school administrators can set up structure": "onlyAdminsStructure",
    "School must be approved before structure setup": "schoolMustBeApprovedStructure",
    "No campus/branch found for this school": "noCampusFound",
    "Only platform administrators can add schools from the admin panel": "onlyPlatformAdminsAddSchools",
    "You can only edit your own school": "onlyEditOwnSchool",
    "Not authorized to update school website": "notAuthorizedWebsite",
    "Not authorized to update school language": "notAuthorizedLocale",
    "You can only update language for your own school": "onlyOwnSchoolLocale",
    "Only school admins can manage billing for this school": "onlySchoolAdminsBilling",
    "Budget plan not found": "budgetPlanNotFound",
    "Budget line not found": "budgetLineNotFound",
    "Only finance can manage budget plans": "onlyFinanceBudget",
    "Invalid slot data": "invalidSlotData",
    "Message cannot be empty": "messageEmpty",
    "Topic is required": "topicRequired",
    "At least one participant required": "atLeastOneParticipant",
    "First message cannot be empty": "firstMessageEmpty",
    "Failed to send the invitation email": "inviteEmailFailed",
}

IMPORT_LINE = 'import { actionError, zodIssueError } from "@/lib/i18n/action-error";'


def ensure_import(text: str) -> str:
    if "from \"@/lib/i18n/action-error\"" in text:
        return text
    if '"use server";' in text:
        return text.replace('"use server";\n', '"use server";\n\n' + IMPORT_LINE + "\n", 1)
    # non-server files
    first_import = re.search(r"^import .+$", text, re.M)
    if first_import:
        idx = first_import.start()
        return text[:idx] + IMPORT_LINE + "\n" + text[idx:]
    return IMPORT_LINE + "\n" + text


def transform(text: str) -> str:
    orig = text
    # longest first
    for english, key in sorted(ERROR_MAP.items(), key=lambda x: -len(x[0])):
        quoted = json_quote = f'"{english}"'
        # return { ok: false, error: "..." }
        text = text.replace(
            f'return {{ ok: false, error: {quoted} }}',
            f'return {{ ok: false, ...(await actionError("{key}")) }}',
        )
        text = text.replace(
            f'return {{ ok: false, error: {quoted} }};',
            f'return {{ ok: false, ...(await actionError("{key}")) }};',
        )
        # return { error: "..." as const }
        text = text.replace(
            f'return {{ error: {quoted} as const }}',
            f'return await actionError("{key}")',
        )
        text = text.replace(
            f'return {{ error: {quoted} as const }};',
            f'return await actionError("{key}");',
        )
        # return { error: "..." }
        text = text.replace(
            f'return {{ error: {quoted} }}',
            f'return await actionError("{key}")',
        )
        text = text.replace(
            f'return {{ error: {quoted} }};',
            f'return await actionError("{key}");',
        )
        # error: "..." remaining in objects (e.g. if (!user) return { ok: false, error: "..." })
        text = text.replace(
            f'error: {quoted}',
            f'error: (await actionError("{key}")).error',
        )

    # zod first issue fallbacks
    text = re.sub(
        r"return \{ error: first\?\.message \?\? \"[^\"]+\" \};",
        'return await zodIssueError(first?.message);',
        text,
    )
    text = re.sub(
        r"return \{ error: parsed\.error\.issues\[0\]\?\.message \?\? \"[^\"]+\" \};",
        'return await zodIssueError(parsed.error.issues[0]?.message);',
        text,
    )

    if text != orig:
        text = ensure_import(text)
    return text


def main() -> None:
    paths = list(ACTIONS.glob("*.ts")) + list(AUTH.glob("*.ts"))
    changed = 0
    for path in paths:
        original = path.read_text(encoding="utf-8")
        updated = transform(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed += 1
            print("updated", path.relative_to(ROOT))
    print(f"done ({changed} files)")


if __name__ == "__main__":
    main()
