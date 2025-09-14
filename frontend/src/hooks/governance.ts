import { useState, useEffect, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { Web3Service } from '../services/web3';
import {
  getRecipients,
  Recipient,
  Donation,
  getRecipientsWithPagination,
  GetRecipientsParams,
  PaginatedRecipientsResponse,
  getDonationsWithPagination,
  GetDonationsParams,
} from '../services/api/governance';
import { getDraftsFromStorage } from './useRecipientForm';
import { web3ServiceInitedAtom } from '../atoms/web3';

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Extended donation interface with blockchain data
export interface ExtendedDonation extends Donation {
  _id?: string;
  creator?: string;
  __v?: number;
  blockchainId?: number;
  recipient?: string;
  amount?: number;
  startTime?: number;
  endTime?: number;
  isActive?: boolean;
  isExecuted?: boolean;
  currentStatus?: string; // Add currentStatus property
  // Additional properties that might be present in the data
  recipientName?: string;
  recipient_name?: string;
  name?: string;
  recipient_type?: string;
  type?: string;
  recipientType?: string;
}

// Extended recipient interface with additional fields
export interface ExtendedRecipient extends Recipient {
  isIncomplete?: boolean; // 标记是否为不完整信息（从区块链合成）
  canEdit?: boolean; // 标记是否可以编辑（name为空的Draft状态）
  isDraft?: boolean; // 标记是否为draft数据
  creator?: string; // 创建者地址
}

export interface CombinedReceiversData {
  blockchain: any[]; // Keep as any[] since this comes from blockchain contract and structure may vary
  backend: ExtendedRecipient[];
  drafts: any[]; // Keep as any[] since this comes from localStorage and structure may vary
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Get recipient status display text
export const getRecipientStatusDisplay = (recipient: ExtendedRecipient) => {
  if (recipient.isDraft || recipient.isIncomplete) {
    return 'Draft (Incomplete info)';
  }
  return recipient.type === 'Organization'
    ? recipient.verified
      ? 'Active'
      : 'In Review'
    : 'Active';
};

// Get donation status display text
export const getDonationStatusDisplay = (donation: ExtendedDonation) => {
  if (donation.isExecuted) {
    return 'Donated';
  } else if (donation.isActive) {
    return 'Voting';
  } else {
    // Check if expired (assuming current time is greater than endTime)
    const currentTime = Math.floor(Date.now() / 1000);
    if (donation.endTime && currentTime > donation.endTime) {
      return 'Expired';
    }
    return 'To be Donated';
  }
};

// Sort recipients for "All Recipients" tab
export const sortAllRecipients = (recipients: ExtendedRecipient[]) => {
  return recipients.sort((a, b) => {
    const web3Service = Web3Service.service;
    const userAddress = web3Service?.address?.toLowerCase();

    // 1. 用户创建的最先 (creator == 用户地址)
    const aIsUserCreated = a.creator?.toLowerCase() === userAddress;
    const bIsUserCreated = b.creator?.toLowerCase() === userAddress;

    if (aIsUserCreated && !bIsUserCreated) return -1;
    if (!aIsUserCreated && bIsUserCreated) return 1;

    // 2. Organization 中 verified 为 true 的 (Active)
    const aIsActiveOrg = a.type === 'Organization' && a.verified;
    const bIsActiveOrg = b.type === 'Organization' && b.verified;

    if (aIsActiveOrg && !bIsActiveOrg) return -1;
    if (!aIsActiveOrg && bIsActiveOrg) return 1;

    // 3. Organization 中 verified 为 false 的 (In Review)
    const aIsReviewOrg = a.type === 'Organization' && !a.verified;
    const bIsReviewOrg = b.type === 'Organization' && !b.verified;

    if (aIsReviewOrg && !bIsReviewOrg) return -1;
    if (!aIsReviewOrg && bIsReviewOrg) return 1;

    // 4. Individual 类型
    const aIsIndividual = a.type === 'Individual';
    const bIsIndividual = b.type === 'Individual';

    if (aIsIndividual && !bIsIndividual) return -1;
    if (!aIsIndividual && bIsIndividual) return 1;

    // 5. 同类型内部按 ID 从大到小排序
    const aId = parseInt(a.id) || 0;
    const bId = parseInt(b.id) || 0;
    return bId - aId;
  });
};

// Sort recipients for "My Recipients" tab
export const sortMyRecipients = (recipients: ExtendedRecipient[]) => {
  return recipients.sort((a, b) => {
    const aStatus = getRecipientStatusDisplay(a);
    const bStatus = getRecipientStatusDisplay(b);

    // Define status priority order
    const statusPriority = {
      Active: 1,
      'In Review': 2,
      'Draft (Incomplete info)': 3,
    };

    const aPriority = statusPriority[aStatus] || 999;
    const bPriority = statusPriority[bStatus] || 999;

    // First sort by status priority
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Then sort by ID (creation time) in descending order
    const aId = parseInt(a.id) || 0;
    const bId = parseInt(b.id) || 0;
    return bId - aId;
  });
};

// Hook for managing recipients data with server-side pagination for All Recipients
export const useAllRecipientsWithPagination = (
  page: number = 1,
  limit: number = 20,
  search?: string,
  type?: 'Organization' | 'Individual',
  category?: string,
  enabled: boolean = true
) => {
  const [data, setData] = useState<PaginatedRecipientsResponse>({
    recipients: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term with 1 second delay
  const debouncedSearch = useDebounce(search, 1000);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);
    try {
      const params: GetRecipientsParams = {
        page,
        limit,
        type,
        category,
      };
      if (debouncedSearch && debouncedSearch.trim() !== '') {
        params.search = debouncedSearch;
      }

      const response = await getRecipientsWithPagination(params);
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch recipients'
      );
      console.error('Error fetching recipients:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, page, limit, debouncedSearch, type, category]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    } else {
      // Reset data when not enabled to prevent showing stale data
      setData({
        recipients: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      setLoading(false);
      setError(null);
    }
  }, [enabled, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Hook for managing donations data with server-side pagination for All Proposals
export const useAllDonationsWithPagination = (
  page: number = 1,
  limit: number = 20,
  search?: string,
  recipientType?: 'Organization' | 'Individual',
  status?: string,
  enabled: boolean = true
) => {
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const [data, setData] = useState<{
    donations: ExtendedDonation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    donations: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term with 1 second delay
  const debouncedSearch = useDebounce(search, 1000);

  const fetchData = useCallback(async () => {
    if (!enabled || !isWeb3ServiceInited || !Web3Service._instance) return;

    setLoading(true);
    setError(null);
    try {
      const params: GetDonationsParams = {
        page,
        limit,
        recipientType,
        status,
      };
      if (debouncedSearch && debouncedSearch.trim() !== '') {
        params.search = debouncedSearch;
      }

      const response = await getDonationsWithPagination(params);

      // If no donations, return empty result
      if (response.donations.length === 0) {
        setData(response as any);
        return;
      }

      // Get blockchain data for these donations
      const web3Service = Web3Service.service;
      const sortesContract = web3Service.contracts?.sortes;

      if (!sortesContract) {
        console.error('cannot get sortes contract');
        setData(response as any);
        return;
      }

      const ids = response.donations.map((donation) => donation.id);
      const abiDonations = await sortesContract.getDonations(ids);

      const parseBigNumber = (value: any): number =>
        value?.toNumber ? value.toNumber() : value;

      const mergedDonations: ExtendedDonation[] = response.donations.map(
        (apiDonation, index) => {
          const abiDonation = abiDonations[index];
          if (!abiDonation) return apiDonation as ExtendedDonation;

          const extendedDonation: ExtendedDonation = {
            ...apiDonation,
            blockchainId: parseBigNumber(abiDonation[0]),
            recipient: abiDonation[2],
            amount: parseBigNumber(abiDonation[3]),
            startTime: parseBigNumber(abiDonation[4]),
            endTime: parseBigNumber(abiDonation[5]),
            isActive: abiDonation[6],
            isExecuted: abiDonation[7],
          };

          // Add currentStatus using the helper function
          extendedDonation.currentStatus =
            getDonationStatusDisplay(extendedDonation);

          return extendedDonation;
        }
      );

      setData({
        donations: mergedDonations,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch donations'
      );
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    isWeb3ServiceInited,
    page,
    limit,
    debouncedSearch,
    recipientType,
    status,
  ]);

  useEffect(() => {
    if (enabled && isWeb3ServiceInited) {
      fetchData();
    } else {
      // Reset data when not enabled to prevent showing stale data
      setData({
        donations: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      setLoading(false);
      setError(null);
    }
  }, [enabled, isWeb3ServiceInited, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Hook for managing recipients data
export const useRecipients = (activeTab: 'myRecipient' | 'allRecipients') => {
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const [myReceivers, setMyReceivers] = useState<CombinedReceiversData>({
    blockchain: [],
    backend: [],
    drafts: [],
    total: 0,
  });
  const [allReceivers, setAllReceivers] = useState<CombinedReceiversData>({
    blockchain: [],
    backend: [],
    drafts: [],
    total: 0,
  });

  const fetchReceiversData = useCallback(async () => {
    try {
      // 检查 Web3Service 是否已初始化
      if (!isWeb3ServiceInited || !Web3Service._instance) {
        return;
      }

      const web3Service = Web3Service.service;

      // 仅在 myRecipient 标签下触发请求；allRecipients 交由分页 hook 处理
      if (activeTab !== 'myRecipient') {
        return;
      }

      // 根据当前标签页获取不同的受助者数据
      if (activeTab === 'myRecipient') {
        // 获取用户创建的受助者
        try {
          let backendReceivers: Recipient[] = [];

          // 1. 从后端 API 获取数据
          try {
            const userAddress = web3Service?.address || '';
            backendReceivers = (await getRecipients(
              userAddress
            )) as Recipient[];
          } catch (error) {
            console.error(error);
          }

          // 2. 合并数据（优先使用后端数据，区块链数据作为补充）
          // gamma版本ABI不支持创建recipient, blockchain 数据为空
          const backendMap = new Map();
          const finalReceivers: ExtendedRecipient[] = [];

          // 添加所有后端数据
          backendReceivers.forEach((receiver) => {
            if (receiver.id) {
              backendMap.set(receiver.id.toString(), receiver);
              finalReceivers.push(receiver);
            }
          });

          // 获取localStorage中的draft数据
          const draftData = getDraftsFromStorage();

          const combinedReceivers = {
            blockchain: [],
            backend: sortMyRecipients(finalReceivers),
            drafts: draftData,
            total: finalReceivers.length + draftData.length,
          };

          setMyReceivers(combinedReceivers);
        } catch (error) {
          console.error(error);
        }
      } else if (activeTab === 'allRecipients') {
        // 获取所有受助者
        try {
          let blockchainReceivers: any[] = [];
          let allBackendReceivers: Recipient[] = [];

          // 1. 从区块链获取数据（所有受助者）
          if (web3Service) {
            const sortesContract = web3Service.contracts?.sortes;
            if (sortesContract) {
              try {
                blockchainReceivers =
                  (await sortesContract.getAllReceivers?.()) || [];
              } catch (error) {
                console.error(error);
              }
            }
          }

          // 2. 从后端 API 获取所有受助者数据
          try {
            allBackendReceivers = (await getRecipients()) as Recipient[];
          } catch (error) {
            console.error(error);
          }

          // 3. 合并数据（优先使用后端数据，区块链数据作为补充）
          const backendMap = new Map();
          const finalAllReceivers: ExtendedRecipient[] = [];

          // 添加所有后端数据
          allBackendReceivers.forEach((receiver) => {
            if (receiver.id) {
              backendMap.set(receiver.id.toString(), receiver);
              finalAllReceivers.push(receiver);
            }
          });

          // 将区块链中存在但API中不存在的数据转换并添加
          blockchainReceivers.forEach((blockchainReceiver, index) => {
            const receiverId =
              blockchainReceiver.id?.toString() ||
              blockchainReceiver[0]?.toString() ||
              index.toString();

            if (!backendMap.has(receiverId)) {
              const blockchainName =
                blockchainReceiver.name || blockchainReceiver[3] || '';
              const isNameEmpty =
                !blockchainName || blockchainName.trim() === '';
              const donationAddress =
                blockchainReceiver.donationAddress ||
                blockchainReceiver[1] ||
                blockchainReceiver.recipient ||
                '';

              const syntheticReceiver: ExtendedRecipient = {
                id: receiverId,
                donationAddress: donationAddress,
                name: isNameEmpty ? '' : blockchainName,
                type: blockchainReceiver.type || 'Individual',
                verified: false,
                website: '',
                twitter: '',
                introduction: '',
                category: 'Other',
                isIncomplete: true,
                canEdit: isNameEmpty,
              };

              backendMap.set(receiverId, syntheticReceiver);
              finalAllReceivers.push(syntheticReceiver);
            }
          });

          const combinedReceivers = {
            blockchain: blockchainReceivers,
            backend: sortAllRecipients(finalAllReceivers),
            drafts: [],
            total: finalAllReceivers.length,
          };

          setAllReceivers(combinedReceivers);
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [activeTab, isWeb3ServiceInited]);

  useEffect(() => {
    fetchReceiversData();
  }, [fetchReceiversData]);

  return {
    myReceivers,
    allReceivers,
    fetchReceiversData,
  };
};

// Hook for managing donations data (supports pagination for myProposal and allProposals)
export const useDonations = (
  activeTab: 'myProposal' | 'allProposals',
  page: number = 1,
  limit: number = 10,
  search?: string,
  enabled: boolean = true
) => {
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const [myDonations, setMyDonations] = useState<ExtendedDonation[]>([]);
  const [allDonations, setAllDonations] = useState<ExtendedDonation[]>([]);
  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [donationRecipientMap] = useState<Record<string, Recipient>>({});

  const debouncedSearch = useDebounce(search, 1000);

  const fetchDonationsData = useCallback(async () => {
    try {
      if (!enabled) {
        return;
      }
      if (!isWeb3ServiceInited || !Web3Service._instance) {
        return;
      }

      const web3Service = Web3Service.service;
      const sortesContract = web3Service.contracts?.sortes;
      if (!sortesContract) {
        console.error('cannot get sortes contract');
        return;
      }

      // Use paginated API with recipient aggregation (single request)
      const params: GetDonationsParams = {
        page,
        limit,
      };
      if (activeTab === 'myProposal') {
        params.creator = web3Service.address;
      }

      if (debouncedSearch && debouncedSearch.trim() !== '') {
        params.search = debouncedSearch;
      }

      const apiPaged = await getDonationsWithPagination(params);

      setTotalDonations(apiPaged.total);

      if (apiPaged.donations.length === 0) {
        setMyDonations([]);
        setAllDonations([]);
        return;
      }

      const abiDonations = await sortesContract.getDonations(
        apiPaged.donations.map((donation) => donation.id)
      );

      const parseBigNumber = (value: any): number =>
        value?.toNumber ? value.toNumber() : value;

      const mergedDonations: ExtendedDonation[] = apiPaged.donations.map(
        (apiDonation, index) => {
          const abiDonation = abiDonations[index];
          if (!abiDonation) return apiDonation;

          const extendedDonation: ExtendedDonation = {
            ...apiDonation,
            blockchainId: parseBigNumber(abiDonation[0]),
            recipient: abiDonation[2],
            amount: parseBigNumber(abiDonation[3]),
            startTime: parseBigNumber(abiDonation[4]),
            endTime: parseBigNumber(abiDonation[5]),
            isActive: abiDonation[6],
            isExecuted: abiDonation[7],
          };

          // Add currentStatus using the helper function
          extendedDonation.currentStatus =
            getDonationStatusDisplay(extendedDonation);

          return extendedDonation;
        }
      );

      // Default sorting: by status priority, then by time (recent first)
      mergedDonations.sort((a, b) => {
        // Define status priority: Voting > Donated > Expired > To be Donated
        const statusPriority: Record<string, number> = {
          Voting: 1,
          Donated: 2,
          Expired: 3,
          'To be Donated': 4,
        };

        const aPriority =
          statusPriority[a.currentStatus || 'To be Donated'] || 999;
        const bPriority =
          statusPriority[b.currentStatus || 'To be Donated'] || 999;

        // First sort by status priority
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        // Then sort by time (more recent first)
        return (b.startTime || 0) - (a.startTime || 0);
      });

      if (activeTab === 'myProposal') {
        setMyDonations(mergedDonations);
      } else {
        setAllDonations(mergedDonations);
      }
    } catch (error) {
      console.error(error);
    }
  }, [activeTab, isWeb3ServiceInited, page, limit, debouncedSearch, enabled]);

  useEffect(() => {
    fetchDonationsData();
  }, [fetchDonationsData]);

  return {
    myDonations,
    allDonations,
    totalDonations,
    donationRecipientMap,
    fetchDonationsData,
  };
};

// Hook for filtering recipients
export const useRecipientFilters = () => {
  const [myRecipientStatus, setMyRecipientStatus] = useState('All');
  const [allRecipientType, setAllRecipientType] = useState('All');
  const [allRecipientCategory, setAllRecipientCategory] = useState('All');
  const [recipientSearchKeyword, setRecipientSearchKeyword] = useState('');

  const getFilteredReceivers = (data: CombinedReceiversData) => {
    const draftToExtendedRecipient = (draft: {
      id: string;
      name: string;
      donationAddress: string;
      website: string;
      twitter: string;
      introduction: string;
      type: string;
      category: string;
    }): ExtendedRecipient => ({
      id: draft.id,
      name: draft.name,
      donationAddress: draft.donationAddress,
      website: draft.website,
      twitter: draft.twitter,
      introduction: draft.introduction,
      type: draft.type === 'organization' ? 'Organization' : 'Individual',
      verified: false,
      category: draft.category,
      isDraft: true,
      canEdit: true,
    });

    let allRecipients = [
      ...data.backend,
      ...data.drafts.map(draftToExtendedRecipient),
    ];

    if (recipientSearchKeyword.trim()) {
      allRecipients = allRecipients.filter((recipient) =>
        recipient.name
          .toLowerCase()
          .includes(recipientSearchKeyword.toLowerCase().trim())
      );
    }

    if (myRecipientStatus !== 'All' && myRecipientStatus) {
      allRecipients = allRecipients.filter((recipient) => {
        const displayType = getRecipientStatusDisplay(recipient);
        return displayType === myRecipientStatus;
      });
    }

    return {
      blockchain: data.blockchain,
      backend: allRecipients,
      drafts: [],
      total: allRecipients.length,
    };
  };

  const getFilteredAllReceivers = (data: CombinedReceiversData) => {
    let filteredBackend = data.backend;

    if (recipientSearchKeyword.trim()) {
      filteredBackend = filteredBackend.filter((recipient) =>
        recipient.name
          .toLowerCase()
          .includes(recipientSearchKeyword.toLowerCase().trim())
      );
    }

    if (allRecipientType !== 'All' && allRecipientType) {
      filteredBackend = filteredBackend.filter((recipient) => {
        const displayType =
          recipient.type === 'Organization'
            ? recipient.verified
              ? 'Certified Organization'
              : 'Non-certified Organization'
            : 'Individual';
        return displayType === allRecipientType;
      });
    }

    if (allRecipientCategory !== 'All' && allRecipientCategory) {
      filteredBackend = filteredBackend.filter((recipient) => {
        return recipient.category === allRecipientCategory;
      });
    }

    return {
      blockchain: data.blockchain,
      backend: filteredBackend,
      drafts: data.drafts,
      total: filteredBackend.length,
    };
  };

  return {
    myRecipientStatus,
    setMyRecipientStatus,
    allRecipientType,
    setAllRecipientType,
    allRecipientCategory,
    setAllRecipientCategory,
    recipientSearchKeyword,
    setRecipientSearchKeyword,
    getFilteredReceivers,
    getFilteredAllReceivers,
  };
};

// Hook for filtering donations
export const useDonationFilters = () => {
  const [proposalSearchKeyword, setProposalSearchKeyword] = useState('');
  const [proposalRecipientType, setProposalRecipientType] = useState('All');
  const [proposalStatus, setProposalStatus] = useState('All');
  const [timeSortOrder, setTimeSortOrder] = useState<'asc' | 'desc' | null>(
    null
  );

  const getFilteredDonations = (
    donations: ExtendedDonation[],
    donationRecipientMap: Record<string, Recipient>
  ) => {
    let filteredDonations = donations.filter((donation) => {
      if (proposalSearchKeyword.trim()) {
        const keyword = proposalSearchKeyword.toLowerCase().trim();
        const matchesSearch =
          (donation.recipientName &&
            donation.recipientName.toLowerCase().includes(keyword)) ||
          (donation.recipient_name &&
            donation.recipient_name.toLowerCase().includes(keyword)) ||
          (donation.name && donation.name.toLowerCase().includes(keyword)) ||
          (donation.recipient &&
            donation.recipient.toLowerCase().includes(keyword));

        if (!matchesSearch) return false;
      }

      if (proposalRecipientType !== 'All') {
        const recipient = donationRecipientMap[donation.recipientId];
        const donationType =
          recipient?.type ||
          donation.recipient_type ||
          donation.type ||
          donation.recipientType ||
          '';

        if (donationType.toLowerCase() !== proposalRecipientType.toLowerCase())
          return false;
      }

      if (proposalStatus !== 'All') {
        if (donation.currentStatus !== proposalStatus) return false;
      }

      return true;
    });

    // Apply time sorting if specified
    if (timeSortOrder) {
      filteredDonations = [...filteredDonations].sort((a, b) => {
        const aTime = a.startTime || 0;
        const bTime = b.startTime || 0;

        if (timeSortOrder === 'asc') {
          return aTime - bTime;
        } else {
          return bTime - aTime;
        }
      });
    }

    return filteredDonations;
  };

  return {
    proposalSearchKeyword,
    setProposalSearchKeyword,
    proposalRecipientType,
    setProposalRecipientType,
    proposalStatus,
    setProposalStatus,
    timeSortOrder,
    setTimeSortOrder,
    getFilteredDonations,
  };
};
