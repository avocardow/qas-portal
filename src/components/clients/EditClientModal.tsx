import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/utils/api';
import { useModal } from '@/hooks/useModal';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { PencilIcon } from '@/icons';
import ComponentCard from '@/components/common/ComponentCard';
import DatePicker from '@/components/form/date-picker';
import Notification from '@/components/ui/notification/Notification';
import { format } from 'date-fns';

// Validation schema for client edit form
const clientFormSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  phone: z.string().optional(),
  email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  abn: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  internalFolder: z.string().url('Invalid URL').or(z.literal('')).nullable().optional(),
  externalFolder: z.string().url('Invalid URL').or(z.literal('')).nullable().optional(),
  xeroContactId: z.string().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  status: z.enum(['prospect', 'active', 'archived']),
  auditPeriodEndDate: z.string().optional(),
  nextContactDate: z.string().optional(),
  estAnnFees: z.coerce.number().optional(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

interface EditClientModalProps {
  clientId: string;
}

export default function EditClientModal({ clientId }: EditClientModalProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const { data: managers = [] } = api.user.getAssignableManagers.useQuery();
  const utils = api.useContext();

  // Fetch client data
  const clientQuery = api.clients.getById.useQuery({ clientId });
  // Mutation for update
  const updateMutation = api.clients.update.useMutation({
    onSuccess: () => {
      // Refresh client detail and client list
      utils.clients.getById.invalidate({ clientId });
      utils.clients.getAll.invalidate();
      // If there are related queries (e.g., contacts), invalidate them here as well if needed
      closeModal();
    },
    onError: (error: unknown) => {
      Notification({ variant: 'error', title: error instanceof Error ? error.message : 'Failed to update client' });
    },
  });

  // Setup form
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
  });

  // Compute date limits for next contact
  const today = new Date();
  const maxContactDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());

  // Prefill form when modal opens and data is available
  useEffect(() => {
    if (isOpen && clientQuery.data) {
      const data = clientQuery.data;
      reset({
        clientName: data.clientName,
        phone: data.phone ?? '',
        email: data.email ?? '',
        abn: data.abn ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        postcode: data.postcode ?? '',
        internalFolder: data.internalFolder ?? null,
        externalFolder: data.externalFolder ?? null,
        xeroContactId: data.xeroContactId ?? '',
        assignedUserId: data.assignedUserId ?? null,
        status: data.status,
        auditPeriodEndDate: data.auditPeriodEndDate
          ? new Date(data.auditPeriodEndDate).toISOString().slice(0, 10)
          : '',
        nextContactDate: data.nextContactDate
          ? new Date(data.nextContactDate).toISOString().slice(0, 10)
          : '',
        estAnnFees: data.estAnnFees ?? undefined,
      });
    }
  }, [isOpen, clientQuery.data, reset]);

  const onSubmit = (formData: ClientFormData) => {
    // Convert date string YYYY-MM-DD to a Date at UTC midnight to avoid timezone shifts
    const toUtcDate = (s?: string) => {
      if (!s) return undefined;
      const [y, m, d] = s.split('-').map(Number);
      return new Date(Date.UTC(y, (m ?? 1) - 1, d));
    };
    const auditDate = toUtcDate(formData.auditPeriodEndDate);
    const nextDate = toUtcDate(formData.nextContactDate);

    // Map optional string fields to null if empty and prepare cleaned update payload
    const cleanedData = {
      clientId,
      clientName: formData.clientName,
      phone: formData.phone?.trim() === '' ? null : formData.phone,
      email: formData.email?.trim() === '' ? null : formData.email,
      abn: formData.abn?.trim() === '' ? null : formData.abn,
      address: formData.address?.trim() === '' ? null : formData.address,
      city: formData.city?.trim() === '' ? null : formData.city,
      postcode: formData.postcode?.trim() === '' ? null : formData.postcode,
      internalFolder: formData.internalFolder?.trim() === '' ? null : formData.internalFolder,
      externalFolder: formData.externalFolder?.trim() === '' ? null : formData.externalFolder,
      xeroContactId: formData.xeroContactId?.trim() === '' ? null : formData.xeroContactId,
      assignedUserId: formData.assignedUserId,
      status: formData.status,
      auditPeriodEndDate: auditDate,
      nextContactDate: nextDate,
      estAnnFees: formData.estAnnFees ?? null,
    };
    updateMutation.mutate(cleanedData);
  };

  // If user cannot view or edit, don't render
  if (!clientQuery.data) return null;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="p-1 text-gray-500 hover:text-gray-700"
        aria-label="Edit Client"
      >
        <PencilIcon className="h-5 w-5" />
      </button>
      <Modal isOpen={isOpen} onClose={closeModal} overlayClassName="bg-black/90" className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <ComponentCard title="Edit Client">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 1. Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Name</label>
              <input
                {...register('clientName')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              />
              {errors.clientName && <p className="text-sm text-red-600">{errors.clientName.message}</p>}
            </div>
            {/* 2. Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <select
                    {...field}
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                )}
              />
            </div>
            {/* 3. Assigned User */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned User</label>
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
                      <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
                    ))}
                  </select>
                )}
              />
            </div>
            {/* 4. Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input {...register('phone')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
            </div>
            {/* 5. Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" {...register('email')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
            </div>
            {/* 6. ABN */}
            <div>
              <label className="block text-sm font-medium text-gray-700">ABN</label>
              <input
                {...register('abn')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            {/* 7. Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                {...register('address')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            {/* 8. City */}
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                {...register('city')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            {/* 9. Postcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Postcode</label>
              <input
                {...register('postcode')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            {/* 10. Audit Period End Date */}
            <Controller
              control={control}
              name="auditPeriodEndDate"
              render={({ field }) => (
                <DatePicker
                  id="auditPeriodEndDatePicker"
                  label="Audit Period End Date"
                  placeholder="Select date"
                  defaultDate={(() => { const val = field.value ?? ''; return /\d{4}-\d{2}-\d{2}/.test(val) ? (() => { const [y, m, d] = val.split('-').map(Number); return new Date(y, m-1, d); })() : undefined })()}
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
            {/* 11. Next Contact Date */}
            <Controller
              control={control}
              name="nextContactDate"
              render={({ field }) => (
                <DatePicker
                  id="nextContactDatePicker"
                  label="Next Contact Date"
                  placeholder="Select date"
                  defaultDate={(() => { const val = field.value ?? ''; return /\d{4}-\d{2}-\d{2}/.test(val) ? (() => { const [y, m, d] = val.split('-').map(Number); return new Date(y, m-1, d); })() : undefined })()}
                  minDate={today}
                  maxDate={maxContactDate}
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
            {/* 12. Estimated Annual Fees */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Annual Fees</label>
              <input
                type="number"
                step="0.01"
                {...register("estAnnFees", { valueAsNumber: true })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            {/* 13. Internal Folder URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Internal Folder URL</label>
              <input {...register('internalFolder')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
            </div>
            {/* 14. External Folder URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700">External Folder URL</label>
              <input {...register('externalFolder')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
            </div>
            {/* 15. Xero Contact ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Xero Contact ID</label>
              <input {...register('xeroContactId')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={isSubmitting || updateMutation.status === 'pending'}>
                {isSubmitting || updateMutation.status === 'pending' ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </Modal>
    </>
  );
} 