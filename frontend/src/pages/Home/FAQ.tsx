import { useState } from 'react';

import Arrow2Svg from '../../assets/svg/home/arrow-2.svg';

export const FAQ = () => {
  interface FAQItem {
    id: number;
    question: string;
    answer: string;
  }
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    {
      id: 1,
      question:
        'Enhanced version of full voting power on proposals and governance, with additional weight based on token holdings',
      answer:
        'VIP 4 users benefit from financial incentives for locking tokens, with the upper limit of the distributor profit split ratio increasing in tandem with the lock-up amount.',
    },
    {
      id: 2,
      question:
        'Highest priority access to exclusive airdrops, special campaigns, and community initiatives, proportional to token holdings',
      answer:
        'VIP members receive priority access to all exclusive events, airdrops, and special campaigns based on their token holding levels and VIP status.',
    },
    {
      id: 3,
      question:
        'Highest priority access to exclusive airdrops, special campaigns, and community initiatives, proportional to token holdings',
      answer:
        'VIP members receive priority access to all exclusive events, airdrops, and special campaigns based on their token holding levels and VIP status.',
    },
    {
      id: 4,
      question:
        'Highest priority access to exclusive airdrops, special campaigns, and community initiatives, proportional to token holdings',
      answer:
        'VIP members receive priority access to all exclusive events, airdrops, and special campaigns based on their token holding levels and VIP status.',
    },
  ];

  const toggleExpanded = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <h2 className="mb-12 text-center text-4xl font-bold text-[#7C3AED] max-sm:mb-4 max-sm:text-xl">
        FAQ
      </h2>

      <div className="space-y-6">
        {faqData.map((item) => {
          const isExpanded = expandedItems.includes(item.id);

          return (
            <div
              key={item.id}
              className="mx-auto w-full max-w-[1100px] rounded-2xl border border-violet-300 bg-white p-5 transition-all duration-300 hover:shadow-lg max-sm:p-2"
            >
              <div className="flex w-full flex-col gap-5 max-sm:gap-[10px] md:px-5">
                {/* Question Header */}
                <div
                  className="flex w-full cursor-pointer items-start justify-between"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="flex-1 text-base font-bold leading-loose text-indigo-500 max-sm:text-xs max-sm:font-semibold">
                    {item.id}. {item.question}
                  </div>

                  {/* Arrow Icon */}
                  <div className="ml-4 flex items-center">
                    <img
                      src={Arrow2Svg}
                      alt="arrow"
                      className={`size-8 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <>
                    {/* Divider Line */}
                    <div className="h-0 w-full border-t border-violet-300" />

                    {/* Answer */}
                    <div className="w-full text-base font-normal leading-loose text-indigo-500 max-sm:text-xs">
                      {item.answer}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
