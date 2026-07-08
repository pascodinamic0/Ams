export {
  getAdminDashboardData,
  getAcademicDashboardData,
  getOperationsDashboardData,
  type OperationsKPIs,
} from "./dashboard";
export {
  getBooks,
  getBookIssues,
  getBookIssuesForStudent,
  getLibraryStats,
  type BookListItem,
  type LibraryIssueListItem,
  type StudentBookIssueItem,
} from "./library";
export {
  getTransportRoutes,
  getTransportVehicles,
  getTransportStudentMappings,
  getTransportStats,
  getTransportForStudent,
  getTransportForStudents,
  type TransportRouteListItem,
  type TransportVehicleListItem,
  type TransportMappingListItem,
  type StudentTransport,
} from "./transport";
export { getEvents, getUpcomingEventsCount, type EventListItem } from "./events";
export {
  getPublicSchoolEvents,
  getPublicSchoolEvent,
  getCampusVisitSlots,
  getEventRegistrations,
  type PublicSchoolEvent,
  type EventRegistrationListItem,
} from "./public-events";
export { getStaff, getStaffCount, type StaffListItem } from "./staff";
export {
  getBranches,
  getBranchById,
  getSchoolCampusId,
  type BranchListItem,
} from "./branches";
export { getClasses, type ClassListItem } from "./classes";
export { getSections, type SectionListItem } from "./sections";
export { getSubjects, type SubjectListItem } from "./subjects";
export { getAdmissions, type AdmissionListItem } from "./admissions";
export {
  getConversations,
  getConversationById,
  getGuardianContacts,
  getStaffContactsForParent,
  findExistingConversation,
  getUnreadConversationCount,
  type ConversationListItem,
  type ConversationMessage,
  type ConversationDetail,
  type GuardianContact,
  type StaffContact,
} from "./conversations";
export {
  getCampaigns,
  getCampaignRecipients,
  getFeeReminderSettings,
  getCampaignTargetGuardians,
  type CampaignListItem,
  type CampaignRecipient,
  type FeeReminderSettings,
} from "./campaigns";
export {
  getSchools,
  getSchoolBySlug,
  getSchoolById,
  type SchoolRow,
  type SchoolListItem,
  type SchoolDirectoryItem,
} from "./schools";
export {
  getStudents,
  getStudentById,
  getStudentByAuthUserId,
  type StudentListItem,
  type StudentPortalProfile,
} from "./students";
export {
  getGuardians,
  getGuardianById,
  getGuardianByAuthUserId,
  getLinkedStudentsForGuardian,
  type GuardianListItem,
  type GuardianProfile,
  type GuardianRecord,
  type LinkedStudent,
} from "./guardians";
export {
  getTimetableForClass,
  getTimetableSlots,
  getTodaysTimetableForClass,
  getTeachers,
  groupTimetableByDay,
  findTimetableSlot,
  findTeacherTimetableConflict,
  insertTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
  deleteTimetableSlotsForCell,
  replaceTimetableCell,
  upsertTimetableSlot,
  DAY_LABELS,
  TIMETABLE_DAYS,
  TIMETABLE_PERIODS,
  type TimetableSlot,
  type TimetableSlotItem,
  type TimetableSlotWrite,
  type TeacherOption,
} from "./timetable";
export {
  getCurriculum,
  getCurriculumById,
  insertCurriculum,
  updateCurriculum,
  deleteCurriculum,
  type CurriculumListItem,
  type CurriculumWrite,
} from "./curriculum";
export {
  getUsers,
  type UserListItem,
} from "./users";
export {
  getFeeStructures,
  getFeeStructureById,
  type FeeStructureListItem,
} from "./fee-structures";
export {
  getInvoices,
  getInvoiceById,
  getInvoicesForGuardian,
  getOpenInvoices,
  getFinanceKPIs,
  type InvoiceListItem,
  type FinanceKPIs,
} from "./invoices";
export {
  getPayments,
  getMonthlyPaymentTotals,
  type PaymentListItem,
} from "./payments";
export {
  getExpenses,
  getExpenseById,
  getExpenseCategories,
  getExpenseTotal,
  getMonthlyExpenseTotals,
  getExpensesByCategory,
  type ExpenseListItem,
} from "./expenses";
export {
  getPayroll,
  getPayrollById,
  getPayrollTotals,
  getMonthlyPayrollTotals,
  getPayrollMonths,
  type PayrollListItem,
  type PayrollMonthListItem,
} from "./payroll";
export {
  getNotifications,
  getUnreadNotificationCount,
  type NotificationItem,
} from "./notifications";
export {
  getTeacherClasses,
  getTeacherTodaySchedule,
  getAttendanceForClass,
  getStudentAttendanceStats,
  type TeacherClassItem,
  type ScheduleSlotItem,
  type AttendanceRecordItem,
} from "./attendance";
export {
  getGradesForClass,
  getGradesForReportCard,
  getGradesForStudent,
  type GradeGridItem,
  type ReportCardGrade,
  type StudentGradeItem,
  type GradeListItem,
} from "./grades";
export {
  getAnalyticsOverview,
  getBranchAnalytics,
  getStudentAnalytics,
  getAttendanceAnalytics,
  getFinanceAnalytics,
  type AnalyticsOverview,
  type BranchPerformanceRow,
  type StudentAnalyticsData,
  type AttendanceAnalyticsData,
  type FinanceAnalyticsData,
  type ChartPoint,
} from "./analytics";
export {
  getRoles,
  type RoleWithPermissions,
  type PermissionItem,
} from "./roles";
export {
  getAuditLogs,
  getAuditEntityTypes,
  type AuditLogItem,
} from "./audit";
export {
  getFeatureToggles,
  getSchoolFeatureMatrix,
  SCHOOL_FEATURE_KEYS,
  schoolFeatureKey,
  type FeatureToggleItem,
  type SchoolFeatureRow,
} from "./features";
export {
  getAssignmentsByTeacher,
  getAssignmentSubmissions,
  getAssignmentsForStudent,
  getAssignmentsForGuardianStudents,
  getUpcomingAssignmentsForStudent,
  type AssignmentListItem,
  type AssignmentSubmissionItem,
  type StudentAssignmentItem,
  type TeacherAssignmentListItem,
  type GuardianAssignmentRow,
} from "./assignments";
