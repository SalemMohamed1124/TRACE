"use client";

import Link from "next/link";
import { useOrg } from "@/hooks/useOrg";
import { useOrgMembers } from "@/Features/settings/useSettings";
import { useMemberFormModals } from "@/Features/settings/Members/useMemberFormModals";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/layout/SeverityBadge";
import {
  Crown,
  Eye,
  Pencil,
  User,
  Users,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import type { OrgMember, OrgRole } from "@/types";
import { cn } from "@/lib/utils";

const ROLE_CONFIG: Record<
  OrgRole,
  { theme: any; icon: React.ElementType; label: string }
> = {
  ADMIN: { theme: "critical", icon: Crown, label: "Admin" },
  EDITOR: { theme: "informative", icon: Pencil, label: "Editor" },
  VIEWER: { theme: "none", icon: Eye, label: "Viewer" },
};

function MemberRow({ member }: { member: OrgMember }) {
  const roleConfig = ROLE_CONFIG[member.role as OrgRole];
  const RoleIcon = roleConfig.icon;
  const initial = member.user.name?.[0]?.toUpperCase();

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
      {/* Avatar */}
      <div className="size-8 rounded-sm bg-primary/10 flex items-center justify-center font-bold text-sm shrink-0 text-primary">
        {initial ?? <User className="size-4 text-muted-foreground" />}
      </div>

      {/* Name + email */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold truncate leading-tight">
          {member.user.name}
        </span>
        <span className="text-[11px] text-muted-foreground truncate leading-tight">
          {member.user.email}
        </span>
      </div>

      {/* Role badge */}
      <SeverityBadge
        theme={roleConfig.theme}
        className="text-[10px] px-2 py-0 h-5 gap-1.5 shrink-0 font-bold"
      >
        <RoleIcon className="size-3" />
        {roleConfig.label}
      </SeverityBadge>
    </div>
  );
}

export default function TeamMembersCard() {
  const { activeOrgId } = useOrg();
  const { items: members, isPending } = useOrgMembers(activeOrgId);
  const { openCreate } = useMemberFormModals();

  return (
    <div className="glass-card p-5 flex flex-col gap-4 shadow-none justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
            <Users className="size-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-tight">
              Team Members
            </h3>
            {!isPending && (
              <span className="text-[10px] text-muted-foreground font-medium">
                {members.length} {members.length === 1 ? "member" : "members"}
              </span>
            )}
          </div>
        </div>

        {/* Invite button */}
        <Button size="sm" className="gap-2 text-xs" onClick={openCreate}>
          <UserPlus className="size-3.5" />
          Invite Member
        </Button>
      </div>

      {/* Member list */}
      <div className={cn("flex flex-col", isPending && "opacity-50")}>
        {isPending ? (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <div className="size-8 bg-muted/20 rounded-sm animate-pulse shrink-0" />
                <div className="flex flex-col gap-1 flex-1">
                  <div className="h-3 w-28 bg-muted/20 rounded animate-pulse" />
                  <div className="h-2.5 w-40 bg-muted/10 rounded animate-pulse" />
                </div>
                <div className="h-5 w-14 bg-muted/20 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 opacity-40 gap-2">
            <Users className="size-8" />
            <p className="text-xs font-black uppercase tracking-widest">
              No Members
            </p>
          </div>
        ) : (
          members.map((member) => <MemberRow key={member.id} member={member} />)
        )}
      </div>

      {/* Footer link */}
      <div>
        <Link
          href="/settings"
          className="flex items-center  pt-3 gap-2 border-t border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span>Manage Employees</span>
          <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
