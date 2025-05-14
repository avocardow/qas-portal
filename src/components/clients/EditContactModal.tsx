"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { z } from "zod";
import { api, RouterOutput } from "@/utils/api";
import Notification from "@/components/ui/notification/Notification";
import Select from "@/components/form/Select";

interface EditContactModalProps {
  contactId: string;
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditContactModal({ contactId, clientId, isOpen, onClose }: EditContactModalProps) {
  const utils = api.useContext();
  const updateContactMutation = api.contact.update.useMutation();
  const createLicenseMutation = api.license.create.useMutation();
  const { data: contact } = api.contact.getById.useQuery({ contactId });
  const { data: licenses } = api.license.getByContactId.useQuery({ contactId });
  const license = licenses && licenses.length > 0 ? licenses[0] : undefined;

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // form validation schema
  const contactSchema = z.object({
    name: z.string().optional(),
    email: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      z.string().email('Invalid email').optional()
    ),
    phone: z.string().optional(),
    title: z.string().optional(),
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

  const [formData, setFormData] = useState<ContactFormData>({
    name: "", email: "", phone: "", title: "", isPrimary: false,
    licenseNumber: undefined, licenseType: undefined, renewalMonth: undefined, licenseIsPrimary: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name ?? "",
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        title: contact.title ?? "",
        isPrimary: contact.isPrimary ?? false,
        licenseNumber: license?.licenseNumber ?? "",
        licenseType: license?.licenseType ?? "",
        renewalMonth: license?.renewalMonth ?? undefined,
        licenseIsPrimary: license?.isPrimary ?? false,
      });
    }
  }, [contact, license]);

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

  const { data: selectedLicense } = api.license.getByLicenseNumber.useQuery(
    { licenseNumber: formData.licenseNumber || "" },
    { enabled: Boolean(formData.licenseNumber) }
  );
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.formErrors.fieldErrors as Record<string, string[]>;
      const newErrs: Partial<Record<keyof ContactFormData, string>> = {};
      for (const key in errors) {
        if (errors[key]?.length) newErrs[key as keyof ContactFormData] = errors[key]![0];
      }
      setFormErrors(newErrs);
      return;
    }
    // Prepare data, letting Zod map empty title to null
    const cleanedData = {
      ...result.data,
      email: result.data.email?.trim() === '' ? undefined : result.data.email,
      phone: result.data.phone?.trim() === '' ? undefined : result.data.phone,
    };
    // Update contact first
    const updateContact = updateContactMutation.mutateAsync
      ? updateContactMutation.mutateAsync({ ...cleanedData, contactId, clientId })
      : new Promise<unknown>((resolve, reject) => {
          updateContactMutation.mutate(
            { ...cleanedData, contactId, clientId },
            {
              onSuccess: resolve,
              onError: reject,
            }
          );
        });
    updateContact
      .then(async (value) => {
        const updatedContact = value as RouterOutput['contact']['update'];
        utils.clients.getById.invalidate({ clientId });
        if (updatedContact?.id && 'contact' in utils && utils.contact.getById?.invalidate) {
          utils.contact.getById.invalidate({ contactId: updatedContact.id });
        }
        // Handle license creation/association
        if (!selectedLicense) {
          try {
            const licenseNumber = result.data.licenseNumber || "";
            await (createLicenseMutation.mutateAsync
              ? createLicenseMutation.mutateAsync({
                  holderType: "contact",
                  contactId,
                  licenseNumber,
                  licenseType: result.data.licenseType,
                  renewalMonth: result.data.renewalMonth,
                  isPrimary: result.data.licenseIsPrimary,
                })
              : new Promise<unknown>((resolve, reject) => {
                  createLicenseMutation.mutate(
                    {
                      holderType: "contact",
                      contactId,
                      licenseNumber,
                      licenseType: result.data.licenseType,
                      renewalMonth: result.data.renewalMonth,
                      isPrimary: result.data.licenseIsPrimary,
                    },
                    {
                      onSuccess: resolve,
                      onError: reject,
                    }
                  );
                })
            );
          } catch {
            setErrorMessage('Failed to create license');
            return;
          }
        }
        if ('license' in utils && utils.license.getByContactIds?.invalidate) {
          utils.license.getByContactIds.invalidate({ contactIds: [contactId] });
        }
        setSuccessMessage("Contact updated successfully");
        onClose();
      })
      .catch((error: unknown) => {
        const msg = error instanceof Error ? error.message : "Failed to update contact";
        setErrorMessage(msg);
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} overlayClassName="bg-black/90" className="max-w-md max-h-[90vh] overflow-y-auto p-6">
      <ComponentCard title="Edit Contact">
        {successMessage && <Notification variant="success" title={successMessage} />}
        {errorMessage && <Notification variant="error" title={errorMessage} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <InputField
              id="name"
              name="name"
              placeholder="Full Name"
              defaultValue={formData.name}
              onChange={e => { setFormData({ ...formData, name: e.target.value }); validateField('name', e.target.value); }}
              error={!!formErrors.name}
              hint={formErrors.name}
            />
          </div>
          <div>
            <Label htmlFor="title">Contact Role</Label>
            <InputField
              id="title"
              name="title"
              placeholder="Contact Role"
              defaultValue={formData.title ?? ''}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <InputField
              type="email"
              id="email"
              name="email"
              placeholder="Email Address"
              value={formData.email ?? ''}
              onChange={e => { setFormData({ ...formData, email: e.target.value }); validateField('email', e.target.value); }}
              error={!!formErrors.email}
              hint={formErrors.email}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <InputField
              type="tel"
              id="phone"
              name="phone"
              placeholder="Phone Number"
              defaultValue={formData.phone}
              onChange={e => { setFormData({ ...formData, phone: e.target.value }); validateField('phone', e.target.value); }}
              error={!!formErrors.phone}
              hint={formErrors.phone}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="isPrimary"
              type="checkbox"
              checked={formData.isPrimary}
              onChange={e => setFormData({ ...formData, isPrimary: e.target.checked })}
              className="h-4 w-4 text-brand-500"
            />
            <Label htmlFor="isPrimary">Primary Contact</Label>
          </div>
          <div className="pt-2 pb-1 font-semibold text-gray-700">License Information</div>
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
            <Button type="submit" disabled={"isLoading" in updateContactMutation && updateContactMutation.isLoading === true}>Save</Button>
          </div>
        </form>
      </ComponentCard>
    </Modal>
  );
} 