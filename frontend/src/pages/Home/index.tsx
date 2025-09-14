import { Link } from 'react-router-dom';
import BannerSrc from '../../assets/images/homepage/light-house-web.png';

import LinkBtn from '../../layouts/Header/LinkBtn';
import iconWBTCPng from '../../assets/icons/icon-WBTC.png';
import iconWETHPng from '../../assets/icons/icon-WETH.png';
import iconBNBPng from '../../assets/icons/reward-bnb-golden.png';
import bannerMobileSvg from '../../assets/images/homepage/light-house-mobile.png';
import logoWithTitlePurple from '../../assets/svg/logo-title-purple.svg';
import balanceSvg from '../../assets/svg/home/balance.svg';
import nodeSvg from '../../assets/svg/home/node.svg';
import revenuesSvg from '../../assets/svg/home/revenues.svg';
import charitySvg from '../../assets/svg/home/charity.svg';
import PlayPng from '../../assets/images/homepage/play.png';
import bgLightPng from '../../assets/images/homepage/bg-light.png';
import SupportedBy from '../../components/SupportedBy';
import incentiveSvg from '../../assets/svg/home/incentive.svg';
import peopleSvg from '../../assets/svg/home/people.svg';
import networkSvg from '../../assets/svg/home/network.svg';
import mathSvg from '../../assets/svg/home/math.svg';
import ChainTagLink from './ChainTagLink';
import { appPage, isMobileWeb, slogan } from '../../utils/env';
import Links from '../../utils/links';
import Roadmap from '../../components/Roadmap';
import getMoneyPng from '../../assets/images/charity/getMoney.png';
import touchHeartPng from '../../assets/images/charity/touchHeart.png';
import gainPng from '../../assets/images/homepage/gain.png';
import framePlaySvg from '../../assets/svg/home/frame-play.svg';
import frameVoteSvg from '../../assets/svg/home/frame-vote.svg';
import frameGainSvg from '../../assets/svg/home/frame-gain.svg';
import textVoteSvg from '../../assets/svg/home/text-vote.svg';
import textGainSvg from '../../assets/svg/home/text-gain.svg';
import textPlaySvg from '../../assets/svg/home/text-play.svg';
import playmobilePng from '../../assets/images/homepage/play-mobile.png';
import poolsMobilePng from '../../assets/images/homepage/pools-mobile.png';
import impactDrawMobilePng from '../../assets/images/homepage/impact-draw-mobile.png';
import poolsPng from '../../assets/images/homepage/pools.png';
import impactDrawPng from '../../assets/images/homepage/impact-draw.png';
import Header from './header';
import { linkData } from './constants';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  return (
    <div className="relative inline-flex h-96 w-[292px] flex-col items-start justify-start rounded-3xl bg-white px-9 py-14 shadow-[2px_4px_4px_0px_rgba(222,215,255,1.00)] max-sm:h-[186px] max-sm:w-[173px] max-sm:px-4 max-sm:py-6">
      <div className="absolute left-1/2 top-0 h-2 w-[85px] -translate-x-1/2 bg-violet-500 max-sm:h-1 max-sm:w-[50px]"></div>
      <h1 className="text-2xl font-bold text-mainV1 max-sm:text-base max-sm:leading-tight">
        {title}
      </h1>
      <h2 className="mt-9 font-['SF_Pro_Text'] text-xl max-sm:mt-[10px] max-sm:text-[12px] max-sm:leading-tight">
        {description}
      </h2>
      <div className="absolute bottom-0 left-1/2 flex size-20 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-violet-500 max-sm:size-9">
        <img src={icon} className="size-[55px] max-sm:size-6" />
      </div>
    </div>
  );
};

interface DifferenceCardProps {
  title: string;
  description: string;
  icon: string;
}

