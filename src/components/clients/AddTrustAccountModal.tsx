"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

interface AddTrustAccountModalProps {
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTrustAccountModal({ clientId: _clientId, isOpen, onClose: _onClose }: AddTrustAccountModalProps) {
  // Stub implementation: only render when open to use isOpen
  if (!isOpen) return null;
  return <div />;
} 