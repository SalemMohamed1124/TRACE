"use client";

import { AuthInfoPanel } from "@/Features/authentication/Shared/AuthInfoPanel";
import { ResetPasswordForm } from "@/Features/authentication/ResetPassword/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden animate-fade-in">
      <AuthInfoPanel />
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-12 overflow-y-auto">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
