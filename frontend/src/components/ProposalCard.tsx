import { FC, useState } from 'react';
import { type Recipient } from '../services/api/governance';
import CertificationSvg from '../assets/svg/certification.svg';
import {
  transactionHash2Url,
  address2Url,
  padToSixDigits,
} from '../utils/format';
import { showSucc, showError } from '../utils/notify';
import ProgressBar from '../pages/Governance/ProgressBar';
import ActionButton from './ActionButton';
import { Web3Service } from '../services/web3';

interface ProcessedDonation {
  id?: string;
  blockchainId?: string;
  recipient_name?: string;
  name?: string;
  endTime?: number;
  end_time?: number;
  startTime?: number;
  start_time?: number;
  donationAmount?: number;
  recipient_type?: string;
  recipient_category?: string;
  recipient_donationAddress?: string;
  recipient_website?: string;
  recipient_twitter?: string;
  recipient_verified?: boolean;
  type?: string;
  category?: string;
  recipient_address?: string;
  donation_address?: string;
  website?: string;
  twitter?: string;
  social_media?: string;
  proposalTxId?: string;
  transaction_hash?: string;
  tx_hash?: string;
  description?: string;
  introduction?: string;
  purpose?: string;
  isExecuted?: boolean;
  isActive?: boolean;
  amount?: number;
  creator?: string;
  recipientId?: string;
  donationId: string;
  proposalId: string;
  statusInfo: {
    display: string;
    color: string;
  };
  amountInfo: {
    usdAmount: number;
    expCurrent: number;
    expTotal: number;
  };
  buttonInfo: {
    shouldShowDonate: boolean;
    shouldShowVote: boolean;
  };
  recipient?: Recipient | null;
}

interface ProposalCardProps {
  donation: ProcessedDonation;
  isCharity?: boolean;
  onVoteClick?: (donationId: string) => void;
  formatAddress: (address: string) => string;
  formatProposalDuration: (startTime: number, endTime: number) => string;
  getTimeRemaining: (endTimestamp: number) => string;
}

