import { Popup } from '../../components/Modal/Popup';
import ChainSelectionMobile from '../../components/mobile/ChainSelectionMobile.tsx';
import ConnectWalletMobile from '../../components/mobile/ConnectWalletMobile.tsx';
import CollapseMobile from '../../components/mobile/CollapseMobile.tsx';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState, ReactNode } from 'react';
import whitepaper from '../../assets/whitepaper.pdf';
import { MediaLink } from '../Footer/index.tsx';
import Links from '../../utils/links.ts';
import { currentChainInfo } from '../../utils/env.ts';
import Token from '../../utils/token.ts';
import JkptIcon from '../../components/jkpt/Icon.tsx';
import GoodExp from './GoodExp.tsx';

interface SidebarMobileProps {
  visible: boolean;
  onClose: () => void;
}
const DragToCloseThreshold = 100;
const CollapseMobileList = (props: {
  list: { title: string | ReactNode; href: string }[];
}) => {
  const { pathname } = useLocation();
  return (
    <ul className="mb-4 mt-2 flex flex-col space-y-8 px-4 text-left text-base font-semibold text-[#7D7D7D]">
      {props.list.map((item) => (
        <li key={item.href}>
          <Link
            to={item.href}
            className={`${
              pathname.toLowerCase().includes(item.href.toLowerCase())
                ? 'text-[#475CF1]'
                : ''
            }`}
          >
            {item.title}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const SidebarMobile: React.FC<SidebarMobileProps> = ({ visible, onClose }) => {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef(pathname);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const MinimumXDrag = 50; // 定义最小X方向拖动距离

  const handleTouchStart = (event: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(event.touches[0].clientX); // 记录触摸开始时的水平位置
    setStartY(event.touches[0].clientY); // 记录触摸开始时的垂直位置
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!isDragging) return;

    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;
    const diffX = currentX - startX;
    const diffY = currentY - startY;

    // 计算拖动角度（弧度）
    const angle = Math.atan2(diffY, diffX);
    // 将弧度转换为角度
    const angleDegrees = angle * (180 / Math.PI);

    // 检查角度是否在右上20°到右下20°之间，且X方向拖动距离至少为50px
    if (angleDegrees >= -20 && angleDegrees <= 20 && diffX >= MinimumXDrag) {
      const distance = Math.sqrt(diffX * diffX + diffY * diffY);
      if (distance > DragToCloseThreshold) {
        setIsDragging(false);
        onClose();
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false); // 确保触摸结束时停止拖拽
  };

  useEffect(() => {
    if (visible && pathname !== prevPathnameRef.current) {
      const timer = setTimeout(() => {
        onClose();
      }, 100);

      return () => clearTimeout(timer);
    }
    prevPathnameRef.current = pathname;
  }, [pathname, visible, onClose]);

  return (
    <Popup visible={visible} setVisible={onClose}>
      <div className="relative h-screen w-screen" onClick={onClose}>
        <div
          className="absolute left-[calc(100vw-340px)] top-1/2 z-30 flex h-[150px] w-[40px] -translate-y-1/2 items-center rounded-md bg-transparent"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <section className="ml-4 h-[60px] w-[6px] bg-white"></section>
        </div>
        <div
          className="absolute right-0 top-0 h-screen w-[300px] overflow-y-auto rounded-bl-[16px] rounded-tl-[16px] bg-white px-5 pb-5 pt-10"
          onTouchStart={handleTouchStart}
          onTouchMove={(e) => {
            handleTouchMove(e);
            if (e.touches[0].clientX - startX > 100) {
              onClose();
            }
          }}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => e.stopPropagation()}
        >
          <GoodExp />
          <ConnectWalletMobile onClose={onClose} />
          <ChainSelectionMobile />
          <CollapseMobile
            title={'Play'}
            href={'/play'}
            isActive={
              pathname.toLowerCase().includes('/play') || pathname === '/'
            }
          />
          <CollapseMobile title={'Pools'}>
            <CollapseMobileList
              list={currentChainInfo().jkpts.map((jkpt) => {
                const token = Token.getTokenByAddress(jkpt);
                return {
                  title: (
                    <div className="flex items-center">
                      <JkptIcon tokenAddress={token.address} sizeClz="w-6 " />
                      <span className="ml-2">{token?.name.toUpperCase()}</span>
                    </div>
                  ),
                  href: `/pools/${token?.name}`,
                };
              })}
            />
          </CollapseMobile>

          <CollapseMobile
            title={'Impact Draw'}
            href={'/create-spd-table'}
            isActive={pathname.toLowerCase().includes('/create-spd-tab')}
          />

          <CollapseMobile title={'Charity'}>
            <CollapseMobileList
              list={[
                { title: 'Charity Governance', href: '/charity-governance' },
                { title: 'Charity Donation', href: '/charity-donation' },
              ]}
            />
          </CollapseMobile>
          <CollapseMobile title="User Benefits">
            <CollapseMobileList
              list={[
                { title: 'Voucher', href: '/voucher' },
                { title: 'EXP Points', href: '/exp' },
                { title: 'VIP System', href: '/vip' },
              ]}
            />
          </CollapseMobile>
          <CollapseMobile title={'Protocol'}>
            <div className="flex flex-col space-y-[29px] px-4 text-left text-base font-semibold text-[#7D7D7D]">
              <a
                href={whitepaper}
                target="_blank"
                rel="noopener noreferrer"
                className=" "
                onClick={(e) => {
                  e.preventDefault();
                  window.open(whitepaper, '_blank');
                }}
              >
                WhitePaper
              </a>
              <a
                href={Links.Tokenomic}
                target="_blank"
                rel="noopener noreferrer"
                className=" "
              >
                Tokenomics
              </a>
              {/* <a
                href={Links.Github}
                target="_blank"
                rel="noopener noreferrer"
                className=" "
              >
                Github
              </a> */}
              <a
                href={Links.Gitbook}
                target="_blank"
                rel="noopener noreferrer"
                className="pb-4"
              >
                Docs
              </a>
            </div>
          </CollapseMobile>
          <div className="flex flex-col">
            <span className="py-4 pl-4 text-left font-semibold text-text1">
              Media
            </span>
            <div className="mt-3 inline-flex w-full items-center justify-between space-x-[30px] px-4 py-5">
              <MediaLink
                iconClz="icon-Twitter-logo   max-sm:text-black max-sm:text-[20px] max-sm:bg-white   "
                href={Links.Twitter}
              />
              <MediaLink
                iconClz="icon-TG_default text-5xl max-sm:text-[43px] max-sm:text-[#26a5e5] max-sm:bg-white "
                href={Links.Telegram}
              />
              <MediaLink
                href={Links.Discord}
                iconClz="icon-Discord_default   max-sm:text-[40px] max-sm:text-[#5865F2] max-sm:bg-white "
              />
              <MediaLink
                href={Links.Medium}
                iconClz="icon-Medium-logo text-lg max-sm:text-[18px] max-sm:text-black max-sm:bg-white "
              />
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default SidebarMobile;
