import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoWithTitle from '../../assets/svg/logo-title.svg';

import MenuSrc from '../../assets/images/menu-mobile.png';
import SidebarMobile from './SidebarMobile';
interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const [renderSidebar, setRenderSidebar] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-mainV1 text-center font-bold max-sm:py-5 md:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between bg-mainV1 px-[30px] text-center text-quaternary max-sm:px-[14px] md:h-[60px]">
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
