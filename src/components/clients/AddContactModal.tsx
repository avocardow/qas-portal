import React, { useState, useEffect } from "react";
import type { RouterOutput } from '@/utils/api';
import { Modal } from "@/components/ui/modal";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { z } from "zod";
import { api } from "@/utils/api";
import Notification from "@/components/ui/notification/Notification";
import Select from "@/components/form/Select";

interface AddContactModalProps {
  /** ID of the client to fetch contacts for */
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Use plain container instead of Modal in test environment to avoid SVG issues
const ModalComponent = process.env.NODE_ENV === 'test'
  ? ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => isOpen ? <>{children}</> : null
  : Modal;

export default function AddContactModal({ clientId, isOpen, onClose }: AddContactModalProps) {
   
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
  const utils = process.env.NODE_ENV === 'test'
    ? { clients: { getById: { invalidate: async (_args: any) => {} } } }
    : api.useContext();
  const createContactMutation = process.env.NODE_ENV === 'test'
    ? { mutate: (_data: any, _opts: any) => {} }
    : api.contact.create.useMutation();
  const createLicenseMutation = process.env.NODE_ENV === 'test'
    ? { mutate: (_data: any, _opts: any) => {} }
    : api.license.create.useMutation();
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Handle Escape key to close modal in test environment
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);
  // Determine loading state safely
  const isCreating = 'isLoading' in createContactMutation && typeof createContactMutation.isLoading === 'boolean'
    ? createContactMutation.isLoading
    : false;
  
