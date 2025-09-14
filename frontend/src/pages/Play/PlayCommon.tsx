import CongratulationsPopup from './Congratulations';
import ProcessingPlays from './ProcessingPlays';

import { useEffect, useState, useCallback, useMemo } from 'react';
import rewardBgWBTC from '../../assets/images/rewards/bg-wbtc.svg';
import rewardBgSatoshi from '../../assets/images/rewards/bg-satoshi.svg';
import rewardBgTaiko from '../../assets/images/rewards/bg-taiko.svg';
import rewardBgExp from '../../assets/images/rewards/bg-exp.svg';
import PlayHistory from './PlayHistory';
import DrawPanel from './DrawPanel';
// import StatisticItem from './StatisticItem';
import { ProbabilityTable } from '../../services/type';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spd } from '../../hooks/probabilityTable';
import ProposalCard from '../../components/ProposalCard';
import {
  getDonations,
  getRecipientById,
  type Recipient,
} from '../../services/api/governance';
import { Web3Service } from '../../services/web3';
import { useAtomValue } from 'jotai';
import { web3ServiceInitedAtom } from '../../atoms/web3';
import { expToUsd, UsdToExp } from '../../utils/format';

interface PlayCommonProps {
  probabilityTable: ProbabilityTable;
  spd?: Spd;
  isSpd?: boolean;
}

