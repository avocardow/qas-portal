"use client";
import React from "react";
import type { EmailMessage } from "@/server/services/emailService";

interface EmailThreadPanelProps {
  emailThreads?: { messages: EmailMessage[]; nextLink?: string };
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export default function EmailThreadPanel({ emailThreads, isLoading, isError, onRetry }: EmailThreadPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (isError) {
    return (
      <div>
        <p className="text-red-500">Error loading email threads</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-blue-600 underline">
            Retry
          </button>
        )}
      </div>
    );
  }
  if (!emailThreads || emailThreads.messages.length === 0) {
    return <p>No recent email threads to display.</p>;
  }
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Recent Email Threads</h3>
      <ul className="space-y-2">
        {emailThreads.messages.map((email) => (
          <li key={email.id} className="border p-2 rounded">
            <p className="font-medium">{email.subject}</p>
            <p className="text-sm text-gray-600">From: {email.from.emailAddress.name}</p>
            <p className="text-xs text-gray-500">{new Date(email.receivedDateTime).toLocaleString()}</p>
            <div className="mt-1 text-sm text-gray-700">{email.bodyPreview}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}