const ProposalCard: FC<ProposalCardProps> = ({
  donation,
  isCharity = false,
  onVoteClick,
  formatAddress,
  formatProposalDuration,
  getTimeRemaining,
}) => {
  const [isDetailShown, setIsDetailShown] = useState(false);
  const { donationId, proposalId } = donation;
  const isLoadingRecipient = false; // No longer have internal loading state

  const toggleDetail = () => {
    setIsDetailShown((prev) => !prev);
  };

  // Handle copy proposal ID to clipboard
  const handleCopyProposalId = async (
    proposalId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Prevent event bubbling
    try {
      await navigator.clipboard.writeText(proposalId);
      showSucc('Proposal ID copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy proposal ID:', error);
      showSucc('Failed to copy proposal ID');
    }
  };

  const handleDonateClick = async (donation: ProcessedDonation) => {
    try {
      // Get Web3 service instance
      const web3Service = Web3Service.service;

      if (!web3Service) {
        return;
      }

      // Get sortes contract instance
      const sortesContract = web3Service.contracts?.sortes;
      if (!sortesContract) {
        console.error('Sortes contract not found');
        return;
      }

      // Ensure donationId is number type
      const donationId = parseInt(donation.id || donation.blockchainId || '');
      if (isNaN(donationId)) {
        return;
      }

      // Call contract's closeDonation function
      const tx = await sortesContract.closeDonation(donationId, {
        gasLimit: 300000, // Set sufficient gas limit
      });

      // Wait for transaction confirmation
      await tx.wait();

      // Show success message
      showSucc('success');
    } catch (error: any) {
      console.error(error);

      // Show error message
      showError(error.message || 'unknown error');
    }
  };

  return (
    <div key={donationId}>
      {/* Desktop view */}
      {!isCharity && (
        <div className="flex justify-center bg-white">
          <div className="h-[2px] w-[1000px] border-none bg-gray-200 max-sm:mx-4 max-sm:w-full"></div>
        </div>
      )}

      <article
        className={`mb-4 flex cursor-pointer flex-col items-center ${
          isCharity ? 'rounded-2xl border-[1px] border-mainV1' : 'rounded-b-2xl'
        } bg-white max-sm:hidden`}
      >
        <div
          onClick={toggleDetail}
          className={`inline-flex w-[1100px] items-center justify-between gap-2.5 p-6 ${isCharity ? 'px-6' : 'px-[50px]'} max-sm:w-[350px]`}
        >
          <section className="flex w-[280px] flex-col gap-[10px]">
            <h3 className="font-normal">
              Proposal by
              {formatAddress(donation.creator || '')}
            </h3>
            <div className="flex items-center gap-2">
              {donation.recipient_verified && (
                <img
                  className="h-[21px] w-[18px] flex-shrink-0"
                  src={CertificationSvg}
                  alt="Verified"
                />
              )}
              <h2 className="overflow-hidden text-ellipsis whitespace-nowrap text-xl font-bold text-black">
                {donation.recipient_name ||
                  donation.name ||
                  'Unknown Recipient'}
              </h2>
            </div>
          </section>
          <section className="flex w-[200px] flex-col gap-[10px]">
            <h3 className="font-normal">
              {donation.statusInfo.display === 'Donated'
                ? 'Voting closed'
                : getTimeRemaining(donation.endTime || donation.end_time || 0)}
            </h3>
            <p className={`text-xl font-bold ${donation.statusInfo.color}`}>
              {donation.statusInfo.display}
            </p>
          </section>
          <section className="flex flex-col gap-[10px]">
            <h3 className="font-normal">Donation Amount</h3>
            <p className="text-xl font-bold text-black">
              ${donation.donationAmount || 0}
            </p>
          </section>
          <section className="flex flex-col justify-end gap-[10px]">
            <h3 className="text-right font-normal">
              {donation.amountInfo.expCurrent || 0}/
              {donation.amountInfo.expTotal || 0} EXP
            </h3>

            <ProgressBar
              width="w-[300px]"
              value={donation.amountInfo.expCurrent || 0}
              max={donation.amountInfo.expTotal || 1}
            />
          </section>
        </div>
        {!isCharity && !isDetailShown && (
          <div
            onClick={toggleDetail}
            className={`mx-auto mb-6 inline-flex w-[1000px] items-center justify-center gap-24 self-stretch rounded-lg bg-sky-50 py-3`}
          >
            <div className="justify-start text-sm font-normal text-blue-500">
              Check More Details
            </div>
          </div>
        )}
        {isDetailShown && (
          <>
            <hr
              className={`mb-6 h-0 ${isCharity ? 'w-[1052px]' : 'w-[1000px]'} outline outline-1 outline-offset-[-0.50px] outline-gray-200 max-sm:w-[350px]`}
            />
            <div
              className={`flex w-full flex-col gap-[50px] ${isCharity ? 'px-6' : 'px-[50px]'}`}
            >
              <section className="flex w-full">
                <div className="flex w-[500px] flex-col space-y-[10px]">
                  <h1 className="text-balance font-normal">Recipient Type</h1>
                  <h1 className="text-xl font-bold text-black">
                    {donation.recipient_type || donation.type || 'Unknown Type'}
                  </h1>
                </div>
                <div className="flex flex-col space-y-[10px]">
                  <h1 className="text-balance font-normal">
                    Donation Category
                  </h1>
                  <h1 className="text-xl font-bold text-black">
                    {donation.recipient_category ||
                      donation.category ||
                      'Unknown Category'}
                  </h1>
                </div>
              </section>
              <section className="flex w-full">
                <div className="flex w-[500px] flex-col space-y-[10px]">
                  <h1 className="text-balance font-normal">Donation Address</h1>
                  <a
                    href={address2Url(
                      donation.recipient_donationAddress ||
                        donation.recipient_address ||
                        donation.donation_address ||
                        ''
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer justify-start text-xl font-normal text-blue-500 underline hover:text-blue-700"
                  >
                    {formatAddress(
                      donation.recipient_donationAddress ||
                        donation.recipient_address ||
                        donation.donation_address ||
                        ''
                    )}
                  </a>
                </div>
                <div className="flex w-[500px] flex-col space-y-[10px]">
                  <h1 className="text-balance font-normal">Website</h1>
                  <div className="justify-start text-xl font-normal text-blue-500 underline">
                    {donation.recipient_website || donation.website ? (
                      <a
                        href={donation.recipient_website || donation.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-700"
                      >
                        {(
                          donation.recipient_website || donation.website
                        )?.slice(0, 30)}
                        {(donation.recipient_website || donation.website)
                          ?.length || 0 > 30
                          ? '...'
                          : ''}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
              </section>
              <section className="flex w-full">
                <div className="flex w-[500px] flex-col space-y-[10px]">
                  <h1 className="text-balance font-normal">Twitter</h1>
                  <div className="justify-start text-xl font-normal text-blue-500 underline">
                    {donation.recipient_twitter ||
                    donation.twitter ||
                    donation.social_media ? (
                      <a
                        href={
                          donation.recipient_twitter ||
                          donation.twitter ||
                          donation.social_media
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-700"
                      >
                        {(
                          donation.recipient_twitter ||
                          donation.twitter ||
                          donation.social_media
                        )?.slice(0, 40)}
                        {(
                          donation.recipient_twitter ||
                          donation.twitter ||
                          donation.social_media
                        )?.length || 0 > 40
                          ? '...'
                          : ''}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
              </section>
              <section className="flex w-full">
                <div className="flex w-[500px] flex-col space-y-[10px]">
                  <h1 className="text-balance font-normal">Proposal ID</h1>

                  <section className="flex space-x-4">
                    <h1 className="text-xl font-bold text-black">
                      {padToSixDigits(proposalId)}
                    </h1>
                    <ActionButton
                      text="Copy"
                      onClick={(e) => handleCopyProposalId(proposalId, e)}
                    />
                  </section>
                </div>
              </section>
              <section className="flex w-full">
                <div className="flex flex-col">
                  <h1 className="text-balance font-normal">Proposal TxID</h1>
                  <a
                    href={transactionHash2Url(
                      donation.proposalTxId ||
                        donation.transaction_hash ||
                        donation.tx_hash ||
                        ''
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer justify-start text-xl font-normal text-blue-500 underline hover:text-blue-700"
                  >
                    {formatAddress(
                      donation.proposalTxId ||
                        donation.transaction_hash ||
                        donation.tx_hash ||
                        ''
                    )}
                  </a>
                </div>
              </section>

              <section>
                <h1 className="text-balance text-xl font-normal">
                  Introduction
                </h1>
                <div
                  className={`mt-[10px] inline-flex ${isCharity ? 'w-[1052px]' : 'w-[1000px]'} items-start justify-start gap-20 overflow-hidden rounded-lg bg-white px-4 py-3 outline outline-1 outline-gray-200`}
                >
                  <div className="h-28 w-[1020px] justify-start">
                    {isLoadingRecipient ? (
                      <span className="text-base font-normal text-neutral-500">
                        Loading recipient details...
                      </span>
                    ) : (
                      <span className="text-base font-normal text-neutral-800">
                        {donation.description ||
                          donation.introduction ||
                          'No description available for this donation proposal.'}
                      </span>
                    )}
                  </div>
                </div>
              </section>
              <section>
                <h1 className="text-balance text-xl font-normal">
                  Donation Purpose
                </h1>
                <div
                  className={`${isCharity ? 'w-[1052px]' : 'w-[1000px]'} mt-[10px] inline-flex items-start justify-start gap-20 overflow-hidden rounded-lg bg-white px-4 py-3 outline outline-1 outline-gray-200`}
                >
                  <div className="h-28 w-[1020px] justify-start">
                    {isLoadingRecipient ? (
                      <span className="text-base font-normal text-neutral-500">
                        Loading recipient details...
                      </span>
                    ) : (
                      <span className="text-base font-normal text-neutral-800">
                        {donation.purpose}
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </div>
            <section className="my-6 flex space-x-[30px]">
              {donation.buttonInfo.shouldShowDonate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDonateClick(donation);
                  }}
                  className="inline-flex h-12 w-48 items-center justify-center gap-2.5 rounded-lg bg-amber-500 px-7 py-5 text-base font-bold text-white"
                >
                  Donate Now
                </button>
              )}
              {donation.buttonInfo.shouldShowVote && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVoteClick?.(donationId);
                  }}
                  className="inline-flex h-12 items-center justify-center gap-2.5 rounded-lg bg-[#93DC08] px-7 py-5 text-base font-bold text-white"
                >
                  Vote with EXP
                </button>
              )}
            </section>
          </>
        )}
      </article>

      {/* Mobile view */}
      <article
        className={`bg-white p-4 md:hidden ${
          isCharity ? 'rounded-lg' : 'rounded-b-lg'
        }`}
      >
        <div onClick={toggleDetail} className="flex justify-between">
          <section className="flex flex-col gap-1">
            <h3 className="text-xs font-normal">
              Proposal by
              {formatAddress(donation.creator || '')}
            </h3>
            <h2 className="flex items-center gap-1 text-sm font-bold">
              {donation.recipient_verified && (
                <img
                  className="h-4 w-[10px] flex-shrink-0"
                  src={CertificationSvg}
                  alt="Verified"
                />
              )}
              {(() => {
                const name =
                  donation.recipient_name ||
                  donation.name ||
                  'Unknown Recipient';
                return name.length > 15 ? name.slice(0, 15) + '...' : name;
              })()}
            </h2>
          </section>
          <section className="flex flex-col items-end gap-1">
            <h3 className="text-xs font-normal">
              {donation.statusInfo.display === 'Donated'
                ? 'Voting closed'
                : getTimeRemaining(donation.endTime || donation.end_time || 0)}
            </h3>
            <p className={`text-sm font-bold ${donation.statusInfo.color}`}>
              {donation.statusInfo.display}
            </p>
          </section>
        </div>
        {!isCharity && !isDetailShown && (
          <div
            onClick={toggleDetail}
            className="mx-auto mt-4 inline-flex w-full items-center justify-center gap-24 self-stretch rounded-lg bg-sky-50 py-2"
          >
            <div className="justify-start text-sm font-normal text-blue-500">
              Check More Details
            </div>
          </div>
        )}
        {isDetailShown && (
          <>
            <hr className="my-[10px] h-0 w-full outline outline-1 outline-offset-[-0.50px] outline-gray-200" />

            <div className="flex flex-col gap-4">
              <section className="mb-3">
                <h3 className="text-right text-sm font-normal">
                  {donation.amountInfo.expCurrent || 0}/
                  {donation.amountInfo.expTotal || 0} EXP
                </h3>
                <ProgressBar
                  value={donation.amountInfo.expCurrent || 0}
                  max={donation.amountInfo.expTotal || 1}
                />
              </section>
              <section className="flex flex-col gap-1">
                <h3 className="text-[10px] font-normal">Donation Amount</h3>
                <h2 className="text-sm font-bold text-black">
                  ${donation.amountInfo.usdAmount || 0}
                </h2>
              </section>
              <section className="flex flex-col gap-1">
                <h3 className="text-[10px] font-normal">Donation Category</h3>
                <h2 className="text-sm font-bold text-black">
                  {donation.recipient_category || donation.category || 'Other '}
                </h2>
              </section>

              {(donation.recipient_website || donation.website) && (
                <section className="flex flex-col gap-1">
                  <h3 className="text-[10px] font-normal">Website</h3>
                  <h2 className="text-sm font-bold">
                    <a
                      className="justify-start text-sm font-normal text-blue-500 underline"
                      href={donation.recipient_website || donation.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {(donation.recipient_website || donation.website)!
                        .length > 15
                        ? `${(donation.recipient_website || donation.website)!.slice(0, 12)}…${(donation.recipient_website || donation.website)!.slice(-4)}`
                        : donation.recipient_website || donation.website}
                    </a>
                  </h2>
                </section>
              )}
              {(donation.recipient_twitter || donation.twitter) && (
                <section className="flex flex-col gap-1">
                  <h3 className="text-[10px] font-normal">Twitter</h3>
                  <h2 className="text-sm font-bold">
                    <a
                      className="justify-start text-sm font-normal text-blue-500 underline"
                      href={donation.recipient_twitter || donation.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {(donation.recipient_twitter || donation.twitter)!
                        .length > 15
                        ? `${(donation.recipient_twitter || donation.twitter)!.slice(0, 12)}…${(donation.recipient_twitter || donation.twitter)!.slice(-4)}`
                        : donation.recipient_twitter || donation.twitter}
                    </a>
                  </h2>
                </section>
              )}
              <section className="flex flex-col gap-1">
                <h3 className="text-[10px] font-normal">Funding Window</h3>

                <section className="flex items-center gap-1">
                  <h2 className="text-sm font-bold">
                    {formatProposalDuration(
                      donation.startTime || donation.start_time || 0,
                      donation.endTime || donation.end_time || 0
                    )}
                  </h2>
                </section>
              </section>
              <section className="flex flex-col gap-1">
                <h3 className="text-[10px] font-normal">Proposal ID</h3>

                <section className="flex items-center gap-1">
                  <h2 className="text-sm font-bold">{proposalId}</h2>
                  <ActionButton
                    text="Copy"
                    onClick={(e) => handleCopyProposalId(proposalId, e)}
                  />
                </section>
              </section>
              <section className="flex flex-col gap-1">
                <h3 className="text-[10px] font-normal">Proposal TxID</h3>
                <a
                  href={transactionHash2Url(
                    donation.proposalTxId ||
                      donation.transaction_hash ||
                      donation.tx_hash ||
                      ''
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer justify-start text-sm font-normal text-blue-500 underline hover:text-blue-700"
                >
                  {formatAddress(
                    donation.proposalTxId ||
                      donation.transaction_hash ||
                      donation.tx_hash ||
                      ''
                  )}
                </a>
              </section>
              <section className="flex flex-col gap-1">
                <h3 className="text-[10px] font-normal">Introduction</h3>
                <div className="rounded-md border border-gray-200 p-2 text-[10px] font-normal">
                  {donation.description || donation.introduction || ''}
                </div>
              </section>
              {donation.purpose && (
                <section className="flex flex-col gap-1">
                  <h3 className="text-[10px] font-normal">Donation Purpose</h3>
                  <div className="rounded-md border border-gray-200 p-2 text-[10px] font-normal">
                    {donation.purpose}
                  </div>
                </section>
              )}
              <section className="flex justify-center gap-2">
                {donation.buttonInfo.shouldShowDonate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDonateClick(donation);
                    }}
                    className="inline-flex items-center justify-center gap-2.5 rounded-md bg-amber-500 px-[10px] py-2 text-xs font-bold text-white"
                  >
                    Donate Now
                  </button>
                )}
                {donation.buttonInfo.shouldShowVote && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVoteClick?.(donationId);
                    }}
                    className="inline-flex items-center justify-center gap-2.5 rounded-md bg-blue-500 px-[10px] py-2 text-xs font-bold text-white"
                  >
                    Vote with EXP
                  </button>
                )}
              </section>
            </div>
          </>
        )}
      </article>
    </div>
  );
};

export default ProposalCard;
