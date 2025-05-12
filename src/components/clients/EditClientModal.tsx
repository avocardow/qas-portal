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
    // Compute actual Date objects
    const auditDate = formData.auditPeriodEndDate
      ? new Date(formData.auditPeriodEndDate)
      : undefined;
    const nextDate = formData.nextContactDate ? new Date(formData.nextContactDate) : undefined;

    updateMutation.mutate({
      clientId,
      ...formData,
      auditPeriodEndDate: auditDate,
      nextContactDate: nextDate,
    });
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
            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Name</label>
              <input
                {...register('clientName')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              />
              {errors.clientName && <p className="text-sm text-red-600">{errors.clientName.message}</p>}
            </div>
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input {...register('phone')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" {...register('email')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
            </div>
            {/* ABN */}
            <div>
              <label className="block text-sm font-medium text-gray-700">ABN</label>
              <input
                {...register('abn')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            {/* Address, City, Postcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                {...register('address')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                {...register('city')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            {/* Postcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Postcode</label>
              <input
                {...register('postcode')}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            {/* Status */}
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
            {/* Assigned User */}
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
            {/* Audit Period End Date */}
            <Controller
              control={control}
              name="auditPeriodEndDate"
              render={({ field }) => (
                <DatePicker
                  id="auditPeriodEndDatePicker"
                  label="Audit Period End Date"
                  placeholder="Select date"
                  minDate={new Date()}
                  defaultDate={field.value ? new Date(field.value) : undefined}
                  onChange={(dates) => {
                    const d = Array.isArray(dates) ? dates[0] : dates;
                    if (d) {
                      field.onChange(d.toISOString().slice(0, 10));
                    }
                  }}
                />
              )}
            />
            {/* Next Contact Date */}
            <Controller
              control={control}
              name="nextContactDate"
              render={({ field }) => (
                <DatePicker
                  id="nextContactDatePicker"
                  label="Next Contact Date"
                  placeholder="Select date"
                  defaultDate={field.value ? new Date(field.value) : undefined}
                  minDate={today}
                  maxDate={maxContactDate}
                  onChange={(dates) => {
                    const d = Array.isArray(dates) ? dates[0] : dates;
                    if (d) {
                      field.onChange(d.toISOString().slice(0, 10));
                    }
                  }}
                />
              )}
            />
            {/* Estimated Annual Fees */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Annual Fees</label>
              <input
                type="number"
                step="0.01"
                {...register("estAnnFees", { valueAsNumber: true })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            {/* Internal Folder ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Internal Folder URL</label>
              <input {...register('internalFolder')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
            </div>
            {/* External Folder ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">External Folder URL</label>
              <input {...register('externalFolder')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
            </div>
            {/* Xero Contact ID */}
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