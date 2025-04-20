"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Notification from "@/components/ui/notification/Notification";
import { api } from "@/utils/api";

interface InviteToPortalButtonProps {
  contactId: string;
  confirmationMessage?: string;
}

const InviteToPortalButton: React.FC<InviteToPortalButtonProps> = ({
  contactId,
  confirmationMessage,
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = api.user.inviteClientContact.useMutation({
    onSuccess: () => {
      setSuccessMessage("Invitation sent successfully.");
      setErrorMessage(null);
    },
    onError: (err) => {
      setErrorMessage(err.message ?? "Error sending invitation.");
    },
  });

  const handleClick = () => {
    if (confirmationMessage && !window.confirm(confirmationMessage)) {
      return;
    }
    setSuccessMessage(null);
    setErrorMessage(null);
    mutation.mutate({ contactId });
  };

  return (
    <div className="space-y-2">
      {successMessage && (
        <Notification variant="success" title={successMessage} />
      )}
      {errorMessage && <Notification variant="error" title={errorMessage} />}
      <Button onClick={handleClick} disabled={mutation.isLoading}>
        {mutation.isLoading ? "Sending..." : "Invite to Portal"}
      </Button>
    </div>
  );
};

export default InviteToPortalButton;