const DifferenceCard = ({ title, description, icon }: DifferenceCardProps) => {
  return (
    <section>
      <div className="inline-flex w-72 items-center justify-center gap-2.5 rounded-tl-2xl rounded-tr-2xl bg-[#7B61FF] px-6 pb-7 pt-6 max-sm:w-[156px] max-sm:px-1 max-sm:pb-6 max-sm:pt-3">
        <h1 className="text-2xl font-bold leading-9 text-white max-sm:text-base">
          {title}
        </h1>
      </div>
      <div className="relative">
        <img
          src={bgLightPng}
          alt=""
          className="-mt-5 w-[305px] max-sm:w-[164px]"
        />
        <div className="absolute left-[36px] top-6 flex flex-col items-center max-sm:left-[18px] max-sm:top-3">
          <img src={icon} alt="" className="w-[100px] max-sm:w-9" />
          <div className="mt-4 h-[2px] w-[85px] bg-violet-500 max-sm:mt-2 max-sm:h-[1px] max-sm:w-[42px]"></div>
          <div className="mt-6 w-[220px] text-wrap text-xl font-bold text-mainV1 max-sm:mt-3 max-sm:w-[130px] max-sm:text-base max-sm:leading-tight">
            {description}
          </div>
        </div>
      </div>
    </section>
  );
};

interface PoolCardProps {
  poolName: string;
  poolSize: string;
  totalProposals: number;
  donationTarget: string;
  onPlayClick: () => void;
  icon: string;
  themeColor: string;
  bgColor: string;
}

const PoolCard = ({
  poolName,
  poolSize,
  totalProposals,
  donationTarget,
  onPlayClick,
  icon,
  themeColor,
  bgColor,
}: PoolCardProps) => {
  return (
    <div
      className="flex flex-col items-center gap-6 rounded-[20px] border-4 bg-white p-8 shadow-lg max-sm:w-full max-sm:gap-3 max-sm:rounded-lg max-sm:border-[1.2px] max-sm:p-2"
      style={{ borderColor: themeColor }}
    >
      {/* Pool Icon and Title */}
      <div className="flex flex-col items-center gap-3 max-sm:gap-2">
        <div className="relative h-24 w-24 max-sm:h-8 max-sm:w-8">
          <div
            className="h-full w-full rounded-full max-sm:h-8 max-sm:w-8"
            style={{ backgroundColor: themeColor }}
          />
          <img
            src={icon}
            alt={poolName}
            className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 max-sm:h-5 max-sm:w-5"
          />
        </div>
        <h3
          className="text-2xl font-bold max-sm:text-sm max-sm:leading-tight"
          style={{ color: themeColor }}
        >
          {poolName}
        </h3>
      </div>

      {/* Pool Stats */}
      <div className="w-full space-y-4 max-sm:space-y-2">
        <div
          className="space-y-4 rounded-md p-4 max-sm:space-y-2 max-sm:rounded max-sm:p-2"
          style={{ backgroundColor: bgColor }}
        >
          <div className="flex items-end gap-1 max-sm:gap-0.5">
            <span className="text-sm text-neutral-700 max-sm:text-[8px] max-sm:leading-tight">
              Current Pool Size:
            </span>
            <span
              className="text-xl font-bold max-sm:text-xs max-sm:leading-tight"
              style={{ color: themeColor }}
            >
              {poolSize}
            </span>
          </div>
          <div className="flex items-end gap-1 max-sm:gap-0.5">
            <span className="text-sm text-neutral-700 max-sm:text-[8px] max-sm:leading-tight">
              Total Proposals:
            </span>
            <span className="text-xl font-bold text-mainV1 max-sm:text-xs max-sm:leading-tight">
              {totalProposals}
            </span>
          </div>
          <div className="flex items-end gap-1 max-sm:gap-0.5">
            <span className="text-sm text-neutral-700 max-sm:text-[8px] max-sm:leading-tight">
              Total Donation Target:
            </span>
            <span className="text-xl font-bold text-green-400 max-sm:text-xs max-sm:leading-tight">
              {donationTarget}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onPlayClick}
          className="w-full rounded-md px-16 py-2.5 text-xl font-bold text-white max-sm:rounded max-sm:px-5 max-sm:py-2 max-sm:text-xs max-sm:leading-tight"
          style={{ backgroundColor: themeColor }}
        >
          Go to Play
        </button>
      </div>
    </div>
  );
};
const featureCards = [
  {
    title: 'Fair and Transparent System',
    description: 'A system that grants dreams with fairness and transparency',
    icon: balanceSvg,
  },
  {
    title: 'Decentralized Lottery Selling Nodes',
    description:
      'A network that allows users to buy tickets in a decentralized manner',
    icon: nodeSvg,
  },
  {
    title: 'BTC/ETH/BNB, Lucrative Revenues',
    description:
      'A financial product that generates multiple Tokens revenues with low risk',
    icon: revenuesSvg,
  },
  {
    title: 'Charity DAO Draw with Purpose',
    description: 'A charity DAO that serves public good',
    icon: charitySvg,
  },
];

