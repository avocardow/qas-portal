"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Notification from "@/components/ui/notification/Notification";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import { api } from "@/utils/api";

export default function CompleteSetupPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const mutation = api.user.activateClientAccount.useMutation();
  const resendMutation = api.user.resendActivationLink.useMutation();
  const [hasMutated, setHasMutated] = useState(false);

  useEffect(() => {
    if (token && !hasMutated) {
      mutation.mutate({ token });
      setHasMutated(true);
    }
  }, [token, hasMutated]);

  const renderContent = () => {
    if (!token) {
      return <Notification variant="error" title="Missing activation token." />;
    }
    if (mutation.isLoading) {
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Validating your activation token...
        </p>
      );
    }
    if (mutation.isError) {
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
              disabled={resendMutation.isLoading}
            >
              {resendMutation.isLoading
                ? "Resending..."
                : "Resend Activation Link"}
            </Button>
          </div>
          {resendMutation.isSuccess && (
            <Notification variant="success" title="New activation link sent." />
          )}
          {resendMutation.isError && (
            <Notification
              variant="error"
              title={resendMutation.error?.message || "Failed to resend link."}
            />
          )}
        </>
      );
    }
    if (mutation.isSuccess) {
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
        <div className="mb-5 sm:mb-8">
          <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
            Account Activation
          </h1>
        </div>
        <div className="space-y-6">{renderContent()}</div>
      </div>
    </div>
  );
}
