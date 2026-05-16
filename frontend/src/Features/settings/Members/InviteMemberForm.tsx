"use client";

import { useState } from "react";
import { useOrg } from "@/hooks/useOrg";
import { useInviteMember } from "../useSettingMutations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import type { OrgRole } from "@/types";

interface InviteMemberFormProps {
  onSuccess?: () => void;
}

export default function InviteMemberForm({ onSuccess }: InviteMemberFormProps) {
  const { activeOrgId } = useOrg();
  const { mutateAsync: inviteMemberApi, isPending: isInviting } =
    useInviteMember();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>("VIEWER");

  const handleSubmit = async () => {
    if (!activeOrgId) return;
    try {
      await inviteMemberApi({ orgId: activeOrgId, payload: { email, role } });
      setEmail("");
      setRole("VIEWER");
      onSuccess?.();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <Field>
        <FieldLabel className="text-xs font-semibold">Email Address</FieldLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          className="h-10 text-sm"
        />
      </Field>

      <Field>
        <FieldLabel className="text-xs font-semibold">Role</FieldLabel>
        <Select value={role} onValueChange={(v) => setRole(v as OrgRole)}>
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Admin (Full Control)</SelectItem>
            <SelectItem value="EDITOR">Editor (Manage Assets)</SelectItem>
            <SelectItem value="VIEWER">Viewer (Read Only)</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Button
        onClick={handleSubmit}
        disabled={!email.trim() || isInviting}
        className="w-full h-10 mt-2 text-sm"
      >
        {isInviting ? (
          <Loader2 className="size-4 animate-spin mr-2" />
        ) : (
          <UserPlus className="size-4 mr-2" />
        )}
        Send Invitation
      </Button>
    </div>
  );
}
