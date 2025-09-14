import api from './index';

export interface CreateSpdTableParams {
  name: string;
  donationId: string;
  image: string;
  probabilityTableId: string;
}

export interface UpdateSpdTableParams {
  name?: string;
  donationId?: string;
  image?: string;
  probabilityTableId?: string;
}

export interface SpdTable {
  id: string;
  name: string;
  creator: string;
  donationId: string;
  image: string;
  probabilityTableId: string;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const createSpdTable = async (
  params: CreateSpdTableParams
): Promise<SpdTable> => {
  return await api.post('/spds', params);
};

export const updateSpdTable = async (
  id: string,
  params: UpdateSpdTableParams
): Promise<SpdTable> => {
  return await api.put(`/spds/${id}`, params);
};

export const getMySpdTables = async (creator: string): Promise<SpdTable[]> => {
  return await api.get(`/spds/creator/${creator}`);
};

export const getSpdTable = async (id: string): Promise<SpdTable> => {
  return await api.get(`/spds/${id}`);
};

export interface SpdTablePage {
  items: SpdTable[];
  total: number;
  page: number; // 0-based index
  pageSize: number;
}

export const getSpdTables = async (
  page?: number,
  pageSize?: number,
  category?: string,
  sortBy?: string,
  sortOrder?: string,
  search?: string,
  type?: string
): Promise<SpdTablePage> => {
  const params: Record<string, any> = {};
  if (typeof page === 'number') params.page = page;
  if (typeof pageSize === 'number') params.pageSize = pageSize;
  if (category && category !== 'All') params.category = category;
  if (sortBy && sortOrder) {
    params.sortBy = sortBy;
    params.sortOrder = sortOrder;
  }
  if (search && search.trim() !== '') params.search = search.trim();
  if (type && type !== 'All') params.type = type;
  return await api.get('/spds', { params });
};

export const getSpdTableByDonationId = async (
  donationId: string
): Promise<SpdTable> => {
  return await api.get(`/spds?donation=${donationId}`);
};

export const deleteSpdTable = async (id: string): Promise<void> => {
  return await api.delete(`/spds/${id}`);
};

// Get donations created by address that are not bound to any SPD
export interface AvailableDonationItem {
  donation: import('./governance').Donation;
  recipient?: import('./governance').Recipient;
}

export const getAvailableDonations = async (
  creator: string
): Promise<AvailableDonationItem[]> => {
  return await api.get(`/spds/available-donations/${creator}`);
};
