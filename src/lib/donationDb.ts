import { apiRequest, getAdminToken } from "./api";

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
  sheet_sync_status: "not_configured" | "pending" | "synced" | "failed";
  sheet_sync_error?: string;
  created_at: string;
  sheet_synced_at?: string;
}

function adminHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchDonations(): Promise<DonationRecord[]> {
  const response = await apiRequest<{ donations: DonationRecord[] }>("/api/admin/donations", {
    headers: adminHeaders(),
  });
  return response.donations;
}
