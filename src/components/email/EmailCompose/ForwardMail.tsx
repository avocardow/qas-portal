import React from "react";
import { Modal } from "@/components/ui/modal";
import { useForm, SubmitHandler } from "react-hook-form";
import { api } from "@/utils/api";

interface ForwardMailProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
  mailboxType?: "personal" | "shared";
}

interface ForwardFormValues {
  to: string;
  comment: string;
}

export default function ForwardMail({
  isOpen,
  onClose,
  messageId,
  mailboxType = "personal",
}: ForwardMailProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ForwardFormValues>({ defaultValues: { to: "", comment: "" } });

  // Set up personal and shared forward mutations
  const personalForward = api.email.createForward.useMutation({
    onSuccess: () => {
      reset();
      onClose();
    },
  });
  const sharedForward = api.email.createSharedForward.useMutation({
    onSuccess: () => {
      reset();
      onClose();
    },
  });
  const forwardMutation =
    mailboxType === "shared" ? sharedForward : personalForward;

  const onSubmit: SubmitHandler<ForwardFormValues> = async (data) => {
    try {
      const toArray = data.to
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await forwardMutation.mutateAsync({
        messageId,
        to: toArray,
        comment: data.comment,
      });
    } catch (error) {
      console.error("Error forwarding email", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg"
      showCloseButton
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        <h2 className="text-lg font-semibold">Forward Email</h2>
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
          <label className="block text-sm font-medium">Comment</label>
          <textarea
            {...register("comment")}
            rows={4}
            placeholder="Add a comment..."
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-indigo-200"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Forwarding..." : "Forward"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
