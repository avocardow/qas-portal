import React from "react";
import { Modal } from "@/components/ui/modal";
import { useForm, SubmitHandler } from "react-hook-form";
import { api } from "@/utils/api";

interface ReplyMailProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
}

interface ReplyFormValues {
  comment: string;
}

export default function ReplyMail({
  isOpen,
  onClose,
  messageId,
}: ReplyMailProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ReplyFormValues>({ defaultValues: { comment: "" } });

  const replyMutation = api.email.createReply.useMutation({
    onSuccess: () => {
      reset();
      onClose();
    },
  });

  const onSubmit: SubmitHandler<ReplyFormValues> = async (data) => {
    try {
      await replyMutation.mutateAsync({ messageId, comment: data.comment });
    } catch (error) {
      console.error("Error replying to email", error);
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
        <h2 className="text-lg font-semibold">Reply to Email</h2>
        <div>
          <label className="block text-sm font-medium">Comment</label>
          <textarea
            {...register("comment", { required: "Comment is required" })}
            rows={4}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-indigo-200"
            placeholder="Add a comment or message..."
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-500">
              {errors.comment.message}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send Reply"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
