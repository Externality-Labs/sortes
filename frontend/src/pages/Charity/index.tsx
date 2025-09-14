import { useState } from 'react';
import { useCharityBalance } from '../../hooks/balance';

import getMoenyImg from '../../assets/images/charity/getMoney.png';
import touchHeart from '../../assets/images/charity/touchHeart.png';

import { formatUSD } from '../../utils/format';

import DonationHistory from './DonationHistory';
import { useDonations } from '../../hooks/governance';
import ProposalsItem from '../Governance/ProposalsItem';
import VotePopup from '../Governance/VotePopup';

export const CharityPage = () => {
  const { totalFunds, donatedFunds, fundsToDonate } = useCharityBalance();

  const { allDonations, donationRecipientMap, fetchDonationsData } =
    useDonations('allProposals');

  // Vote popup state
  const [showVotePopup, setShowVotePopup] = useState<boolean>(false);
  const [selectedDonationId, setSelectedDonationId] = useState<string>('');
  const [currentDonation, setCurrentDonation] = useState<any>(null);

  // Handle vote button click
  const handleVoteClick = (donationId: string) => {
    setSelectedDonationId(donationId);
    setShowVotePopup(true);
    setCurrentDonation(
      allDonations.find((donation) => donation.id === donationId)
    );
  };

  if (fundsToDonate === null) return null;

  return (
    <div className="pb-[30px] max-sm:bg-mainV1 md:pb-20">
      {/* pc header */}
      <header className="hidden w-full justify-center bg-mainV1 pb-[100px] pt-24 text-white max-sm:pt-8 md:flex">
        <div className="relative flex w-[1140px] flex-col max-sm:w-full max-sm:px-6">
          <span className="flex space-x-[10px] text-4xl">
            <span className="max-sm:text-lg">Total Charity Funds:</span>
            <span className="text-[#FFA41B]">{formatUSD(totalFunds)}</span>
          </span>
          <div className="mt-[30px] flex space-x-[50px]">
            <div className="flex text-2xl">
              <span>Donated Funds: &nbsp;</span>
              <span className="text-[#FFA41B]">{formatUSD(donatedFunds)}</span>
            </div>
            <div className="flex text-2xl">
              <span>Funds to be Donated: &nbsp;</span>
              <span className="text-[#FFA41B]">{formatUSD(fundsToDonate)}</span>
            </div>
          </div>
          <span className="mt-5 text-xl font-normal max-sm:text-sm">
            This charity fund will be governed by the community and contribute
            to the social welfare.
          </span>

          <img
            src={getMoenyImg}
            alt=""
            width={128}
            height={93}
            className="absolute -top-[22px] right-[115px] mx-auto mt-[100px]"
          />
          <img
            src={touchHeart}
            alt=""
            width={121}
            height={74}
            className="absolute -right-[17px] -top-[140px] mx-auto mt-[100px]"
          />
        </div>
      </header>

      {/* 移动端header */}
      <header className="flex w-full justify-center bg-mainV1 pb-10 pt-[30px] text-white md:hidden md:pb-[100px]">
        <div className="relative mx-3 overflow-hidden rounded-lg max-sm:w-full">
          <div
            className="rounded-lg p-[2px]"
            style={{
              background: 'linear-gradient(45deg, #FA48E8, #FFDD17, #93DC08)',
            }}
          >
            <div className="flex flex-col rounded-lg bg-mainV1 p-[14px]">
              <section className="flex flex-nowrap space-x-2 text-sm leading-[17px]">
                <span className=" ">Total Charity Funds:</span>
                <span className="text-nowrap text-[#FFA41B]">
                  {formatUSD(totalFunds)}{' '}
                </span>
              </section>

              <section className="mt-[2px] flex space-x-4 text-[10px] leading-[12px]">
                <span className="flex h-3 leading-[12px]">
                  <span>Donated Funds: &nbsp;</span>
                  <span className="text-nowrap leading-[12px] text-[#FFA41B]">
                    {formatUSD(donatedFunds)}
                  </span>
                </span>
                <span className="flex h-3 leading-[12px]">
                  <span>Funds to be Donated: &nbsp;</span>
                  <span className="text-nowrap leading-[12px] text-[#FFA41B]">
                    {formatUSD(fundsToDonate)}
                  </span>
                </span>
              </section>
              <section className="mt-1 text-[8px] font-normal leading-[10px]">
                This charity fund will be governed by the community and
                contribute to the social welfare.
              </section>
            </div>
          </div>
        </div>
      </header>

      {/* history */}
      <div>
        <section className="mx-auto w-full px-5 max-sm:bg-mainV1 md:flex md:flex-col md:items-center">
          <div className="md:mt-[60px] md:w-[1100px]">
            <h1 className="text-lg font-bold leading-[29px] text-white md:text-4xl md:leading-[48px] md:text-mainV1">
              Donation History
            </h1>
          </div>
          <div className="flex justify-center text-center font-bold text-mainV1 max-sm:mb-[30px] max-sm:mt-5 sm:mt-[30px] sm:text-left md:w-[1100px]">
            <DonationHistory />
          </div>
        </section>

        <section className="mx-auto my-[60px] w-full px-5 max-sm:my-9 max-sm:bg-mainV1 md:flex md:flex-col md:items-center">
          <div className="mb-10 flex items-center justify-start text-left text-4xl font-bold text-violet-500 underline max-sm:mb-4 max-sm:text-lg max-sm:text-white md:w-[1100px]">
            Make a Donation
            <i
              className="iconfont icon-link ml-[10px] cursor-pointer text-3xl leading-none max-sm:ml-1 max-sm:text-lg max-sm:font-normal"
              onClick={() => {
                window.open('/governance', '_blank');
              }}
            ></i>
          </div>
          <div className="md:w-[1100px]">
            <ProposalsItem
              isCharity={true}
              data={allDonations.slice(0, 3)}
              onVoteClick={handleVoteClick}
              recipientMap={donationRecipientMap}
            />
          </div>
          <button className="mt-4 w-full max-w-[1100px] rounded-2xl border border-emerald-200 bg-[#F3F9FF] px-6 py-4 focus:outline-none max-sm:rounded-xl max-sm:py-[10px]">
            <a
              href="/governance"
              target="_blank"
              className="text-2xl font-bold text-blue-500 max-sm:text-sm"
            >
              Check All Proposals
            </a>
          </button>
        </section>
        <section className="mx-auto w-full px-5 sm:w-[1140px]">
          <div className="md:mt-[60px] md:w-[1100px]">
            <h1 className="text-lg font-bold leading-[29px] text-white md:text-4xl md:leading-[48px] md:text-mainV1">
              Trustless Social Welfare System
            </h1>
            <div className="mt-10 rounded-[16px] border-2 border-[#7B61FF] bg-white p-4 text-sm font-normal leading-[30px] text-[#666] max-sm:mt-5 md:p-10 md:text-xl md:leading-[42px]">
              <h1>
                We see Sortes as more than just a prize platform. It's set to be
                an agent of change in our evolving cyber society. Purchasing
                tickets here isn't just about winning prizes - it's about
                contributing to a digital society. These contributions are
                essential for constructing our network state. Hence, Sortes
                holds a central position in this cyber society. Beyond
                dispensing rewards, it encourages civic involvement and
                contribution, becoming a critical tool for accelerating our
                digital society's growth.
              </h1>
              <h1 className="mt-6">
                Our goal is to embody this essence - inclusive, just, and
                transparent in both creating and sharing prosperity. We're
                excited to have you, digital explorer.
              </h1>
            </div>
          </div>
        </section>
      </div>

      {/* Vote Popup */}
      <VotePopup
        currentDonation={currentDonation}
        donationId={selectedDonationId}
        visible={showVotePopup}
        setVisible={setShowVotePopup}
        onSuccess={fetchDonationsData}
      />
    </div>
  );
};
