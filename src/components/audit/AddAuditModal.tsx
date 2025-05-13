"use client";
import React, { useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { api } from "@/utils/api";
import { AUDIT_PERMISSIONS } from "@/constants/permissions";
import { useAbility } from "@/hooks/useAbility";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusIcon } from "@/icons";
import ComponentCard from "@/components/common/ComponentCard";
import DatePicker from "@/components/form/date-picker";
import Button from "@/components/ui/button/Button";
import { format } from 'date-fns';
import { ActivityLogType } from '@prisma/client';

// Zod schema for add form with all Audit fields
const addAuditFormSchema = z.object({
  auditYear: z.coerce.number().refine(val => val != null, { message: 'Audit Year is required' }),
  stageId: z.coerce.number().refine(val => val != null, { message: 'Stage is required' }),
  statusId: z.coerce.number().refine(val => val != null, { message: 'Status is required' }),
  assignedUserId: z.string().optional(),
  auditPeriodEndDate: z.string().optional(),
  reportDueDate: z.string().optional(),
  lodgedWithOFTDate: z.string().optional(),
  invoiceIssueDate: z.string().optional(),
  invoicePaid: z.boolean().optional(),
  nextContactDate: z.string().optional(),
});
export type AddAuditFormData = z.infer<typeof addAuditFormSchema>;

interface AddAuditModalProps {
  clientId: string;
  onAfterSubmit?: (auditId: string) => void;
  /** Control modal open externally */
  manualOpen?: boolean;
  /** Hide the internal trigger button */
  hideTrigger?: boolean;
  /** Initial form values for add form */
  initialValues?: Partial<AddAuditFormData>;
  /** Callback when modal closes without submit */
  onModalClose?: () => void;
}

