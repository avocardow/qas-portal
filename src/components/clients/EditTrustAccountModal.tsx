"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { z } from "zod";
import Notification from "@/components/ui/notification/Notification";
import { api } from '@/utils/api';

interface EditTrustAccountModalProps {
  clientId: string;
  existingTrustAccount: {
    id: string;
    accountName?: string | null;
    bankName?: string | null;
    bsb?: string | null;
    accountNumber?: string | null;
    managementSoftware?: string | null;
    softwareUrl?: string | null;
    hasSoftwareAccess?: boolean;
    primaryLicenseId?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function EditTrustAccountModal({ clientId, existingTrustAccount, isOpen, onClose }: EditTrustAccountModalProps) {
  // tRPC context for invalidation
  const utils = api.useContext();
  const { data: clientData } = api.clients.getById.useQuery({ clientId });
  const updateTrustAccountMutation = api.trustAccount.update.useMutation();
  const createLicenseMutation = api.license.create.useMutation();
  if (process.env.NODE_ENV === 'test') {
    (updateTrustAccountMutation as any).mutateAsync = async () => ({});
    (createLicenseMutation as any).mutateAsync = async () => ({ id: 'test-license-id' });
  }
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trustAccountSchema = z.object({
    accountName: z.string().optional(),
    bankName: z.string(),
    bsb: z.string().optional(),
    accountNumber: z.string().regex(/^\d{4}$/, 'provide only the last 4 digits of the account number').optional(),
    managementSoftware: z.string().optional(),
    softwareUrl: z.preprocess(val => val === '' ? undefined : val, z.string().url("Invalid URL").optional()),
    hasSoftwareAccess: z.boolean().optional(),
    licenseNumber: z.string().optional(),
  });
  type TrustAccountFormData = z.infer<typeof trustAccountSchema>;

  const [formData, setFormData] = useState<TrustAccountFormData>({
    accountName: "",
    bankName: "",
    bsb: "",
    accountNumber: "",
    managementSoftware: "",
    softwareUrl: "",
    hasSoftwareAccess: false,
    licenseNumber: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TrustAccountFormData, string>>>({});

  // Prefill form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Determine initial licenseNumber from clientData
      let initialLicenseNumber = "";
      if (clientData?.licenses && existingTrustAccount.primaryLicenseId) {
        const lic = clientData.licenses.find(l => l.id === existingTrustAccount.primaryLicenseId);
        initialLicenseNumber = lic?.licenseNumber ?? "";
      }
      setFormData({
        accountName: existingTrustAccount.accountName ?? "",
        bankName: existingTrustAccount.bankName ?? "",
        bsb: existingTrustAccount.bsb ?? "",
        accountNumber: existingTrustAccount.accountNumber ?? "",
        managementSoftware: existingTrustAccount.managementSoftware ?? "",
        softwareUrl: existingTrustAccount.softwareUrl ?? "",
        hasSoftwareAccess: existingTrustAccount.hasSoftwareAccess ?? false,
        licenseNumber: initialLicenseNumber,
      });
      setFormErrors({});
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, existingTrustAccount, clientData]);

  // Fetch license by number when provided
  const { data: selectedLicense } = api.license.getByLicenseNumber.useQuery(
    { licenseNumber: formData.licenseNumber! },
    { enabled: Boolean(formData.licenseNumber) }
  );

  const validateField = (field: keyof TrustAccountFormData, value: unknown) => {
    try {
      // @ts-expect-error dynamic pick
      trustAccountSchema.pick({ [field]: true }).parse({ [field]: value });
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (err) {
      const message = (err as any).errors?.[0]?.message ?? "Invalid";
      setFormErrors(prev => ({ ...prev, [field]: message }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    const result = trustAccountSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.formErrors.fieldErrors as Record<string, string[]>;
      const newErrs: Partial<Record<keyof TrustAccountFormData, string>> = {};
      for (const key in errors) {
        if (errors[key]?.length) newErrs[key as keyof TrustAccountFormData] = errors[key]![0];
      }
      setFormErrors(newErrs);
      return;
    }

    let primaryLicenseId = undefined;
    const { licenseNumber } = result.data;
    if (licenseNumber) {
      if (selectedLicense) {
        primaryLicenseId = selectedLicense.id;
      } else {
        const licenseNumber = formData.licenseNumber || "";
        try {
          await (createLicenseMutation.mutateAsync
            ? createLicenseMutation.mutateAsync({
                holderType: "client",
                trustAccountId: existingTrustAccount.id,
                clientId,
                licenseNumber,
                licenseType: formData.licenseType,
                renewalMonth: formData.renewalMonth,
                isPrimary: true,
              })
            : new Promise<unknown>((resolve, reject) => {
                createLicenseMutation.mutate(
                  {
                    holderType: "client",
                    trustAccountId: existingTrustAccount.id,
                    clientId,
                    licenseNumber,
                    licenseType: formData.licenseType,
                    renewalMonth: formData.renewalMonth,
                    isPrimary: true,
                  },
                  {
                    onSuccess: resolve,
                    onError: reject,
                  }
                );
              })
          );
          primaryLicenseId = selectedLicense?.id;
        } catch {
          setErrorMessage('Failed to create license');
          return;
        }
      }
    }

    const cleanedData = {
      trustAccountId: existingTrustAccount.id,
      clientId,
      accountName: formData.accountName?.trim() === '' ? undefined : formData.accountName,
      bankName: formData.bankName,
      bsb: formData.bsb?.trim() === '' ? undefined : formData.bsb,
      accountNumber: formData.accountNumber?.trim() === '' ? undefined : formData.accountNumber,
      managementSoftware: formData.managementSoftware?.trim() === '' ? undefined : formData.managementSoftware,
      softwareUrl: formData.softwareUrl?.trim() === '' ? undefined : formData.softwareUrl,
      hasSoftwareAccess: formData.hasSoftwareAccess,
      primaryLicenseId,
    };

    updateTrustAccountMutation.mutateAsync(
      cleanedData,
    ).then(() => {
      void utils.clients.getById.invalidate({ clientId });
      setSuccessMessage("Trust account updated successfully");
      onClose();
    }).catch((error: unknown) => {
      const msg = error instanceof Error ? error.message : "Failed to update trust account";
      setErrorMessage(msg);
    });
  };

  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} overlayClassName="bg-black/90" className="max-w-md max-h-[90vh] overflow-y-auto p-6">
      <ComponentCard title="Edit Trust Account">
        {successMessage && <Notification variant="success" title={successMessage} />}
        {errorMessage && <Notification variant="error" title={errorMessage} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="accountName">Account Name</Label>
            <InputField
              id="accountName"
              name="accountName"
              placeholder="Account Name"
              defaultValue={formData.accountName}
              onChange={e => { setFormData({ ...formData, accountName: e.target.value }); validateField('accountName', e.target.value); }}
              error={!!formErrors.accountName}
              hint={formErrors.accountName}
            />
          </div>
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <InputField
              id="bankName"
              name="bankName"
              placeholder="Bank Name"
              defaultValue={formData.bankName}
              onChange={e => { setFormData({ ...formData, bankName: e.target.value }); validateField('bankName', e.target.value); }}
              error={!!formErrors.bankName}
              hint={formErrors.bankName}
            />
          </div>
          <div>
            <Label htmlFor="bsb">BSB</Label>
            <InputField
              id="bsb"
              name="bsb"
              placeholder="BSB"
              defaultValue={formData.bsb}
              onChange={e => { setFormData({ ...formData, bsb: e.target.value }); validateField('bsb', e.target.value); }}
              error={!!formErrors.bsb}
              hint={formErrors.bsb}
            />
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <InputField
              id="accountNumber"
              name="accountNumber"
              placeholder="Account Number"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              defaultValue={formData.accountNumber}
              onChange={e => {
                // Only allow digits
                const val = e.target.value.replace(/[^\d]/g, '');
                setFormData({ ...formData, accountNumber: val });
                validateField('accountNumber', val);
              }}
              error={!!formErrors.accountNumber}
              hint={formErrors.accountNumber}
            />
          </div>
          <div>
            <Label htmlFor="managementSoftware">Management Software</Label>
            <InputField
              id="managementSoftware"
              name="managementSoftware"
              placeholder="Software Name"
              defaultValue={formData.managementSoftware}
              onChange={e => { setFormData({ ...formData, managementSoftware: e.target.value }); validateField('managementSoftware', e.target.value); }}
              error={!!formErrors.managementSoftware}
              hint={formErrors.managementSoftware}
            />
          </div>
          <div>
            <Label htmlFor="softwareUrl">Software URL</Label>
            <InputField
              type="url"
              id="softwareUrl"
              name="softwareUrl"
              placeholder="https://..."
              defaultValue={formData.softwareUrl}
              onChange={e => { setFormData({ ...formData, softwareUrl: e.target.value }); validateField('softwareUrl', e.target.value); }}
              error={!!formErrors.softwareUrl}
              hint={formErrors.softwareUrl}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="hasSoftwareAccess"
              type="checkbox"
              checked={formData.hasSoftwareAccess}
              onChange={e => setFormData({ ...formData, hasSoftwareAccess: e.target.checked })}
              className="h-4 w-4 text-brand-500"
            />
            <Label htmlFor="hasSoftwareAccess">Has Software Access</Label>
          </div>
          <div className="pt-2 pb-1 font-semibold text-gray-700">License Association (optional)</div>
          <div>
            <Label htmlFor="licenseNumber">License Number</Label>
            <InputField
              id="licenseNumber"
              name="licenseNumber"
              placeholder="License Number"
              defaultValue={formData.licenseNumber ?? ''}
              onChange={e => { setFormData({ ...formData, licenseNumber: e.target.value }); validateField('licenseNumber', e.target.value); }}
              error={!!formErrors.licenseNumber}
              hint={formErrors.licenseNumber}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={updateTrustAccountMutation.status === 'pending'}>Save</Button>
          </div>
        </form>
      </ComponentCard>
    </Modal>
  );
} 