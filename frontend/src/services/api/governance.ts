import api from './index';

export interface Recipient {
  id: string;
  name: string;
  donationAddress: string;
  website: string;
  twitter: string;
  introduction: string;
  type: 'Organization' | 'Individual';
  verified: boolean;
  category: string;
}

export interface Donation {
  id: string;
  purpose: string;
  donationAmount: number;
  recipientId: string;
  proposalTxId: string;
  donationProof?: string;
}

export interface GetRecipientsParams {
  creator?: string;
  page?: number;
  limit?: number;
  search?: string;
  type?: 'Organization' | 'Individual';
  category?: string;
}

export interface PaginatedRecipientsResponse {
  recipients: Recipient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetDonationsParams {
  creator?: string;
  page?: number;
  limit?: number;
  search?: string;
  recipientType?: 'Organization' | 'Individual';
  status?: string;
}

export interface PaginatedDonationsResponse {
  donations: Donation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getRecipients = async (creator?: string): Promise<Recipient[]> => {
  const params = creator ? { creator } : {};
  return await api.get('/governance/recipients', { params });
};

export const getRecipientsWithPagination = async (
  params: GetRecipientsParams
): Promise<PaginatedRecipientsResponse> => {
  // Remove undefined values
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );
  return await api.get('/governance/recipients', { params: cleanParams });
};

export const getRecipientById = async (id: string): Promise<Recipient> => {
  return await api.get(`/governance/recipients/${id}`);
};

export const registerRecipient = async (
  recipient: Omit<Recipient, 'id'>
): Promise<Recipient> => {
  return await api.post('/governance/recipients', recipient);
};

export const updateRecipient = async (
  recipient: Recipient
): Promise<Recipient> => {
  return await api.put(`/governance/recipients/${recipient.id}`, recipient);
};

export const deleteRecipient = async (id: string): Promise<void> => {
  return await api.delete(`/governance/recipients/${id}`);
};

export const createDonation = async (donation: Donation): Promise<Donation> => {
  return await api.post('/governance/donations', donation);
};

export const getDonations = async (creator?: string): Promise<Donation[]> => {
  const params = creator ? { creator } : {};
  return await api.get('/governance/donations', { params });
};

export const getDonationsWithPagination = async (
  params: GetDonationsParams
): Promise<PaginatedDonationsResponse> => {
  // Remove undefined values
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );
  return await api.get('/governance/donations', { params: cleanParams });
};

export const getDonationById = async (id: string): Promise<Donation> => {
  return await api.get(`/governance/donations/${id}`);
};

export const updateDonation = async (
  id: string,
  donation: Partial<Donation>
): Promise<Donation> => {
  return await api.put(`/governance/donations/${id}`, donation);
};
