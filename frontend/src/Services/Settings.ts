import api from "@/lib/api";
import type {
  Organization,
  OrganizationInvitation,
  OrgMember,
  OrgRole,
  ChangePasswordPayload,
} from "@/types";

export async function fetchOrgMembers(orgId: string) {
  const { data } = await api.get(`/api/organizations/${orgId}/members`);
  return data as OrgMember[];
}

export async function updateProfile(name: string) {
  const { data } = await api.patch("/api/auth/profile", { name });
  return data as { id: string; name: string; email: string };
}

export async function changePassword(payload: ChangePasswordPayload) {
  await api.post("/api/auth/change-password", payload);
}

export async function updateOrganization(orgId: string, name: string) {
  const { data } = await api.patch(`/api/organizations/${orgId}`, { name });
  return data as Organization;
}

export async function deleteOrganization(orgId: string) {
  await api.delete(`/api/organizations/${orgId}`);
}

export async function createOrganization(name: string) {
  const { data } = await api.post("/api/organizations", { name });
  return data as Organization;
}

export async function updateMemberRole(
  orgId: string,
  memberId: string,
  role: OrgRole,
) {
  await api.patch(`/api/organizations/${orgId}/members/${memberId}`, { role });
}

export async function removeMember(orgId: string, memberId: string) {
  await api.delete(`/api/organizations/${orgId}/members/${memberId}`);
}

export async function inviteMember(
  orgId: string,
  payload: { email: string; role: OrgRole },
) {
  const { data } = await api.post(
    `/api/organizations/${orgId}/invitations`,
    payload,
  );
  return data as OrganizationInvitation;
}

export async function fetchOrgInvitations(orgId: string) {
  const { data } = await api.get(`/api/organizations/${orgId}/invitations`);
  return data as OrganizationInvitation[];
}

export async function cancelOrgInvitation(orgId: string, invitationId: string) {
  await api.delete(`/api/organizations/${orgId}/invitations/${invitationId}`);
}

export async function fetchMyInvitations() {
  const { data } = await api.get("/api/organizations/me/invitations");
  return data as OrganizationInvitation[];
}

export async function acceptInvitation(invitationId: string) {
  const { data } = await api.post(
    `/api/organizations/me/invitations/${invitationId}/accept`,
  );
  return data as Organization;
}

export async function declineInvitation(invitationId: string) {
  await api.post(`/api/organizations/me/invitations/${invitationId}/decline`);
}
