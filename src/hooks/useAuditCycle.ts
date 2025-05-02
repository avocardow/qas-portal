import { api } from '@/utils/api';
import { AuditCycleData, AuditScheduleItem } from '@/types/audit';

// Hook to fetch and prepare audit data for cycle progress and schedule
export function useAuditCycle(clientId: string) {
  const { data, isLoading, error } = api.audit.getByClientId.useQuery({ clientId });
  const audits = data ?? [];

  // Sort audits by report due date ascending
  const sortedAudits = [...audits].sort((a, b) => {
    const aDate = a.reportDueDate ? new Date(a.reportDueDate).getTime() : 0;
    const bDate = b.reportDueDate ? new Date(b.reportDueDate).getTime() : 0;
    return aDate - bDate;
  });

  // Determine cycle data: last and next report due dates
  let cycleData: AuditCycleData | undefined;
  if (sortedAudits.length >= 2) {
    const lastIndex = sortedAudits.length - 1;
    const lastDate = sortedAudits[lastIndex - 1].reportDueDate!;
    const nextDate = sortedAudits[lastIndex].reportDueDate!;
    // Calculate progress percentage between last and next report due dates
    const now = Date.now();
    const totalInterval = nextDate.getTime() - lastDate.getTime();
    const elapsed = now - lastDate.getTime();
    const rawProgress = totalInterval > 0 ? (elapsed / totalInterval) * 100 : 0;
    const progress = Math.min(Math.max(rawProgress, 0), 100);
    cycleData = {
      lastReportDueDate: lastDate,
      nextReportDueDate: nextDate,
      progress,
    };
  }

  // Prepare schedule items for upcoming audits
  const schedule: AuditScheduleItem[] = sortedAudits.map((audit) => ({
    id: audit.id,
    auditYear: audit.auditYear,
    stageName: audit.stage?.name ?? '',
    dueDate: audit.reportDueDate!,
  }));

  return { cycleData, schedule, isLoading, error };
} 