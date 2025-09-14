import { FunctionComponent } from 'react';
import { Recipient } from '../../services/api/governance';
import EmptyState from './EmptyState';
import CertificationSvg from '../../assets/svg/certification.svg';
import { formatObjectId } from '../../utils/format';

interface ExtendedRecipient extends Recipient {
  isIncomplete?: boolean;
  canEdit?: boolean;
  isDraft?: boolean;
}

interface CombinedReceiversData {
  blockchain: any[];
  backend: ExtendedRecipient[];
  drafts: any[];
  total: number;
}

interface MyRecipientItemProps {
  data: CombinedReceiversData;
  onEdit?: (recipient: ExtendedRecipient) => void;
}

const MyRecipientItem: FunctionComponent<MyRecipientItemProps> = ({
  data,
  onEdit,
}) => {
  // 获取状态信息
  const getStatusInfo = (recipient: ExtendedRecipient) => {
    // 如果是draft数据或不完整信息（从区块链合成的数据），都显示为Draft (Incomplete info)
    if (recipient.isDraft || recipient.isIncomplete) {
      return {
        text: 'Draft (Incomplete info)',
        bgColor: 'bg-[#ff4d6c]',
      };
    }
    // 正常的状态判断逻辑
    if (recipient.type === 'Organization' && !recipient.verified) {
      return {
        text: 'In Review',
        bgColor: 'bg-[#ffa000]',
      };
    }
    return {
      text: 'Active',
      bgColor: 'bg-[#00ccaa]',
    };
  };

  if (!data.backend.length) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 max-sm:gap-2 md:grid-cols-2 lg:grid-cols-3">
      {data.backend.map((recipient) => {
        const statusInfo = getStatusInfo(recipient);
        const isClickable =
          recipient.isDraft || recipient.canEdit || !recipient.isIncomplete;
        return (
          <div
            key={recipient.id}
            className={`w-78 relative inline-flex gap-6 rounded-2xl bg-white px-6 pb-6 pt-9 transition-shadow max-sm:rounded-lg max-sm:pb-4 max-sm:pt-6 ${
              isClickable
                ? 'cursor-pointer hover:shadow-lg'
                : 'cursor-not-allowed opacity-75'
            }`}
            onClick={() => isClickable && onEdit && onEdit(recipient)}
          >
            {/* 状态标签 */}
            <span
              className={`absolute right-0 top-0 rounded-bl-lg rounded-tr-2xl font-normal max-sm:rounded-bl-lg max-sm:rounded-tr-lg max-sm:text-xs ${statusInfo.bgColor} px-4 py-1 text-base text-white`}
            >
              {statusInfo.text}
            </span>

            {/* ID标签 */}
            <span className="absolute left-0 top-0 px-4 py-1 text-base font-normal text-neutral-800 max-sm:text-xs">
              ID: {recipient.isDraft ? 'DRAFT' : formatObjectId(recipient.id)}
            </span>

            {/* 标题 */}
            <div className="mt-4 inline-flex items-center gap-2 max-sm:mt-2 max-sm:gap-1">
              {/* <div className="h-2 w-2.5 bg-white" /> */}
              {recipient.verified && (
                <img
                  className="h-[21px] w-[18px] max-sm:h-4 max-sm:w-2.5"
                  src={CertificationSvg}
                  alt="Certification"
                />
              )}
              <h3
                className={`truncate text-xl font-bold text-neutral-800 max-sm:text-sm`}
              >
                {recipient.name.trim() === ''
                  ? 'N/A  '
                  : recipient.name.toString().length > 20
                    ? recipient.name.toString().slice(0, 20) + '...'
                    : recipient.name.toString()}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyRecipientItem;
