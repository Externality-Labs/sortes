import { useMemo, useState } from 'react';
import classNames from 'classnames';

import ExpCard from './ExpCard';

import { isMobileWeb } from '../../utils/env';

import ExpSrc from '../../assets/images/exp.png';

const expMenus = ['Claim for Airdrop', 'Governance Voting'];
const getExpMenus = ['Play to Earn', 'Governance Voting'];

function getMenuDetail(menu: string) {
  switch (menu) {
    case 'Claim for Airdrop':
      return {
        title: menu,
        expand: false,
        desc: 'Soon, Sortes will hold colorful airdrop campaigns to reward active contributors and participants in our community. At that time, there will be 2 ways of using EXP to get airdrop reward:',
        list: [
          '1. Based on your current position quantity of EXP, a certain number of airdrops can be claimed through claiming page.',
          '2. By completing specific tasks (such as participating in community activities), combined with your EXP holdings levels, you can also claim the airdrop rewards. ',
        ],
      };
    case 'Governance Voting':
      return {
        title: menu,
        expand: false,
        list: [
          '1. Determine the use of charitable funds: where or who the donations will go.',
          '2. Vote for the protocol upgrade plan: decide which blockchain to deploy or which features will be added to our product to-do list, etc.',
        ],
      };
    case 'Play to Earn':
      return {
        title: menu,
        expand: false,
        list: [
          '1. As long as you participate in the play, every draw will guarantee you 10 times your ticket denomination in EXP. However, if your prize is not EXP, this participation bonus will not appear in the winning results popup but can be viewed on the blockchain explorer.',
          '2. For users who only win the EXP prize, an extra amount of EXP equal to 10 times your ticket denomination will be given uniformly. This amount will be directly included in your winning amount and will not be prompted separately.',
        ],
      };
    default:
      return {};
  }
}

