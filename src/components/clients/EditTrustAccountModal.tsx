"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

interface EditTrustAccountModalProps {
  clientId: string;
  existingTrustAccount: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditTrustAccountModal({ clientId: _clientId, existingTrustAccount: _existingTrustAccount, isOpen, onClose: _onClose }: EditTrustAccountModalProps) {
  if (!isOpen) return null;
  return <div />;
} 