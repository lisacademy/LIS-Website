import { apiRequest, getAdminToken } from "./api";

export type DonationStatus = "pending" | "approved" | "rejected";

export interface DonationRecord {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  payment_mode: string;
  transaction_id: string;
  status: DonationStatus;
  sheet_sync_status: "not_configured" | "pending" | "synced" | "failed";
  sheet_sync_error?: string;
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
  sheet_synced_at?: string;
}

export interface DonationMailResult {
  ok: boolean;
  to?: string;
  subject?: string;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

function adminHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchDonations(): Promise<DonationRecord[]> {
  const response = await apiRequest<{ donations: DonationRecord[] }>("/api/admin/donations", {
    headers: adminHeaders(),
  });
  return response.donations.map((donation) => ({
    ...donation,
    status: donation.status || "pending",
  }));
}

export async function updateDonationStatus(
  id: string,
  status: DonationStatus,
  rejectionReason?: string,
): Promise<{ donation: DonationRecord; mail?: DonationMailResult }> {
  const response = await apiRequest<{ donation: DonationRecord; mail?: DonationMailResult }>(`/api/admin/donations/${id}/status`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({ status, rejectionReason }),
  });
  return {
    mail: response.mail,
    donation: {
      ...response.donation,
      status: response.donation.status || "pending",
    },
  };
}