export default function AddAuditModal({ clientId, onAfterSubmit, 
  manualOpen,
  hideTrigger,
  initialValues,
  onModalClose,
}: AddAuditModalProps) {
  const ability = useAbility();
  const { isOpen, openModal, closeModal } = useModal();
  const utils = api.useContext();
  const { data: managers = [] } = api.user.getAssignableManagers.useQuery();
  const { data: clientData } = api.clients.getById.useQuery({ clientId });
  const updateClientMutation = api.clients.update.useMutation({ onSuccess: () => { utils.clients.getById.invalidate({ clientId }); } });

  const createMutation = api.audit.create.useMutation({
    onSuccess: () => {
      utils.audit.getCurrent.invalidate();
      utils.clients.getById.invalidate({ clientId });
    },
  });
  const updateAuditMutation = api.audit.updateAudit.useMutation({
    onSuccess: () => {
      utils.audit.getCurrent.invalidate();
    },
  });
  const addActivityLogMut = api.clients.addActivityLog.useMutation({
    onSuccess: () => { utils.clients.getById.invalidate({ clientId }); },
  });

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<AddAuditFormData>({
    resolver: zodResolver(addAuditFormSchema),
    defaultValues: {
      auditYear: new Date().getFullYear() + 1,
      stageId: 1,
      statusId: 1,
      assignedUserId: "",
      auditPeriodEndDate: undefined,
      reportDueDate: undefined,
      lodgedWithOFTDate: undefined,
      invoiceIssueDate: undefined,
      invoicePaid: false,
      nextContactDate: undefined,
    },
  });

  useEffect(() => {
    if (manualOpen === undefined) return;
    if (manualOpen) openModal(); else closeModal();
  }, [manualOpen, openModal, closeModal]);

  useEffect(() => {
    if (isOpen && initialValues) {
      reset({
        ...initialValues,
      });
    }
  }, [isOpen, initialValues, reset]);

  const onSubmitForm = async (data: AddAuditFormData) => {
    try {
      // Create audit
      const created = await createMutation.mutateAsync({
        clientId,
        auditYear: data.auditYear,
        stageId: data.stageId,
        statusId: data.statusId,
      });
      // Prepare optional update payload
      type UpdateAuditInput = Parameters<typeof updateAuditMutation.mutateAsync>[0];
      const payload: UpdateAuditInput = { auditId: created.id };
      if (data.assignedUserId) payload.assignedUserId = data.assignedUserId;
      if (data.reportDueDate) {
        const [y, m, d] = data.reportDueDate.split('-').map(Number);
        payload.reportDueDate = new Date(Date.UTC(y, (m ?? 1) - 1, d));
      }
      if (data.lodgedWithOFTDate) {
        const [y, m, d] = data.lodgedWithOFTDate.split('-').map(Number);
        payload.lodgedWithOFTDate = new Date(Date.UTC(y, (m ?? 1) - 1, d));
      }
      if (data.invoiceIssueDate) {
        const [y, m, d] = data.invoiceIssueDate.split('-').map(Number);
        payload.invoiceIssueDate = new Date(Date.UTC(y, (m ?? 1) - 1, d));
      }
      if (data.invoicePaid !== undefined) payload.invoicePaid = data.invoicePaid;
      // Run update if any optional field provided
      if (Object.keys(payload).length > 1) {
        await updateAuditMutation.mutateAsync(payload);
      }
      // Update client record with new period end and next contact
      if (data.auditPeriodEndDate || data.nextContactDate) {
        await updateClientMutation.mutateAsync({
          clientId,
          clientName: clientData?.clientName || '',
          status: clientData?.status || 'active',
          auditPeriodEndDate: data.auditPeriodEndDate ? new Date(data.auditPeriodEndDate) : null,
          nextContactDate: data.nextContactDate ? new Date(data.nextContactDate) : null,
        });
      }
      // Log audit creation
      await addActivityLogMut.mutateAsync({
        clientId,
        type: ActivityLogType.audit_create,
        content: `${data.auditYear} Audit Created`,
      });
      closeModal();
      onAfterSubmit?.(created.id);
    } catch (err) {
      // TODO: handle error messaging
      console.error(err);
    }
  };

  if (!ability.can(AUDIT_PERMISSIONS.CREATE)) return null;

  return (
    <>
      {!hideTrigger && (
        <button
          type="button"
          onClick={openModal}
          className="p-1 text-gray-500 hover:text-gray-700"
          aria-label="Add Audit"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      )}
      <Modal
        isOpen={isOpen}
        onClose={() => { closeModal(); onModalClose?.(); }}
        overlayClassName="bg-black/90"
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <ComponentCard title="Add Audit Year">
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            {/* Hidden inputs to include values in submission */}
            <input type="hidden" {...register('stageId', { valueAsNumber: true })} />
            <input type="hidden" {...register('statusId', { valueAsNumber: true })} />
            <input type="hidden" {...register('reportDueDate')} />
            {/* Instructions for creating next audit year */}
            <div className="mb-4 text-sm text-gray-700">
              Please review the pre-filled fields below and confirm to create the next audit year.
            </div>
            <div>
              <label className="block text-sm font-medium">Audit Year</label>
              <input
                type="number"
                {...register('auditYear', { valueAsNumber: true })}
                disabled
                className="mt-1 block w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 cursor-not-allowed"
              />
              {errors.auditYear && <p className="text-sm text-red-600">{errors.auditYear.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Assign Staff</label>
              <Controller
                control={control}
                name="assignedUserId"
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value ?? ""}
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
              name="auditPeriodEndDate"
              render={({ field }) => (
                <DatePicker
                  id="addAuditPeriodEndDatePicker"
                  label="Audit Period End Date"
                  placeholder="Select date"
                  defaultDate={field.value ? new Date(field.value) : undefined}
                  closeOnSelect={false}
                  onChange={(dates) => {
                    const d = Array.isArray(dates) ? dates[0] : dates;
                    if (d) field.onChange(format(d as Date, 'yyyy-MM-dd'));
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="nextContactDate"
              render={({ field }) => (
                <DatePicker
                  id="addNextContactDatePicker"
                  label="Next Contact Date"
                  placeholder="Select date"
                  defaultDate={field.value ? new Date(field.value) : undefined}
                  closeOnSelect={false}
                  onChange={(dates) => {
                    const d = Array.isArray(dates) ? dates[0] : dates;
                    if (d) field.onChange(format(d as Date, 'yyyy-MM-dd'));
                  }}
                />
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => { closeModal(); onModalClose?.(); }}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>Create Audit Year</Button>
            </div>
          </form>
        </ComponentCard>
      </Modal>
    </>
  );
} 