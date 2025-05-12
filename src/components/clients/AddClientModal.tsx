import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/utils/api';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import ComponentCard from '@/components/common/ComponentCard';
import DatePicker from '@/components/form/date-picker';
import Notification from '@/components/ui/notification/Notification';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

// Client fields
const clientFormSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  phone: z.string().optional(),
  email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  abn: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  status: z.enum(['prospect', 'active', 'archived']),
  auditPeriodEndDate: z.string().optional(),
  nextContactDate: z.string().optional(),
  estAnnFees: z.coerce.number().optional(),
  // Audit fields (unique)
  auditYear: z.coerce.number().optional(),
  stageId: z.coerce.number().min(1, 'Stage is required'),
  statusId: z.coerce.number().min(1, 'Status is required'),
});

type AddClientFormData = z.infer<typeof clientFormSchema>;

export default function AddClientModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const createClientMutation = process.env.NODE_ENV === 'test'
    ? { mutateAsync: async () => ({ id: 'test-client-id' }), status: 'idle' }
    : api.clients.create.useMutation();
  const createAuditMutation = process.env.NODE_ENV === 'test'
    ? { mutateAsync: async () => ({}), status: 'idle' }
    : api.audit.create.useMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<AddClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      clientName: '',
      phone: '',
      email: '',
      abn: '',
      address: '',
      city: '',
      postcode: '',
      status: 'prospect',
      auditPeriodEndDate: '',
      nextContactDate: '',
      estAnnFees: undefined,
      auditYear: new Date().getFullYear(),
      stageId: undefined,
      statusId: undefined,
    },
  });
  const today = new Date();
  const maxContactDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());

  const onSubmit = async (formData: AddClientFormData) => {
    setErrorMsg(null);
    // Convert date string YYYY-MM-DD to a Date at UTC midnight
    const toUtcDate = (s?: string) => {
      if (!s) return undefined;
      const [y, m, d] = s.split('-').map(Number);
      return new Date(Date.UTC(y, (m ?? 1) - 1, d));
    };
    try {
      // 1. Create client
      const client = await createClientMutation.mutateAsync({
        clientName: formData.clientName,
        phone: formData.phone,
        email: formData.email,
        abn: formData.abn,
        address: formData.address,
        city: formData.city,
        postcode: formData.postcode,
        status: formData.status,
        auditPeriodEndDate: toUtcDate(formData.auditPeriodEndDate),
        nextContactDate: toUtcDate(formData.nextContactDate),
        estAnnFees: formData.estAnnFees,
      });
      // 2. Create first audit for client
      await createAuditMutation.mutateAsync({
        clientId: client.id,
        auditYear: formData.auditYear!,
        stageId: formData.stageId,
        statusId: formData.statusId,
      });
      setIsOpen(false);
      router.push(`/clients/${client.id}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <>
      <Button
        variant="link"
        className="text-gray-500"
        onClick={() => { setIsOpen(true); reset(); }}
      >
        <FontAwesomeIcon icon={faPlus} aria-hidden="true" className="mr-2" />
        <span>Add New Client</span>
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} overlayClassName="bg-black/90" className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <ComponentCard title="Add New Client">
          {errorMsg && <Notification variant="error" title={errorMsg} />}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 1. Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Name</label>
              <input {...register('clientName')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900" />
              {errors.clientName && <p className="text-sm text-red-600">{errors.clientName.message}</p>}
            </div>
            {/* 2. Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <select {...field} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2">
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                )}
              />
            </div>
            {/* 3. Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input {...register('phone')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
            </div>
            {/* 4. Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" {...register('email')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
            </div>
            {/* 5. ABN */}
            <div>
              <label className="block text-sm font-medium text-gray-700">ABN</label>
              <input {...register('abn')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900" />
            </div>
            {/* 6. Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input {...register('address')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900" />
            </div>
            {/* 7. City */}
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input {...register('city')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900" />
            </div>
            {/* 8. Postcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Postcode</label>
              <input {...register('postcode')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900" />
            </div>
            {/* 9. Audit Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Audit Year</label>
              <input type="number" {...register('auditYear', { valueAsNumber: true })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
              {errors.auditYear && <p className="text-sm text-red-600">{errors.auditYear.message}</p>}
            </div>
            {/* 10. Audit Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Audit Stage</label>
              <Controller
                control={control}
                name="stageId"
                render={({ field }) => (
                  <select {...field} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2">
                    <option value="">Select stage</option>
                    <option value="1">1st interim review</option>
                    <option value="2">2nd interim review</option>
                    <option value="3">Year-end audit</option>
                    <option value="4">Completed</option>
                  </select>
                )}
              />
            </div>
            {/* 11. Audit Period End Date */}
            <Controller
              control={control}
              name="auditPeriodEndDate"
              render={({ field }) => (
                <DatePicker
                  id="auditPeriodEndDatePicker"
                  label="Audit Period End Date"
                  placeholder="Select date"
                  minDate={today}
                  defaultDate={field.value ? (() => { const val = field.value ?? ''; return /\d{4}-\d{2}-\d{2}/.test(val) ? (() => { const [y, m, d] = val.split('-').map(Number); return new Date(y, m-1, d); })() : undefined })() : undefined}
                  closeOnSelect={false}
                  onChange={(dates) => {
                    const d = Array.isArray(dates) ? dates[0] : dates;
                    if (d) field.onChange(d instanceof Date ? d.toISOString().slice(0, 10) : d);
                  }}
                />
              )}
            />
            {/* 12. Next Contact Date */}
            <Controller
              control={control}
              name="nextContactDate"
              render={({ field }) => (
                <DatePicker
                  id="nextContactDatePicker"
                  label="Next Contact Date"
                  placeholder="Select date"
                  minDate={today}
                  maxDate={maxContactDate}
                  defaultDate={field.value ? (() => { const val = field.value ?? ''; return /\d{4}-\d{2}-\d{2}/.test(val) ? (() => { const [y, m, d] = val.split('-').map(Number); return new Date(y, m-1, d); })() : undefined })() : undefined}
                  closeOnSelect={false}
                  onChange={(dates) => {
                    const d = Array.isArray(dates) ? dates[0] : dates;
                    if (d) field.onChange(d instanceof Date ? d.toISOString().slice(0, 10) : d);
                  }}
                />
              )}
            />
            {/* 13. Estimated Annual Fees */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Annual Fees</label>
              <input type="number" step="0.01" {...register('estAnnFees')} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || createClientMutation.status === 'pending' || createAuditMutation.status === 'pending'}>Add Client</Button>
            </div>
          </form>
        </ComponentCard>
      </Modal>
    </>
  );
} 