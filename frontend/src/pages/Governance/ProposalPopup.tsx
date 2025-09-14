import { FC, useState, useEffect } from 'react';
import CertificationSvg from '../../assets/svg/certification.svg';
import { Popup, PopupProps } from '../../components/Modal/Popup';
import Filter from '../../components/Filter';
import { Web3Service } from '../../services/web3';
import {
  getRecipients,
  createDonation,
  Recipient,
  Donation,
} from '../../services/api/governance';
import Lottie from 'lottie-react';
import LoadingHourglass from '../../assets/animations/loading-hourglass.json';
import { showSucc, showError } from '../../utils/notify';
import { formatObjectId, readableAddr } from '../../utils/format';
interface ProposalPopupProps extends PopupProps {
  onSuccess?: () => void;
}

interface RecipientInfo {
  id: string;
  name: string;
  type: string;
  donationAddress: string;
  website: string;
  twitter: string;
  introduction: string;
}

interface ProposalFormData {
  recipient: string;
  amount: string;
  introduction: string;
}

const ProposalPopup: FC<ProposalPopupProps> = ({
  visible,
  setVisible,
  onSuccess,
}) => {
  // 表单数据状态
  const [formData, setFormData] = useState<ProposalFormData>({
    recipient: '',
    amount: '',
    introduction: '',
  });

  // 表单提交状态
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // 错误信息
  const [amountError, setAmountError] = useState<string>('');
  const [purposeError, setPurposeError] = useState<string>('');
  // 是否已选择接收者
  const [recipientSelected, setRecipientSelected] = useState<boolean>(false);
  // 接收者数据
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  // 最大字符数
  const MAX_INTRODUCTION_LENGTH = 1000;

  // 重置表单状态
  const resetFormState = () => {
    setFormData({
      recipient: '',
      amount: '',
      introduction: '',
    });
    setAmountError('');
    setPurposeError('');
    setRecipientSelected(false);
    setIsSubmitting(false);
  };

  // 处理弹窗关闭
  const handleClose = () => {
    resetFormState();
    setVisible(false);
  };

  // 获取接收者数据和状态重置
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const recipientsData = await getRecipients();
        setRecipients(recipientsData);
      } catch (error) {
        console.error(error);
      }
    };

    if (visible) {
      fetchRecipients();
      // 弹窗打开时重置状态
      resetFormState();
    }
  }, [visible]);

  // 生成接收者选项和数据映射
  const filteredRecipients = recipients;

  // 排序：verified为true的排在前面
  const sortedRecipients = [...filteredRecipients].sort((a, b) => {
    if (a.verified && !b.verified) return -1;
    if (!a.verified && b.verified) return 1;
    return 0;
  });

  const recipientOptions = sortedRecipients.map((recipient) => ({
    label: (
      <div className="flex items-center gap-1.5">
        {recipient.verified && (
          <img
            className="h-[16px] w-[14px] flex-shrink-0 max-sm:h-[14px] max-sm:w-3"
            src={CertificationSvg}
            alt="Verified"
          />
        )}
        <span>{`${recipient.name} (ID: ${formatObjectId(recipient.id)})`}</span>
      </div>
    ),
    value: `${recipient.name} (ID: ${formatObjectId(recipient.id)})`,
  }));
  const recipientData: Record<string, RecipientInfo> = sortedRecipients.reduce(
    (acc, recipient) => {
      const optionKey = `${recipient.name} (ID: ${formatObjectId(recipient.id)})`;
      acc[optionKey] = {
        id: recipient.id,
        name: recipient.name,
        type: recipient.type,
        donationAddress: recipient.donationAddress,
        website: recipient.website,
        twitter: recipient.twitter,
        introduction: recipient.introduction,
      };
      return acc;
    },
    {} as Record<string, RecipientInfo>
  );

  // 处理接收者选择
  const handleRecipientChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      recipient: value,
    }));
    console.log(value, 'value');
    setRecipientSelected(!!value);
  };

  // 处理金额变化
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      amount: value,
    }));

    // 验证金额
    if (!value.trim()) {
      setAmountError('');
      return;
    }

    const amount = parseFloat(value);
    if (
      isNaN(amount) ||
      !Number.isInteger(amount) ||
      amount < 360 ||
      amount > 20000
    ) {
      setAmountError('Only integers between $360–$20,000 allowed.');
    } else {
      setAmountError('');
    }
  };

  // 处理介绍文本变化
  const handleIntroductionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      introduction: value,
    }));

    // 验证字符长度
    if (value.length > MAX_INTRODUCTION_LENGTH) {
      setPurposeError('Maximum length: 1000 characters');
    } else {
      setPurposeError('');
    }
  };

  // 设置最小金额
  const handleSetMinAmount = () => {
    // 设置最小金额
    const minAmount = '360';
    setFormData((prev) => ({
      ...prev,
      amount: minAmount,
    }));
  };

  // 设置最大金额
  const handleSetMaxAmount = () => {
    // 这里应该从API获取最大可用金额
    const maxAmount = '20000';
    setFormData((prev) => ({
      ...prev,
      amount: maxAmount,
    }));
  };

  // 表单验证
  const validateForm = (): boolean => {
    let isValid = true;

    // 检查接收者
    if (!formData.recipient) {
      isValid = false;
    }

    // 检查捐赠金额
    if (!formData.amount.trim()) {
      setAmountError('Please enter an amount');
      isValid = false;
    } else {
      const amount = parseFloat(formData.amount);
      if (
        isNaN(amount) ||
        !Number.isInteger(amount) ||
        amount < 360 ||
        amount > 20000
      ) {
        setAmountError('Only integers between $360–$20,000 allowed.');
        isValid = false;
      }
    }

    // 检查介绍
    if (!formData.introduction.trim()) {
      setPurposeError('This field is required.');
      isValid = false;
    } else if (formData.introduction.length > MAX_INTRODUCTION_LENGTH) {
      setPurposeError('Maximum length: 1000 characters');
      isValid = false;
    }

    // 检查是否已有错误
    if (amountError || purposeError) {
      isValid = false;
    }

    return isValid;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 获取Web3服务实例
      const web3Service = Web3Service.service;
      if (!web3Service) {
        throw new Error('not initialized');
      }

      // 获取选中接收者的地址
      const receiverAddress = selectedRecipient?.donationAddress;
      if (!receiverAddress) {
        throw new Error('invalid receiver address');
      }

      // 获取sortes合约实例
      const sortesContract = web3Service.contracts?.sortes;
      if (!sortesContract) {
        throw new Error('cannot get sortes contract');
      }

      try {
        // 调用initiateDonation函数

        const tx = await sortesContract.initiateDonation(receiverAddress);

        // 等待交易确认
        const receipt = await tx.wait();

        // 从事件中获取捐赠ID
        const donationInitiatedEvent = receipt.events?.find(
          (event: any) => event.event === 'DonationInitiated'
        );

        if (donationInitiatedEvent) {
          const donationData = donationInitiatedEvent.args[0];
          const donationId = donationData.id.toString();

          // 调用后端API保存捐赠信息
          try {
            const donationPayload: Donation = {
              id: donationId,
              purpose: formData.introduction,
              donationAmount: parseFloat(formData.amount),
              recipientId: selectedRecipient.id,
              proposalTxId: tx.hash, // 添加提案交易哈希
            };

            await createDonation(donationPayload);
          } catch (apiError: any) {
            console.error('API error:', apiError);
            showError(
              `Failed to save donation data: ${apiError.message || 'Unknown error'}`
            );
          }
        } else {
          throw new Error('cannot find donation initiated event');
        }

        // 显示成功提示
        showSucc('Donation proposal created successfully!');

        // 立即关闭弹窗和重置状态
        setVisible(false);
        resetFormState();

        // Call onSuccess callback to refresh donations data
        onSuccess?.();
      } catch (contractError: any) {
        console.error('Contract error:', contractError);

        // 解析合约错误信息
        let errorMessage = 'Contract execution failed';
        if (contractError.reason) {
          errorMessage = contractError.reason;
        } else if (contractError.message) {
          if (contractError.message.includes('user rejected')) {
            errorMessage = 'Transaction was rejected by user';
          } else if (contractError.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for transaction';
          } else if (contractError.message.includes('gas')) {
            errorMessage = 'Transaction failed due to gas issues';
          } else {
            errorMessage = contractError.message;
          }
        }

        showError(errorMessage);
      }
    } catch (error: any) {
      console.error('General error:', error);

      // 处理一般错误
      let errorMessage = 'An unexpected error occurred';
      if (error.message) {
        if (error.message.includes('not initialized')) {
          errorMessage =
            'Web3 service not initialized. Please connect your wallet.';
        } else if (error.message.includes('invalid receiver address')) {
          errorMessage = 'Invalid recipient address selected';
        } else if (error.message.includes('cannot get')) {
          errorMessage = 'Contract not available. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }

      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 获取当前选择的接收者信息
  const selectedRecipient = formData.recipient
    ? recipientData[formData.recipient]
    : null;

  return (
    <>
      {/* 提交loading状态 - 使用fixed定位覆盖整个屏幕 */}
      {isSubmitting && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          style={{ zIndex: 7000 }}
        >
          <div className="flex flex-col items-center rounded-lg bg-white p-8 shadow-lg">
            <Lottie animationData={LoadingHourglass} className="h-24 w-24" />
            <p className="mt-2 text-sm text-gray-600">
              Processing transaction...
            </p>
          </div>
        </div>
      )}

      <Popup
        visible={visible}
        setVisible={setVisible}
        closeSideEffect={resetFormState}
      >
        <div className="common-scroll-bar flex max-h-[90vh] flex-col items-start justify-start overflow-y-auto overflow-x-hidden rounded-2xl bg-white p-10 max-sm:max-h-[85vh] max-sm:p-4 md:gap-2.5">
          {/* 捐赠对象 */}
          <div className="mb-10 inline-flex items-center justify-start gap-2.5 max-sm:mb-5 max-sm:flex-col max-sm:items-start">
            <div className="text-xl font-bold text-blue-500 max-sm:text-sm">
              Donate to
            </div>
            <Filter
              maxHeight="45vh"
              className="w-[525px] max-sm:h-9 max-sm:w-[248px]"
              options={recipientOptions}
              onChange={handleRecipientChange}
              value={formData.recipient}
              placeholder="Choose the Donation Recipient"
              placeholderClassName="placeholder:text-base font-normal text:text-stone-300 max-sm:placeholder:text-sm"
              filterType="input"
            />
          </div>

          {/* 接收者详细信息 - 仅在选择接收者后显示 */}
          {recipientSelected && selectedRecipient && (
            <div className="mb-[60px] flex flex-col items-start justify-start space-y-10 max-sm:mb-[10px] max-sm:space-y-6">
              {/* 组织信息 */}
              <div className="inline-flex items-start justify-start gap-20 max-sm:flex-col max-sm:gap-4">
                <div className="flex items-center justify-end gap-2.5">
                  <span className="text-base font-bold text-neutral-800 max-sm:text-sm">
                    Type:
                  </span>
                  <span className="text-base font-normal text-neutral-800 max-sm:text-sm">
                    {selectedRecipient.type}
                  </span>
                </div>
              </div>

              {/* 捐赠地址 */}
              <div className="inline-flex items-center justify-end gap-2.5 max-sm:flex-col max-sm:items-start max-sm:gap-1">
                <span className="text-base font-bold text-neutral-800 max-sm:text-sm">
                  Donation Address:
                </span>
                <span className="text-base font-normal text-neutral-800 max-sm:break-all max-sm:text-sm">
                  {readableAddr(selectedRecipient.donationAddress)}
                </span>
              </div>

              {/* 网站 */}
              <div className="inline-flex items-center justify-end gap-2.5 max-sm:flex-col max-sm:items-start max-sm:gap-1">
                <span className="text-base font-bold text-neutral-800 max-sm:text-sm">
                  Website:
                </span>
                <a
                  href={selectedRecipient.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-normal text-blue-500 underline max-sm:break-all max-sm:text-sm"
                >
                  {selectedRecipient.website}
                </a>
              </div>

              {/* Twitter */}
              <div className="inline-flex items-center justify-end gap-2.5 max-sm:flex-col max-sm:items-start max-sm:gap-1">
                <span className="text-base font-bold text-neutral-800 max-sm:text-sm">
                  Twitter:
                </span>
                <a
                  href={selectedRecipient.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-normal text-blue-500 underline max-sm:break-all max-sm:text-sm"
                >
                  {selectedRecipient.twitter}
                </a>
              </div>

              {/* 介绍 */}
              <div className="flex flex-col items-start justify-start">
                <div className="inline-flex items-center justify-end gap-2.5 max-sm:flex-col max-sm:items-start max-sm:gap-1">
                  <span className="text-base font-bold text-neutral-800 max-sm:text-sm">
                    Introduction:
                  </span>
                  <span className="w-[520px] text-base font-normal text-neutral-800 max-sm:w-full max-sm:text-sm">
                    {selectedRecipient.introduction.substring(0, 65)}
                  </span>
                </div>
                <span className="w-[636px] text-base font-normal text-neutral-800 max-sm:w-full max-sm:text-sm">
                  {selectedRecipient.introduction.substring(65)}
                </span>
              </div>
            </div>
          )}

          {/* 捐赠金额 */}
          <div className="mb-10 max-sm:mb-6">
            <div className="flex items-center justify-center gap-2.5 max-sm:flex-col max-sm:items-start">
              <span className="text-xl font-bold text-blue-500 max-sm:text-sm">
                Donation Amount
              </span>
              <div
                className={`h-12 w-[444px] rounded-lg bg-white py-3 pl-4 pr-2.5 outline outline-1 outline-offset-[-0.50px] ${
                  amountError ? 'outline-rose-500' : 'outline-gray-200'
                } inline-flex items-center justify-between overflow-hidden max-sm:h-9 max-sm:w-[248px]`}
              >
                <div className="flex w-full items-center">
                  <span className="mr-1 text-xl font-bold text-neutral-800 max-sm:text-sm">
                    $
                  </span>
                  <input
                    type="text"
                    value={formData.amount}
                    onChange={handleAmountChange}
                    className="w-full bg-transparent text-base font-normal text-neutral-800 outline-none max-sm:text-sm"
                  />
                </div>
                <div className="flex items-center gap-4 max-sm:gap-2">
                  <button
                    onClick={handleSetMinAmount}
                    className="text-base font-bold text-blue-500 underline transition-opacity hover:opacity-80 max-sm:text-sm"
                  >
                    Min
                  </button>
                  <div className="h-6 w-px bg-neutral-800/40 max-sm:h-4"></div>
                  <button
                    onClick={handleSetMaxAmount}
                    className="text-base font-bold text-green-400 underline transition-opacity hover:opacity-80 max-sm:text-sm"
                  >
                    Max
                  </button>
                </div>
              </div>
            </div>
            <div className="ml-[188px] mt-1 px-2 max-sm:ml-0">
              {amountError ? (
                <div className="text-xs font-bold text-rose-500 max-sm:text-[10px] max-sm:font-normal">
                  {amountError}
                </div>
              ) : (
                <div className="text-xs font-normal text-[#C8C8C9] max-sm:text-[10px]">
                  Only integers between $360–$20,000 allowed.
                </div>
              )}
            </div>
          </div>

          {/* Purpose Field */}
          <div className="mb-[60px] flex items-start gap-2.5 max-sm:mb-[30px] max-sm:flex-col max-sm:items-start">
            <span className="text-xl font-bold text-blue-500 max-sm:text-sm">
              Purpose
            </span>
            <div className="flex flex-col items-start justify-start">
              <div
                className={`relative h-36 w-[543px] rounded-lg bg-white px-4 py-3 outline outline-1 outline-offset-[-0.50px] ${
                  purposeError ? 'outline-rose-500' : 'outline-gray-200'
                } max-sm:h-32 max-sm:w-[248px]`}
              >
                <textarea
                  id="introduction"
                  placeholder={`Briefly describe the purpose of this donation — what it's for and who it helps.\nMaximum length: 1000 characters`}
                  className="h-full w-[492px] resize-none border-none bg-transparent text-base font-normal leading-normal outline-none placeholder:text-stone-300 max-sm:w-full max-sm:text-sm"
                  value={formData.introduction}
                  onChange={handleIntroductionChange}
                ></textarea>
              </div>
              <div className="mt-1 px-2">
                {purposeError ? (
                  <div className="text-xs font-bold text-rose-500 max-sm:text-[10px] max-sm:font-normal">
                    {purposeError}
                  </div>
                ) : (
                  <div className="text-xs font-normal text-[#C8C8C9] max-sm:text-[10px]">
                    Maximum length: 1000 characters
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 按钮区域 */}
          <div className="inline-flex items-start justify-start gap-7 self-end max-sm:w-full max-sm:justify-center max-sm:gap-4">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className={`flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-white px-7 py-5 outline outline-1 outline-offset-[-0.50px] outline-blue-500 max-sm:h-9 max-sm:px-4 max-sm:py-3 ${
                isSubmitting ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <span className="text-base font-bold text-blue-500 max-sm:text-sm">
                Cancel
              </span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !recipientSelected}
              className={`flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-blue-500 px-7 py-5 max-sm:h-9 max-sm:px-4 max-sm:py-3 ${
                isSubmitting || !recipientSelected
                  ? 'cursor-not-allowed opacity-70'
                  : ''
              }`}
            >
              {isSubmitting ? (
                <span className="text-base font-bold text-white max-sm:text-sm">
                  Submitting...
                </span>
              ) : (
                <span className="text-base font-bold text-white max-sm:text-sm">
                  submit
                </span>
              )}
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default ProposalPopup;
