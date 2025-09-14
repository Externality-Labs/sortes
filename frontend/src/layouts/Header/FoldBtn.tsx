import { Link, useLocation } from 'react-router-dom';

import arrow_down_img from '../../assets/images/dropdown/arrow-down.svg';
import logoX from '../../assets/images/dropdown/logo-x.svg';

import logoTelegramLight from '../../assets/images/dropdown/logo-telegram-light.svg';

import logoDiscordLight from '../../assets/images/dropdown/logo-discord-light.svg';
import logoMedium from '../../assets/images/dropdown/logo-medium.svg';
import { useWallets } from '@web3-onboard/react';
import whitepaper from '../../assets/whitepaper.pdf';
import Links from '../../utils/links';
import { currentChainInfo } from '../../utils/env';
import { ReactNode } from 'react';
import Token from '../../utils/token';
import JkptIcon from '../../components/jkpt/Icon';

const NavbarDropdownBox = (props: { title: string; dropdown: JSX.Element }) => (
  <div className="group relative flex select-none items-center gap-[10px] text-center font-[Roboto] text-[18px] font-medium not-italic leading-[normal]">
    <span
      className="flex cursor-pointer items-center justify-end gap-[10px] px-0.5 py-2.5 text-lg"
      onClick={() => {}}
    >
      <span className="mx-auto py-3 text-base text-white">{props.title}</span>
      <img src={arrow_down_img} alt="arrow" />
    </span>
    <div className="absolute left-0 top-[55px] hidden h-auto flex-col items-start whitespace-nowrap rounded-2xl bg-white p-6 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] group-hover:inline-flex">
      {props.dropdown}
    </div>
  </div>
);

const NavbarDropdownList = (props: {
  title: string;
  dropdownList: { subTitle: string | ReactNode; url: string }[];
}) => {
  const { pathname } = useLocation();
  const [wallet] = useWallets();

  const getLinkClassName = (url: string, subTitle: string | ReactNode) => {
    const isActive = pathname.toLowerCase().includes(url.toLowerCase());
    const isCharityFundActive =
      subTitle === 'Charity' &&
      wallet &&
      pathname.toLowerCase().includes('/charity');

    return `
      text-[#3F3535]
      text-base
      hover:text-mainV1
      ${isActive ? 'text-mainV1' : ''}
      ${isCharityFundActive ? 'text-mainV1' : ''}
    `.trim();
  };

  const listEle = (
    <ul className="flex flex-col space-y-2">
      {props.dropdownList.map(({ subTitle, url }, index) => (
        <li
          key={index}
          className="w-max cursor-pointer p-1 text-left font-medium"
        >
          <Link
            to={url}
            className={getLinkClassName(url, subTitle)}
            target="_blank"
          >
            {subTitle}
          </Link>
        </li>
      ))}
    </ul>
  );

  return <NavbarDropdownBox title={props.title} dropdown={listEle} />;
};

export const HeaderDropdownAsset = () => (
  <NavbarDropdownList
    title="Asset"
    dropdownList={[
      { subTitle: 'Asset', url: '/asset' },
      { subTitle: 'Charity', url: '/charity' },
    ]}
  />
);

export const HeaderDropdownCharity = () => (
  <NavbarDropdownList
    title="Charity"
    dropdownList={[
      { subTitle: 'Charity Governance', url: '/charity-governance' },
      { subTitle: 'Charity Donation', url: '/charity-donation' },
    ]}
  />
);

