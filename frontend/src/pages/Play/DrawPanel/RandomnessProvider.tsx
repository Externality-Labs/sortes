import React, { useEffect, useState } from 'react';
import { RandomnessSource } from '../../../utils/env';
import { RandomnessIcon } from '../RandomnessIcon';

interface RandomnessProviderProps {
  value: RandomnessSource;
  setValue: (value: RandomnessSource) => void;
}

const RandomnessProvider: React.FC<RandomnessProviderProps> = ({
  value,
  setValue,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const hideDropdown = () => setDropdownVisible(false);
    document.addEventListener('click', hideDropdown);

    return () => document.removeEventListener('click', hideDropdown);
  }, []);

  // const arrowClz =
  //   'icon-chevron-up iconfont ml-2 text-[8px] font-medium text-link' +
  //   (dropdownVisible ? '' : ' rotate-180');

  return (
    <span className="relative">
      <span
        className="1py-1 flex items-center rounded-md"
        onClick={(e) => {
          // TODO: allow to change randomness provider
          // setDropdownVisible(!dropdownVisible);
          e.stopPropagation();
        }}
      >
        <RandomnessIcon randomness={value} />
        {/*
        <i className={arrowClz}></i>
        */}
      </span>
      {dropdownVisible && (
        <ul className="absolute -top-20 flex w-full flex-col gap-1 rounded-md border border-link bg-white p-2">
          {[RandomnessSource.Chainlink, RandomnessSource.Arpa].map((source) => {
            const isSelected = value === source;
            return (
              <li
                key={source}
                onClick={() => setValue(source)}
                className="flex cursor-pointer items-center"
              >
                <RandomnessIcon randomness={source} />
                {isSelected && (
                  <i className="icon-check iconfont ml-1 text-sm text-link" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </span>
  );
};

export default RandomnessProvider;
