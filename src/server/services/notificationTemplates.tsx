import React from 'react';
import type { 
  NotificationTemplate,
  ClientAssignmentData,
  AuditAssignmentData,
  AuditUpdateData,
  NotificationTypeData
} from '@/types/notification';
import { NotificationType } from '@prisma/client';

/**
 * Template for client assignment notifications
 */
function ClientAssignmentTemplate({ data }: { data: ClientAssignmentData }) {
  return (
    <div>
      <h3>New Client Assignment</h3>
      <p>
        You have been assigned as the manager for client:{' '}
        <strong>{data.clientName}</strong>.
      </p>
      <p>
        Assignment Date: {data.assignmentDate.toLocaleDateString('en-AU')}
      </p>
      <p>
        Please review the client details and ensure all necessary documentation
        is up to date.
      </p>
    </div>
  );
}

/**
 * Template for audit assignment notifications
 */
function AuditAssignmentTemplate({ data }: { data: AuditAssignmentData }) {
  return (
    <div>
      <h3>New Audit Assignment</h3>
      <p>
        You have been assigned to audit <strong>{data.clientName}</strong> for
        the {data.auditYear} financial year.
      </p>
      {data.periodEndDate && (
        <p>
          Period End Date: {data.periodEndDate.toLocaleDateString('en-AU')}
        </p>
      )}
      <p>
        Assignment Date: {data.assignmentDate.toLocaleDateString('en-AU')}
      </p>
      <p>
        Please begin the audit process by reviewing the client&apos;s documentation
        and planning the audit procedures.
      </p>
    </div>
  );
}

/**
 * Template for audit stage update notifications
 */
function AuditStageUpdateTemplate({ data }: { data: AuditUpdateData }) {
  return (
    <div>
      <h3>Audit Stage Update</h3>
      <p>
        The audit stage for <strong>{data.clientName}</strong> (
        {data.auditYear}) has been updated.
      </p>
      <p>
        <strong>Previous Stage:</strong> {data.previousValue}
        <br />
        <strong>New Stage:</strong> {data.newValue}
      </p>
      <p>
        Updated by: {data.updatedBy}
      </p>
      <p>
        Please review the updated audit stage and adjust your workflow
        accordingly.
      </p>
    </div>
  );
}

/**
 * Template for audit status update notifications
 */
function AuditStatusUpdateTemplate({ data }: { data: AuditUpdateData }) {
  return (
    <div>
      <h3>Audit Status Update</h3>
      <p>
        The audit status for <strong>{data.clientName}</strong> (
        {data.auditYear}) has been updated.
      </p>
      <p>
        <strong>Previous Status:</strong> {data.previousValue}
        <br />
        <strong>New Status:</strong> {data.newValue}
      </p>
      <p>
        Updated by: {data.updatedBy}
      </p>
      <p>
        Please review the updated audit status and take any necessary actions.
      </p>
    </div>
  );
}

/**
 * Notification template service for generating React components and text content
 */
