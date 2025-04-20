"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/utils/api";
import Notification from "@/components/ui/notification/Notification";
import Button from "@/components/ui/button/Button";
import Link from "next/link";

interface ActivateClientProps {
  token: string;
}

export default function ActivateClient({ token }: ActivateClientProps) {
  const mutation = api.user.activateClientAccount.useMutation();
  const resendMutation = api.user.resendActivationLink.useMutation();
  const [hasMutated, setHasMutated] = useState(false);

  useEffect(() => {
    if (token && !hasMutated) {
      mutation.mutate({ token });
      setHasMutated(true);
    }
  }, [token, hasMutated, mutation]);

  const renderContent = () => {
    if (!token) {
      return <Notification variant="error" title="Missing activation token." />;
    }
    if (mutation.status === "pending") {
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Validating your activation token...
        </p>
      );
    }
    if (mutation.status === "error") {
      return (
        <>
          <Notification
            variant="error"
            title={mutation.error?.message || "Activation failed."}
          />
          <div className="mt-4 space-y-2 space-x-2">
            <Link href="/signin">
              <Button>Back to Sign In</Button>
            </Link>
            <Button
              onClick={() => resendMutation.mutate({ token })}
              disabled={resendMutation.status === "pending"}
            >
              {resendMutation.status === "pending"
                ? "Resending..."
                : "Resend Activation Link"}
            </Button>
          </div>
          {resendMutation.status === "success" && (
            <Notification variant="success" title="New activation link sent." />
          )}
          {resendMutation.status === "error" && (
            <Notification
              variant="error"
              title={resendMutation.error?.message || "Failed to resend link."}
            />
          )}
        </>
      );
    }
    if (mutation.status === "success") {
      return (
        <>
          <Notification
            variant="success"
            title="Account activated successfully."
          />
          <div className="mt-4">
            <Link href="/signin">
              <Button>Go to Sign In</Button>
            </Link>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
              Account Activation
            </h1>
          </div>
          <div className="space-y-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
