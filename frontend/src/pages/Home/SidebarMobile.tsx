import { Popup } from '../../components/Modal/Popup';

import { useLocation } from 'react-router-dom';

import { useEffect, useRef, useState } from 'react';

import Links from '../../utils/links.ts';
import { MediaLink } from '../../layouts/Footer/index.tsx';
import { linkData } from './constants';

interface SidebarMobileProps {
  visible: boolean;
  onClose: () => void;
}
const DragToCloseThreshold = 100;
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
          className="absolute left-[calc(100vw-340px)] top-1/2 z-30 flex h-[150px] w-[40px] -translate-y-[150px] items-center rounded-md bg-transparent"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="ml-4 h-[60px] w-[6px] bg-white"></div>
        </div>
        <div
          className="absolute right-0 top-0 flex h-[520px] w-[300px] flex-col overflow-y-auto rounded-bl-[16px] rounded-tl-[16px] bg-white px-5 pb-5 pt-5"
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
          {linkData.map((link, index) =>
            link.isSpecial ? (
              <a
                key={index}
                href={link.href}
                target="_blank"
                className="inline-flex w-full items-center gap-2.5 rounded-md bg-violet-500 p-4 text-left font-['SF_Compact'] text-lg text-white"
              >
                {link.text}
              </a>
            ) : link.text === 'Home' ? (
              <span
                className={`py-4 pl-4 text-left font-semibold text-text1 ${
                  index > 1 ? 'border-b border-gray-200' : ''
                }`}
                key={index}
              >
                {link.text}
              </span>
            ) : (
              <a
                href={link.href}
                target="_blank"
                className={`py-4 pl-4 text-left font-semibold text-text1 ${
                  index > 1 ? 'border-b border-gray-200' : ''
                }`}
                key={index}
              >
                {link.text}
              </a>
            )
          )}
          <div className="flex flex-col">
            <span className="py-4 pl-4 text-left font-semibold text-text1">
              Media
            </span>
            <div className="mt-3 inline-flex w-full items-center justify-between space-x-[30px] px-4 py-5">
              {[
                {
                  href: Links.Twitter,
                  iconClz:
                    'icon-Twitter-logo   max-sm:text-black max-sm:text-[20px] max-sm:bg-white   ',
                },
                {
                  href: Links.Telegram,
                  iconClz:
                    'icon-TG_default text-5xl max-sm:text-[43px] max-sm:text-[#26a5e5] max-sm:bg-white ',
                },
                {
                  href: Links.Discord,
                  iconClz:
                    'icon-Discord_default   max-sm:text-[40px] max-sm:text-[#5865F2] max-sm:bg-white ',
                },
                {
                  href: Links.Medium,
                  iconClz:
                    'icon-Medium-logo text-lg max-sm:text-[18px] max-sm:text-black max-sm:bg-white ',
                },
              ].map((link, index) => (
                <MediaLink
                  key={index}
                  href={link.href}
                  iconClz={link.iconClz}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default SidebarMobile;
