"use client";

import { useRequireAuth } from "@/hooks/use-auth";

export default function ProtectedClient() {
  const { session, status } = useRequireAuth();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Client Protected Content</h2>
      <p>Hello, {session?.user.name}</p>
    </div>
  );
}
