import { ReactNode, useState } from 'react';

interface TabsProps {
  labels: string[];
  children: ReactNode[];
}

const Tabs: React.FC<TabsProps> = ({ labels, children }) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  return (
    <div className="w-full max-sm:pl-[10px]">
      <div className="flex items-end space-x-10 font-bold max-sm:space-x-6 max-sm:text-base">
        {labels.map((label, idx) => {
          const baseClasses = 'hover:cursor-pointer pb-1';
          const activeClasses =
            'text-4xl leading-none font-bold text-mainV1 max-sm:text-2xl';
          const inactiveClasses =
            'text-3xl leading-none text-text1 font-bold max-sm:text-xl';

          return (
            <span
              key={idx}
              className={`${baseClasses} ${idx === currentIdx ? activeClasses : inactiveClasses}`}
              onClick={() => setCurrentIdx(idx)}
            >
              {label}
            </span>
          );
        })}
      </div>
      <div className="mt-10">{children[currentIdx]}</div>
    </div>
  );
};

export default Tabs;
