import { FunctionComponent } from 'react';
import Card from './Card';
import { useLocker } from '../../hooks/locker';
import { Progress } from './Progress';
import { formatGood } from '../../utils/format';
import Links from '../../utils/links';

interface TokenPageProps {}

const tokenIntro = [
  {
    title: 'About EXP',
    children: (
      <>
        · EXP is the <span className="font-bold">point reward</span> you'll get
        through every play. Your EXP holdings determine your user level.
        <br />
        · EXP has an unlimited supply.
        <br />· EXP can be exchanged for SORTES, which is the Official Token of
        Sortes, using the Constant Product Invariant model.
      </>
    ),
  },
  {
    title: 'How to get EXP',
    children: (
      <>
        <h1 className="font-bold">Play to Earn</h1>
        1. As long as you participate in the play, every draw will guarantee you
        10 times your ticket denomination in EXP. However, if your prize is not
        EXP, this participation bonus will not appear in the winning results
        popup but can be viewed on the blockchain explorer. <br />
        2. For users who only win the EXP prize, an extra amount of EXP equal to
        10 times your ticket denomination will be given uniformly. This amount
        will be directly included in your winning amount and will not be
        prompted separately.
        <h1 className="font-bold"> Governance Voting</h1>
        You will receive varying amounts of EXP through every vote you have cast
        on the Sortes community.
      </>
    ),
  },
  {
    title: 'About SORTES',
    children: (
      <>
        · SORTES is the <span className="font-bold">Offical Token</span> issued
        by Sortes. It can be only exchanged by EXP.
        <br />
        · SORTES exchange follows the Constant Product Invariant model. <br />·
        SORTES has a <span className="font-bold">limited supply</span>, with a
        maximum of <span className="font-bold">30 million SORTES</span>&nbsp;
        available through gameplay (~30% of the total supply). <br />· SORTES
        also grants access to governance voting and future airdrop claims.
      </>
    ),
  },
  {
    title: 'SORTES Utility',
    children: (
      <>
        <h1 className="font-bold">Claim for Airdrop</h1>
        Soon, Sortes will hold colorful airdrop campaigns to reward active
        contributors and participants in our community. At that time, there will
        be 2 ways of using SORTES to get airdrop reward: <br />
        1. Based on your current position quantity of SORTES, a certain number
        of airdrops can be claimed through claiming page. <br />
        2. By completing specific tasks (such as participating in community
        activities), combined with your SORTES holding level, you can also claim
        the airdrop rewards.
        <h1 className="font-bold"> Governance Voting</h1>
        1. Determine the use of charitable funds: where or who the donations
        will go. <br />
        2. Vote for the protocol upgrade plan: decide which blockchain to deploy
        or which features will be added to our product to-do list, etc.
      </>
    ),
  },
];
const Tokennomic = [
  {
    title: 'Token Supply',
    children: (
      <>
        · EXP has an <span className="font-bold">unlimited supply</span>.
        <br />· SORTES has a <span className="font-bold">limited supply</span>,
        with a maximum of 30 million SORTES available through gameplay (~30% of
        the total supply).
        <br />
      </>
    ),
  },
  {
    title: 'EXP exchange to SORTES',
    children: (
      <>
        · SORTES is the <span className="font-bold">Offical Token</span> issued
        by Sortes. It can be only exchanged by EXP. <br />· The amount of SORTES
        received is determined by the Constant Product Invariant formula and the
        reserves of both tokens.
        <br />· EXP can be exchanged for SORTES, which is the Official Token of
        Sortes, using the Constant Product Invariant model.
      </>
    ),
  },
  {
    title: 'Claim SORTES (Unlocking Rules)',
    children: (
      <>
        · Exchanged SORTES will be fully locked automatically and unlocked
        linearly over 1 year.
        <br />· You can claim the unlocked portion at any time, but any
        remaining locked SORTES will be reclaimed and cannot be claimed anymore.
      </>
    ),
  },
  {
    title: 'Token Value Relationship',
    children: (
      <>
        · Token value relationship between EXP and SORTES determined by the
        &nbsp;
        <span className="font-bold">Constant Product Invariant</span>.
      </>
    ),
  },
];
const TokenPage: FunctionComponent<TokenPageProps> = () => {
  const {
    claimableAmount,
    lockedAmount,
    receivedAmount,
    claimedAmount,
    claimAll,
  } = useLocker();

  console.log(claimableAmount, lockedAmount, receivedAmount, claimedAmount);

  return (
    <main className="bg-mainV1 pt-5 max-sm:px-3 md:pt-20">
      <section className="text-md flex w-full items-center justify-center font-medium">
        <div className="flex flex-col rounded-lg bg-white p-5 md:w-[1073px]">
          <span className="mb-14 text-lg font-bold text-mainV1">
            Claim GOOD
          </span>
          <Progress
            claimable={claimableAmount}
            claimed={claimedAmount}
            locked={lockedAmount}
          />
          <div className="mt-5 flex justify-between">
            <span className="text-[#99A5B8]">Unlocked / Total</span>
            <span className="text-mainV1">
              <span className="text-[##93DC08]">
                {formatGood(claimedAmount)}
              </span>
              <span>
                {' '}
                / {formatGood(receivedAmount)} (~
                {((claimedAmount / receivedAmount) * 100).toFixed(1)}%)
              </span>
            </span>
          </div>
          <div className="mt-2 flex justify-between">
            <div className="flex items-center gap-1 text-[#99A5B8]">
              <div className="h-3 w-3 rounded-full bg-[#E9ECF5]"></div>
              <span>Remaining Locked</span>
            </div>
            <span className="text-mainV1">{formatGood(lockedAmount)}</span>
          </div>
          <div className="mt-2 flex justify-between gap-2">
            <div className="flex flex-1 flex-col rounded-lg border border-mainV1 bg-[#F6F9FF] p-2 text-[#99A5B8]">
              <div className="mb-2 flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-mainV1"></div>
                <span>Total Claimed</span>
              </div>
              <div className="flex items-center justify-end">
                <span className="text-xl font-bold text-mainV1">
                  {formatGood(claimedAmount)}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col rounded-lg border border-[#93DC08] bg-[#F6F9FF] p-2 text-[#99A5B8]">
              <div className="mb-2 flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-[#93DC08]"></div>
                <span>Total Claimable</span>
              </div>
              <div className="flex items-center justify-end">
                <span className="text-xl font-bold text-[#93DC08]">
                  {formatGood(claimableAmount)}
                </span>
              </div>
            </div>
          </div>
          <button
            className="mt-8 rounded-lg bg-mainV1 px-4 py-2 text-lg font-bold text-white"
            onClick={claimAll}
          >
            Claim All
          </button>
          <span className="mt-4 text-sm text-[#99A5B8]">
            Auto-claim after each play. "Claim All" collects all currently
            unlocked GOOD.{' '}
            <a
              className="text-link underline"
              href={Links.Tokenomic}
              target="_blank"
            >
              Learn more
            </a>
          </span>
        </div>
      </section>
      <section className="mt-20 flex flex-col items-center justify-center max-sm:mt-[30px]">
        <div className="text-center text-2xl font-bold text-white max-sm:text-[18px]">
          Token Introduction
        </div>
        <section className="mt-6 flex w-full flex-col items-center space-y-[6px] max-sm:mt-4 md:w-[1073px] md:space-y-4">
          {tokenIntro.map((item, index) => (
            <Card className="w-full md:w-[1073px]" key={index} {...item} />
          ))}
        </section>
      </section>
      <section className="mt-20 flex flex-col items-center justify-center max-sm:mt-[30px]">
        <div className="text-center text-2xl font-bold text-white max-sm:text-[18px]">
          Tokenomics
        </div>
        <section className="my-10 flex w-full flex-col items-center space-y-[6px] max-sm:mt-4 md:w-[1073px] md:space-y-4">
          {Tokennomic.map((item, index) => (
            <Card className="w-full md:w-[1073px]" key={index} {...item} />
          ))}
        </section>
      </section>
    </main>
  );
};

export default TokenPage;
