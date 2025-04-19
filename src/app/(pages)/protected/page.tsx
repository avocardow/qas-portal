import { requireAuth } from "@/lib/auth";

export default async function ProtectedPage() {
  const user = await requireAuth();

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Protected Page</h1>
      <p>Welcome, {user.name}!</p>
      <p>Your role: {user.role || "Not assigned"}</p>
      <p>Your email: {user.email}</p>
    </div>
  );
}
