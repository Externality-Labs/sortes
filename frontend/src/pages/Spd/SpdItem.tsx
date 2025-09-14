import React, { useRef, useState, useEffect, useCallback } from 'react';
import PossibilityTable from './PossibilityTable';
import { useJkpt, usePoolSize } from '../../hooks/pool';
import { useFileUpload } from '../../hooks/useFileUpload';
import {
  Recipient,
  getDonationById,
  getRecipientById,
} from '../../services/api/governance';
import {
  getAvailableDonations,
  AvailableDonationItem,
} from '../../services/api/spd';
import { createSpdTable, updateSpdTable } from '../../services/api/spd';
import { useCurrentUser } from '../../hooks/user';
import { showSucc, showError } from '../../utils/notify';
import {
  getJackpot,
  getPayoutRatio,
  getWinRate,
} from '../../utils/probabilityTable';
import JkptIcon from '../../components/jkpt/Icon';
import Tooltip from '../../components/Tooltip';
import { AxiosError } from 'axios';
import { padToSixDigits } from '../../utils/format';
import ImageCropper from '../../components/ImageCropper';
import CertificationSvg from '../../assets/svg/certification.svg';
import { isMobileWeb } from '../../utils/env';

interface SpdItemProps {
  poolToken?: string;
  isExpandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  // Props for expanded content
  isWeb3ServiceInited?: boolean;
  probabilityTable?: any;
  tablePopupVisible?: boolean;
  setTablePopupVisible?: (visible: boolean) => void;
  ticketPrice?: number;
  valid?: boolean;
  voucher?: any;
  mode?: 'create' | 'edit';
  editData?: {
    id: string;
    name: string;
    proposalId: string;
    image?: string;
  };
}

const ArrowSvg = ({ className }: { className?: string }) => (
  <svg
    width="8"
    height="12"
    viewBox="0 0 8 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.00697 11.8155C0.800946 11.5867 0.81942 11.2342 1.04824 11.0282L6.63259 6L1.04824 0.971826C0.81942 0.765797 0.800946 0.413286 1.00697 0.184467C1.213 -0.0443497 1.56551 -0.0628242 1.79433 0.143205L7.81537 5.56458C7.94323 5.67969 8.00541 5.84055 7.99945 6C8.00541 6.15945 7.94323 6.3203 7.81537 6.43542L1.79433 11.8568C1.56551 12.0628 1.213 12.0443 1.00697 11.8155Z"
      fill={'#999999'}
    />
  </svg>
);

