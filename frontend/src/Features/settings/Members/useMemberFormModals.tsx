"use client";

import { useViewModal } from "@/Contexts/ViewModalContext";
import InviteMemberForm from "./InviteMemberForm";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function useMemberFormModals() {
  const { view, close } = useViewModal();

  const openCreate = () => {
    view({
      title: "Invite Team Member",
      content: <InviteMemberForm onSuccess={close} />,
    });
  };

  return { openCreate };
}

export function MemberTableActions() {
  const { openCreate } = useMemberFormModals();

  return (
    <Button size="sm" className="gap-2 text-xs" onClick={openCreate}>
      <UserPlus className="size-3.5" />
      Invite Member
    </Button>
  );
}

