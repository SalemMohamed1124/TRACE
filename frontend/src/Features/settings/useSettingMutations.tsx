"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  setStoredUser,
  getActiveOrgId,
  getStoredOrgs,
  setActiveOrgId,
  setStoredOrgs,
} from "@/Services/auth";
import { notifyAuthChange } from "@/hooks/useAuth";
import type { OrgRole, User } from "@/types";
import {
  updateProfile as updateProfileApiReq,
  changePassword as changePasswordApiReq,
  createOrganization as createOrgApiReq,
  updateOrganization as updateOrgApiReq,
  deleteOrganization as deleteOrgApiReq,
  updateMemberRole as updateRoleApiReq,
  removeMember as removeMemberApiReq,
  inviteMember as inviteMemberApiReq,
  cancelOrgInvitation as cancelOrgInvitationApiReq,
  acceptInvitation as acceptInvitationApiReq,
  declineInvitation as declineInvitationApiReq,
} from "@/Services/Settings";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ name }: { name: string; user: User }) =>
      updateProfileApiReq(name),
    onSuccess: (data, { user }) => {
      toast.success("Profile updated successfully");
      setStoredUser({ ...data, createdAt: user?.createdAt ?? "" });
      notifyAuthChange();
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: () => toast.error("Failed to update profile"),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useChangePassword() {
  const mutation = useMutation({
    mutationFn: changePasswordApiReq,
    onSuccess: () => toast.success("Password changed successfully"),
    onError: () => toast.error("Failed to update password"),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ orgId, name }: { orgId: string; name: string }) =>
      updateOrgApiReq(orgId, name),
    onSuccess: (updatedOrg, { orgId, name }) => {
      toast.success("Organization updated");

      const orgs = getStoredOrgs();
      const updatedOrgs = orgs.map((o) =>
        o.id === orgId
          ? { ...o, ...updatedOrg, name: updatedOrg?.name ?? name }
          : o,
      );
      setStoredOrgs(updatedOrgs);

      queryClient.invalidateQueries({ queryKey: ["auth"] });
      notifyAuthChange();
    },
    onError: () => toast.error("Failed to update organization"),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: ({ name }: { name: string }) => createOrgApiReq(name),
    onSuccess: (org) => {
      toast.success("Organization created");

      const orgs = getStoredOrgs();
      const updatedOrgs = [...orgs.filter((o) => o.id !== org.id), org];
      setStoredOrgs(updatedOrgs);
      setActiveOrgId(org.id);

      notifyAuthChange();
      queryClient.invalidateQueries();
      router.push("/overview");
    },
    onError: () => toast.error("Failed to create organization"),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteOrgApiReq,
    onSuccess: (_, orgId) => {
      toast.success("Organization deleted");

      const orgs = getStoredOrgs();
      const remainingOrgs = orgs.filter((o) => o.id !== orgId);
      setStoredOrgs(remainingOrgs);

      if (getActiveOrgId() === orgId && remainingOrgs[0]) {
        setActiveOrgId(remainingOrgs[0].id);
      }

      notifyAuthChange();
      queryClient.invalidateQueries();
      window.location.href = "/overview";
    },
    onError: () => toast.error("Failed to delete organization"),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      orgId,
      memberId,
      role,
    }: {
      orgId: string;
      memberId: string;
      role: OrgRole;
    }) => updateRoleApiReq(orgId, memberId, role),
    onSuccess: (_, { orgId }) => {
      toast.success("Member role updated");
      queryClient.invalidateQueries({ queryKey: ["org-members", orgId] });
    },
    onError: () => toast.error("Failed to update role"),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ orgId, memberId }: { orgId: string; memberId: string }) =>
      removeMemberApiReq(orgId, memberId),
    onSuccess: (_, { orgId }) => {
      toast.success("Member removed");
      queryClient.invalidateQueries({ queryKey: ["org-members", orgId] });
    },
    onError: () => toast.error("Failed to remove member"),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      orgId,
      payload,
    }: {
      orgId: string;
      payload: { email: string; role: OrgRole };
    }) => inviteMemberApiReq(orgId, payload),
    onSuccess: (_, { orgId }) => {
      toast.success("Invitation sent successfully");
      queryClient.invalidateQueries({ queryKey: ["org-invitations", orgId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("Failed to invite member"),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useCancelOrgInvitation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      orgId,
      invitationId,
    }: {
      orgId: string;
      invitationId: string;
    }) => cancelOrgInvitationApiReq(orgId, invitationId),
    onSuccess: (_, { orgId }) => {
      toast.success("Invitation cancelled");
      queryClient.invalidateQueries({ queryKey: ["org-invitations", orgId] });
    },
    onError: () => toast.error("Failed to cancel invitation"),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: acceptInvitationApiReq,
    onSuccess: (org) => {
      toast.success("Invitation accepted");

      const orgs = getStoredOrgs();
      setStoredOrgs([...orgs.filter((item) => item.id !== org.id), org]);
      setActiveOrgId(org.id);
      notifyAuthChange();

      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to accept invitation"),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: declineInvitationApiReq,
    onSuccess: () => {
      toast.success("Invitation declined");
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("Failed to decline invitation"),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
