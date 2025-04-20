import React from "react";
import ActivateClient from "./ActivateClient";

export const metadata = {
  title: "Next.js Account Activation | TailAdmin - Next.js Dashboard Template",
  description: "Complete your account activation.",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ActivatePage({ searchParams }: any) {
  const token = searchParams.token ?? "";
  return <ActivateClient token={token} />;
}
