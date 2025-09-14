import { FC, useState } from 'react';

import {
  CombinedReceiversData,
  ExtendedRecipient,
} from '../../hooks/governance';
import EmptyState from './EmptyState';
import CertificationSvg from '../../assets/svg/certification.svg';
import { formatObjectId } from '../../utils/format';

interface AllRecipientItemProps {
  data: CombinedReceiversData;
}

const AllRecipientItem: FC<AllRecipientItemProps> = ({ data }) => {
  const [showDetail, setShowDetail] = useState<Record<string, boolean>>({});

  const toggleDetail = (recipientId: string) => {
    setShowDetail((prev) => ({
      ...prev,
      [recipientId]: !prev[recipientId],
    }));
  };

  // 获取受助者类型显示文本
  const getRecipientTypeDisplay = (recipient: ExtendedRecipient) => {
    // 如果是不完整信息（从区块链合成的数据）
    if (recipient.isIncomplete) {
      return 'Draft (Incomplete info)';
    }
    // 正常的类型判断逻辑
    if (recipient.type === 'Organization') {
      return recipient.verified
        ? 'Certified Organization'
        : 'Non-certified Organization';
    }
    return 'Individual';
  };

  if (!data.backend.length) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="flex flex-col gap-4 max-sm:hidden">
        {data.backend.map((recipient) => (
          <article
            key={recipient.id}
            onClick={() => toggleDetail(recipient.id)}
            className={`flex cursor-pointer flex-col items-center rounded-2xl ${
              recipient.isIncomplete ? 'bg-[#ff4d6c]' : 'bg-white'
            }`}
          >
            <div className="inline-flex w-[1100px] items-center justify-between gap-2.5 p-6 max-sm:w-[350px]">
              <section className="flex w-[375px] flex-col gap-[10px]">
                <h3
                  className={`font-normal ${recipient.isIncomplete ? 'text-white' : 'text-black'}`}
                >
                  ID: {formatObjectId(recipient.id)}
                </h3>
                <div
                  className={`flex items-center space-x-2 truncate text-xl font-bold ${
                    recipient.isIncomplete ? 'text-white' : 'text-black'
                  } ${recipient.name.trim() === '' ? 'italic opacity-75' : ''}`}
                >
                  {recipient.verified && (
                    <img
                      className="h-[21px] w-[18px]"
                      src={CertificationSvg}
                      alt="Certification"
                    />
                  )}
                  <h2 className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {recipient.name.trim() === ''
                      ? 'Name not set'
                      : recipient.name.toString()}
                  </h2>
                </div>
              </section>

              <section className="flex w-[320px] flex-col gap-[10px]">
                <h3
                  className={`font-normal ${recipient.isIncomplete ? 'text-white' : 'text-black'}`}
                >
                  Recipient Type
                </h3>
                <p
                  className={`truncate text-xl font-bold ${recipient.isIncomplete ? 'text-white' : 'text-black'}`}
                >
                  {getRecipientTypeDisplay(recipient)}
                </p>
              </section>
              <section className="flex w-[320px] flex-col gap-[10px]">
                <h3
                  className={`font-normal ${recipient.isIncomplete ? 'text-white' : 'text-black'}`}
                >
                  Donation Category
                </h3>
                <div
                  className={`justify-start text-xl font-bold ${recipient.isIncomplete ? 'text-white' : 'text-black'}`}
                >
                  {recipient.category || 'Other'}
                </div>
              </section>
            </div>
            {showDetail[recipient.id] && (
              <>
                <hr className="mb-6 h-0 w-[1052px] outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
                <div className="flex w-full flex-col gap-[50px] px-6">
                  <section className="flex w-full">
                    {/* <div className="flex w-[500px] flex-col">
                      <h1 className="text-balance font-normal">Network</h1>
                      <h1 className="text-xl font-bold text-black">
                        ERC-20 (ethereum)
                      </h1>
                    </div> */}
                    <div className="flex flex-col">
                      <h1 className="text-balance font-normal">
                        Donation Address
                      </h1>
                      <div className="justify-start text-xl font-normal text-blue-500 underline">
                        {recipient.donationAddress.slice(0, 10)}...
                        {recipient.donationAddress.slice(-8)}
                      </div>
                    </div>
                  </section>
                  <section className="flex w-full">
                    <div className="flex w-[500px] flex-col">
                      <h1 className="text-balance font-normal">Website</h1>
                      <div className="justify-start text-xl font-normal text-blue-500 underline">
                        {recipient.website ? (
                          <a
                            href={recipient.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {recipient.website.length > 20
                              ? `${recipient.website.slice(0, 10)}…${recipient.website.slice(-7)}`
                              : recipient.website}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-balance font-normal">Twitter</h1>
                      <div className="justify-start text-xl font-normal text-blue-500 underline">
                        {recipient.twitter ? (
                          <a
                            href={recipient.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {recipient.twitter}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="mb-6">
                    <h1 className="text-balance text-xl font-normal">
                      Introduction
                    </h1>
                    <div className="mt-[10px] inline-flex w-[1052px] items-start justify-start gap-20 overflow-hidden rounded-lg bg-white px-4 py-3 outline outline-1 outline-gray-200">
                      <div className="h-28 w-[1020px] justify-start">
                        <span className="text-base font-normal text-neutral-800">
                          {recipient.introduction || ''}
                        </span>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            )}
          </article>
        ))}
      </div>

      <div className="md:hidden">
        <div className="flex flex-col gap-4">
          {data.backend.map((recipient) => (
            <article
              key={recipient.id}
              onClick={() => toggleDetail(recipient.id)}
              className="rounded-lg bg-white p-4"
            >
              <div className="flex justify-between">
                <section className="flex flex-col gap-1">
                  <h3 className="text-xs font-normal">
                    ID: {formatObjectId(recipient.id)}
                  </h3>
                  <h2 className="text-sm font-bold">
                    {recipient.name.toString().slice(0, 15)}
                  </h2>
                </section>
                <section className="flex flex-col items-end gap-1">
                  <h3 className="text-xs font-normal">Website</h3>
                  <a
                    href={recipient.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="justify-start text-sm text-blue-500 underline"
                  >
                    {recipient.website && recipient.website.length > 15
                      ? `${recipient.website.slice(0, 12)}…${recipient.website.slice(-4)}`
                      : recipient.website}
                  </a>
                </section>
              </div>
              {showDetail[recipient.id] && (
                <>
                  <hr className="my-[10px] h-0 w-full outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
                  <div className="flex flex-col gap-4">
                    <section className="flex flex-col gap-1">
                      <h3 className="text-[10px] font-normal">
                        Recipient Type
                      </h3>
                      <h2 className="text-sm font-bold">
                        {getRecipientTypeDisplay(recipient)}
                      </h2>
                    </section>
                    <section className="flex flex-col gap-1">
                      <h3 className="text-[10px] font-normal">
                        Donation Category
                      </h3>
                      <h2 className="text-sm font-bold">
                        {recipient.category || 'Other'}
                      </h2>
                    </section>
                    <section className="flex flex-col gap-1">
                      <h3 className="text-[10px] font-normal">
                        Donation Address
                      </h3>
                      <div className="justify-start text-sm font-normal text-blue-500 underline">
                        {recipient.donationAddress.slice(0, 10)}...
                        {recipient.donationAddress.slice(-8)}
                      </div>
                    </section>
                    <section className="flex flex-col gap-1">
                      <h3 className="text-[10px] font-normal">Website</h3>
                      <h2 className="text-sm font-bold">
                        {recipient.website ? (
                          <a
                            className="justify-start text-sm font-normal text-blue-500 underline"
                            href={recipient.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {recipient.website}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </h2>
                    </section>
                    <section className="flex flex-col gap-1">
                      <h3 className="text-[10px] font-normal">Twitter</h3>
                      <h2 className="text-sm font-bold">
                        {recipient.twitter ? (
                          <a
                            className="justify-start text-sm font-normal text-blue-500 underline"
                            href={recipient.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {recipient.twitter}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </h2>
                    </section>
                    <section className="flex flex-col gap-1">
                      <h3 className="text-[10px] font-normal">Introduction</h3>
                      <div className="rounded-md border border-gray-200 p-2 text-[10px] font-normal">
                        {recipient.introduction}
                      </div>
                    </section>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    </>
  );
};

export default AllRecipientItem;
