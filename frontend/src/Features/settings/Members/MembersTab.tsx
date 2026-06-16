"use client";

import { useState } from "react";
import { InvitationList } from "@/Features/invitations/InvitationList";
import { useOrg } from "@/hooks/useOrg";
import type { OrganizationInvitation } from "@/types";
import { useOrgInvitations, useOrgMembers } from "../useSettings";
import { useCancelOrgInvitation } from "../useSettingMutations";
import { DataTable } from "@/components/dataTable/DataTable";
import { MemberColumns } from "./MemberColumns";
import { MemberTableActions } from "./useMemberFormModals";

export default function MembersTab() {
  const { activeOrgId } = useOrg();
  const {
    items: members = [],
    isPending,
    isError,
    error,
  } = useOrgMembers(activeOrgId);
  const {
    items: invitations = [],
    isPending: isInvitationsPending,
    isError: isInvitationsError,
    error: invitationsError,
  } = useOrgInvitations(activeOrgId);
  const { mutateAsync: cancelInvitation } = useCancelOrgInvitation();
  const [busyInvitationId, setBusyInvitationId] = useState<string | null>(null);

  async function handleCancelInvitation(invitation: OrganizationInvitation) {
    if (!activeOrgId) return;

    setBusyInvitationId(invitation.id);
    try {
      await cancelInvitation({
        orgId: activeOrgId,
        invitationId: invitation.id,
      });
    } finally {
      setBusyInvitationId(null);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-foreground">
          Personnel Registry
        </h2>
        <p className="text-xs text-muted-foreground">
          Manage organization access and roles
        </p>
      </div>

      <DataTable
        tableName="MembersTable"
        columns={MemberColumns}
        data={members}
        isPending={isPending}
        error={isError ? error : undefined}
        cardsLayout={true}
        disablePagination={members.length < 10}
        toolbar={{
          search: true,
          export: false,
          filter: true,
          viewOptions: false,
        }}
        extraActions={<MemberTableActions />}
      />

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Pending Invitations
          </h3>
          <p className="text-xs text-muted-foreground">
            Existing users who have not accepted access yet
          </p>
        </div>
        <InvitationList
          invitations={invitations}
          isPending={isInvitationsPending}
          error={isInvitationsError ? invitationsError : undefined}
          emptyText="No pending invitations"
          mode="admin"
          busyId={busyInvitationId}
          onCancel={(invitation) => void handleCancelInvitation(invitation)}
        />
      </div>
    </div>
  );
}
