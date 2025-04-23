import React from "react";
import { Modal } from "@/components/ui/modal";
import { useForm, SubmitHandler } from "react-hook-form";
import { api } from "@/utils/api";

interface ComposeMailProps {
  isOpen: boolean;
  onClose: () => void;
  mailboxType?: "personal" | "shared";
}

interface ComposeFormValues {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
}

export default function ComposeMail({
  isOpen,
  onClose,
  mailboxType = "personal",
}: ComposeMailProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ComposeFormValues>({
    defaultValues: { to: "", cc: "", bcc: "", subject: "", body: "" },
  });

  // Set up both personal and shared mailbox send mutations
  const personalMutation = api.email.sendMessage.useMutation({
    onSuccess: () => {
      reset();
      onClose();
    },
  });
  const sharedMutation = api.email.sendSharedMessage.useMutation({
    onSuccess: () => {
      reset();
      onClose();
    },
  });
  const sendMutation =
    mailboxType === "shared" ? sharedMutation : personalMutation;

  const onSubmit: SubmitHandler<ComposeFormValues> = async (data) => {
    try {
      const toArray = data.to
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const ccArray = data.cc
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const bccArray = data.bcc
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await sendMutation.mutateAsync({
        to: toArray,
        cc: ccArray,
        bcc: bccArray,
        subject: data.subject,
        htmlBody: data.body,
      });
    } catch (error) {
      console.error("Error sending email", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-xl"
      showCloseButton
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        <h2 className="text-lg font-semibold">Compose Email</h2>
        <div>
          <label className="block text-sm font-medium">To</label>
          <input
            type="text"
            {...register("to", { required: "Recipient is required" })}
            placeholder="recipient1@example.com, recipient2@example.com"
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-indigo-200"
          />
          {errors.to && (
            <p className="mt-1 text-sm text-red-500">{errors.to.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">CC</label>
          <input
            type="text"
            {...register("cc")}
            placeholder="cc@example.com"
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-indigo-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">BCC</label>
          <input
            type="text"
            {...register("bcc")}
            placeholder="bcc@example.com"
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-indigo-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Subject</label>
          <input
            type="text"
            {...register("subject", { required: "Subject is required" })}
            placeholder="Subject"
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-indigo-200"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-500">
              {errors.subject.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Body</label>
          <textarea
            {...register("body", { required: "Body is required" })}
            rows={6}
            placeholder="Write your message here..."
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-indigo-200"
          />
          {errors.body && (
            <p className="mt-1 text-sm text-red-500">{errors.body.message}</p>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
