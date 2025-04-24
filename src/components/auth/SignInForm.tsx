"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

interface ClientEmailFormInputs {
  clientEmail: string;
}

export default function SignInForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientEmailFormInputs>();

  const [emailSent, setEmailSent] = useState(false);
  const [sentEmailAddress, setSentEmailAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMicrosoftSignIn = () => {
    setLoading(true);
    signIn("azure-ad", { callbackUrl: "/dashboard" });
  };

  const onClientSubmit: SubmitHandler<ClientEmailFormInputs> = async (data) => {
    setLoading(true);
    setEmailSent(false);

    const result = await signIn("email", {
      email: data.clientEmail,
      redirect: false,
    });

    setLoading(false);
    if (result?.ok && !result.error) {
      setSentEmailAddress(data.clientEmail);
      setEmailSent(true);
    } else {
      console.error("Email sign-in error:", result?.error);
      alert(
        `Error sending login link: ${result?.error || "Please try again."}`
      );
    }
  };

  // --- Start of Return Statement ---
  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          {" "}
          {/* Parent Div 1 */}
          <div className="mb-5 sm:mb-8">
            <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Welcome to the QAS Portal. Please sign in below.
            </p>
          </div>
          <div>
            {" "}
            {/* Parent Div 2 */}
            {/* === Stacked Login Methods === */}
            <div className="space-y-6">
              {/* Client Login */}
              <div>
                <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Clients
                </h2>
                {emailSent ? (
                  <div className="border-success-300 bg-success-100 text-success-700 dark:border-success-700 dark:bg-success-900/30 dark:text-success-300 rounded border p-3 text-center text-sm">
                    Check your email! A sign-in link has been sent to{" "}
                    {sentEmailAddress}.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onClientSubmit)}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="clientEmail">
                          Enter your registered email address{" "}
                          <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                          name="clientEmail"
                          control={control}
                          rules={{
                            required: "Email address is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          }}
                          render={({ field }) => (
                            <Input
                              id="clientEmail"
                              type="email"
                              placeholder="your.email@agency.com"
                              disabled={loading}
                              {...field}
                              aria-invalid={
                                errors.clientEmail ? "true" : "false"
                              }
                            />
                          )}
                        />
                        {errors.clientEmail && (
                          <p
                            className="text-error-500 mt-1 text-xs"
                            role="alert"
                          >
                            {errors.clientEmail.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full items-center justify-center rounded-lg bg-gray-100 px-7 py-3 text-sm font-normal text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                        >
                          {loading ? "Sending..." : "Send Login Link"}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
              {/* Separator between login methods */}
              <div className="relative py-3 sm:py-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-slate-50 p-2 text-gray-400 sm:px-5 sm:py-2 dark:bg-slate-900">
                    Or
                  </span>
                </div>
              </div>
              {/* Team Member Login */}
              <div className="mb-4">
                <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  QAS Team Members
                </h2>
                <button
                  type="button"
                  onClick={handleMicrosoftSignIn}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-gray-100 px-7 py-3 text-sm font-normal text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                >
                  Sign in with Microsoft 365
                </button>
              </div>
            </div>
          </div>{" "}
          {/* Parent Div 2 End */}
        </div>{" "}
        {/* Parent Div 1 End */}
      </div>{" "}
      {/* Parent Div End */}
    </div> // Root Div End
  ); // Function Return End
} // Component End
