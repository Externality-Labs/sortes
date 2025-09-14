import { FC } from 'react';

const EmptyState: FC = () => {
  return (
    <div className="flex h-[250px] w-[1100px] items-center justify-center rounded-2xl bg-white max-sm:h-[112px] max-sm:w-[350px]">
      <i className="iconfont icon-empty-icon max-auto my-[15px] text-[170px] font-normal leading-normal text-[#E5E7EB] max-sm:text-[80px]" />
    </div>
  );
};

export default EmptyState;
