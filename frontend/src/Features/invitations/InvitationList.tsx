"use client";

import { format } from "date-fns";
import { Check, Clock, Loader2, Shield, X } from "lucide-react";
import type { OrganizationInvitation } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InvitationListProps {
  invitations: OrganizationInvitation[];
  isPending: boolean;
  error?: Error | { message: string } | string | null;
  emptyText: string;
  mode: "incoming" | "admin";
  busyId?: string | null;
  onAccept?: (invitation: OrganizationInvitation) => void;
  onDecline?: (invitation: OrganizationInvitation) => void;
  onCancel?: (invitation: OrganizationInvitation) => void;
}

export function InvitationList({
  invitations,
  isPending,
  error,
  emptyText,
  mode,
  busyId,
  onAccept,
  onDecline,
  onCancel,
}: InvitationListProps) {
  if (isPending) {
    return (
      <div className="flex min-h-32 items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error.toString()}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="rounded-md border border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => {
        const isBusy = busyId === invitation.id;
        return (
          <div
            key={invitation.id}
            className="flex flex-col gap-4 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Shield className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {mode === "incoming"
                      ? invitation.organization.name
                      : invitation.invitedUser.name}
                  </p>
                  <span className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {invitation.role}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {mode === "incoming"
                    ? `Invited by ${invitation.invitedBy?.name ?? "an admin"}`
                    : invitation.email}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                  <Clock className="size-3" />
                  {format(new Date(invitation.createdAt), "MMM d, yyyy HH:mm")}
                </div>
              </div>
            </div>

            <div
              className={cn(
                "flex shrink-0 gap-2",
                mode === "incoming" ? "sm:justify-end" : "sm:justify-end",
              )}
            >
              {mode === "incoming" ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    disabled={isBusy}
                    onClick={() => onDecline?.(invitation)}
                  >
                    {isBusy ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2"
                    disabled={isBusy}
                    onClick={() => onAccept?.(invitation)}
                  >
                    {isBusy ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    Accept
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  disabled={isBusy}
                  onClick={() => onCancel?.(invitation)}
                >
                  {isBusy ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <X className="size-3.5" />
                  )}
                  Cancel
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
