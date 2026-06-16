"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InvitationList } from "./InvitationList";
import { useMyInvitations } from "@/Features/settings/useSettings";
import {
  useAcceptInvitation,
  useDeclineInvitation,
} from "@/Features/settings/useSettingMutations";
import type { OrganizationInvitation } from "@/types";

export default function InvitationsPanel() {
  const router = useRouter();
  const { items, isPending, isError, error } = useMyInvitations();
  const { mutateAsync: acceptInvitation } = useAcceptInvitation();
  const { mutateAsync: declineInvitation } = useDeclineInvitation();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleAccept(invitation: OrganizationInvitation) {
    setBusyId(invitation.id);
    try {
      await acceptInvitation(invitation.id);
      router.push("/overview");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(invitation: OrganizationInvitation) {
    setBusyId(invitation.id);
    try {
      await declineInvitation(invitation.id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <InvitationList
      invitations={items}
      isPending={isPending}
      error={isError ? error : undefined}
      emptyText="No pending invitations"
      mode="incoming"
      busyId={busyId}
      onAccept={(invitation) => void handleAccept(invitation)}
      onDecline={(invitation) => void handleDecline(invitation)}
    />
  );
}
