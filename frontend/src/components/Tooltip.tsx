import React, { useEffect, useState } from 'react';
import Question from '../assets/svg/question';
import InfoIcon from '../assets/icons/info.png';

interface TooltipProps {
  children: React.ReactNode;
  type?: 'question' | 'info';
}

const Tooltip = ({ children, type = 'question' }: TooltipProps) => {
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const hideText = () => {
      setTextVisible(false);
    };
    document.addEventListener('click', hideText);
    return () => document.removeEventListener('click', hideText);
  }, []);

  return (
    <div className="text-md relative font-normal">
      <span
        className="cursor-pointer"
        onClick={(e) => {
          setTextVisible(!textVisible);
          e.stopPropagation();
        }}
      >
        {type === 'question' ? (
          <Question />
        ) : (
          <img src={InfoIcon} alt="Info" className="h-auto w-full" />
        )}
      </span>
      {textVisible && (
        <span className="z-20 flex text-left text-xs text-black">
          {children}
        </span>
      )}
    </div>
  );
};

export default Tooltip;
