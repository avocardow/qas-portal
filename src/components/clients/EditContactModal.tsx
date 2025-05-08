"use client";
import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import InputField from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { z } from "zod";
import { api } from "@/utils/api";
import Notification from "@/components/ui/notification/Notification";

interface EditContactModalProps {
  clientId: string;
  // existing contact to edit
  existingContact: {
    id: string;
    name?: string | null;
    title?: string | null;
    phone?: string | null;
    email?: string | null;
    licenseNumber?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

// validation schema matching AddContactModal
const contactSchema = z.object({
  id: z.string(),
  name: z.string().nonempty("Name is required"),
  title: z.string().nonempty("Type is required"),
  phone: z.string().nonempty("Phone is required").regex(/^[0-9-+() ]+$/, "Invalid phone number"),
  email: z.string().nonempty("Email is required").email("Invalid email address"),
  licenseNumber: z.string().regex(/^[A-Za-z0-9-]*$/, "Invalid license number").optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function EditContactModal({ clientId, existingContact, isOpen, onClose }: EditContactModalProps) {
  const utils = api.useContext();
  const updateMutation = api.contact.update.useMutation();
  const [formData, setFormData] = useState<ContactFormData>({
    id: existingContact.id,
    name: existingContact.name ?? "",
    title: existingContact.title ?? "",
    phone: existingContact.phone ?? "",
    email: existingContact.email ?? "",
    licenseNumber: existingContact.licenseNumber ?? "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateField = (field: keyof ContactFormData, value: unknown) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const partialSchema = contactSchema.pick({ [field]: true } as any);
      partialSchema.parse({ [field]: value });
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (err: unknown) {
      const msg = err instanceof z.ZodError
        ? err.errors[0]?.message
        : err instanceof Error
          ? err.message
          : "Invalid";
      setFormErrors(prev => ({ ...prev, [field]: msg }));
    }
  };

  const handleSubmitInternal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    updateMutation.mutate(
      { contactId: formData.id, clientId, name: formData.name, title: formData.title, phone: formData.phone, email: formData.email },
      {
        onSuccess: () => {
          utils.clients.getById.invalidate({ clientId });
          setSuccessMessage("Contact updated successfully");
        },
        onError: (error: unknown) => {
          const msg = error instanceof Error ? error.message : "Failed to update contact";
          setErrorMessage(msg);
        },
      }
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        {/* backdrop */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Edit Contact
                </Dialog.Title>
                {successMessage && <Notification variant="success" title={successMessage} />}
                {errorMessage && <Notification variant="error" title={errorMessage} />}
                <div className="mt-2">
                  <Form onSubmit={handleSubmitInternal} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <InputField id="name" defaultValue={formData.name} onChange={e => { setFormData({ ...formData, name: e.target.value }); validateField('name', e.target.value); }} error={!!formErrors.name} hint={formErrors.name} />
                    </div>
                    <div>
                      <Label htmlFor="title">Type</Label>
                      <Select options={[{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }]} defaultValue={formData.title} onChange={val => { setFormData({ ...formData, title: val }); validateField('title', val); }} className={formErrors.title ? 'border-error-500' : ''} />
                      {formErrors.title && <p className="text-error-500 text-sm mt-1">{formErrors.title}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <InputField id="phone" type="tel" defaultValue={formData.phone} onChange={e => { setFormData({ ...formData, phone: e.target.value }); validateField('phone', e.target.value); }} error={!!formErrors.phone} hint={formErrors.phone} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <InputField id="email" type="email" defaultValue={formData.email} onChange={e => { setFormData({ ...formData, email: e.target.value }); validateField('email', e.target.value); }} error={!!formErrors.email} hint={formErrors.email} />
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <InputField id="licenseNumber" type="text" defaultValue={formData.licenseNumber} onChange={e => { setFormData({ ...formData, licenseNumber: e.target.value }); validateField('licenseNumber', e.target.value); }} error={!!formErrors.licenseNumber} hint={formErrors.licenseNumber} />
                    </div>
                    <div>
                      <Button type="submit">Update Contact</Button>
                    </div>
                  </Form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 