const ExpPage = () => {
  const [expMenu, setExpMenu] = useState(expMenus[0]);
  const [getExpMenu, setGetExpMenu] = useState(getExpMenus[0]);
  const [expDetail, setExpDetail] = useState<any>(getMenuDetail(expMenu));
  const [getExpDetail, setGetExpDetail] = useState<any>(
    getMenuDetail(getExpMenu)
  );

  const isPlayMenu = useMemo(() => getExpMenu === 'Play to Earn', [getExpMenu]);

  const changeExpMenu = (menu: string) => {
    if (menu === expMenu) {
      return;
    }
    setExpMenu(menu);
    setExpDetail(getMenuDetail(menu));
  };

  const changeGetExpMenu = (menu: string) => {
    if (menu === getExpMenu) {
      return;
    }
    setGetExpMenu(menu);
    if (menu === 'Governance Voting') {
      setGetExpDetail({
        title: menu,
        expand: false,
        desc: 'You will receive varying amounts of EXP through every vote you have cast on the Sortes community.',
        list: [],
      });
      return;
    }
    setGetExpDetail(getMenuDetail(menu));
  };

  return (
    <div className="min-h-[calc(100svh-300px)] bg-mainV1 max-sm:bg-secondary">
      <section className="mx-auto w-[1100px] bg-mainV1 pt-20 max-sm:w-full max-sm:overflow-x-scroll max-sm:px-4 max-sm:pt-0">
        {!isMobileWeb ? (
          <header className="flex items-center rounded-2xl bg-white pl-10">
            <ExpCard />
            <img className="mt-3 h-[328px] w-[621px] flex-1" src={ExpSrc} />
          </header>
        ) : (
          <div className="rounded-[18px] border-[2px] border-white p-[2px]">
            <div className="overflow-hidden rounded-2xl">
              <ExpCard />
            </div>
          </div>
        )}
        <div className="mt-20 rounded-2xl bg-white px-12 pb-12 pt-10 max-sm:mt-[30px] max-sm:rounded-2xl max-sm:p-5">
          <div className="text-[26px] text-mainV1 max-sm:text-xl">
            About EXP Points
          </div>
          <ul className="mt-10 text-xl font-normal text-[#666666] max-sm:mt-0 max-sm:text-base">
            <li className="flex items-start gap-2 leading-9 max-sm:mt-3 max-sm:leading-6">
              <span className="mt-[0.7em] flex-shrink-0 max-sm:mt-[0.5em]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  className="max-sm:size-1"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4 8C6.20914 8 8 6.20914 8 4C8 1.79086 6.20914 0 4 0C1.79086 0 0 1.79086 0 4C0 6.20914 1.79086 8 4 8Z"
                    fill="#666666"
                  />
                </svg>
              </span>
              <span className="text-[20px] max-sm:text-[14px]">
                {' '}
                EXP is the point reward you'll get through every play, which may
                also affect your level in Sortes.
              </span>
            </li>
            <li className="flex items-start gap-2 leading-9 max-sm:mt-7 max-sm:leading-6">
              <span className="mt-[0.7em] flex-shrink-0 max-sm:mt-[0.5em]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  className="max-sm:size-1"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4 8C6.20914 8 8 6.20914 8 4C8 1.79086 6.20914 0 4 0C1.79086 0 0 1.79086 0 4C0 6.20914 1.79086 8 4 8Z"
                    fill="#666666"
                  />
                </svg>
              </span>
              <span className="text-[20px] max-sm:text-[14px]">
                EXP can be used for subsequent governance voting and airdrop
                claiming, etc.
              </span>
            </li>
            <li className="flex items-start gap-2 leading-9 max-sm:mt-7 max-sm:leading-6">
              <span className="mt-[0.7em] flex-shrink-0 max-sm:mt-[0.5em]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  className="max-sm:size-1"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4 8C6.20914 8 8 6.20914 8 4C8 1.79086 6.20914 0 4 0C1.79086 0 0 1.79086 0 4C0 6.20914 1.79086 8 4 8Z"
                    fill="#666666"
                  />
                </svg>
              </span>
              <span className="text-[20px] max-sm:text-[14px]">
                EXP will have more utility and economic value in the future, so
                please stay tuned for its expanding range of applications.
              </span>
            </li>
            <li className="flex items-start gap-2 leading-9 max-sm:mt-7 max-sm:leading-6">
              <span className="mt-[0.7em] flex-shrink-0 max-sm:mt-[0.5em]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  className="max-sm:size-1"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4 8C6.20914 8 8 6.20914 8 4C8 1.79086 6.20914 0 4 0C1.79086 0 0 1.79086 0 4C0 6.20914 1.79086 8 4 8Z"
                    fill="#666666"
                  />
                </svg>
              </span>
              <span className="text-[20px] max-sm:text-[14px]">
                EXP to Token Conversion:
                <a
                  href="https://externality-labs.gitbook.io/externality-labs-docs/tokenomic/exp-to-token-conversion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-[#5a91fd] underline"
                >
                  https://externality-labs.gitbook.io/externality-labs-docs/tokenomic/exp-to-token-conversion
                  <i className="iconfont icon-link ml-1"></i>
                </a>
              </span>
            </li>
          </ul>
        </div>
        <div className="mt-20 py-1 text-[26px] text-white max-sm:mt-[30px] max-sm:py-0 max-sm:text-xl max-sm:text-white">
          EXP Utility
        </div>
        <div className="mt-8 flex items-start gap-7 font-normal max-sm:mt-5 max-sm:flex-col max-sm:items-center max-sm:gap-4">
          <div className="flex w-[300px] flex-col gap-y-[10px] rounded-2xl bg-white p-5 text-lg max-sm:w-auto max-sm:flex-row max-sm:rounded-[8px] max-sm:p-1 max-sm:text-sm">
            {expMenus.map((item) => (
              <div
                key={item}
                onClick={() => changeExpMenu(item)}
                className={[
                  'cursor-pointer p-5 max-sm:p-0 max-sm:px-3 max-sm:py-1',
                  item === expMenu
                    ? 'rounded-2xl bg-mainV1 font-bold text-white max-sm:rounded-[8px]'
                    : 'rounded-none',
                ].join(' ')}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="flex-1 rounded-2xl bg-white px-12 py-8 max-sm:w-full max-sm:p-5">
            <div className="text-lg font-bold leading-9 text-mainV1 max-sm:text-lg">
              {expDetail.title}
            </div>

            <div>
              {!expDetail.desc ? null : (
                <div className="mb-9 text-base leading-9 text-text2 max-sm:text-base">
                  {expDetail.desc}
                </div>
              )}
              {expDetail.list.map((item: string, i: number) => (
                <div
                  key={item}
                  className={[
                    'text-base leading-9 max-sm:text-base',
                    i === expDetail.list.length - 1
                      ? 'text-text2'
                      : 'mb-9 text-text2 max-sm:mb-4',
                  ].join(' ')}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-20 text-4xl text-[26px] text-white max-sm:mt-[30px] max-sm:text-xl max-sm:text-white">
          How To get EXP
        </div>
        <div className="mt-8 flex items-start gap-7 pb-20 font-normal max-sm:flex-col max-sm:items-center max-sm:pb-[30px]">
          <div className="flex w-[300px] flex-col gap-y-[10px] rounded-2xl bg-white p-5 text-lg max-sm:w-auto max-sm:flex-row max-sm:rounded-[8px] max-sm:p-1 max-sm:text-sm">
            {getExpMenus.map((item) => (
              <div
                key={item}
                onClick={() => changeGetExpMenu(item)}
                className={[
                  'cursor-pointer p-5 max-sm:p-0 max-sm:px-3 max-sm:py-1 max-sm:text-sm',
                  item === getExpMenu
                    ? 'rounded-2xl bg-mainV1 font-bold text-white max-sm:rounded-[8px]'
                    : 'rounded-none',
                ].join(' ')}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="flex-1 rounded-2xl bg-white p-10 max-sm:w-full max-sm:p-5">
            <div
              className={classNames(
                'text-lg font-bold leading-9 text-mainV1 max-sm:text-lg',
                { 'mb-[30px] max-sm:mb-3': isPlayMenu }
              )}
            >
              {getExpDetail.title}
            </div>
            {isPlayMenu ? (
              getExpDetail.list.map((item: string, i: number) => (
                <div
                  key={item}
                  className={[
                    'text-[16px] leading-[30px] max-sm:text-[14px]',
                    i === getExpDetail.list.length - 1
                      ? 'text-text2'
                      : 'mb-9 text-text2 max-sm:mb-10',
                  ].join(' ')}
                >
                  {item}
                </div>
              ))
            ) : (
              <div>
                <div>
                  {!getExpDetail.desc ? null : (
                    <div className="text-base leading-[30px] text-text2 max-sm:text-base">
                      {getExpDetail.desc}
                    </div>
                  )}
                  {getExpDetail.list.map((item: string, i: number) => (
                    <div
                      key={i}
                      className={[
                        'text-base leading-9 max-sm:text-sm',
                        i === getExpDetail.list.length - 1
                          ? 'text-text2'
                          : 'mb-9 text-text2 max-sm:mb-4',
                      ].join(' ')}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExpPage;