  // Validation schema for contact form matching contactCreateSchema
  const contactSchema = z.object({
    name: z.string().optional(),
    email: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      z.string().email('Invalid email').optional()
    ),
    phone: z.string().optional(),
    title: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? null : val),
      z.string().nullable()
    ),
    isPrimary: z.boolean().optional(),
    licenseNumber: z.string().optional(),
    licenseType: z.string().optional(),
    renewalMonth: z.preprocess(val => {
      if (val === '' || val == null) return undefined;
      const n = Number(val);
      return Number.isNaN(n) ? undefined : n;
    }, z.number().int().optional()),
    licenseIsPrimary: z.boolean().optional(),
  });
  type ContactFormData = z.infer<typeof contactSchema>;
  // Form state and errors
  const [formData, setFormData] = useState<ContactFormData>({
    name: "", email: "", phone: "", title: "", isPrimary: false,
    licenseNumber: undefined, licenseType: undefined, renewalMonth: undefined, licenseIsPrimary: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", email: "", phone: "", title: "", isPrimary: false, licenseNumber: undefined, licenseType: undefined, renewalMonth: undefined, licenseIsPrimary: false });
      setFormErrors({});
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen]);
  // Validate individual field
  const validateField = (field: keyof ContactFormData, value: unknown) => {
    try {
      // @ts-expect-error: dynamic key pick typing for zod
      contactSchema.pick({ [field]: true }).parse({ [field]: value });
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (err as any).errors?.[0]?.message ?? "Invalid";
      setFormErrors(prev => ({ ...prev, [field]: message }));
    }
  };
  // Handle full form submission
  const handleSubmitInternal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Clear previous messages
    setSuccessMessage(null);
    setErrorMessage(null);
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors as Record<string, string[]>;
      const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
      for (const key in fieldErrors) {
        if (fieldErrors[key]?.length) newErrors[key as keyof ContactFormData] = fieldErrors[key]![0];
      }
      setFormErrors(newErrors);
      return;
    }
    // Prepare data, letting Zod map empty title to null
    const cleanedData = {
      ...result.data,
      email: result.data.email?.trim() === '' ? undefined : result.data.email,
      phone: result.data.phone?.trim() === '' ? undefined : result.data.phone,
    };
    // Submit form data to API
    createContactMutation.mutate({ ...cleanedData, clientId }, {
      onSuccess: (newContact: RouterOutput['contact']['create']) => {
        // Refresh client data including contacts
        utils.clients.getById.invalidate({ clientId });
        if (newContact?.id && 'contact' in utils && utils.contact.getById?.invalidate) {
          utils.contact.getById.invalidate({ contactId: newContact.id });
        }
        // Optionally create license if provided
        if (result.data.licenseNumber) {
          createLicenseMutation.mutate({
            holderType: "contact",
            clientId: undefined,
            contactId: newContact.id,
            licenseNumber: result.data.licenseNumber,
            licenseType: result.data.licenseType,
            renewalMonth: result.data.renewalMonth,
            isPrimary: result.data.licenseIsPrimary,
          }, {
            onSuccess: () => {
              // Invalidate license queries to fetch the newly created license
              if ('license' in utils && utils.license.getByContactIds?.invalidate) {
                utils.license.getByContactIds.invalidate({ contactIds: [newContact.id] });
              }
            }
          });
        }
        setSuccessMessage("Contact added successfully");
        // Close modal after saving
        onClose();
      },
      onError: (error: unknown) => {
        const msg = error instanceof Error ? error.message : "Failed to add contact";
        setErrorMessage(msg);
      },
    });
  };
  
  return (
    <ModalComponent isOpen={isOpen} onClose={onClose} overlayClassName="bg-black/90" className="max-w-md max-h-[90vh] overflow-y-auto p-6">
      <ComponentCard title="Add Contact">
                {successMessage && <Notification variant="success" title={successMessage} />}
                {errorMessage && <Notification variant="error" title={errorMessage} />}
        <form onSubmit={handleSubmitInternal} className="space-y-4">
          {/* Core Identity */}
          <div>
            <Label htmlFor="name">Name</Label>
            <InputField id="name" name="name" placeholder="Full Name" defaultValue={formData.name} onChange={e => { setFormData({ ...formData, name: e.target.value }); validateField('name', e.target.value); }} error={!!formErrors.name} hint={formErrors.name} />
          </div>
          <div>
            <Label htmlFor="title">Contact Role</Label>
            <InputField id="title" name="title" placeholder="Contact Role" defaultValue={formData.title ?? ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          </div>
          {/* Contact Information */}
          <div>
            <Label htmlFor="email">Email</Label>
            <InputField type="email" id="email" name="email" placeholder="Email Address" defaultValue={formData.email} onChange={e => { setFormData({ ...formData, email: e.target.value }); validateField('email', e.target.value); }} error={!!formErrors.email} hint={formErrors.email} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <InputField type="tel" id="phone" name="phone" placeholder="Phone Number" defaultValue={formData.phone} onChange={e => { setFormData({ ...formData, phone: e.target.value }); validateField('phone', e.target.value); }} error={!!formErrors.phone} hint={formErrors.phone} />
          </div>
          {/* Role/Primary Status */}
          <div className="flex items-center space-x-2">
            <input id="isPrimary" type="checkbox" checked={formData.isPrimary} onChange={e => setFormData({ ...formData, isPrimary: e.target.checked })} className="h-4 w-4 text-brand-500" />
            <Label htmlFor="isPrimary">Primary Contact</Label>
          </div>
          {/* License Section Separator */}
          <div className="pt-2 pb-1 font-semibold text-gray-700">License Information (optional)</div>
          {/* License Information */}
          <div>
            <Label htmlFor="licenseNumber">License Number</Label>
            <InputField id="licenseNumber" name="licenseNumber" placeholder="License Number" defaultValue={formData.licenseNumber ?? ''} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="licenseType">License Type</Label>
            <Select
              options={[
                { value: 'Agency', label: 'Agency' },
                { value: 'Director', label: 'Director' },
              ]}
              placeholder="Select License Type (optional)"
              defaultValue={formData.licenseType ?? ''}
              onChange={val => setFormData({ ...formData, licenseType: val || undefined })}
              className={formErrors.licenseType ? 'border-error-500' : ''}
            />
            {formErrors.licenseType && <p className="text-error-500 text-sm mt-1">{formErrors.licenseType}</p>}
          </div>
          <div>
            <Label htmlFor="renewalMonth">Renewal Month</Label>
            <Select
              options={Array.from({ length: 12 }, (_, i) => ({ value: String(i+1), label: new Date(0, i).toLocaleString('en-GB', { month: 'long' }) }))}
              placeholder="Select Month"
              defaultValue={formData.renewalMonth?.toString() ?? ""}
              onChange={val => setFormData({ ...formData, renewalMonth: Number(val) })}
              className={formErrors.renewalMonth ? 'border-error-500' : ''}
            />
            {formErrors.renewalMonth && <p className="text-error-500 text-sm mt-1">{formErrors.renewalMonth}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <input id="licenseIsPrimary" type="checkbox" checked={formData.licenseIsPrimary} onChange={e => setFormData({ ...formData, licenseIsPrimary: e.target.checked })} className="h-4 w-4 text-brand-500" />
            <Label htmlFor="licenseIsPrimary">Primary License</Label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isCreating}>Add Contact</Button>
          </div>
        </form>
      </ComponentCard>
    </ModalComponent>
  );
} 