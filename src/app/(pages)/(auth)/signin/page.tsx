import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "QLD Audit Specialists | Sign In",
  description: "QLD Audit Specialists | Sign In",
};

export default function SignIn() {
  return <SignInForm />;
}
