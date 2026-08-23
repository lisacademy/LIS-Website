import { apiRequest, clearMemberToken, getMemberToken, setMemberToken, getAdminToken, setAdminToken, clearAdminToken } from "./api";
import type { AdminMemberDraftValues, Member, MembershipTier, MemberStatus, VolunteerStatus, LifeCertificateEditorState } from "./membershipTypes";
import { LIFE_CERTIFICATE_TEMPLATE_VERSION, VOLUNTEER_CERTIFICATE_TEMPLATE_VERSION } from "./certificateGenerator";
export { MEMBERSHIP_TIERS, TIER_COLORS } from "./membershipTypes";

export interface CreateMemberInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  category: string;
  custom_detail: string;
  designation: string;
  institution: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  membership_tier: MembershipTier;
  photo_data_url?: string;
  certificate_editor_state?: LifeCertificateEditorState;
  certificate_draft_data_url?: string;
}

interface MemberAuthResponse {
  token: string;
  member: Member;
}

export async function registerMember(input: CreateMemberInput): Promise<Member> {
  const response = await apiRequest<MemberAuthResponse>("/api/members/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setMemberToken(response.token);
  return response.member;
}

export async function loginMember(identifier: string, password: string): Promise<Member> {
  const response = await apiRequest<MemberAuthResponse>("/api/members/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
  setMemberToken(response.token);
  return response.member;
}

export function logoutMember() {
  clearMemberToken();
}

export async function getCurrentMember(): Promise<Member | null> {
  const token = getMemberToken();
  if (!token) return null;
  try {
    const response = await apiRequest<{ member: Member }>("/api/members/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.member;
  } catch {
    clearMemberToken();
    return null;
  }
}

export async function createMember(input: CreateMemberInput): Promise<Member> {
  return registerMember(input);
}

export async function createAdminMember(input: CreateMemberInput & { status?: MemberStatus }): Promise<Member> {
  const response = await apiRequest<{ member: Member }>("/api/admin/members", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(input),
  });
  return response.member;
}

export async function adminLogin(username: string, password: string): Promise<void> {
  const response = await apiRequest<{ token: string }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setAdminToken(response.token);
}

export function adminLogout() {
  clearAdminToken();
}

export function hasAdminToken() {
  return Boolean(getAdminToken());
}

function adminHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getAllMembers(): Promise<Member[]> {
  const response = await apiRequest<{ members: Member[] }>("/api/admin/members", {
    headers: adminHeaders(),
  });
  return response.members;
}

export async function getMemberById(id: string): Promise<Member | null> {
  try {
    const response = await apiRequest<{ member: Member }>(`/api/admin/members/${id}`, {
      headers: adminHeaders(),
    });
    return response.member;
  } catch {
    return null;
  }
}

export async function getMemberByMembershipId(membershipId: string): Promise<Member | null> {
  const member = await getCurrentMember();
  if (member?.membership_id === membershipId) {
    return member;
  }
  return null;
}

export async function updateMemberStatus(id: string, status: MemberStatus, reason = ""): Promise<{ member: Member; email_error?: string | null }> {
  return apiRequest<{ member: Member; email_error?: string | null }>(`/api/admin/members/${id}/status`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({ status, reason }),
  });
}

export async function updateVolunteerStatus(id: string, status: Exclude<VolunteerStatus, "not_applied">, reason = ""): Promise<{ member: Member; email_error?: string | null }> {
  const response = await apiRequest<{ member: Member; email_error?: string | null }>(`/api/admin/members/${id}/volunteer-status`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({ status, reason }),
  });
  return response;
}

export async function updateMemberCertificateEditorState(
  id: string,
  certificate_editor_state: LifeCertificateEditorState,
): Promise<Member> {
  const response = await apiRequest<{ member: Member }>(`/api/admin/members/${id}/certificate-editor`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({ certificate_editor_state }),
  });
  return response.member;
}

export async function updateMemberDraftValues(id: string, input: AdminMemberDraftValues): Promise<Member> {
  const response = await apiRequest<{ member: Member }>(`/api/admin/members/${id}/draft-values`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify(input),
  });
  return response.member;
}

export async function deleteMember(id: string): Promise<void> {
  await apiRequest<void>(`/api/admin/members/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
}

export async function saveMemberCertificate(certificate_data_url: string): Promise<{ saved: true; certificate_template_version: number }> {
  const token = getMemberToken();
  if (!token) {
    throw new Error("Member authentication required.");
  }

  const response = await apiRequest<{ saved: true; certificate_template_version: number }>("/api/members/me/certificate", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      certificate_data_url,
      certificate_template_version: LIFE_CERTIFICATE_TEMPLATE_VERSION,
    }),
  });

  return response;
}

export async function saveVolunteerCertificate(volunteer_certificate_data_url: string): Promise<{ saved: true; volunteer_certificate_template_version: number }> {
  const token = getMemberToken();
  if (!token) {
    throw new Error("Member authentication required.");
  }

  return apiRequest<{ saved: true; volunteer_certificate_template_version: number }>("/api/members/me/volunteer-certificate", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      volunteer_certificate_data_url,
      volunteer_certificate_template_version: VOLUNTEER_CERTIFICATE_TEMPLATE_VERSION,
    }),
  });
}

export async function saveMemberCertificateDraft(
  certificate_draft_data_url: string,
  submit_for_review: boolean,
): Promise<{ saved: true; submitted_at?: string }> {
  const token = getMemberToken();
  if (!token) {
    throw new Error("Member authentication required.");
  }

  return apiRequest<{ saved: true; submitted_at?: string }>("/api/members/me/certificate-draft", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      certificate_draft_data_url,
      submit_for_review,
    }),
  });
}

export async function applyForVolunteer(): Promise<Member> {
  const token = getMemberToken();
  if (!token) {
    throw new Error("Member authentication required.");
  }

  const response = await apiRequest<{ member: Member }>("/api/members/me/volunteer", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.member;
}
