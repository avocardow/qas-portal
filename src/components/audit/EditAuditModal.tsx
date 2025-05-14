"use client";
// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { api } from "@/utils/api";
import { AUDIT_PERMISSIONS } from "@/constants/permissions";
import type { CurrentAudit } from "@/hooks/useCurrentAudit";
import { useAbility } from "@/hooks/useAbility";
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useModal } from '@/hooks/useModal';
import { PencilIcon } from '@/icons';
import ComponentCard from '@/components/common/ComponentCard';
import DatePicker from '@/components/form/date-picker';
import Button from '@/components/ui/button/Button';
import { format } from 'date-fns';
import Authorized from '@/components/Authorized';
import { ActivityLogType } from '@prisma/client';

interface EditAuditModalProps {
  clientId: string;
  existingAudit: CurrentAudit | null;
  /** Control modal open externally */
  manualOpen?: boolean;
  /** Hide internal trigger button */
  hideTrigger?: boolean;
  /** Callback after form submit */
  onAfterSubmit?: (data: AuditFormData) => void;
  /** Callback when modal closes */
  onModalClose?: () => void;
}

// Add Zod schema for audit form
const auditFormSchema = z.object({
  auditYear: z.coerce.number().optional(),
  stageId: z.coerce.number().refine(val => val !== undefined && val !== null, { message: 'Stage is required' }),
  statusId: z.coerce.number().refine(val => val !== undefined && val !== null, { message: 'Status is required' }),
  assignedUserId: z.string().nullable().optional(),
  reportDueDate: z.string().optional(),
  lodgedWithOFTDate: z.string().optional(),
  invoicePaid: z.boolean().optional(),
  invoiceIssueDate: z.string().optional(),
  auditPeriodEndDate: z.string().optional(),
  nextContactDate: z.string().optional(),
});
export type AuditFormData = z.infer<typeof auditFormSchema>;

