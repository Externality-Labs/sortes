import React, { HTMLAttributes, ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';

interface CollapseMobileProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  title: string;
  isEnd?: boolean;
  href?: string;
  isActive?: boolean;
}
const CollapseMobile: React.FC<
  CollapseMobileProps & HTMLAttributes<HTMLDivElement>
> = (props) => {
  const {
    children = null,
    title,
    isEnd = false,
    href,
    isActive = false,
    onClick,
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`w-[260px] ${isEnd ? '' : 'border-b border-b-[#DDDEE0]'}`}
      onClick={onClick}
    >
      <div
        className="flex cursor-pointer items-center justify-between p-4 font-semibold text-text1"
        onClick={toggleCollapse}
      >
        <Link to={href!} className={`${isActive ? 'text-[#475CF1]' : ''}`}>
          {title}
        </Link>
        {children && !isEnd && (
          <i
            className={`iconfont icon-chevron-up transform text-[7px] text-[#202020] transition-transform ${isOpen ? '' : 'rotate-180'}`}
          />
        )}
      </div>
      {isOpen && children}
    </div>
  );
};
export default CollapseMobile;
