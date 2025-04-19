"use client";

import AuthLayout from "@/app/(full-width-pages)/(auth)/layout";
import SignInForm from "@/components/auth/SignInForm";

export default function HomePage() {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}
