"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { TraceLogo } from "@/components/layout/TraceLogo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/Services/auth";
import { toast } from "sonner";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormInner() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setGlobalError("Reset token is missing from the URL.");
      return;
    }
    
    setIsLoading(true);
    setGlobalError(null);
    try {
      await resetPassword(token, data.password);
      setIsSuccess(true);
      toast.success("Password has been reset successfully.");
    } catch (error: any) {
      setGlobalError(
        error?.response?.data?.message || "Invalid or expired token."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-[420px] mx-auto animate-fade-in-up px-4 sm:px-0 text-center">
        <Link href="/" className="flex lg:hidden items-center justify-center gap-3 mb-8 group cursor-pointer w-fit mx-auto transition-transform active:scale-95 focus:outline-none">
          <TraceLogo iconClassName="size-8" nameClassName="text-2xl font-black tracking-tight" />
        </Link>
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tighter mb-4">Password Reset</h1>
        <p className="text-[14px] text-muted-foreground font-medium mb-8">
          Your password has been successfully updated.
        </p>
        <Link href="/login">
          <Button variant="primary" className="h-11 w-full font-bold text-[14px]">
            Return to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto animate-fade-in-up px-4 sm:px-0">
      <Link href="/" className="flex lg:hidden items-center gap-3 mb-8 group cursor-pointer w-fit mx-auto transition-transform active:scale-95 focus:outline-none">
        <TraceLogo iconClassName="size-8" nameClassName="text-2xl font-black tracking-tight" />
      </Link>

      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tighter">Reset Password</h1>
          <p className="mt-2 text-[13px] sm:text-[14px] text-muted-foreground font-medium">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {globalError && (
            <div className="flex items-center gap-2 border border-destructive/20 px-4 py-3 text-[13px] text-destructive bg-destructive/5">
              <div className="h-1.5 w-1.5 bg-destructive shrink-0" />
              {globalError}
            </div>
          )}

          <Field>
            <FieldLabel className="text-[13px] font-semibold text-foreground/80 mb-2">New Password</FieldLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input 
                autoFocus
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" 
                {...register("password")} 
                className="h-11 bg-transparent pl-10 pr-10 border-border/60 focus:border-primary/50 focus-visible:ring-primary/10 transition-all" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError errors={[errors.password]} />
          </Field>

          <Field>
            <FieldLabel className="text-[13px] font-semibold text-foreground/80 mb-2">Confirm Password</FieldLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input 
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••" 
                {...register("confirmPassword")} 
                className="h-11 bg-transparent pl-10 pr-10 border-border/60 focus:border-primary/50 focus-visible:ring-primary/10 transition-all" 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError errors={[errors.confirmPassword]} />
          </Field>

          <Button
            type="submit"
            disabled={isLoading || !token}
            variant="primary"
            className="h-11 w-full font-bold text-[14px]"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Resetting...
              </>
            ) : (
              <span className="flex items-center gap-2">
                Update Password
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="flex justify-center"><Spinner className="h-8 w-8 text-primary" /></div>}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