export class NotificationTemplateService {
  /**
   * Generate a notification template for the given type and data
   */
  static generateTemplate(
    type: NotificationType,
    data: NotificationTypeData
  ): NotificationTemplate {
    switch (type) {
      case 'client_assignment':
        return this.generateClientAssignmentTemplate(data as ClientAssignmentData);
      
      case 'audit_assignment':
        return this.generateAuditAssignmentTemplate(data as AuditAssignmentData);
      
      case 'audit_stage_update':
        return this.generateAuditUpdateTemplate(data as AuditUpdateData, 'stage');
      
      case 'audit_status_update':
        return this.generateAuditUpdateTemplate(data as AuditUpdateData, 'status');
      
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }

  /**
   * Generate client assignment template
   */
  private static generateClientAssignmentTemplate(
    data: ClientAssignmentData
  ): NotificationTemplate {
    const content = <ClientAssignmentTemplate data={data} />;
    
    const plainTextContent = `
New Client Assignment

      You have been assigned as the manager for client: ${data.clientName}.

Assignment Date: ${data.assignmentDate.toLocaleDateString('en-AU')}

Please review the client details and ensure all necessary documentation is up to date.
    `.trim();

    return {
      subject: `New Client Assignment: ${data.clientName}`,
      content,
      plainTextContent,
      actionUrl: `/clients/${data.clientId}`,
      actionText: 'View Client Details'
    };
  }

  /**
   * Generate audit assignment template
   */
  private static generateAuditAssignmentTemplate(
    data: AuditAssignmentData
  ): NotificationTemplate {
    const content = <AuditAssignmentTemplate data={data} />;
    
    const plainTextContent = `
New Audit Assignment

You have been assigned to audit ${data.clientName} for the ${data.auditYear} financial year.

${data.periodEndDate ? `Period End Date: ${data.periodEndDate.toLocaleDateString('en-AU')}` : ''}

Assignment Date: ${data.assignmentDate.toLocaleDateString('en-AU')}

Please begin the audit process by reviewing the client's documentation and planning the audit procedures.
    `.trim();

    return {
      subject: `New Audit Assignment: ${data.clientName} (${data.auditYear})`,
      content,
      plainTextContent,
      actionUrl: `/audits/${data.auditId}`,
      actionText: 'View Audit Details'
    };
  }

  /**
   * Generate audit update template (for both stage and status updates)
   */
  private static generateAuditUpdateTemplate(
    data: AuditUpdateData,
    updateType: 'stage' | 'status'
  ): NotificationTemplate {
    const isStage = updateType === 'stage';
    const updateTypeText = isStage ? 'Stage' : 'Status';
    
    const content = isStage ? (
      <AuditStageUpdateTemplate data={data} />
    ) : (
      <AuditStatusUpdateTemplate data={data} />
    );
    
    const plainTextContent = `
Audit ${updateTypeText} Update

The audit ${updateType} for ${data.clientName} (${data.auditYear}) has been updated.

Previous ${updateTypeText}: ${data.previousValue}
New ${updateTypeText}: ${data.newValue}

Updated by: ${data.updatedBy}

Please review the updated audit ${updateType} and ${isStage ? 'adjust your workflow accordingly' : 'take any necessary actions'}.
    `.trim();

    return {
      subject: `Audit ${updateTypeText} Update: ${data.clientName} (${data.auditYear})`,
      content,
      plainTextContent,
      actionUrl: `/audits/${data.auditId}`,
      actionText: 'View Audit Details'
    };
  }

  /**
   * Validate that the data matches the expected type structure
   */
  static validateTypeData(
    type: NotificationType,
    data: NotificationTypeData
  ): boolean {
    try {
      switch (type) {
        case 'client_assignment':
          const clientData = data as ClientAssignmentData;
          return !!(
            clientData.clientId &&
            clientData.clientName &&
            clientData.managerName &&
            clientData.assignmentDate
          );
        
        case 'audit_assignment':
          const auditData = data as AuditAssignmentData;
          return !!(
            auditData.auditId &&
            auditData.clientName &&
            auditData.auditYear &&
            auditData.auditorName &&
            auditData.assignmentDate
          );
        
        case 'audit_stage_update':
        case 'audit_status_update':
          const updateData = data as AuditUpdateData;
          return !!(
            updateData.auditId &&
            updateData.clientName &&
            updateData.auditYear &&
            updateData.changeType &&
            updateData.previousValue &&
            updateData.newValue &&
            updateData.updatedBy
          );
        
        default:
          return false;
      }
          } catch {
        return false;
      }
  }

  /**
   * Get template preview for testing purposes
   */
  static getTemplatePreview(
    type: NotificationType,
    data: NotificationTypeData
  ): { subject: string; plainText: string } {
    if (!this.validateTypeData(type, data)) {
      throw new Error(`Invalid data for notification type: ${type}`);
    }

    const template = this.generateTemplate(type, data);
    return {
      subject: template.subject,
      plainText: template.plainTextContent
    };
  }
} 