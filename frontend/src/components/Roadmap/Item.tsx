export interface RoadmapItemProps {
  year: string;
  quarter: string;
  descriptions: string[];
  isActive: boolean;
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({
  year,
  quarter,
  descriptions,
  isActive,
}) => {
  return (
    <div className="inline-flex h-auto flex-col items-start justify-start gap-4 self-start rounded-[16px] border-none bg-[rgba(215,208,255,0.05)] p-4 shadow-[2px_4px_4px_0px_rgba(123,97,255,0.25)] outline-offset-[-0.50px]">
      <div className="inline-flex items-end justify-start gap-2.5">
        <div className="justify-start text-center text-3xl font-bold text-mainV1 max-sm:text-lg">
          {quarter}
        </div>
        <div className="justify-start text-base font-bold text-mainV1 max-sm:text-sm">
          {year}
        </div>
      </div>
      <div className="flex flex-col items-start justify-start gap-5 max-sm:gap-2">
        {descriptions.map((description, idx) => (
          <div
            key={idx}
            className="inline-flex items-start justify-start gap-2.5"
          >
            <div className="inline-flex flex-col items-center justify-center gap-2.5 pt-1">
              <i
                className={`icon-check text-5 iconfont max-sm:text-[10px] ${isActive ? 'text-[#40DC6A]' : 'text-[rgba(64,220,106,0.2)]'} `}
              ></i>
            </div>
            <div
              className="w-56 justify-start text-base text-neutral-700 max-sm:text-sm max-sm:font-light sm:font-normal"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapItem;
