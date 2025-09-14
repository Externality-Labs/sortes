import { FC, useState, useRef, useEffect, ReactNode } from 'react';

interface FilterOption {
  label: string | ReactNode;
  value: string;
}

interface FilterProps {
  options: string[] | FilterOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  placeholderClassName?: string;
  buttonClassName?: string;
  filterType?: 'default' | 'input';
  mode?: 'default' | 'spdMode';
  maxHeight?: string;
}

// 自定义箭头组件
const ArrowDown: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-6 max-sm:h-[10px] max-sm:w-[10px]"
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

const Filter: FC<FilterProps> = ({
  options,
  value,
  onChange,
  label,
  className = '',
  buttonClassName = '',
  placeholderClassName = '',
  filterType = 'default',
  mode = 'default',
  maxHeight = '50vh',
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: string | FilterOption) => {
    setShowOptions(false);
    const value = typeof option === 'string' ? option : option.value;
    onChange(value);
  };

  // 标准化选项格式
  const normalizedOptions: FilterOption[] = options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option
  );

  // 添加点击外部区域关闭下拉菜单的功能
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={filterRef}
      className={`relative inline-flex flex-col items-start justify-start gap-2.5 text-base max-sm:h-5 max-sm:text-[10px] ${className}`}
    >
      {/* 选择器头部 */}
      <div
        className={`inline-flex ${buttonClassName} h-12 w-full cursor-pointer items-center justify-between gap-5 overflow-hidden rounded-lg bg-white ${mode === 'spdMode' ? 'pl-3' : 'pl-4'} pr-2.5 outline outline-1 outline-gray-200 max-sm:gap-0 max-sm:rounded-[2px] max-sm:pl-[6px] max-sm:pr-[2px]`}
        onClick={() => setShowOptions(!showOptions)}
      >
        <div
          className={`justify-start font-normal leading-none text-neutral-800 max-sm:text-[10px] ${mode === 'spdMode' ? 'text-xs' : ''} ${!value && !label ? placeholderClassName : ''}`}
        >
          {filterType === 'input' ? value : label || label}
        </div>
        <ArrowDown />
      </div>

      {/* 下拉选项 */}
      {showOptions && (
        <div
          className={`common-scroll-bar absolute left-0 top-full z-modal1 mt-2.5 flex min-w-full flex-col justify-start gap-2.5 overflow-y-auto rounded-lg bg-white px-4 py-2.5 shadow-lg outline outline-1 outline-offset-[-0.50px] outline-gray-200 max-sm:gap-1 max-sm:p-1 ${filterType === 'input' ? 'w-full' : ''}`}
          style={{ maxHeight }}
          onMouseLeave={() => setShowOptions(false)}
        >
          {normalizedOptions.map((option, index) => (
            <div
              key={index}
              className={`flex w-full cursor-pointer flex-col items-start justify-center gap-2.5 rounded-lg px-3.5 py-2.5 max-sm:rounded-[2px] max-sm:p-2 ${
                option.value === value
                  ? 'bg-blue-500/10 text-blue-500'
                  : 'hover:bg-blue-500/10 hover:text-blue-500'
              } ${filterType === 'input' ? 'w-full' : ''}`}
              onClick={() => handleSelect(option)}
            >
              <div
                className={`flex w-full items-center justify-start overflow-hidden ${mode === 'spdMode' ? 'text-xs' : 'text-base'} font-normal max-sm:text-[10px] max-sm:leading-3`}
              >
                {typeof option.label === 'string' ? (
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {option.label}
                  </span>
                ) : (
                  option.label
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Filter;
