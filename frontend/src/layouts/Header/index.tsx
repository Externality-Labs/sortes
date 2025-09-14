import LinkBtn from './LinkBtn';
import ConnectWallet from './ConnectWallet';
import { Link, useLocation } from 'react-router-dom';
import CurrentUser from './CurrentUser';
import Notification from './Notification';
import { useWallets } from '@web3-onboard/react';
import MenuSrc from '../../assets/images/menu-mobile.png';

import SidebarMobile from './SidebarMobile';
import { useState } from 'react';
import logoWithTitle from '../../assets/svg/logo-title.svg';
import ChainSelection from './ChainSelection';
import { useAtomValue } from 'jotai';
import { HeaderDropdownMore, HeaderDropdownCharity } from './FoldBtn.tsx';
import ExpBtn from './ExpBtn.tsx';
import { accessTokenAtom } from '../../atoms/auth';
import GoodButton from './GoodButton.tsx';
import Links from '../../utils/links.ts';
const Header = () => {
  const [renderSidebar, setRenderSidebar] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { pathname } = useLocation();
  const [wallet] = useWallets();
  const accessToken = useAtomValue(accessTokenAtom);
  return (
    <>
      <header className="sticky top-0 z-30 bg-mainV1 text-center font-bold max-sm:py-5">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between bg-mainV1 px-[30px] text-center text-quaternary max-sm:px-[14px] md:h-[60px]">
          {/* 大屏幕布局 */}
          <div className="flex items-center space-x-[30px] max-sm:hidden">
            <span className="mr-[70px] text-2xl text-white">
              <Link to="/">
                <img src={logoWithTitle} alt="Sortes" className="w-[110px]" />
              </Link>
            </span>

            <LinkBtn
              text="Play"
              href={'/play'}
              isActive={
                pathname.toLowerCase().includes('/play') || pathname === '/'
              }
            />

            <LinkBtn
              text="Pools"
              href={'/pools'}
              isActive={pathname.toLowerCase().includes('/pools')}
            />

            <LinkBtn
              text="Impact Draw"
              href="/create-spd-table"
              isActive={pathname.toLowerCase().includes('/create-spd-table')}
            />

            <HeaderDropdownCharity></HeaderDropdownCharity>

            <LinkBtn
              text="Docs"
              href={Links.Gitbook}
              isActive={false}
              target="_blank"
            />

            <HeaderDropdownMore></HeaderDropdownMore>
          </div>
          <div className="flex items-center space-x-2 max-sm:hidden">
            <GoodButton />
            <ExpBtn />
            <div className="">
              <ChainSelection />
            </div>
            <div className="flex">
              {wallet && accessToken ? <CurrentUser /> : <ConnectWallet />}
            </div>
          </div>

          {/* 移动端布局 */}
          <div className="hidden w-full items-center justify-between max-sm:flex">
            {/* 占位元素，保持布局平衡 */}
            <div className="h-6 w-6"></div>
            {/* Logo 居中 */}
            <Link
              to="/"
              className="absolute left-1/2 -translate-x-1/2 transform"
            >
              <img src={logoWithTitle} alt="Sortes" className="h-9 w-auto" />
            </Link>
            {/* 菜单按钮放在右边 */}
            <button
              className="h-5 w-auto"
              onClick={() => {
                if (!renderSidebar) setRenderSidebar(true);
                setSidebarVisible(true);
              }}
            >
              <img src={MenuSrc} alt="Menu" className="h-full w-full" />
            </button>
          </div>
        </div>
      </header>
      <Notification></Notification>
      {renderSidebar && (
        <SidebarMobile
          visible={sidebarVisible}
          onClose={() => {
            setSidebarVisible(false);
            setTimeout(() => setRenderSidebar(false), 300); // 假设动画持续300ms
          }}
        />
      )}
    </>
  );
};

export default Header;
