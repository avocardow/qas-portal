export interface AuditCycleData {
  lastReportDueDate: Date;
  nextReportDueDate: Date;
  progress: number;
}

export interface AuditScheduleItem {
  id: string;
  auditYear: number;
  stageName: string;
  dueDate: Date;
} 