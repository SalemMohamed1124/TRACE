"use client";

import { AuthInfoPanel } from "@/Features/authentication/Shared/AuthInfoPanel";
import { ForgotPasswordForm } from "@/Features/authentication/ForgotPassword/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden animate-fade-in">
      <AuthInfoPanel />
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-12 overflow-y-auto">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