const SpdItem: React.FC<SpdItemProps> = (props) => {
  const {
    isExpandable = false,
    expanded = false,
    onToggle,
    isWeb3ServiceInited,
    probabilityTable,
    tablePopupVisible,
    setTablePopupVisible,
    ticketPrice,
    mode = 'create',
    editData,
  } = props;
  const { jkptPrice } = useJkpt(probabilityTable?.outputToken);
  const poolSize = usePoolSize(probabilityTable?.outputToken);
  const { address } = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const proposalDropdownRef = useRef<HTMLDivElement>(null);
  const {
    uploadState,
    selectFile,
    uploadCroppedFile,
    cancelCrop,
    resetUpload,
  } = useFileUpload();
  const payoutRatio = getPayoutRatio(probabilityTable);
  const totalWinRate = getWinRate(
    probabilityTable,
    Number(poolSize),
    jkptPrice
  );
  const jackpot = getJackpot(probabilityTable, Number(poolSize), jkptPrice);

  const [formData, setFormData] = useState({
    name: editData?.name || '',
    presetText: '',
    proposalId: editData?.proposalId || '',
  });

  const [errors, setErrors] = useState({
    name: '',
    proposalId: '',
    image: '',
  });

  const MAX_NAME_LENGTH = 35;

  // Update form data when editData changes
  useEffect(() => {
    if (editData && mode === 'edit') {
      const newFormData = {
        name: editData.name || '',
        presetText: '',
        proposalId: editData.proposalId || '',
      };
      setFormData(newFormData);

      // Reset original image removal state when edit data changes
      setIsOriginalImageRemoved(false);

      // Validate fields on initialization
      const newErrors: { name: string; proposalId: string; image: string } = {
        name: '',
        proposalId: '',
        image: '',
      };

      if (newFormData.name.length > MAX_NAME_LENGTH) {
        newErrors.name = `Maximum length: ${MAX_NAME_LENGTH} characters`;
      }

      if (!newFormData.proposalId.trim()) {
        newErrors.proposalId = 'This field is required.';
      }

      if (!editData?.image) {
        newErrors.image = 'This field is required.';
      }

      setErrors(newErrors);
    }
  }, [editData, mode, MAX_NAME_LENGTH]);

  // 监听文件上传状态，清除图片错误
  useEffect(() => {
    if (uploadState.previewUrl && errors.image) {
      setErrors((prev) => ({
        ...prev,
        image: '',
      }));
      // Reset original image removal state when new image is uploaded
      setIsOriginalImageRemoved(false);
    }
  }, [uploadState.previewUrl, errors.image]);

  const [showProposalOptions, setShowProposalOptions] = useState(false);
  const [donations, setDonations] = useState<any[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [donationRecipientMap, setDonationRecipientMap] = useState<
    Record<string, Recipient>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOriginalImageRemoved, setIsOriginalImageRemoved] = useState(false);

  // Helper functions for rendering proposal options
  const renderProposalDisplayText = (donation: any, recipient?: any) => {
    const idText = `ID: ${padToSixDigits(donation.id)}, Name: `;
    const nameText = recipient?.name || donation.purpose || '';
    const fullText = idText + nameText;
    const maxLength = isMobileWeb ? 30 : 45;

    if (fullText.length > maxLength) {
      return (
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-base max-sm:text-sm">
          {fullText.slice(0, maxLength)}...
        </span>
      );
    }

    return (
      <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-base max-sm:text-sm">
        <span>{idText}</span>
        {recipient?.verified && (
          <img
            className="h-[14px] w-3 flex-shrink-0"
            src={CertificationSvg}
            alt="Verified"
          />
        )}
        <span>{nameText}</span>
      </div>
    );
  };

  const renderSelectedProposal = () => {
    if (!formData.proposalId) {
      return (
        <input
          type="text"
          value=""
          placeholder="Proposal ID / Recipient Name"
          className="flex-1 cursor-pointer bg-transparent font-normal text-neutral-800 outline-none"
          readOnly
        />
      );
    }

    const selectedDonation = donations.find(
      (d) => String(d.id) === String(formData.proposalId)
    );

    if (!selectedDonation) {
      return '';
    }

    const recipient = donationRecipientMap[selectedDonation.recipientId];
    const handleClick = () => setShowProposalOptions(!showProposalOptions);

    if (recipient) {
      return (
        <div
          className="flex flex-1 cursor-pointer items-center justify-between gap-1.5 font-normal text-neutral-800"
          onClick={handleClick}
        >
          <div className="flex items-center gap-1.5 overflow-hidden text-nowrap">
            <span>{`ID: ${padToSixDigits(selectedDonation.id)}, Name: `}</span>
            {recipient.verified && (
              <img
                className="h-[14px] w-3 flex-shrink-0"
                src={CertificationSvg}
                alt="Verified"
              />
            )}
            <span className="truncate">
              {recipient.name.substring(0, 10)}...
            </span>
          </div>
        </div>
      );
    }

    return (
      <span
        className="flex-1 cursor-pointer font-normal text-neutral-800"
        onClick={handleClick}
      >
        {`ID: ${padToSixDigits(selectedDonation.id)}, Purpose: ${selectedDonation.purpose}`}
      </span>
    );
  };

  const getSortedDonations = () => {
    return donations.sort((a, b) => {
      const recipientA = donationRecipientMap[a.recipientId];
      const recipientB = donationRecipientMap[b.recipientId];

      // Verified recipients first
      if (recipientA?.verified && !recipientB?.verified) return -1;
      if (!recipientA?.verified && recipientB?.verified) return 1;

      return 0;
    });
  };

  // Event handlers
  const handleToggleProposalOptions = () => {
    setShowProposalOptions(!showProposalOptions);
  };

  const handleProposalSelect = (donationId: string) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const proposalId = String(donationId);
      handleInputChange('proposalId', proposalId);
      setShowProposalOptions(false);
    };
  };

  const handleFormClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isExpandable && onToggle) {
      e.stopPropagation();
      onToggle();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isExpandable && onToggle && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onToggle();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      selectFile(file);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      selectFile(file);
    }
  };

  const handleRemoveImage = () => {
    resetUpload();

    // In edit mode, mark original image as removed
    if (mode === 'edit' && editData?.image) {
      setIsOriginalImageRemoved(true);
      // Set image validation error since image is now required
      setErrors((prev) => ({
        ...prev,
        image: 'This field is required.',
      }));
    } else {
      // Clear image validation error when user manually removes uploaded image
      setErrors((prev) => ({
        ...prev,
        image: '',
      }));
    }
  };

  // Helper function to get outline styles for desktop upload area
  const getOutlineStyles = () => {
    if (errors.image) return 'outline outline-[#FF4D6C]';
    if (!uploadState.previewUrl) return 'outline outline-gray-200';
    return '';
  };

  // Helper function to get outline styles for mobile upload area
  const getMobileOutlineStyles = () => {
    return errors.image
      ? 'outline outline-[#FF4D6C]'
      : 'outline outline-gray-200';
  };

  // Helper function to get outline styles for name input
  const getNameInputOutlineStyles = () => {
    return errors.name ? 'outline-rose-500' : 'outline-gray-200';
  };

  // Helper function to get outline styles for proposal input
  const getProposalInputOutlineStyles = () => {
    return errors.proposalId ? 'outline-rose-500' : 'outline-gray-200';
  };

  // 点击外部区域关闭下拉选项
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        proposalDropdownRef.current &&
        !proposalDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProposalOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Validate name field
    if (field === 'name') {
      if (value.length > MAX_NAME_LENGTH) {
        setErrors((prev) => ({
          ...prev,
          name: `Maximum length: ${MAX_NAME_LENGTH} characters`,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          name: '',
        }));
      }
    }

    // Validate proposalId field
    if (field === 'proposalId') {
      if (!value.trim()) {
        setErrors((prev) => ({
          ...prev,
          proposalId: 'This field is required.',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          proposalId: '',
        }));
      }
    }
  };

  // 获取捐赠数据（根据用户地址，过滤掉已被 SPD 使用的），一次返回 donation+recipient
  const fetchDonations = useCallback(async () => {
    try {
      setLoadingDonations(true);
      if (!address) {
        setDonations([]);
        return;
      }
      const items: AvailableDonationItem[] =
        await getAvailableDonations(address);
      const flatDonations = items.map((i) => i.donation);

      // In edit mode, also fetch the current donation if it's not in the available list
      if (mode === 'edit' && editData?.proposalId) {
        const currentDonationExists = flatDonations.some(
          (d) => String(d.id) === String(editData.proposalId)
        );

        if (!currentDonationExists) {
          try {
            const currentDonation = await getDonationById(editData.proposalId);
            flatDonations.unshift(currentDonation); // Add to beginning of array

            // Also fetch the recipient for this donation
            if (currentDonation.recipientId) {
              try {
                const currentRecipient = await getRecipientById(
                  currentDonation.recipientId
                );
                setDonationRecipientMap((prev) => ({
                  ...prev,
                  [currentRecipient.id]: currentRecipient,
                }));
              } catch (recipientError) {
                console.error(
                  'Failed to fetch current donation recipient:',
                  recipientError
                );
              }
            }
          } catch (donationError) {
            console.error('Failed to fetch current donation:', donationError);
          }
        }
      }

      setDonations(flatDonations);

      // priming local recipient cache from aggregate result
      setDonationRecipientMap((prev) => {
        const next = { ...prev } as Record<string, Recipient>;
        for (const item of items) {
          if (item.recipient) {
            next[item.recipient.id] = item.recipient as Recipient;
          }
        }
        return next;
      });
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoadingDonations(false);
    }
  }, [address, mode, editData?.proposalId]);

  // 当组件展开时获取捐赠数据
  useEffect(() => {
    if (expanded) {
      // 在编辑模式下或者donations为空时都重新获取
      if (mode === 'edit' || donations.length === 0) {
        fetchDonations();
      }
    }
  }, [expanded, mode, fetchDonations, donations.length]); // 添加所有使用的依赖

  const handleSubmit = async () => {
    // 防止重复提交
    if (isSubmitting) return;

    // 运行完整验证
    const newErrors: { name: string; proposalId: string; image: string } = {
      name: '',
      proposalId: '',
      image: '',
    };
    let hasErrors = false;

    // 验证名称
    if (!formData.name.trim()) {
      newErrors.name = 'This field is required.';
      hasErrors = true;
    } else if (formData.name.length > MAX_NAME_LENGTH) {
      newErrors.name = `Maximum length: ${MAX_NAME_LENGTH} characters`;
      hasErrors = true;
    }

    // 验证proposal
    if (!formData.proposalId.trim()) {
      newErrors.proposalId = 'This field is required.';
      hasErrors = true;
    }

    // 验证图片
    if (
      !uploadState.previewUrl &&
      (!editData?.image || isOriginalImageRemoved)
    ) {
      newErrors.image = 'This field is required.';
      hasErrors = true;
    }

    // 更新错误状态
    setErrors(newErrors);

    // 如果有错误，停止提交
    if (hasErrors) {
      return;
    }
    if (!probabilityTable?.id) {
      showError('Probability table is required');
      return;
    }
    if (!address) {
      showError('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'edit') {
        // 编辑模式 - 调用更新API
        if (!editData?.id) {
          showError('Edit data is missing, unable to update');
          setIsSubmitting(false);
          return;
        }

        // 准备更新数据
        const updateParams: any = {
          name: formData.name,
          donationId: formData.proposalId,
        };

        // 如果有新上传的图片，则更新图片
        if (uploadState.uploadedUrl) {
          updateParams.image = uploadState.uploadedUrl;
        } else if (formData.presetText) {
          // 如果有预设文本但没有上传图片，生成图片URL
          updateParams.image = `https://placeholder.com/generate?text=${encodeURIComponent(formData.presetText)}`;
        }
        // 如果都没有，则不更新图片字段，保持原有图片

        await updateSpdTable(editData.id, updateParams);

        showSucc('SPD Table updated successfully!');

        // 更新成功后关闭弹窗
        if (onToggle) {
          onToggle();
        }
        return;
      }

      // 创建模式
      // 准备图片URL - 优先使用上传的图片，如果没有则使用预设文本生成的图片
      let imageUrl = uploadState.uploadedUrl;
      if (!imageUrl && formData.presetText) {
        // TODO: 这里可以调用生成图片的API，暂时使用占位符
        imageUrl = `https://placeholder.com/generate?text=${encodeURIComponent(formData.presetText)}`;
      }

      // 调用API创建SPD表格
      await createSpdTable({
        name: formData.name,
        donationId: formData.proposalId,
        image: imageUrl || '',
        probabilityTableId: probabilityTable.id,
      });

      showSucc('SPD Table created successfully!');

      // 提交成功后关闭展开状态
      if (onToggle) {
        onToggle();
      }
    } catch (error) {
      console.error(
        `Failed to ${mode === 'edit' ? 'update' : 'create'} SPD table:`,
        error
      );
      if (error instanceof AxiosError) {
        showError(
          `Failed to ${mode === 'edit' ? 'update' : 'create'} SPD table. ${error.response?.data.message}`
        );
      } else {
        showError(
          `Failed to ${mode === 'edit' ? 'update' : 'create'} SPD table. Please try again.`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-[1100px] overflow-visible rounded-2xl bg-white max-sm:w-full">
      <article
        onClick={handleClick}
        className={`mt-6 inline-flex w-full items-center gap-20 px-[48px] pb-6 max-sm:mt-4 max-sm:gap-[33px] max-sm:px-4 max-sm:pb-4 ${
          isExpandable ? 'spd-trigger-div cursor-pointer' : ''
        } `}
        role={isExpandable ? 'button' : undefined}
        tabIndex={isExpandable ? 0 : undefined}
        onKeyDown={isExpandable ? handleKeyDown : undefined}
      >
        <section className="flex w-[380px] items-center justify-start gap-6 max-sm:w-[100px]">
          <div className="inline-flex flex-col items-start justify-start gap-2.5 max-sm:gap-1">
            <div className="justify-start text-base font-normal leading-none text-neutral-800 max-sm:text-[10px]">
              Jackpot
            </div>
            <div className="inline-flex items-center justify-start gap-2">
              <JkptIcon
                tokenAddress={probabilityTable?.outputToken}
                sizeClz="w-6 h-6"
              />
              <div className="justify-start text-xl font-bold text-blue-500 max-sm:text-sm">
                {jackpot.toFixed(4)}
              </div>
            </div>
          </div>
        </section>

        <section className="relative inline-flex w-[300px] flex-col items-start justify-start gap-2.5 max-sm:w-[76px] max-sm:gap-1">
          <div className="justify-start text-base font-normal leading-none text-neutral-800 max-sm:text-[10px]">
            Total Win Rate
          </div>
          <div className="justify-start text-xl font-bold text-blue-500 max-sm:text-sm">
            {(totalWinRate * 100).toFixed(2)}%
          </div>

          <div className="absolute -top-[15px] left-[115px] size-4 max-sm:-top-[10px] max-sm:left-[70px] max-sm:size-[10px]">
            <Tooltip type="info">
              <div className="absolute -top-[60px] z-30 ml-5 w-[200px] rounded-lg bg-[#f8f8f8] p-2 shadow-lg max-sm:-left-[10px] max-sm:-top-[135px] max-sm:w-[100px]">
                Based on a $1 ticket. Total Win Rate slightly increases with
                higher ticket values.
              </div>
            </Tooltip>
          </div>
        </section>

        <section className="relative inline-flex w-[150px] flex-col items-start justify-start gap-2.5 max-sm:w-[86px] max-sm:gap-1">
          <div className="justify-start text-base font-normal leading-none text-neutral-800 max-sm:text-center max-sm:text-[10px]">
            Payout Ratio (EV)
          </div>
          <div className="justify-start text-xl font-bold text-blue-500 max-sm:text-sm">
            {(payoutRatio * 100).toFixed(2)}%
          </div>{' '}
          <div className="absolute -top-[15px] left-[135px] size-4 max-sm:-top-[10px] max-sm:left-[85px] max-sm:size-[10px]">
            <Tooltip type="info">
              <div className="absolute -top-[100px] z-30 ml-5 w-[200px] rounded-lg bg-[#f8f8f8] p-2 text-[#444444] shadow-lg max-sm:-left-[120px] max-sm:-top-[240px] max-sm:w-[100px]">
                <span className="block">Based on a $1 ticket.</span>
                <span className="mt-2 block">
                  Includes average payout from all non-EXP prizes plus current
                  EXP-to-GOOD value. GOOD will have a public price at launch.
                </span>
              </div>
            </Tooltip>
          </div>{' '}
        </section>
      </article>
      {expanded && (
        <div className="absolute left-1/2 h-[1px] w-[1028px] -translate-x-1/2 bg-gray-200 max-sm:left-7 max-sm:right-7 max-sm:w-auto max-sm:translate-x-0"></div>
      )}
      {expanded && (
        <aside className="mb-6">
          <form
            className="relative mt-6 flex overflow-visible rounded-2xl bg-white px-[48px] max-sm:px-1"
            onClick={handleFormClick}
            onSubmit={handleFormSubmit}
          >
            <div className="relative flex max-sm:w-full max-sm:flex-col max-sm:px-4">
              <fieldset className="inline-flex flex-col items-start justify-start gap-10 max-sm:gap-[30px]">
                <legend className="sr-only">
                  {mode === 'create'
                    ? 'Create SPD Table Form'
                    : 'Edit SPD Table Form'}
                </legend>
                <div className="inline-flex items-center justify-start gap-2 text-lg max-sm:text-sm">
                  <label className="justify-start font-bold capitalize text-neutral-800">
                    Pool Size:
                  </label>{' '}
                  <div className="justify-start font-bold text-blue-500">
                    {poolSize}
                  </div>
                </div>
                <div className="relative w-[535px] max-sm:w-full">
                  <div className="inline-flex w-full items-center justify-start gap-2 text-lg max-sm:flex-col max-sm:items-start max-sm:text-sm">
                    <label
                      htmlFor="name-input"
                      className="justify-start font-bold text-neutral-800"
                    >
                      Name:
                    </label>
                    <input
                      ref={nameInputRef}
                      id="name-input"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange('name', e.target.value)
                      }
                      className={`flex h-10 flex-1 items-center justify-start gap-6 rounded-lg bg-white px-4 py-3 font-normal outline outline-1 outline-offset-[-0.50px] max-sm:h-8 max-sm:w-full ${getNameInputOutlineStyles()}`}
                      placeholder="Maximum length: 35 characters"
                      maxLength={MAX_NAME_LENGTH + 10} // Allow some extra characters to trigger validation
                    />
                  </div>
                  {errors.name && (
                    <div className="absolute top-full ml-[60px] mt-1 px-2 text-xs font-bold text-rose-500">
                      {errors.name}
                    </div>
                  )}
                </div>
                <div className="relative w-[535px] max-sm:w-full">
                  <div className="inline-flex w-full items-center justify-start gap-2 text-lg max-sm:flex-col max-sm:items-start max-sm:text-sm">
                    <label className="justify-start font-bold text-neutral-800">
                      Link to Proposal:
                    </label>
                    <div
                      className="relative flex-1 cursor-pointer max-sm:w-full"
                      ref={proposalDropdownRef}
                      onClick={handleToggleProposalOptions}
                    >
                      <div
                        className={`flex h-10 cursor-pointer items-center justify-between rounded-lg bg-white px-4 py-3 outline outline-1 outline-offset-[-0.50px] ${getProposalInputOutlineStyles()}`}
                      >
                        {!formData.proposalId && (
                          <i className="iconfont icon-magnifier_RandSwap mr-2 text-lg text-gray-400 max-sm:ml-1 max-sm:text-sm" />
                        )}

                        {renderSelectedProposal()}
                        <ArrowSvg
                          className={`mr-2 size-4 transition-transform max-sm:size-[9px] ${showProposalOptions ? '-rotate-90' : 'rotate-90'}`}
                        />
                      </div>
                    </div>
                    {showProposalOptions && (
                      <div
                        className="absolute left-0 top-full z-10 mt-2.5 inline-flex w-[535px] min-w-full items-center justify-start gap-2.5 overflow-hidden rounded-lg bg-white py-2.5 pl-3 shadow-lg outline outline-1 outline-offset-[-0.50px] outline-gray-200 max-sm:w-full max-sm:font-normal"
                        onClick={handleDropdownClick}
                      >
                        <div className="common-scroll-bar inline-flex max-h-[200px] w-full flex-col items-start justify-start gap-2.5 overflow-y-auto pr-2">
                          {loadingDonations ? (
                            <div className="flex w-full cursor-pointer flex-col items-start justify-center gap-2.5 rounded-lg px-3.5 py-2.5">
                              <div className="justify-start overflow-hidden text-ellipsis whitespace-nowrap text-base font-normal text-neutral-400">
                                Loading proposals...
                              </div>
                            </div>
                          ) : donations.length === 0 ? (
                            <div className="flex w-full cursor-pointer flex-col items-start justify-center gap-2.5 rounded-lg px-3.5 py-2.5">
                              <div className="justify-start overflow-hidden text-ellipsis whitespace-nowrap text-base font-normal text-neutral-400">
                                No proposals available
                              </div>
                            </div>
                          ) : (
                            getSortedDonations().map((donation) => {
                              const recipient =
                                donationRecipientMap[donation.recipientId];
                              return (
                                <div
                                  key={donation.id}
                                  className="flex w-full cursor-pointer flex-col items-start justify-center gap-2.5 rounded-lg px-3.5 py-2.5 hover:bg-blue-500/10 hover:text-blue-500"
                                  onClick={handleProposalSelect(donation.id)}
                                >
                                  {renderProposalDisplayText(
                                    donation,
                                    recipient
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.proposalId && (
                    <div className="absolute top-full ml-[155px] mt-1 px-2 text-xs font-bold text-rose-500">
                      {errors.proposalId}
                    </div>
                  )}
                </div>
                <fieldset className="flex flex-col items-start justify-start gap-2 max-sm:mb-[30px] max-sm:w-full max-sm:gap-[30px]">
                  <legend className="sr-only">Image Settings</legend>
                  <h3 className="text-lg font-bold text-neutral-800 max-sm:hidden">
                    Set Image:
                  </h3>
                  {/* Mobile layout */}
                  <div className="inline-flex flex-col items-start justify-start gap-2 self-stretch sm:hidden">
                    <div className="inline-flex items-center justify-start gap-1 self-stretch">
                      <div className="justify-start text-sm text-neutral-800">
                        Set Image
                      </div>
                      <div className="flex h-8 flex-1 items-center justify-center gap-8 overflow-hidden rounded bg-blue-500 px-2 py-[4.71px]">
                        <button
                          onClick={handleFileUpload}
                          disabled={uploadState.isUploading}
                          className="h-full w-full cursor-pointer border-none bg-transparent text-xs text-white"
                        >
                          Upload
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                    <div className="justify-start text-left text-xs font-normal leading-none text-neutral-800">
                      Recommended Image Size: 650 × 650 px
                      <br />
                      Recommended Resolution: at least 72 dpi
                      <br />
                      Max file size: 2MB <br />
                      JPG, PNG only
                    </div>
                    {(uploadState.previewUrl ||
                      (editData?.image && !isOriginalImageRemoved)) && (
                      <div
                        className={`relative inline-flex max-h-[218px] max-w-[218px] items-center justify-start gap-8 overflow-hidden rounded bg-white px-2 py-[4.71px] outline outline-1 outline-offset-[-0.50px] ${getMobileOutlineStyles()}`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        {uploadState.previewUrl ? (
                          <div className="relative flex h-full w-full items-center justify-center">
                            <img
                              src={uploadState.previewUrl}
                              alt="Preview"
                              className="max-h-[200px] max-w-[200px] rounded object-contain"
                            />
                            <button
                              onClick={handleRemoveImage}
                              className="absolute -right-[10px] -top-[10px] flex size-[22px] items-center justify-center rounded-full shadow-md"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 176 176"
                                fill="none"
                              >
                                <g clipPath="url(#clip0_10729_4368)">
                                  <path
                                    d="M0.115234 87.627C0.115234 110.866 9.34692 133.153 25.7794 149.586C42.2119 166.018 64.4992 175.25 87.7383 175.25C110.977 175.25 133.265 166.018 149.697 149.586C166.13 133.153 175.361 110.866 175.361 87.627C175.361 64.3879 166.13 42.1006 149.697 25.6681C133.265 9.2356 110.977 0.00390625 87.7383 0.00390625C64.4992 0.00390625 42.2119 9.2356 25.7794 25.6681C9.34692 42.1006 0.115234 64.3879 0.115234 87.627Z"
                                    fill="#FF4D6C"
                                  />
                                  <path
                                    d="M112.852 120.664C110.852 120.664 108.854 119.9 107.328 118.375L57.498 68.5469C54.4473 65.4961 54.4473 60.5488 57.498 57.498C60.5488 54.4473 65.4961 54.4473 68.5469 57.498L118.375 107.326C121.426 110.377 121.426 115.324 118.375 118.375C116.85 119.9 114.852 120.664 112.852 120.664Z"
                                    fill="white"
                                  />
                                  <path
                                    d="M63.0234 120.664C61.0234 120.664 59.0254 119.9 57.5 118.375C54.4492 115.324 54.4492 110.377 57.5 107.326L107.328 57.498C110.379 54.4473 115.326 54.4473 118.377 57.498C121.428 60.5488 121.428 65.4961 118.377 68.5469L68.5469 118.375C67.0215 119.9 65.0215 120.664 63.0234 120.664Z"
                                    fill="white"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_10729_4368">
                                    <rect
                                      width="176"
                                      height="176"
                                      fill="white"
                                    />
                                  </clipPath>
                                </defs>
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="relative flex h-full w-full items-center justify-center">
                            <img
                              src={editData?.image}
                              alt="Preview"
                              className="max-h-[200px] max-w-[200px] rounded object-contain"
                            />
                            <button
                              onClick={handleRemoveImage}
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 176 176"
                                fill="none"
                              >
                                <g clipPath="url(#clip0_10729_4368)">
                                  <path
                                    d="M0.115234 87.627C0.115234 110.866 9.34692 133.153 25.7794 149.586C42.2119 166.018 64.4992 175.25 87.7383 175.25C110.977 175.25 133.265 166.018 149.697 149.586C166.13 133.153 175.361 110.866 175.361 87.627C175.361 64.3879 166.13 42.1006 149.697 25.6681C133.265 9.2356 110.977 0.00390625 87.7383 0.00390625C64.4992 0.00390625 42.2119 9.2356 25.7794 25.6681C9.34692 42.1006 0.115234 64.3879 0.115234 87.627Z"
                                    fill="#FF4D6C"
                                  />
                                  <path
                                    d="M112.852 120.664C110.852 120.664 108.854 119.9 107.328 118.375L57.498 68.5469C54.4473 65.4961 54.4473 60.5488 57.498 57.498C60.5488 54.4473 65.4961 54.4473 68.5469 57.498L118.375 107.326C121.426 110.377 121.426 115.324 118.375 118.375C116.85 119.9 114.852 120.664 112.852 120.664Z"
                                    fill="white"
                                  />
                                  <path
                                    d="M63.0234 120.664C61.0234 120.664 59.0254 119.9 57.5 118.375C54.4492 115.324 54.4492 110.377 57.5 107.326L107.328 57.498C110.379 54.4473 115.326 54.4473 118.377 57.498C121.428 60.5488 121.428 65.4961 118.377 68.5469L68.5469 118.375C67.0215 119.9 65.0215 120.664 63.0234 120.664Z"
                                    fill="white"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_10729_4368">
                                    <rect
                                      width="176"
                                      height="176"
                                      fill="white"
                                    />
                                  </clipPath>
                                </defs>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Desktop layout */}
                  <div className="hidden items-start justify-start gap-6 sm:inline-flex">
                    <div
                      className={`inline-flex size-[225px] flex-col items-center justify-center gap-2.5 overflow-visible rounded-lg px-6 py-9 outline-1 outline-offset-[-0.50px] ${getOutlineStyles()}`}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      {uploadState.previewUrl ? (
                        <div className="relative flex size-[225px] items-center justify-center">
                          <img
                            src={uploadState.previewUrl}
                            alt="Preview"
                            className="max-h-[225px] max-w-[225px] rounded object-contain"
                          />
                          <button
                            onClick={handleRemoveImage}
                            className="absolute -right-[10px] -top-[10px] flex size-[22px] items-center justify-center rounded-full shadow-md"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 176 176"
                              fill="none"
                            >
                              <g clipPath="url(#clip0_10729_4368)">
                                <path
                                  d="M0.115234 87.627C0.115234 110.866 9.34692 133.153 25.7794 149.586C42.2119 166.018 64.4992 175.25 87.7383 175.25C110.977 175.25 133.265 166.018 149.697 149.586C166.13 133.153 175.361 110.866 175.361 87.627C175.361 64.3879 166.13 42.1006 149.697 25.6681C133.265 9.2356 110.977 0.00390625 87.7383 0.00390625C64.4992 0.00390625 42.2119 9.2356 25.7794 25.6681C9.34692 42.1006 0.115234 64.3879 0.115234 87.627Z"
                                  fill="#FF4D6C"
                                />
                                <path
                                  d="M112.852 120.664C110.852 120.664 108.854 119.9 107.328 118.375L57.498 68.5469C54.4473 65.4961 54.4473 60.5488 57.498 57.498C60.5488 54.4473 65.4961 54.4473 68.5469 57.498L118.375 107.326C121.426 110.377 121.426 115.324 118.375 118.375C116.85 119.9 114.852 120.664 112.852 120.664Z"
                                  fill="white"
                                />
                                <path
                                  d="M63.0234 120.664C61.0234 120.664 59.0254 119.9 57.5 118.375C54.4492 115.324 54.4492 110.377 57.5 107.326L107.328 57.498C110.379 54.4473 115.326 54.4473 118.377 57.498C121.428 60.5488 121.428 65.4961 118.377 68.5469L68.5469 118.375C67.0215 119.9 65.0215 120.664 63.0234 120.664Z"
                                  fill="white"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_10729_4368">
                                  <rect width="176" height="176" fill="white" />
                                </clipPath>
                              </defs>
                            </svg>
                          </button>
                        </div>
                      ) : editData?.image && !isOriginalImageRemoved ? (
                        <div className="relative h-full w-full">
                          <img
                            src={editData.image}
                            alt="Preview"
                            className="h-full w-full rounded object-cover"
                          />
                          <button
                            onClick={handleRemoveImage}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 176 176"
                              fill="none"
                            >
                              <g clipPath="url(#clip0_10729_4368)">
                                <path
                                  d="M0.115234 87.627C0.115234 110.866 9.34692 133.153 25.7794 149.586C42.2119 166.018 64.4992 175.25 87.7383 175.25C110.977 175.25 133.265 166.018 149.697 149.586C166.13 133.153 175.361 110.866 175.361 87.627C175.361 64.3879 166.13 42.1006 149.697 25.6681C133.265 9.2356 110.977 0.00390625 87.7383 0.00390625C64.4992 0.00390625 42.2119 9.2356 25.7794 25.6681C9.34692 42.1006 0.115234 64.3879 0.115234 87.627Z"
                                  fill="#FF4D6C"
                                />
                                <path
                                  d="M112.852 120.664C110.852 120.664 108.854 119.9 107.328 118.375L57.498 68.5469C54.4473 65.4961 54.4473 60.5488 57.498 57.498C60.5488 54.4473 65.4961 54.4473 68.5469 57.498L118.375 107.326C121.426 110.377 121.426 115.324 118.375 118.375C116.85 119.9 114.852 120.664 112.852 120.664Z"
                                  fill="white"
                                />
                                <path
                                  d="M63.0234 120.664C61.0234 120.664 59.0254 119.9 57.5 118.375C54.4492 115.324 54.4492 110.377 57.5 107.326L107.328 57.498C110.379 54.4473 115.326 54.4473 118.377 57.498C121.428 60.5488 121.428 65.4961 118.377 68.5469L68.5469 118.375C67.0215 119.9 65.0215 120.664 63.0234 120.664Z"
                                  fill="white"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_10729_4368">
                                  <rect width="176" height="176" fill="white" />
                                </clipPath>
                              </defs>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={handleFileUpload}
                            disabled={uploadState.isUploading}
                            className="inline-flex h-10 cursor-pointer items-center justify-center gap-6 self-stretch rounded-lg bg-blue-500 px-4 py-3 disabled:bg-gray-400"
                          >
                            <span className="justify-start text-lg font-normal text-white">
                              {uploadState.isUploading
                                ? 'Uploading...'
                                : 'Upload'}
                            </span>
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                          <div className="justify-start text-sm font-normal text-neutral-800">
                            or
                          </div>
                          <div className="inline-flex h-10 items-center justify-center gap-6 self-stretch rounded-lg px-4 py-3">
                            <div className="justify-start text-lg font-normal text-neutral-800">
                              Drag file here
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <aside
                      className={`justify-start text-left text-xs font-normal leading-none ${
                        errors.image ? 'text-[#FF4D6C]' : 'text-neutral-800'
                      }`}
                    >
                      Recommended Image Size: 650 × 650 px
                      <br />
                      <br />
                      <br />
                      Recommended Resolution: at least 72 dpi
                      <br />
                      <br />
                      <br />
                      Max file size: 2MB <br />
                      <br />
                      <br />
                      JPG, PNG only
                    </aside>
                  </div>
                </fieldset>
                <div className="mb-4 h-[1px] w-full bg-gray-200 md:hidden"></div>
              </fieldset>
              <div className="absolute left-[562px] top-0 h-[90%] w-[1px] bg-[#E7E7E9] max-sm:hidden"></div>
              <section className="direction-col flex flex-col overflow-visible pb-[60px] max-sm:flex-col">
                <div className="mb-10 flex items-center justify-start gap-2 text-lg max-sm:mb-6 max-sm:text-sm md:ml-[50px]">
                  <h1 className="font-bold text-neutral-800">Prize Table</h1>
                  <span className="font-normal text-neutral-800">
                    (Based on $1 ticket)
                  </span>
                </div>
                {isWeb3ServiceInited && probabilityTable && (
                  <PossibilityTable
                    name={formData.name}
                    probabilityTable={probabilityTable}
                    tablePopupVisible={tablePopupVisible || false}
                    setTablePopupVisible={setTablePopupVisible || (() => {})}
                    ticketPrice={ticketPrice || 0}
                    className="w-[390px] max-sm:w-[320px] sm:ml-0"
                  />
                )}
              </section>
            </div>
          </form>
          <section className="flex justify-center gap-[60px] text-lg max-sm:gap-6">
            <button
              onClick={onToggle}
              className="border-1 rounded-[0.5rem] border border-[#3370FF] px-[56px] py-4 text-[#3370FF] max-sm:px-[10px] max-sm:py-2 max-sm:text-xs"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                uploadState.isUploading ||
                !!errors.name ||
                !!errors.proposalId ||
                !!errors.image
              }
              className={`rounded-[0.5rem] px-[56px] py-4 font-bold text-white max-sm:px-[10px] max-sm:py-2 max-sm:text-xs ${
                isSubmitting ||
                uploadState.isUploading ||
                !!errors.name ||
                !!errors.proposalId ||
                !!errors.image
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-[#3370FF] hover:bg-[#2856CC]'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </span>
              ) : mode === 'create' ? (
                'Create Impact Draw'
              ) : (
                'Confirm'
              )}
            </button>
          </section>
        </aside>
      )}

      {/* Image Cropper Modal */}
      {uploadState.showCropper && uploadState.previewUrl && (
        <ImageCropper
          src={uploadState.previewUrl}
          onCropComplete={uploadCroppedFile}
          onCancel={cancelCrop}
          isVisible={uploadState.showCropper}
          imageInfo={uploadState.imageInfo}
        />
      )}
    </div>
  );
};

export default SpdItem;