const differenceCards = [
  {
    title: 'Token Incentive',
    description: 'Deflationary token mining',
    icon: incentiveSvg,
  },
  {
    title: 'People Own',
    description: 'Their choice over how to make positive social impacts',
    icon: peopleSvg,
  },
  {
    title: 'Protocol Network',
    description: 'Operates as an open ecosystem',
    icon: networkSvg,
  },
  {
    title: 'Trust in Math',
    description: 'Instant settlement, fair randomness',
    icon: mathSvg,
  },
];

const poolCards = [
  {
    poolName: 'BTC Pool',
    poolSize: '1.0075 WBTC',
    totalProposals: 20,
    donationTarget: '$188,000',
    icon: iconWBTCPng,
    themeColor: '#FFA41B',
    bgColor: '#FFF5E6',
    chain: 'arbitrum',
  },
  {
    poolName: 'ETH Pool',
    poolSize: '10.78 WETH',
    totalProposals: 36,
    donationTarget: '$5800',
    icon: iconWETHPng,
    themeColor: '#627EEA',
    bgColor: '#F0F2FF',
    chain: 'ethereum',
  },
  {
    poolName: 'BNB Pool',
    poolSize: '100 WBNB',
    totalProposals: 18,
    donationTarget: '$3000',
    icon: iconBNBPng,
    themeColor: '#F3BA2F',
    bgColor: '#FFFBF0',
    chain: 'bnb',
  },
];
export const DesktopHomePage = () => {
  return (
    <>
      <header className="fixed left-1/2 top-0 z-20 w-full -translate-x-1/2 overflow-hidden bg-violet-500 px-14 py-6 max-sm:hidden md:flex md:justify-center">
        <div className="flex w-[1440px] items-center justify-between rounded-full bg-white px-9 py-2 max-sm:flex-1">
          <div className="relative z-10 flex items-center">
            <span className="mr-[180px]">
              <Link to="/">
                <img
                  src={logoWithTitlePurple}
                  alt="Sortes"
                  className="w-[128px]"
                />
              </Link>
            </span>
            <span className="flex flex-row items-center justify-center space-x-[30px]">
              {linkData.map((link, index) =>
                link.isSpecial ? (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2.5 rounded-full bg-violet-500 px-6 py-2 text-center font-['Roboto'] text-xl font-bold text-white"
                  >
                    {link.text}
                  </a>
                ) : (
                  <LinkBtn
                    key={index}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    theme="website"
                    isActive={false}
                    text={link.text}
                    isHome={true}
                  />
                )
              )}
            </span>
          </div>
          <div className="flex items-center justify-end">
            {/* <Link to={appPage} target="_blank" rel="noreferrer">
              <span className="mr-8 rounded-lg bg-white px-8 py-2 text-2xl font-bold text-primary2">
                Launch App
              </span>
            </Link> */}
            <div className="flex items-center space-x-4">
              <a
                href={Links.Twitter}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full"
              >
                <i className="iconfont icon-Twitter-logo bg-white text-xl text-black"></i>
              </a>
              <a
                href={Links.Telegram}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full"
              >
                <i className="iconfont icon-TG_default bg-white text-5xl text-[#2AABEE]"></i>
              </a>
              <a
                href={Links.Discord}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full"
              >
                <i className="iconfont icon-Discord_default bg-white text-5xl text-[#5865f2]"></i>
              </a>
              <a
                href={Links.Medium}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full"
              >
                <i className="iconfont icon-Medium-logo bg-white text-xl text-[#000000]"></i>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="relative m-auto flex flex-col items-center max-sm:h-auto max-sm:w-full md:min-w-[1200px] md:max-w-[1600px]">
        <Header />
        <div className="w-full overflow-hidden max-sm:-mt-20">
          <div className="w-full overflow-hidden max-sm:relative max-sm:h-[281px] md:h-[594px]">
            <img
              src={isMobileWeb ? bannerMobileSvg : BannerSrc}
              alt="banner"
              className="relative ml-[13px] mt-[20px] h-[644px] max-sm:absolute max-sm:bottom-0 max-sm:right-0 max-sm:ml-0 max-sm:mt-0 max-sm:h-[281px] md:-mb-[95px] md:ml-[410px]"
            />
          </div>
          <section
            id="banner"
            className="absolute left-[283px] top-[260px] font-bold text-white max-sm:left-[55px] max-sm:top-[110px] max-sm:h-[131px] md:w-full"
          >
            <div className="max-sm:left-5">
              <h1 className="text-[56px] font-normal max-sm:text-[28px] max-sm:font-black">
                <span className="rounded-2xl bg-white text-mainV1 max-sm:rounded-md max-sm:text-2xl">
                  Sortes
                </span>
                <span className="ml-3 rounded-2xl bg-mainV1 px-9 text-white max-sm:rounded-md max-sm:px-3 max-sm:text-2xl">
                  Protocol
                </span>
              </h1>
              <p className="mt-3 text-xl font-normal text-mainV1 max-sm:mt-2 max-sm:w-[250px] max-sm:text-base">
                {slogan}
              </p>
              <div className="mt-6 flex gap-6 max-sm:mt-2 max-sm:gap-3">
                <ChainTagLink
                  url={`${appPage}/play?swap=0`}
                  img={isMobileWeb ? playmobilePng : PlayPng}
                />
                <ChainTagLink
                  url={`${appPage}/pools/wbtc`}
                  img={isMobileWeb ? poolsMobilePng : poolsPng}
                />
                <ChainTagLink
                  url={`${appPage}/create-spd-table?chain=arbitrum`}
                  img={isMobileWeb ? impactDrawMobilePng : impactDrawPng}
                />
              </div>
            </div>
          </section>
        </div>
        <section
          id="s1"
          className="mx-auto mt-[56px] flex flex-col items-center justify-center max-sm:mt-6"
        >
          <p className="mb-[72px] text-4xl font-bold text-mainV1 max-sm:mb-6 max-sm:text-xl">
            What's Sortes
          </p>
          <div className="flex space-x-4 max-sm:grid max-sm:grid-cols-2 max-sm:gap-4 max-sm:gap-y-10 max-sm:space-x-0">
            {featureCards.map((card, index) => (
              <FeatureCard
                key={index}
                title={card.title}
                description={card.description}
                icon={card.icon}
              />
            ))}
          </div>
        </section>{' '}
        <section className="relative mt-[200px] flex flex-col items-center max-sm:mt-[49px]">
          <header className="mb-[60px] flex flex-col items-center space-y-4 max-sm:mb-[15px] max-sm:space-y-2">
            <h2 className="text-4xl font-bold text-mainV1 max-sm:text-xl">
              Impact Draw
            </h2>

            <p className="flex w-[800px] justify-center text-center text-xl text-[#666] max-sm:w-[333px] max-sm:text-left max-sm:text-xs max-sm:italic">
              A community-powered draw where every ticket supports a specific
              cause{' '}
            </p>
          </header>
          <div className="flex justify-center gap-8 max-sm:flex-col max-sm:gap-4">
            {poolCards.map((pool, index) => (
              <PoolCard
                key={index}
                poolName={pool.poolName}
                poolSize={pool.poolSize}
                totalProposals={pool.totalProposals}
                donationTarget={pool.donationTarget}
                onPlayClick={() =>
                  window.open(`${appPage}/play?chain=${pool.chain}`, '_blank')
                }
                icon={pool.icon}
                themeColor={pool.themeColor}
                bgColor={pool.bgColor}
              />
            ))}
          </div>
        </section>
        <section className="relative mt-[168px] flex flex-col items-center max-sm:mt-12">
          <p className="mb-[72px] text-4xl font-bold text-mainV1 max-sm:mb-6 max-sm:text-xl">
            Why is Sortes Different？
          </p>
          <div className="relative z-10 flex w-full space-x-[10px] max-sm:grid max-sm:grid-cols-2 max-sm:gap-4 max-sm:space-x-0">
            {differenceCards.map((card, index) => (
              <section className="relative">
                <DifferenceCard
                  key={index}
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                />
                <div className="absolute -bottom-3 left-[120px] h-2 text-5xl font-bold text-white max-sm:left-[60px] max-sm:text-2xl">
                  0{index + 1}
                </div>
              </section>
            ))}
          </div>
          <div className="absolute -bottom-[90px] -left-[90px] z-0 h-[272px] w-[1440px] bg-gradient-to-b from-[#8679ff] to-[#8e7aff] max-sm:hidden" />
        </section>
        <section className="relative mt-[168px] flex flex-col items-center max-sm:mt-[47px]">
          <header className="mb-[60px] flex flex-col items-center space-y-4 max-sm:mb-[15px] max-sm:space-y-2">
            <h2 className="text-4xl font-bold text-mainV1 max-sm:text-xl">
              Tokenomics
            </h2>
            <div className="w-[800px] justify-start text-xl max-sm:w-[320px] max-sm:text-xs">
              <span className="font-normal max-sm:font-['SF_Pro_Text'] max-sm:text-stone-500">
                Sortes' tokenomics are designed to align the interests of users,
                supporters, and the long‐term sustainability of the platform.
              </span>
              <a
                className="font-normal text-blue-500 underline"
                href={Links.Tokenomic}
                target="_blank"
              >
                Learn more
              </a>
            </div>
          </header>
          <div className="flex justify-center gap-8 max-sm:hidden">
            {/* Play Card */}
            <section className="relative">
              <img
                src={framePlaySvg}
                alt="framePlay"
                className="h-full w-full"
              />
              <div className="absolute left-[40px] top-[350px] flex -translate-y-1/2 flex-col items-center">
                <section className="-mt-[52px] flex h-[230px] flex-col items-center">
                  <img src={textPlaySvg} alt="PLAY" className="mb-9 h-[34px]" />
                  <img src={getMoneyPng} style={{ height: '140px' }} />
                </section>
                <div className="mt-5 flex flex-col gap-5">
                  <div className="w-72 text-xl font-bold text-mainV1">
                    • EXP is the reward point awarded with every play.
                  </div>
                  <div className="w-72 text-xl font-bold text-mainV1">
                    • Every $1 spent playing the lottery generates 10 EXP.
                  </div>
                  <div className="w-72 text-xl font-bold text-mainV1">
                    • Each play grants EXP equal to 10× your ticket value — a
                    guaranteed participation bonus.
                  </div>
                </div>
              </div>
            </section>

            {/* Vote Card */}
            <section className="relative">
              <img
                src={frameVoteSvg}
                alt="frameVote"
                className="h-full w-full"
              />
              <div className="absolute left-[40px] top-[350px] flex -translate-y-1/2 flex-col items-center">
                <section className="-mt-[70px] flex h-[230px] flex-col items-center">
                  <img src={textVoteSvg} alt="VOTE" className="mb-9 h-[34px]" />
                  <img src={touchHeartPng} style={{ height: '112px' }} />
                </section>
                <div className="mt-5 flex flex-col gap-5">
                  <div className="w-72 text-xl font-bold text-mainV1">
                    • Charity Voting: Use EXP to vote and decide how charitable
                    funds will be allocated and distributed.
                  </div>
                  <div className="w-72 text-xl font-bold text-mainV1">
                    • EXP can only be converted to GOOD through voting and
                    remains inactive unless used for voting.
                  </div>
                </div>
              </div>
            </section>

            {/* Gain Card */}
            <section className="relative">
              <img
                src={frameGainSvg}
                alt="frameGain"
                className="h-full w-full"
              />
              <div className="absolute left-[40px] top-[350px] flex -translate-y-1/2 flex-col items-center">
                <section className="flex h-[230px] flex-col items-center">
                  <img src={textGainSvg} alt="GAIN" className="mb-9 h-[34px]" />
                  <img src={gainPng} style={{ height: '140px' }} />
                </section>
                <div className="mt-5 flex flex-col gap-5">
                  <div className="w-72 text-xl font-bold text-mainV1">
                    • GOOD is the governance and utility token issued by Sortes.
                  </div>
                  <div className="w-72 text-xl font-bold text-mainV1">
                    • Utility: Proposal registration, governance participation,
                    and more.
                  </div>
                  <div className="w-72 text-xl font-bold text-mainV1">
                    • EXP→GOOD Mechanism: Based on a bonding curve (y = k/x)
                    with an initial rate of 40:1.
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div className="flex flex-col space-y-3 md:hidden">
            {/* Mobile Tokenomic Cards */}
            <div className="w-72 rounded-2xl px-6 py-6 outline outline-[2.5px] outline-offset-[-1.25px] outline-amber-300">
              <div className="flex flex-col items-center gap-2.5">
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-center font-['Baloo_2'] text-lg font-extrabold uppercase leading-none text-mainV1">
                    Play
                  </h3>
                  <img className="h-11 w-14" src={getMoneyPng} alt="Play" />
                </div>
                <div className="flex flex-col gap-1.5 text-sm text-mainV1">
                  <div>• EXP is the reward point awarded with every play.</div>
                  <div>
                    • Every $1 spent playing the lottery generates 10 EXP.
                  </div>
                  <div>
                    • Each play grants EXP equal to 10× your ticket value — a
                    guaranteed participation bonus.
                  </div>
                </div>
              </div>
            </div>

            <div className="w-72 rounded-2xl px-6 py-6 outline outline-[2.5px] outline-offset-[-1.25px] outline-blue-300">
              <div className="flex flex-col items-center gap-2.5">
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-center font-['Baloo_2'] text-lg font-extrabold uppercase leading-none text-mainV1">
                    Vote
                  </h3>
                  <img className="h-11 w-14" src={touchHeartPng} alt="Vote" />
                </div>
                <div className="flex flex-col gap-1.5 text-sm text-mainV1">
                  <div>
                    • Charity Voting: Use EXP to vote and decide how charitable
                    funds will be allocated and distributed.
                  </div>
                  <div>
                    • EXP can only be converted to GOOD through voting and
                    remains inactive unless used for voting.
                  </div>
                </div>
              </div>
            </div>

            <div className="w-72 rounded-2xl px-6 py-6 outline outline-[2.5px] outline-offset-[-1.25px] outline-green-300">
              <div className="flex flex-col items-center gap-2.5">
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-center font-['Baloo_2'] text-lg font-extrabold uppercase leading-none text-mainV1">
                    Gain
                  </h3>
                  <img className="h-11 w-14" src={gainPng} alt="Gain" />
                </div>
                <div className="flex flex-col gap-1.5 text-sm text-mainV1">
                  <div>
                    • GOOD is the governance and utility token issued by Sortes.
                  </div>
                  <div>
                    • Utility: Proposal registration, governance participation,
                    and more.
                  </div>
                  <div>
                    • EXP→GOOD Mechanism: Based on a bonding curve (y = k/x)
                    with an initial rate of 40:1.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mb-32 mt-24 text-center font-pingfang font-bold max-sm:mb-12 max-sm:mt-[43px] md:w-[1200px]">
          <SupportedBy />
        </section>
        <section id="s6" className="mb-20 flex flex-col md:w-[1490px] md:px-32">
          <Roadmap />
        </section>
        {/* <section className="flex flex-col items-center justify-center pb-[100px] pt-[50px] max-sm:pb-12 max-sm:pt-12">
          <FAQ />
        </section> */}
      </div>
    </>
  );
};
