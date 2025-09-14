interface StatisticItemProps {
  label: string;
  value: string;
  tooltipText?: string;
}

const StatisticItem: React.FC<StatisticItemProps> = ({
  label,
  value,
  tooltipText,
}) => {
  return (
    <div className="relative flex items-center justify-center gap-1 max-sm:justify-start max-sm:p-1 md:p-2.5">
      <div className="relative text-base font-bold text-white max-sm:text-sm md:text-base">
        {label}:
        {tooltipText && (
          <div className="group absolute -right-3 top-0 -translate-x-1/2 -translate-y-full font-normal max-sm:hidden">
            <i className="iconfont icon-info text-xs font-normal text-white"></i>
            <div className="absolute bottom-full left-3 z-10 mb-2 hidden w-[200px] rounded bg-dark0 p-[10px] px-2 py-1 text-left text-xs font-normal text-black group-hover:block">
              {tooltipText}
            </div>
          </div>
        )}
      </div>
      <div className="text-base font-bold text-white max-sm:text-sm md:text-base">
        {value}
      </div>
    </div>
  );
};

export default StatisticItem;
