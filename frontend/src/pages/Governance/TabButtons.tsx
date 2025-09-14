import { FC } from 'react';

interface TabButtonsProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  tabs: {
    key: string;
    label: string;
  }[];
}

const TabButtons: FC<TabButtonsProps> = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="flex flex-nowrap rounded-full border border-white p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`rounded-full px-6 py-3 text-2xl font-bold max-sm:px-4 max-sm:py-2 max-sm:text-lg ${
            tab.key === activeTab ? 'bg-white text-mainV1' : 'text-white'
          } ${tab.key === 'myProposal' ? 'leading-6' : ''}`}
          onClick={() => {
            setActiveTab(tab.key);
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabButtons;
