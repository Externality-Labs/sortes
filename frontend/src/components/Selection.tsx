import { SyntheticEvent, useCallback, useState } from 'react';

interface SelectionProps {
  options: string[];
  initialValue?: string;
  error?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disable?: boolean;
}

const ArrowDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <g opacity="0.4">
      <path
        d="M18 9L12 15L6 9"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

const Selection: React.FC<SelectionProps> = ({
  options,
  initialValue,
  error,
  onChange,
  placeholder,
  disable = true,
}) => {
  const [value, setValue] = useState(initialValue);
  const [showOptions, setShowOptions] = useState(false);
  const border = error ? 'border-[#FF4D6C]' : 'border-border1';

  const handleClickOption = useCallback(
    (option: string) => {
      // if (option === value) return;
      setValue(option);
      setShowOptions(false);
      onChange(option);
    },
    [onChange]
  );

  return (
    <div
      className={
        'relative flex select-none flex-col rounded-lg border-[1.5px] ' + border
      }
    >
      <div
        className={`flex items-center px-2 py-1 hover:cursor-pointer ${disable ? 'bg-[#FAFAFB]' : ''}`}
        onClick={() => !disable && setShowOptions(!showOptions)}
      >
        {initialValue && (
          <span className="flex-1 px-4 py-2 font-bold">{value}</span>
        )}
        {!initialValue && (
          <span className="flex-1 px-4 py-2 font-bold text-dark3">
            {placeholder}
          </span>
        )}
        <span className={`${showOptions ? 'rotate-180' : ''}`}>
          <ArrowDown />
        </span>
      </div>
      {error && (
        <span className="absolute -left-3 top-14 flex items-center space-x-2 px-3 py-1 text-xs font-bold text-[#FF4D6C]">
          <span>{error}</span>
        </span>
      )}
      {showOptions && (
        <div
          className="absolute top-14 z-[9999] flex w-full flex-col space-y-[10px] rounded-lg border-[1.5px] border-border1 bg-white px-2 py-[10px]"
          onMouseLeave={() => setShowOptions(false)}
        >
          {options.map((option, idx) => (
            <span
              key={idx}
              className="cursor-pointer rounded-md px-4 py-2.5 font-bold hover:bg-primary/10 hover:text-primary max-sm:py-1"
              onClick={(e: SyntheticEvent) => {
                handleClickOption(option);
                e.stopPropagation();
              }}
            >
              {option}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Selection;