export default function EditAuditModal({
  clientId,
  existingAudit,
  manualOpen,
  hideTrigger,
  onAfterSubmit,
  onModalClose,
}: EditAuditModalProps) {
  const ability = useAbility();
  const { isOpen, openModal, closeModal } = useModal();
  const utils = api.useContext();
  const { data: managers = [] } = api.user.getAssignableManagers.useQuery();
  const statusesQuery = api.audit.getStatuses.useQuery();
  const createMutation = api.audit.create.useMutation({
    onSuccess: () => {
      utils.audit.getCurrent.invalidate();
      utils.clients.getById.invalidate({ clientId });
      closeModal();
    },
  });
  const updateAuditMutation = api.audit.updateAudit.useMutation({
    onSuccess: () => {
      utils.audit.getCurrent.invalidate();
      utils.clients.getById.invalidate({ clientId });
      closeModal();
    },
  });
  const assignMutation = api.audit.assignUser.useMutation({ onSuccess: () => utils.audit.getCurrent.invalidate() });
  const unassignMutation = api.audit.unassignUser.useMutation({ onSuccess: () => utils.audit.getCurrent.invalidate() });
  const updateClientMutation = api.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.getById.invalidate({ clientId });
      utils.clients.getAll.invalidate();
    }
  });
  const addActivityLogMut = api.clients.addActivityLog.useMutation();
  const { data: clientData } = api.clients.getById.useQuery({ clientId });
  const computedReportDueDate = existingAudit?.reportDueDate
    ? existingAudit.reportDueDate
    : clientData?.auditPeriodEndDate
      ? (() => {
          const d = new Date(clientData.auditPeriodEndDate);
          // Last day of the month four months after auditPeriodEndDate
          return new Date(d.getFullYear(), d.getMonth() + 5, 0);
        })()
      : undefined;
  const computedClientAuditPeriodEndDate = clientData?.auditPeriodEndDate
    ? new Date(clientData.auditPeriodEndDate)
    : undefined;
  const computedClientNextContactDate = clientData?.nextContactDate
    ? new Date(clientData.nextContactDate)
    : undefined;

  // React Hook Form setup
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting }, setValue } = useForm<AuditFormData>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      auditYear: existingAudit?.auditYear,
      stageId: existingAudit?.stage?.id,
      statusId: existingAudit?.status?.id,
      assignedUserId: existingAudit?.assignments?.[0]?.userId ?? null,
      reportDueDate: existingAudit?.reportDueDate ? existingAudit.reportDueDate.toISOString().split('T')[0] : undefined,
      lodgedWithOFTDate: existingAudit?.lodgedWithOFTDate ? existingAudit.lodgedWithOFTDate.toISOString().split('T')[0] : undefined,
      invoicePaid: existingAudit?.invoicePaid ?? false,
      invoiceIssueDate: existingAudit?.invoiceIssueDate ? existingAudit.invoiceIssueDate.toISOString().split('T')[0] : undefined,
      auditPeriodEndDate: clientData?.auditPeriodEndDate ? new Date(clientData.auditPeriodEndDate).toISOString().split('T')[0] : undefined,
      nextContactDate: clientData?.nextContactDate ? new Date(clientData.nextContactDate).toISOString().split('T')[0] : undefined,
    }
  });
  const [initAssign] = useState(existingAudit?.assignments?.[0]?.userId ?? null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const auditPeriodEndDate = useWatch({ control, name: 'auditPeriodEndDate' });
  const reportDueDate = useWatch({ control, name: 'reportDueDate' });

  // Reset form when modal opens or existingAudit changes
  useEffect(() => {
    if (isOpen) {
      reset({
        auditYear: existingAudit?.auditYear,
        stageId: existingAudit?.stage?.id,
        statusId: existingAudit?.status?.id,
        assignedUserId: existingAudit?.assignments?.[0]?.userId ?? null,
        reportDueDate: existingAudit?.reportDueDate ? existingAudit.reportDueDate.toISOString().split('T')[0] : undefined,
        lodgedWithOFTDate: existingAudit?.lodgedWithOFTDate ? existingAudit.lodgedWithOFTDate.toISOString().split('T')[0] : undefined,
        invoicePaid: existingAudit?.invoicePaid ?? false,
        invoiceIssueDate: existingAudit?.invoiceIssueDate ? existingAudit.invoiceIssueDate.toISOString().split('T')[0] : undefined,
        auditPeriodEndDate: clientData?.auditPeriodEndDate ? new Date(clientData.auditPeriodEndDate).toISOString().split('T')[0] : undefined,
        nextContactDate: clientData?.nextContactDate ? new Date(clientData.nextContactDate).toISOString().split('T')[0] : undefined,
      });
    }
  }, [isOpen, existingAudit, reset, clientData]);

  // Auto-update reportDueDate when auditPeriodEndDate changes
  useEffect(() => {
    if (!isOpen) return;
    if (auditPeriodEndDate) {
      const [y, m, d] = auditPeriodEndDate.split('-').map(Number);
      if (!y || !m || !d) return;
      // Add 4 months, then set to last day of that month
      const base = new Date(Date.UTC(y, m - 1, d));
      const due = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 5, 0));
      // Format as yyyy-MM-dd
      const yyyy = due.getUTCFullYear();
      const mm = (due.getUTCMonth() + 1).toString().padStart(2, '0');
      const dd = due.getUTCDate().toString().padStart(2, '0');
      const dueStr = `${yyyy}-${mm}-${dd}`;
      if (reportDueDate !== dueStr) {
        setValue('reportDueDate', dueStr);
      }
    }
  }, [isOpen, auditPeriodEndDate, reportDueDate, setValue]);

  // sync external control
  useEffect(() => {
    if (manualOpen === undefined) return;
    if (manualOpen) openModal(); else closeModal();
  }, [manualOpen, openModal, closeModal]);

  const onSubmitForm = async (formData: AuditFormData) => {
    setErrorMsg(null);
    try {
      let auditId: string;
      if (existingAudit) {
        const payload = {
          auditId: existingAudit.id,
          auditYear: formData.auditYear,
          stageId: formData.stageId,
          statusId: formData.statusId,
          reportDueDate: formData.reportDueDate ? (() => { const [y,m,d] = formData.reportDueDate.split('-').map(Number); return new Date(Date.UTC(y, (m??1)-1, d)); })() : undefined,
          lodgedWithOFTDate: formData.lodgedWithOFTDate ? (() => { const [y,m,d] = formData.lodgedWithOFTDate.split('-').map(Number); return new Date(Date.UTC(y, (m??1)-1, d)); })() : undefined,
          invoicePaid: formData.invoicePaid,
          invoiceIssueDate: formData.invoiceIssueDate ? (() => { const [y,m,d] = formData.invoiceIssueDate.split('-').map(Number); return new Date(Date.UTC(y, (m??1)-1, d)); })() : undefined,
        };
        await updateAuditMutation.mutateAsync(payload);
        auditId = existingAudit.id;
        // Update client auditPeriodEndDate and nextContactDate
        await updateClientMutation.mutateAsync({
          clientId,
          clientName: clientData?.clientName || '',
          status: clientData?.status || 'active',
          auditPeriodEndDate: formData.auditPeriodEndDate ? (() => { const [y,m,d] = formData.auditPeriodEndDate.split('-').map(Number); return new Date(Date.UTC(y, (m??1)-1, d)); })() : undefined,
          nextContactDate: formData.nextContactDate ? (() => { const [y,m,d] = formData.nextContactDate.split('-').map(Number); return new Date(Date.UTC(y, (m??1)-1, d)); })() : undefined,
        });
      } else {
        const created = await createMutation.mutateAsync({ clientId, auditYear: formData.auditYear!, stageId: formData.stageId, statusId: formData.statusId });
        auditId = created.id;
      }
      // Handle assignment changes
      if (formData.assignedUserId !== initAssign) {
        if (initAssign) await unassignMutation.mutateAsync({ auditId, userId: initAssign });
        if (formData.assignedUserId) await assignMutation.mutateAsync({ auditId, userId: formData.assignedUserId });
      }
      closeModal();
      onAfterSubmit?.(formData);
      // If audit is completed and lodged, add a flag-checkered activity log
      if (
        existingAudit &&
        formData.lodgedWithOFTDate &&
        formData.invoiceIssueDate &&
        formData.invoicePaid &&
        formData.stageId === 4 &&
        formData.statusId === 10
      ) {
        await addActivityLogMut.mutateAsync({
          clientId,
          type: 'audit_complete' as unknown as ActivityLogType,
          content: `${existingAudit.auditYear} Audit Completed and Lodged`,
        });
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  };

  // Only allow users with create or edit audit permission to open modal
  if (!ability.can(AUDIT_PERMISSIONS.EDIT) && !ability.can(AUDIT_PERMISSIONS.CREATE)) return null;

  return (
    <>
      {/* Trigger icon */}
      {!hideTrigger && (
        <button
          type="button"
          onClick={openModal}
          className="p-1 text-gray-500 hover:text-gray-700"
          aria-label={existingAudit ? 'Edit Audit' : 'Create Audit'}
        >
          <PencilIcon className="h-5 w-5" />
        </button>
      )}
      <Modal
        isOpen={isOpen}
        onClose={() => { closeModal(); onModalClose?.(); }}
        overlayClassName="bg-black/90"
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <ComponentCard title={existingAudit ? 'Edit Audit Year' : 'Create Audit'}>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            {/* Audit Details */}
            <div className="pb-1 font-semibold text-gray-700">Audit Details</div>
            <div>
              <label className="block text-sm font-medium">Audit Year</label>
              <input
                type="number"
                disabled
                {...register('auditYear', { valueAsNumber: true })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
              {errors.auditYear && <p className="text-sm text-red-600">{errors.auditYear.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Audit Stage</label>
              <Controller
                control={control}
                name="stageId"
                rules={{ required: 'Stage is required' }}
                render={({ field }) => (
                  <select {...field} required className="mt-1 block w-full rounded border border-gray-300 px-3 py-2">
                    <option value="">Select stage</option>
                    <option value="0">Onboarding</option>
                    <option value="1">1st interim review</option>
                    <option value="2">2nd interim review</option>
                    <option value="3">Year-end audit</option>
                    <option value="4">Completed</option>
                  </select>
                )}
              />
              {errors.stageId && <p className="text-sm text-red-600">{errors.stageId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Audit Status</label>
              <Controller
                control={control}
                name="statusId"
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <select {...field} required className="mt-1 block w-full rounded border border-gray-300 px-3 py-2">
                    <option value=''>Select status</option>
                    {statusesQuery.data?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
              />
              {errors.statusId && <p className="text-sm text-red-600">{errors.statusId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Assign Staff</label>
              <Controller
                control={control}
                name="assignedUserId"
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value ?? ''}
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                  >
                    <option value="">Unassigned</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name || m.email}</option>
                    ))}
                  </select>
                )}
              />
            </div>
            {/* Period & Dates */}
            <div className="pt-2 pb-1 font-semibold text-gray-700">Period & Dates</div>
            <Controller
              control={control}
              name="auditPeriodEndDate"
              render={({ field }) => (
                <DatePicker
                  id="auditPeriodEndDatePicker"
                  label="Audit Period End Date"
                  placeholder="Select date"
                  defaultDate={field.value ? (() => { const [y,m,d] = field.value.split('-').map(Number); return new Date(y,(m??1)-1,d); })() : computedClientAuditPeriodEndDate}
                  closeOnSelect={false}
                  onChange={(dates) => {
                    const d = Array.isArray(dates) ? dates[0] : dates;
                    if (d) {
                      field.onChange(format(d as Date, 'yyyy-MM-dd'));
                    }
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="reportDueDate"
              render={({ field }) => (
                <DatePicker
                  id="reportDueDatePicker"
                  label="Report Due Date"
                  placeholder="Select date"
                  minDate={new Date()}
                  defaultDate={field.value ? new Date(field.value) : computedReportDueDate}
                  closeOnSelect={false}
                  onChange={(dates) => {
                    const d = Array.isArray(dates) ? dates[0] : dates;
                    if (d) {
                      field.onChange(format(d, 'yyyy-MM-dd'));
                    }
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="lodgedWithOFTDate"
              render={({ field }) => (
                <Authorized action={AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS}>
                  <DatePicker
                    id="lodgedWithOFTDatePicker"
                    label="Lodged with OFT Date"
                    placeholder="Select date"
                    defaultDate={field.value ? new Date(field.value) : undefined}
                    closeOnSelect={false}
                    showClearButton
                    onChange={(dates) => {
                      if (dates.length) {
                        const d = dates[0] as Date;
                        field.onChange(format(d, 'yyyy-MM-dd'));
                      }
                    }}
                  />
                </Authorized>
              )}
            />
            <Controller
              control={control}
              name="invoiceIssueDate"
              render={({ field }) => (
                <Authorized action={AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS}>
                  <DatePicker
                    id="invoiceIssueDatePicker"
                    label="Invoice Issue Date"
                    placeholder="Select date"
                    defaultDate={field.value ? new Date(field.value) : undefined}
                    maxDate={new Date()}
                    closeOnSelect={false}
                    showClearButton
                    onChange={(dates) => {
                      if (dates.length) {
                        const d = dates[0] as Date;
                        field.onChange(format(d, 'yyyy-MM-dd'));
                      }
                    }}
                  />
                </Authorized>
              )}
            />
            <Authorized action={AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS}>
              <div className="flex items-center">
                <input type="checkbox" id="invoicePaid" {...register('invoicePaid')} className="mr-2" />
                <label htmlFor="invoicePaid" className="block text-sm font-medium">Invoice Paid</label>
              </div>
            </Authorized>
            <Controller
              control={control}
              name="nextContactDate"
              render={({ field }) => (
                <DatePicker
                  id="nextContactDatePicker"
                  label="Next Contact Date"
                  placeholder="Select date"
                  value={field.value ? (() => { const [y, m, d] = field.value.split('-').map(Number); return d.toString().padStart(2, '0') + '/' + (m ?? 1).toString().padStart(2, '0') + '/' + y; })() : ''}
                  defaultDate={field.value ? (() => { const [y, m, d] = field.value.split('-').map(Number); return new Date(y, (m ?? 1) - 1, d); })() : computedClientNextContactDate}
                  minDate={(() => {
                    const initialDate = field.value
                      ? new Date(field.value)
                      : computedClientNextContactDate ?? new Date();
                    const today = new Date();
                    return initialDate < today ? initialDate : today;
                  })()}
                  closeOnSelect={false}
                  onChange={(dates) => {
                    const d = Array.isArray(dates) ? dates[0] : dates;
                    if (d) {
                      field.onChange(format(d as Date, 'yyyy-MM-dd'));
                    }
                  }}
                />
              )}
            />
            {errorMsg && <p className="text-red-600">{errorMsg}</p>}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={isSubmitting || createMutation.status==='pending' || updateAuditMutation.status==='pending'}>
                {existingAudit ? 'Save' : 'Create'}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </Modal>
    </>
  );
}

// Add named component for creating a new audit using the same modal
export function AddAuditModal({ clientId }: { clientId: string }) {
  // existingAudit is null to trigger create mode
  return <EditAuditModal clientId={clientId} existingAudit={null} />;
} 