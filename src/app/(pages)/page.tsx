"use client";

import AuthLayout from "@/app/(pages)/(auth)/layout";
import SignInForm from "@/components/auth/SignInForm";

export default function IndexPage() {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}
