import RoadmapItem, { RoadmapItemProps } from './Item';

const items: RoadmapItemProps[] = [
  {
    year: '2025',
    quarter: 'Q1-Q2',
    descriptions: [
      'v2 online <span class="   font-bold text-[#444444]">Arbitrum, Base, BSC</span>',
      'More token types & LSD-Fi',
      'Charity Governance',
    ],
    isActive: true,
  },
  {
    year: '2025',
    quarter: 'Q3',
    descriptions: [
      '<span class="   font-bold text-[#444444]">User Growth & TGE</span>',
      'Enable AA Wallet & Web2 login',
    ],
    isActive: false,
  },
  {
    year: '2025',
    quarter: 'Q4',
    descriptions: ['VDF System integration', 'Power ToB projects'],
    isActive: false,
  },
  {
    year: '2026',
    quarter: 'Q1',
    descriptions: [
      '<span class="font-bold text-[#444444]">Mass Adoption</span>',
      'On-chain Liquidity Aggregation',
      'Viral Marketing Campaigns',
    ],
    isActive: false,
  },
];

const RoadMap = ({ isApp = false }: { isApp?: boolean }) => {
  return (
    <div className="flex flex-col items-center justify-center font-normal max-sm:w-80 md:space-y-8">
      <h1
        className={`w-full text-left text-4xl font-bold text-mainV1 max-sm:text-center ${isApp ? 'md:pl-[50px]' : 'flex w-full justify-center max-sm:text-xl'}`}
      >
        Roadmap
      </h1>
      <div
        className={`relative flex w-full flex-row max-sm:mt-12 max-sm:justify-center ${
          isApp ? 'sm:mt-9' : 'max-sm:mt-6'
        } sm:flex-col`}
      >
        <div className="flex justify-between max-sm:flex-col max-sm:space-y-[20px] sm:flex-row md:w-[1221px]">
          {items.map((item, index) => (
            <RoadmapItem key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadMap;
