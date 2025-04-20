import React from "react";
import ActivateClient from "./ActivateClient";

export const metadata = {
  title: "Next.js Account Activation | TailAdmin - Next.js Dashboard Template",
  description: "Complete your account activation.",
};

export default function ActivatePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";
  return <ActivateClient token={token} />;
}
