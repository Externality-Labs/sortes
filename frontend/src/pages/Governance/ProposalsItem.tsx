import { FC, useMemo, useCallback } from 'react';
import { type Recipient } from '../../services/api/governance';
import { expToUsd, UsdToExp } from '../../utils/format';
import EmptyState from './EmptyState';
import ProposalCard from '../../components/ProposalCard';
import { Web3Service } from '../../services/web3';

interface ProposalsItemProps {
  data?: any[];
  onVoteClick?: (donationId: string) => void;
  recipientMap?: Record<string, Recipient>;
  isCharity?: boolean;
}

const ProposalsItem: FC<ProposalsItemProps> = ({
  data = [],
  onVoteClick,
  recipientMap: externalRecipientMap = {},
  isCharity = false,
}) => {
  // 使用 useMemo 缓存当前时间戳，避免每次渲染都重新计算
  const currentTimestamp = useMemo(() => Math.floor(Date.now() / 1000), []);

  // 使用 useMemo 缓存处理后的数据，避免重复计算
  const processedData = useMemo(() => {
    return data.map((donation, index) => {
      const donationId = donation.id || index.toString();
      const recipientId = donation.recipientId;
      const recipient = recipientId ? externalRecipientMap[recipientId] : null;
      const proposalId = donation.blockchainId || donation.id || 'N/A';
      console.log(donation, 'donation');

      // 缓存状态相关计算
      const statusInfo = {
        display: donation.isExecuted
          ? 'Donated'
          : donation.isActive
            ? 'Voting'
            : 'Expired',
        color: donation.isExecuted
          ? 'text-[#40DC6A]'
          : donation.isActive
            ? 'text-[#3370FF]'
            : 'text-orange-500',
      };

      // 缓存金额相关计算
      const amountInfo = {
        usdAmount: expToUsd(donation.amount) || 0,
        expCurrent: donation.amount * 0.0001 || 0,
        expTotal: UsdToExp(donation.donationAmount) || 0,
      };

      // 缓存按钮显示逻辑
      const buttonInfo = {
        shouldShowDonate:
          donation.creator === Web3Service.service.address &&
          amountInfo.usdAmount > 360 &&
          !donation.isExecuted &&
          donation.isActive,
        shouldShowVote: statusInfo.display !== 'Donated',
      };

      return {
        ...donation,
        donationId,
        recipient,
        proposalId,
        statusInfo,
        amountInfo,
        buttonInfo,
      };
    });
  }, [data, externalRecipientMap]);

  // 使用 useCallback 缓存辅助函数
  const formatAddress = useCallback((address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  }, []);

  const formatProposalDuration = useCallback(
    (startTime: number, endTime: number) => {
      if (!startTime || !endTime) return 'N/A';

      const durationSeconds = endTime - startTime;
      const durationDays = Math.floor(durationSeconds / (24 * 60 * 60));

      if (durationDays === 0) {
        const durationHours = Math.floor(durationSeconds / (60 * 60));
        return durationHours > 0
          ? `${durationHours} hour${durationHours > 1 ? 's' : ''}`
          : '< 1 hour';
      }

      return `${durationDays} day${durationDays > 1 ? 's' : ''}`;
    },
    []
  );

  const getTimeRemaining = useCallback(
    (endTimestamp: number) => {
      if (!endTimestamp) return 'N/A';

      const remainingSeconds = endTimestamp - currentTimestamp;

      if (remainingSeconds <= 0) {
        return 'Voting ended';
      }

      const days = Math.floor(remainingSeconds / (24 * 60 * 60));
      const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);

      if (days > 0) {
        return `Voting ends in: ${days}d ${hours}h`;
      } else if (hours > 0) {
        return `Voting ends in: ${hours}h ${minutes}m`;
      } else {
        return `Voting ends in: ${minutes}m`;
      }
    },
    [currentTimestamp]
  );

  if (!data.length) {
    return <EmptyState />;
  }

  return (
    <>
      <div
        className={`max-sm:flex max-sm:flex-col max-sm:gap-1 ${
          isCharity ? 'space-y-4' : ' '
        }`}
      >
        {processedData.map((donation) => (
          <ProposalCard
            key={donation.donationId}
            donation={donation}
            isCharity={isCharity}
            onVoteClick={onVoteClick}
            formatAddress={formatAddress}
            formatProposalDuration={formatProposalDuration}
            getTimeRemaining={getTimeRemaining}
          />
        ))}
      </div>
    </>
  );
};

export default ProposalsItem;
