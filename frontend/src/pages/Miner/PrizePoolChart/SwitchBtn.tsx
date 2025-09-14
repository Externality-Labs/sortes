import { useState } from 'react';

interface SwitchBtnProps {
  labels: string[];
  initIdx: number;
  onSwitch: (newIdx: number) => void;
}

const SwitchBtn: React.FC<SwitchBtnProps> = (props) => {
  const [currentIdx, setCurrentIdx] = useState<number>(props.initIdx);
  return (
    <span className="flex rounded-lg border border-solid border-[#6A79FF] text-sm max-sm:text-xs">
      {props.labels.map((label, idx) => {
        if (idx === currentIdx) {
          return (
            <span
              key={idx}
              className="cursor-pointer bg-[#6A79FF] px-5 py-3 text-white first:rounded-l-lg last:rounded-r-lg hover:text-white max-sm:px-4 max-sm:py-3"
            >
              {label}
            </span>
          );
        } else {
          return (
            <span
              key={idx}
              className="cursor-pointer bg-white px-5 py-3 text-[#6A79FF] first:rounded-l-lg last:rounded-r-lg max-sm:px-[10px] max-sm:py-2 max-sm:leading-6"
              onClick={() => {
                setCurrentIdx(idx);
                props.onSwitch(idx);
              }}
            >
              {label}
            </span>
          );
        }
      })}
    </span>
  );
};

export default SwitchBtn;
