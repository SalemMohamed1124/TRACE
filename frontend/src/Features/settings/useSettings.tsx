"use client";

import { useQuery } from "@tanstack/react-query";
import type { OrganizationInvitation, OrgMember } from "@/types";
import {
  fetchMyInvitations,
  fetchOrgInvitations,
  fetchOrgMembers,
} from "@/Services/Settings";

export function useOrgMembers(orgId: string | undefined) {
  const query = useQuery<OrgMember[]>({
    queryKey: ["org-members", orgId],
    queryFn: () => fetchOrgMembers(orgId!),
    enabled: !!orgId,
  });

  const items = query.data ?? [];
  const isEmpty = !query.isPending && !query.isError && items.length === 0;

  return {
    items,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    isEmpty,
    refetch: query.refetch,
  };
}

export function useOrgInvitations(orgId: string | undefined) {
  const query = useQuery<OrganizationInvitation[]>({
    queryKey: ["org-invitations", orgId],
    queryFn: () => fetchOrgInvitations(orgId!),
    enabled: !!orgId,
  });

  const items = query.data ?? [];
  const isEmpty = !query.isPending && !query.isError && items.length === 0;

  return {
    items,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    isEmpty,
    refetch: query.refetch,
  };
}

export function useMyInvitations() {
  const query = useQuery<OrganizationInvitation[]>({
    queryKey: ["my-invitations"],
    queryFn: fetchMyInvitations,
  });

  const items = query.data ?? [];
  const pendingCount = items.filter((item) => item.status === "PENDING").length;

  return {
    items,
    pendingCount,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
