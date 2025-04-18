"use client";

import { signIn } from "next-auth/react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <h1 className="mb-4 text-4xl font-bold">Welcome to QAS Portal</h1>
      <button
        onClick={() => signIn()}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Sign In
      </button>
    </main>
  );
}
