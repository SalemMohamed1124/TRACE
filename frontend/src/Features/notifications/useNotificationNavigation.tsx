"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useOrg } from "@/hooks/useOrg";
import type { Notification } from "@/types";
import { useMarkAsRead } from "./useNotificationMutations";

export function getNotificationHref(notification: Notification): string | null {
  if (notification.metadata?.invitationId) return "/invitations";

  const scanId = notification.metadata?.scanId;
  if (scanId) return `/scans/${scanId}`;

  if (notification.metadata?.assetId) return "/assets";

  return null;
}

export function useNotificationNavigation() {
  const router = useRouter();
  const { activeOrgId, organizations, switchOrg } = useOrg();
  const { mutateAsync: markAsRead } = useMarkAsRead();

  return useCallback(
    async (notification: Notification) => {
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      const href = getNotificationHref(notification);
      if (!href) return;

      const targetOrgId = notification.metadata?.organizationId;
      if (targetOrgId && targetOrgId !== activeOrgId) {
        if (notification.metadata?.invitationId) {
          router.push(href);
          return;
        }

        const canAccessOrg = organizations.some(
          (org) => org.id === targetOrgId,
        );
        if (!canAccessOrg) {
          toast.error(
            "You no longer have access to this notification's organization",
          );
          return;
        }

        switchOrg(targetOrgId, { redirectToOverview: false });
      }

      router.push(href);
    },
    [activeOrgId, markAsRead, organizations, router, switchOrg],
  );
}
