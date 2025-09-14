import React from 'react';
import ArrowIcon from './ArrowIcon';

interface SortButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  // When SortOrder is undefined, the button is in "unselected" state
  SortOrder?: 'asc' | 'desc';
  handleSortClick: () => void;
  label: string;
  className?: string;
}

const SortButton: React.FC<SortButtonProps> = (props) => {
  const { SortOrder, handleSortClick, label, className } = props;

  return (
    <div
      className={`flex h-8 items-center rounded-lg border-gray-100 px-3 text-xs shadow-sm max-sm:px-0 max-sm:text-[10px] md:justify-between md:border md:bg-white ${className || ''}`}
    >
      <span className="font-normal text-black max-sm:text-white">{label}</span>
      <div className="ml-2 flex cursor-pointer flex-col items-center max-sm:ml-[2px]">
        <ArrowIcon
          onClick={handleSortClick}
          enable={SortOrder === 'asc'}
          className="-mb-1.5 mr-[1px]"
        />
        <ArrowIcon
          onClick={handleSortClick}
          enable={SortOrder === 'desc'}
          className="ml-[1px] origin-center rotate-180 max-sm:mr-[1px] max-sm:mt-2"
        />
      </div>
    </div>
  );
};

export default SortButton;