export const HeaderDropdownMore = () => {
  const { pathname } = useLocation();

  const Group = (props: {
    title: string;
    items?: string[];
    children?: JSX.Element | JSX.Element[] | string;
  }) => {
    const { title, items, children } = props;
    return (
      <div className="mt-[30px] flex flex-col flex-nowrap content-center items-start justify-center first:mt-0">
        <div
          className={`flex items-center justify-center font-bold text-text1`}
        >
          {title}
        </div>
        <div className="mt-5 flex flex-col items-start space-y-5 text-base">
          {items?.map((item) => <span>{item}</span>)}
          {children || null}
        </div>
      </div>
    );
  };
  const dropdownEle = (
    <div className="flex flex-col space-y-[38px]">
      <Group title="User Benefits">
        <Link to="/token">
          <span
            className={`text-[#3F3535] hover:text-mainV1 ${pathname === '/token' ? 'text-mainV1' : ''}`}
          >
            Token
          </span>
        </Link>
        <Link to="/Voucher">
          <span
            className={`text-[#3F3535] hover:text-mainV1 ${pathname === '/Voucher' ? 'text-mainV1' : ''}`}
          >
            Voucher
          </span>
        </Link>
        {/* <Link to="/exp">
          <span
            className={`text-[#3F3535] hover:text-mainV1 ${pathname === '/exp' ? 'text-mainV1' : ''}`}
          >
            EXP Points
          </span>
        </Link>
        <Link to="/vip">
          <span
            className={`text-[#3F3535] hover:text-mainV1 ${pathname === '/vip' ? 'text-mainV1' : ''}`}
          >
            VIP System
          </span>
        </Link> */}
      </Group>
      <Group title="Protocol">
        <Link to={whitepaper} target="_blank">
          <span className="text-[#3F3535] hover:text-mainV1">WhitePaper</span>
        </Link>
        <Link to={Links.Tokenomic} target="_blank">
          <span className="text-[#3F3535] hover:text-mainV1">Tokenomics</span>
        </Link>
        <Link to={Links.Gitbook} target="_blank">
          <span className="text-[#3F3535] hover:text-mainV1">Docs</span>
        </Link>
        {/* <Link to={Links.Github} target="_blank">
          <span className="text-[#3F3535] hover:text-mainV1">Github</span>
        </Link> */}
      </Group>
      <Group title="Media">
        <div className="mt-3 inline-flex w-48 items-center justify-center gap-[30px]">
          <Link to={Links.Twitter} target="_blank">
            <img alt="X" src={logoX} className="h-[20px] w-[22px]"></img>
          </Link>
          <Link to={Links.Telegram} target="_blank">
            <img
              alt="Telegram"
              src={logoTelegramLight}
              className="h-[19px] w-[23px]"
            ></img>
          </Link>
          <Link to={Links.Discord} target="_blank">
            <img
              alt="Discord"
              src={logoDiscordLight}
              className="h-[20px] w-[27px]"
            ></img>
          </Link>
          <Link to={Links.Medium} target="_blank">
            <img
              alt="Medium"
              src={logoMedium}
              className="h-[16px] w-[28px]"
            ></img>
          </Link>
        </div>
      </Group>
    </div>
  );
  return <NavbarDropdownBox title="More" dropdown={dropdownEle} />;
};

const PoolItem = (props: { poolToken: Token }) => {
  const { poolToken } = props;
  return (
    <div className="flex items-center gap-2">
      <JkptIcon tokenAddress={poolToken.address} sizeClz="w-6 max-sm:w-4" />
      <span>{poolToken.name.toUpperCase()}</span>
    </div>
  );
};
export const HeaderDropdownPools = () => {
  const jkpts = currentChainInfo().jkpts;
  const dropdownList = jkpts
    .map((jkpt) => Token.getTokenByAddress(jkpt))
    .filter(Boolean)
    .map((token) => {
      return {
        subTitle: <PoolItem poolToken={token} />,
        url: `/pools/${token.name}`,
      };
    })
    .filter(Boolean);

  const { pathname } = useLocation();

  return (
    <div className="group relative flex select-none items-center gap-[10px] text-center font-[Roboto] text-[18px] font-medium not-italic leading-[normal]">
      <span
        className="flex cursor-pointer items-center justify-end gap-[10px] px-0.5 py-2.5 text-lg"
        onClick={() => {}}
      >
        <span className="mx-auto py-3 text-base text-white">Pools</span>
        <img src={arrow_down_img} alt="arrow" />
      </span>
      <div className="absolute left-0 top-[55px] hidden h-auto flex-col items-start whitespace-nowrap group-hover:inline-flex">
        <div className="inline-flex w-36 flex-col items-start justify-center gap-2.5 rounded-2xl bg-white px-2 py-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          {dropdownList.map(({ subTitle, url }, index) => {
            const isActive = pathname.toLowerCase().includes(url.toLowerCase());
            return (
              <div
                key={index}
                className={`inline-flex h-12 items-center justify-between self-stretch rounded-lg p-2 hover:bg-purple-50 ${
                  isActive ? 'bg-purple-50' : 'bg-white'
                }`}
              >
                <Link
                  to={url}
                  className="text-base text-[#3F3535]"
                  target="_blank"
                >
                  <div className="flex items-center justify-start gap-1">
                    {subTitle}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
