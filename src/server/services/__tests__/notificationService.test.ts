import { describe, it, expect, vi } from 'vitest';
import { NotificationTemplateService } from '../notificationTemplates';
import type { 
  ClientAssignmentData,
  AuditAssignmentData,
  AuditUpdateData
} from '@/types/notification';

// Mock logger
vi.mock('@/server/api/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('NotificationTemplateService', () => {
  describe('Template Generation', () => {
    it('should generate client assignment template', () => {
      const data: ClientAssignmentData = {
        clientId: 'client-1',
        clientName: 'Acme Corp',
        managerName: 'Jane Smith',
        assignedByName: 'Admin User',
        assignmentDate: new Date('2024-01-15')
      };
      
      const template = NotificationTemplateService.generateTemplate('client_assignment', data);
      
      expect(template.subject).toContain('Acme Corp');
      expect(template.plainTextContent).toContain('Acme Corp');
      expect(template.actionUrl).toBe('/clients/client-1');
      expect(template.actionText).toBe('View Client Details');
    });

    it('should generate audit assignment template', () => {
      const data: AuditAssignmentData = {
        auditId: 'audit-1',
        clientName: 'Acme Corp',
        auditYear: 2024,
        auditorName: 'Bob Wilson',
        assignedByName: 'Admin User',
        assignmentDate: new Date('2024-01-15'),
        periodEndDate: new Date('2024-06-30')
      };
      
      const template = NotificationTemplateService.generateTemplate('audit_assignment', data);
      
      expect(template.subject).toContain('Acme Corp');
      expect(template.subject).toContain('2024');
      expect(template.plainTextContent).toContain('financial year');
      expect(template.actionUrl).toBe('/audits/audit-1');
    });

    it('should generate audit stage update template', () => {
      const data: AuditUpdateData = {
        auditId: 'audit-1',
        clientName: 'Acme Corp',
        auditYear: 2024,
        changeType: 'stage' as const,
        previousValue: 'Planning',
        newValue: 'In Progress',
        updatedBy: 'Admin User'
      };
      
      const template = NotificationTemplateService.generateTemplate('audit_stage_update', data);
      
      expect(template.subject).toContain('Audit Stage Update');
      expect(template.plainTextContent).toContain('Planning');
      expect(template.plainTextContent).toContain('In Progress');
    });

    it('should generate audit status update template', () => {
      const data: AuditUpdateData = {
        auditId: 'audit-1',
        clientName: 'Acme Corp',
        auditYear: 2024,
        changeType: 'status' as const,
        previousValue: 'Active',
        newValue: 'Completed',
        updatedBy: 'Admin User'
      };
      
      const template = NotificationTemplateService.generateTemplate('audit_status_update', data);
      
      expect(template.subject).toContain('Audit Status Update');
      expect(template.plainTextContent).toContain('Active');
      expect(template.plainTextContent).toContain('Completed');
    });

    it('should throw error for unknown notification type', () => {
      const data: AuditUpdateData = {
        auditId: 'audit-1',
        clientName: 'Acme Corp',
        auditYear: 2024,
        changeType: 'stage' as const,
        previousValue: 'Planning',
        newValue: 'In Progress',
        updatedBy: 'Admin User'
      };
      
      expect(() => {
        NotificationTemplateService.generateTemplate('unknown_type' as never, data);
      }).toThrow('Unknown notification type');
    });
  });

  describe('Data Validation', () => {
    it('should validate client assignment data', () => {
      const validData: ClientAssignmentData = {
        clientId: 'client-1',
        clientName: 'Acme Corp',
        managerName: 'Jane Smith',
        assignedByName: 'Admin User',
        assignmentDate: new Date()
      };
      
      const result = NotificationTemplateService.validateTypeData('client_assignment', validData);
      expect(result).toBe(true);
    });

    it('should reject invalid client assignment data', () => {
      const invalidData = {
        clientId: 'client-1',
        // Missing required fields
      };
      
      const result = NotificationTemplateService.validateTypeData('client_assignment', invalidData as ClientAssignmentData);
      expect(result).toBe(false);
    });

    it('should validate audit assignment data', () => {
      const validData: AuditAssignmentData = {
        auditId: 'audit-1',
        clientName: 'Acme Corp',
        auditYear: 2024,
        auditorName: 'Bob Wilson',
        assignedByName: 'Admin User',
        assignmentDate: new Date()
      };
      
      const result = NotificationTemplateService.validateTypeData('audit_assignment', validData);
      expect(result).toBe(true);
    });
  });

  describe('Template Preview', () => {
    it('should generate template preview', () => {
      const data: ClientAssignmentData = {
        clientId: 'client-1',
        clientName: 'Acme Corp',
        managerName: 'Jane Smith',
        assignedByName: 'Admin User',
        assignmentDate: new Date()
      };
      
      const preview = NotificationTemplateService.getTemplatePreview('client_assignment', data);
      
      expect(preview.subject).toContain('Acme Corp');
      expect(preview.plainText).toContain('Acme Corp');
    });

    it('should throw error for invalid data in preview', () => {
      const invalidData = { clientId: 'client-1' };
      
      expect(() => {
        NotificationTemplateService.getTemplatePreview('client_assignment', invalidData as ClientAssignmentData);
      }).toThrow('Invalid data for notification type');
    });
  });
}); 