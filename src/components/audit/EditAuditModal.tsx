"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { api } from "@/utils/api";
import { AUDIT_PERMISSIONS } from "@/constants/permissions";
import type { CurrentAudit } from "@/hooks/useCurrentAudit";
import { useAbility } from "@/hooks/useAbility";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useModal } from '@/hooks/useModal';
import { PencilIcon } from '@/icons';
import ComponentCard from '@/components/common/ComponentCard';
import DatePicker from '@/components/form/date-picker';
import Button from '@/components/ui/button/Button';
import { format } from 'date-fns';

interface EditAuditModalProps {
  clientId: string;
  existingAudit: CurrentAudit | null;
}

// Add Zod schema for audit form
const auditFormSchema = z.object({
  auditYear: z.coerce.number().optional(),
  stageId: z.coerce.number().min(1, 'Stage is required'),
  statusId: z.coerce.number().min(1, 'Status is required'),
  assignedUserId: z.string().nullable().optional(),
  reportDueDate: z.string().optional(),
  lodgedWithOFTDate: z.string().optional(),
  invoicePaid: z.boolean().optional(),
  invoiceIssueDate: z.string().optional(),
});
type AuditFormData = z.infer<typeof auditFormSchema>;

export default function EditAuditModal({ clientId, existingAudit }: EditAuditModalProps) {
  const ability = useAbility();
  const { isOpen, openModal, closeModal } = useModal();
  const utils = api.useContext();
  const { data: managers = [] } = api.user.getAssignableManagers.useQuery();
  const stagesQuery = api.audit.getStages.useQuery();
  const statusesQuery = api.audit.getStatuses.useQuery();
  const createMutation = api.audit.create.useMutation({
    onSuccess: () => {
      utils.audit.getCurrent.invalidate();
      closeModal();
    },
  });
  const updateAuditMutation = api.audit.updateAudit.useMutation({
    onSuccess: () => {
      utils.audit.getCurrent.invalidate();
      closeModal();
    },
  });
  const assignMutation = api.audit.assignUser.useMutation({ onSuccess: () => utils.audit.getCurrent.invalidate() });
  const unassignMutation = api.audit.unassignUser.useMutation({ onSuccess: () => utils.audit.getCurrent.invalidate() });

  // React Hook Form setup
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<AuditFormData>({
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
    }
  });
  const [initAssign] = useState(existingAudit?.assignments?.[0]?.userId ?? null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      });
    }
  }, [isOpen, existingAudit, reset]);

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
          reportDueDate: formData.reportDueDate ? new Date(formData.reportDueDate) : undefined,
          lodgedWithOFTDate: formData.lodgedWithOFTDate ? new Date(formData.lodgedWithOFTDate) : undefined,
          invoicePaid: formData.invoicePaid,
          invoiceIssueDate: formData.invoiceIssueDate ? new Date(formData.invoiceIssueDate) : undefined,
        };
        await updateAuditMutation.mutateAsync(payload);
        auditId = existingAudit.id;
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
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  };

  if (!ability.can(AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS)) return null;

  return (
    <>
      {/* Trigger icon */}
      <button
        type="button"
        onClick={openModal}
        className="p-1 text-gray-500 hover:text-gray-700"
        aria-label={existingAudit ? 'Edit Audit' : 'Create Audit'}
      >
        <PencilIcon className="h-5 w-5" />
      </button>
      <Modal isOpen={isOpen} onClose={closeModal} overlayClassName="bg-black/90" className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <ComponentCard title={existingAudit ? 'Edit Audit' : 'Create Audit'}>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            {/* Audit Year */}
            <div>
              <label className="block text-sm font-medium">Audit Year</label>
              <input
                type="number"
                {...register('auditYear', { valueAsNumber: true })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
              />
              {errors.auditYear && <p className="text-sm text-red-600">{errors.auditYear.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Stage</label>
              <Controller
                control={control}
                name="stageId"
                render={({ field }) => (
                  <select {...field} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2">
                    <option value=''>Select stage</option>
                    {stagesQuery.data?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
              />
              {errors.stageId && <p className="text-sm text-red-600">{errors.stageId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Status</label>
              <Controller
                control={control}
                name="statusId"
                render={({ field }) => (
                  <select {...field} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2">
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
              <label className="block text-sm font-medium">Staff</label>
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
              <Controller
                control={control}
                name="reportDueDate"
                render={({ field }) => (
                  <DatePicker
                    id="reportDueDatePicker"
                    label="Report Due Date"
                    placeholder="DD/MM/YYYY"
                    defaultDate={field.value ? new Date(field.value) : undefined}
                    onChange={(dates) => {
                      if (dates.length) {
                        const d = dates[0] as Date;
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
                  <DatePicker
                    id="lodgedWithOFTDatePicker"
                    label="Lodged with OFT Date"
                    placeholder="DD/MM/YYYY"
                    defaultDate={field.value ? new Date(field.value) : undefined}
                    onChange={(dates) => {
                      if (dates.length) {
                        const d = dates[0] as Date;
                        field.onChange(format(d, 'yyyy-MM-dd'));
                      }
                    }}
                  />
                )}
              />
              <div className="flex items-center">
                <input type="checkbox" id="invoicePaid" {...register('invoicePaid')} className="mr-2" />
                <label htmlFor="invoicePaid" className="block text-sm font-medium">Invoice Paid</label>
              </div>
              <Controller
                control={control}
                name="invoiceIssueDate"
                render={({ field }) => (
                  <DatePicker
                    id="invoiceIssueDatePicker"
                    label="Invoice Issue Date"
                    placeholder="DD/MM/YYYY"
                    defaultDate={field.value ? new Date(field.value) : undefined}
                    onChange={(dates) => {
                      if (dates.length) {
                        const d = dates[0] as Date;
                        field.onChange(format(d, 'yyyy-MM-dd'));
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