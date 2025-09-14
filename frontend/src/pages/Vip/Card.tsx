import { useState, useEffect } from 'react';

import ArrowImg from '../../assets/images/arrow.png';

const Card = ({ title, detail }: any) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [title]);

  const changeExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="mb-[30px] rounded-2xl bg-[#475CF1]/10 bg-bg1 p-5 max-sm:mb-2.5">
      <div className="flex cursor-pointer justify-start" onClick={changeExpand}>
        <div className="flex-1 text-xl leading-9 max-sm:text-base max-sm:font-semibold">
          {title}
        </div>
        <img
          src={ArrowImg}
          alt=""
          className="size-9 transition-all max-sm:size-6"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </div>
      {expanded ? (
        <div className="my-5 mr-8 border-t border-[#CECDCD] pt-5 text-lg font-normal leading-9 max-sm:my-2.5 max-sm:mr-4 max-sm:pt-2.5 max-sm:text-base">
          {detail}
        </div>
      ) : null}
    </div>
  );
};

export default Card;
