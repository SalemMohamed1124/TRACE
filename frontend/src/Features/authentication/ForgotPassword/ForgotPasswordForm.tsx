"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { TraceLogo } from "@/components/layout/TraceLogo";
import Link from "next/link";
import { requestPasswordReset } from "@/Services/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      await requestPasswordReset(data.email);
      setIsSuccess(true);
    } catch (error: any) {
      setGlobalError(
        error?.response?.data?.message || "An unexpected error occurred."
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
        <h1 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tighter mb-4">Check your email</h1>
        <p className="text-[14px] text-muted-foreground font-medium mb-8">
          We have sent a password reset link to your email address. Please click the link to reset your password.
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
          <h1 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tighter">Forgot Password</h1>
          <p className="mt-2 text-[13px] sm:text-[14px] text-muted-foreground font-medium">
            Enter your email address and we&apos;ll send you a link to reset your password.
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
            <FieldLabel className="text-[13px] font-semibold text-foreground/80 mb-2">Email Address</FieldLabel>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input 
                autoFocus
                placeholder="you@company.com" 
                {...register("email")} 
                className="h-11 bg-transparent pl-10 border-border/60 focus:border-primary/50 focus-visible:ring-primary/10 transition-all" 
              />
            </div>
            <FieldError errors={[errors.email]} />
          </Field>

          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            className="h-11 w-full font-bold text-[14px]"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Sending Link...
              </>
            ) : (
              <span className="flex items-center gap-2">
                Send Reset Link
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-[12px] sm:text-[13px] text-muted-foreground mt-6">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
