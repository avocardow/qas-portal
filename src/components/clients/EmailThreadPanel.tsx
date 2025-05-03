"use client";
import React from "react";
import type { EmailMessage } from "@/server/services/emailService";

interface EmailThreadPanelProps {
  emailThreads?: { messages: EmailMessage[]; nextLink?: string };
  isLoading: boolean;
  isError: boolean;
}

export default function EmailThreadPanel({ emailThreads, isLoading, isError }: EmailThreadPanelProps) {
  if (isLoading) {
    return <p>Loading email threads...</p>;
  }
  if (isError) {
    return <p className="text-red-500">Error loading email threads</p>;
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