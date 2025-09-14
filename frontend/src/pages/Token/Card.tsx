import { useState, useEffect } from 'react';

const Card = ({ title, className, children }: any) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [title]);

  const changeExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div
      className={`rounded-2xl bg-[#475CF1]/10 bg-bg1 p-5 max-sm:px-5 max-sm:py-2 ${className}`}
    >
      <div
        className="flex cursor-pointer justify-between leading-9"
        onClick={changeExpand}
      >
        {title}

        <i
          className={`iconfont icon-chevron-up transform text-[12px] text-mainV1 transition-transform ${expanded ? 'md:mb-2' : 'md:mt-2'}`}
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0) ' }}
        />
      </div>
      {expanded ? (
        <div className="mt-5 border-t border-[#7b61ff] pt-[10px] text-lg font-normal leading-9 max-sm:my-2.5 max-sm:mr-4 max-sm:pt-2.5 max-sm:text-base">
          {children}
        </div>
      ) : null}
    </div>
  );
};

export default Card;
