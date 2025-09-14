import { FC } from 'react';
import { Popup, PopupProps } from '../../components/Modal/Popup';
import { useRecipientForm } from '../../hooks/useRecipientForm';
import { Recipient } from '../../services/api/governance';
import Filter from '../../components/Filter';
import { recipientCategoryOptions } from '../../services/type';
import { isMobileWeb } from '../../utils/env';
import Lottie from 'lottie-react';
import LoadingHourglass from '../../assets/animations/loading-hourglass.json';

interface RecipientPopupProps extends PopupProps {
  mode?: 'create' | 'edit';
  recipientData?: Recipient;
}

const RecipientPopup: FC<RecipientPopupProps> = ({
  visible,
  setVisible,
  mode = 'create',
  recipientData,
}) => {
  const {
    // 状态
    formData,
    errors,
    charCount,
    isSubmitting,
    isNameEditable,
    MAX_INTRODUCTION_LENGTH,

    // 方法
    handleChange,
    handleRadioChange,
    handleIntroductionChange,
    handleClose,
    handleSubmit,
    handleSaveAsDraft,
  } = useRecipientForm(visible, setVisible, mode, recipientData);

  const isEditMode = mode === 'edit';

  const title = isEditMode
    ? 'Re-edit Donation Recipient Info'
    : 'Donation Recipient Info';

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

      <Popup visible={visible} setVisible={setVisible}>
        <div className="common-scroll-bar max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-10 pb-20 max-sm:p-4 max-sm:pb-16">
          <h2 className="mb-10 text-xl font-bold text-blue-500 max-sm:mb-5 max-sm:text-base">
            {title}
          </h2>

          <div className="mb-10 space-y-10 text-base max-sm:mb-[30px] max-sm:space-y-6 max-sm:text-sm">
            {/* Name Field */}
            <div className="relative flex items-center gap-2.5 max-sm:flex-col max-sm:items-start">
              <label htmlFor="name" className="font-bold text-neutral-800">
                Name
              </label>
              <input
                id="name"
                placeholder="Recipient Name"
                className={`h-12 w-[578px] rounded-lg bg-white px-4 py-3 font-normal outline outline-1 outline-offset-[-0.50px] placeholder:text-stone-300 max-sm:w-[248px] ${
                  errors.name ? 'outline-rose-500' : 'outline-gray-200'
                } ${!isNameEditable ? 'cursor-not-allowed bg-gray-100' : ''}`}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={!isNameEditable}
              />
              {errors.name && (
                <div className="absolute top-full ml-[60px] mt-1 px-2 text-xs font-bold text-rose-500 max-sm:ml-[0px] max-sm:text-[10px] max-sm:font-normal">
                  {errors.name}
                </div>
              )}
            </div>

            {/* Type Field */}
            <div className="relative flex items-center gap-10 max-sm:gap-3">
              <label className="font-bold text-neutral-800">Type</label>
              <div className="flex items-center gap-14 max-sm:gap-3">
                <div className="flex items-center gap-2 max-sm:gap-1">
                  <input
                    type="radio"
                    id="organization"
                    name="recipientType"
                    value="organization"
                    checked={formData.type === 'organization'}
                    onChange={handleRadioChange}
                    className="size-4 accent-blue-500 max-sm:size-[10px]"
                  />
                  <label
                    htmlFor="organization"
                    className="font-bold text-neutral-800"
                  >
                    Organization
                  </label>
                </div>
                <div className="flex items-center gap-2 max-sm:gap-1">
                  <input
                    type="radio"
                    id="individual"
                    name="recipientType"
                    value="individual"
                    checked={formData.type === 'individual'}
                    onChange={handleRadioChange}
                    className="size-4 accent-blue-500 max-sm:size-[10px]"
                  />
                  <label
                    htmlFor="individual"
                    className="font-bold text-neutral-800"
                  >
                    Individual
                  </label>
                </div>
              </div>
              {errors.type && (
                <div className="absolute top-full ml-[70px] mt-1 px-2 text-xs font-bold text-rose-500 max-sm:ml-[40px] max-sm:text-[10px] max-sm:font-normal">
                  {errors.type}
                </div>
              )}
            </div>

            {/* Category Field */}
            <div className="relative flex items-center gap-2.5 max-sm:flex-col max-sm:items-start">
              <label htmlFor="category" className="font-bold text-neutral-800">
                Category
              </label>
              <Filter
                className="w-[552px] max-sm:h-9 max-sm:w-[248px]"
                filterType={'input'}
                label="Category"
                placeholder="Category"
                options={recipientCategoryOptions}
                value={formData.category}
                onChange={(value: string) => handleChange('category', value)}
              />
              {errors.category && (
                <div className="absolute top-full ml-[90px] mt-1 px-2 text-xs font-bold text-rose-500 max-sm:ml-[0px] max-sm:text-[10px] max-sm:font-normal">
                  {errors.category}
                </div>
              )}
            </div>
            {/* Donation Address Field */}
            <div className="relative flex items-center gap-2.5 max-sm:flex-col max-sm:items-start">
              <label
                htmlFor="donationAddress"
                className="font-bold text-neutral-800"
              >
                Donation Address
              </label>
              <div
                className={`h-12 w-[480px] rounded-lg bg-white px-4 py-3 outline outline-1 outline-offset-[-0.50px] max-sm:w-[248px] ${
                  errors.donationAddress
                    ? 'outline-rose-500'
                    : 'outline-gray-200'
                } ${isEditMode ? 'bg-gray-100' : ''}`}
              >
                <input
                  id="donationAddress"
                  type="text"
                  placeholder=" "
                  className={`w-full bg-transparent font-normal outline-none placeholder:text-stone-300 ${
                    isEditMode ? 'cursor-not-allowed' : ''
                  }`}
                  value={formData.donationAddress}
                  onChange={(e) =>
                    handleChange('donationAddress', e.target.value)
                  }
                  disabled={isEditMode}
                />
              </div>
              {errors.donationAddress && (
                <div className="absolute top-full ml-[160px] mt-1 px-2 text-xs font-bold text-rose-500 max-sm:ml-[0px] max-sm:text-[10px] max-sm:font-normal">
                  {errors.donationAddress}
                </div>
              )}
            </div>

            {/* Website Field */}
            <div className="relative flex items-center gap-2.5">
              <label htmlFor="website" className="font-bold text-neutral-800">
                Website
              </label>
              <div
                className={`h-12 w-[560px] rounded-lg bg-white px-4 py-3 outline outline-1 outline-offset-[-0.50px] max-sm:w-[189px] ${
                  errors.website ? 'outline-rose-500' : 'outline-gray-200'
                }`}
              >
                <input
                  id="website"
                  type="text"
                  placeholder={`${!isMobileWeb ? 'Website of the donation recipient. If none, type N/A.' : 'If none, type N/A'}`}
                  className="w-full bg-transparent font-normal outline-none placeholder:text-stone-300"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                />
              </div>
              {errors.website && (
                <div className="absolute top-full ml-[80px] mt-1 px-2 text-xs font-bold text-rose-500 max-sm:ml-[60px] max-sm:text-[10px] max-sm:font-normal">
                  {errors.website}
                </div>
              )}
            </div>

            {/* Twitter Field */}
            <div className="relative flex items-center gap-2.5">
              <label htmlFor="twitter" className="font-bold text-neutral-800">
                Twitter
              </label>
              <div
                className={`h-12 w-[560px] rounded-lg bg-white px-4 py-3 outline outline-1 outline-offset-[-0.50px] max-sm:w-[194px] ${
                  errors.twitter ? 'outline-rose-500' : 'outline-gray-200'
                }`}
              >
                <input
                  id="twitter"
                  type="text"
                  placeholder={`${!isMobileWeb ? 'Twitter of the donation recipient. If none, type N/A.' : 'If none, type N/A'}`}
                  className="w-full bg-transparent font-normal outline-none placeholder:text-stone-300"
                  value={formData.twitter}
                  onChange={(e) => handleChange('twitter', e.target.value)}
                />
              </div>
              {errors.twitter && (
                <div className="absolute top-full ml-[70px] mt-1 px-2 text-xs font-bold text-rose-500 max-sm:ml-[60px] max-sm:text-[10px] max-sm:font-normal">
                  {errors.twitter}
                </div>
              )}
            </div>

            {/* Introduction Field */}
            <div className="relative flex items-start gap-2.5 max-sm:flex-col max-sm:items-start">
              <label
                htmlFor="introduction"
                className="w-32 font-bold text-neutral-800"
              >
                Introduction
              </label>
              <div className="flex flex-col items-start justify-start">
                <div
                  className={`relative h-36 w-[492px] rounded-lg bg-white px-4 py-3 outline outline-1 outline-offset-[-0.50px] max-sm:w-[248px] ${
                    errors.introduction
                      ? 'outline-rose-500'
                      : 'outline-gray-200'
                  }`}
                >
                  <textarea
                    id="introduction"
                    placeholder="Brief introduction of the donation recipient. Maximum length: 1000 characters"
                    className="h-full w-full resize-none border-none bg-transparent font-normal leading-normal outline-none placeholder:text-stone-300"
                    value={formData.introduction}
                    onChange={handleIntroductionChange}
                  />
                </div>
                {errors.introduction && (
                  <div className="absolute top-full mt-1 px-2 text-xs font-bold text-rose-500 max-sm:text-[10px] max-sm:font-normal">
                    {errors.introduction}
                  </div>
                )}
                {!errors.introduction &&
                  charCount >= MAX_INTRODUCTION_LENGTH * 0.9 && (
                    <span className="absolute -left-2 top-full flex items-center space-x-2 px-3 py-1 text-xs font-bold text-[#FF4D6C] max-sm:text-[10px]">
                      {`Characters: ${charCount}/${MAX_INTRODUCTION_LENGTH}`}
                    </span>
                  )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-7 max-sm:gap-2">
            <button
              className={`flex h-12 items-center rounded-lg bg-white px-7 py-5 text-base font-bold text-blue-500 outline outline-1 outline-offset-[-0.50px] outline-blue-500 max-sm:px-4 ${
                isSubmitting ? 'cursor-not-allowed opacity-50' : ''
              }`}
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            {/* {isDraftEdit && (
            <button
              className="flex h-12 items-center rounded-lg bg-red-500 px-7 py-5 text-base font-bold text-white"
              onClick={handleDeleteDraft}
            >
              Delete Draft
            </button>
          )} */}
            <button
              className={`flex h-12 items-center rounded-lg bg-white px-7 py-5 text-base font-bold text-blue-500 outline outline-1 outline-offset-[-0.50px] outline-blue-500 max-sm:px-4 ${
                isSubmitting ? 'cursor-not-allowed opacity-50' : ''
              }`}
              onClick={handleSaveAsDraft}
              disabled={isSubmitting}
            >
              {isMobileWeb ? 'Draft' : 'Save as Draft'}
            </button>
            <button
              className={`flex h-12 items-center rounded-lg bg-blue-500 px-7 py-5 text-base font-bold text-white max-sm:px-4 ${
                isSubmitting ? 'cursor-not-allowed bg-gray-400' : ''
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default RecipientPopup;