const PlayCommon = ({ probabilityTable, spd }: PlayCommonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);

  // State for donation data
  const [donationData, setDonationData] = useState<any>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(false);

  // Current timestamp for time calculations
  const currentTimestamp = useMemo(() => Math.floor(Date.now() / 1000), []);

  // Fetch donation data for SPD
  const fetchDonationData = useCallback(async () => {
    if (!spd?.donationId || !isWeb3ServiceInited || !Web3Service._instance) {
      return;
    }

    setLoading(true);
    try {
      // Get donation from API
      const donations = await getDonations();
      const donation = donations.find((d) => d.id === spd.donationId);

      if (!donation) {
        console.warn('Donation not found for SPD:', spd.donationId);
        return;
      }

      // Get blockchain data
      const web3Service = Web3Service.service;
      const sortesContract = web3Service.contracts?.sortes;

      if (!sortesContract) {
        console.error('Sortes contract not found');
        setDonationData(donation);
        return;
      }

      const abiDonations = await sortesContract.getDonations([donation.id]);
      const abiDonation = abiDonations[0];

      let extendedDonation = donation;
      if (abiDonation) {
        const parseBigNumber = (value: any): number =>
          value?.toNumber ? value.toNumber() : value;

        extendedDonation = {
          ...donation,
          blockchainId: parseBigNumber(abiDonation[0]),
          recipient_address: abiDonation[2],
          amount: parseBigNumber(abiDonation[3]),
          startTime: parseBigNumber(abiDonation[4]),
          endTime: parseBigNumber(abiDonation[5]),
          isActive: abiDonation[6],
          isExecuted: abiDonation[7],
        } as any;
      }

      setDonationData(extendedDonation);

      // Get recipient data
      if (donation.recipientId) {
        try {
          const recipientData = await getRecipientById(donation.recipientId);
          setRecipient(recipientData);
        } catch (error) {
          console.error('Failed to fetch recipient:', error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch donation data:', error);
    } finally {
      setLoading(false);
    }
  }, [spd?.donationId, isWeb3ServiceInited]);

  // Fetch donation data when SPD changes
  useEffect(() => {
    if (spd?.donationId && isWeb3ServiceInited) {
      fetchDonationData();
    }
  }, [spd?.donationId, isWeb3ServiceInited, fetchDonationData]);

  // Helper functions for ProposalCard
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

  // Process donation data for ProposalCard
  const processedDonation = useMemo(() => {
    if (!donationData) return null;

    const donation = donationData;
    const donationId = donation.id || 'unknown';
    const proposalId = donation.blockchainId || donation.id || 'N/A';

    // Calculate status info
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

    // Calculate amount info
    const amountInfo = {
      usdAmount: expToUsd(donation.amount) || 0,
      expCurrent: donation.amount * 0.0001 || 0,
      expTotal: UsdToExp(donation.donationAmount) || 0,
    };

    // Calculate button info
    const buttonInfo = {
      shouldShowDonate:
        donation.creator === Web3Service.service?.address &&
        amountInfo.usdAmount > 360 &&
        !donation.isExecuted &&
        donation.isActive,
      shouldShowVote: false, // No vote button in PlayCommon
    };

    return {
      ...donation,
      donationId,
      recipient,
      proposalId,
      statusInfo,
      amountInfo,
      buttonInfo,
      // Override name to match SPD name for consistency
      name:
        spd?.name ||
        recipient?.name ||
        donation.recipient_name ||
        donation.name,
      recipient_name:
        spd?.name ||
        recipient?.name ||
        donation.recipient_name ||
        donation.name,
      // Merge recipient data fields
      recipient_type:
        recipient?.type || donation.recipient_type || donation.type,
      recipient_category:
        recipient?.category || donation.recipient_category || donation.category,
      recipient_donationAddress:
        recipient?.donationAddress ||
        donation.recipient_donationAddress ||
        donation.recipient_address ||
        donation.donation_address,
      recipient_website:
        recipient?.website || donation.recipient_website || donation.website,
      recipient_twitter:
        recipient?.twitter ||
        donation.recipient_twitter ||
        donation.twitter ||
        donation.social_media,
      recipient_verified:
        recipient?.verified ?? donation.recipient_verified ?? false,
      // Use recipient's introduction if available, otherwise use existing description/introduction
      description:
        recipient?.introduction ||
        donation.description ||
        donation.introduction,
      introduction:
        recipient?.introduction ||
        donation.description ||
        donation.introduction,
    };
  }, [donationData, recipient, spd]);

  // Handle vote click
  const handleVoteClick = useCallback((donationId: string) => {
    // TODO: Implement vote functionality for SPD
    console.log('Vote clicked for donation:', donationId);
  }, []);

  // Memoize proposal card visibility condition
  const shouldShowProposalCard = useMemo(() => {
    return !!(spd && processedDonation && !loading);
  }, [spd, processedDonation, loading]);

  // preload images
  useEffect(() => {
    const imgs = [rewardBgExp, rewardBgSatoshi, rewardBgTaiko, rewardBgWBTC];
    Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            const image = new Image();
            image.src = img;
            image.onload = resolve;
            image.onerror = resolve;
          })
      )
    );
  }, []);

  return (
    <div className="min-h-[calc(100svh-300px)] bg-mainV1 pb-16 pt-10 text-center max-sm:px-4 max-sm:pb-5 max-sm:pt-0">
      <div className="mx-auto flex w-[1100px] flex-col overflow-visible max-sm:w-full">
        <div className="mb-20 mt-5 max-sm:mb-[48px]">
          <DrawPanel
            probabilityTable={probabilityTable}
            spd={spd}
            hasProposalCard={shouldShowProposalCard}
          />

          {/* Show related donation proposal for SPD */}
          {shouldShowProposalCard && (
            <div className="flex flex-col items-center">
              <div className="w-[1100px] text-left max-sm:w-full">
                <ProposalCard
                  donation={processedDonation}
                  isCharity={false}
                  onVoteClick={handleVoteClick}
                  formatAddress={formatAddress}
                  formatProposalDuration={formatProposalDuration}
                  getTimeRemaining={getTimeRemaining}
                />
              </div>
            </div>
          )}

          {probabilityTable && (
            <ProcessingPlays probabilityTable={probabilityTable} />
          )}
        </div>

        <button
          onClick={() => {
            // Check if current path is from SPD tables
            const isFromSpdTables = location.pathname.includes('/spd-tables/');
            const targetUrl = isFromSpdTables ? '/play?spd-tables' : '/play';
            navigate(targetUrl);
          }}
          className="flex w-full items-center justify-center rounded-full bg-white py-[23px] text-center text-2xl font-bold leading-none text-mainV1 max-sm:text-lg"
        >
          Check All Prize Tables
          <i className="iconfont icon-arrow-top-right mb-2 ml-2 max-sm:mb-1"></i>
        </button>

        <div className="mt-20 flex flex-col max-sm:mt-[48px]">
          <span className="mb-6 text-left text-2xl font-bold text-white max-sm:mb-8">
            Play History
          </span>
          {/***
             *
          <div className="mb-3 flex max-w-full flex-col gap-4 overflow-x-auto max-sm:justify-start sm:flex-row sm:items-center sm:justify-between sm:gap-0 md:overflow-visible">
            <StatisticItem
              label="Prize Won (Excl. EXP)"
              value="≈ $7,5319.92"
              tooltipText="Total prize value received from all non-EXP rewards."
            />
            <StatisticItem
              label="Win Rate (Excl. EXP)"
              value="58.23%"
              tooltipText="Percentage of your past draws that hit non-EXP prizes."
            />
            <StatisticItem
              label="Actual Return ($1)"
              value="$3.6"
              tooltipText="Average return per $1 ticket based on historical draw results."
            />
          </div>
             */}
          <PlayHistory />
        </div>
      </div>
      {probabilityTable && (
        <CongratulationsPopup probabilityTable={probabilityTable} />
      )}
    </div>
  );
};

export default PlayCommon;
