import React, { useState, useMemo } from 'react';
import { Popup, PopupProps } from '../../components/Modal/Popup';
import { Web3Service } from '../../services/web3';
import { BigNumber } from 'ethers';
import { showError } from '../../utils/notify';
import { showSucc } from '../../utils/notify';
import { refreshVoucherAtom } from '../../atoms/web3';
import { useSetAtom } from 'jotai';
import { isMobileWeb } from '../../utils/env';

interface SendVoucherProps extends PopupProps {
  availableValue: number;
  availableQuantity: number;
  voucherId: BigNumber;
}

const SendVoucher: React.FC<SendVoucherProps> = (props) => {
  const [sendQuantity, setSendQuantity] = useState<number | ''>('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const setRefreshVoucher = useSetAtom(refreshVoucherAtom);

  // Use useMemo to optimize button disabled state and styling
  const { isDisabled, buttonClassName } = useMemo(() => {
    const disabled =
      !!addressError ||
      !!quantityError ||
      sendQuantity === 0 ||
      !recipientAddress;

    const className = `rounded-lg px-4 py-1 font-bold text-white max-sm:rounded-md max-sm:py-[10px] max-sm:text-sm md:h-12 md:px-[30px] ${
      disabled
        ? 'cursor-not-allowed bg-gray-400'
        : 'bg-[#3370FF] hover:bg-[#2563EB]'
    }`;

    return { isDisabled: disabled, buttonClassName: className };
  }, [addressError, quantityError, sendQuantity, recipientAddress]);

  const validateAddress = (address: string) => {
    // 这里添加以太坊地址验证逻辑
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setRecipientAddress(address);
    if (address && !validateAddress(address)) {
      setAddressError('Blockchain address format is incorrect');
    } else {
      setAddressError('');
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 如果是空值，直接设置为空字符串
    if (!value) {
      setSendQuantity('');
      setQuantityError('');
      return;
    }

    // 检查是否为有效的正整数
    if (/^\d+$/.test(value)) {
      const quantity = Number(value);
      setSendQuantity(quantity);
      if (quantity > props.availableQuantity) {
        setQuantityError('Sending quantity exceeds the available');
      } else {
        setQuantityError('');
      }
    }
  };

  const clearInputs = () => {
    setSendQuantity('');
    setRecipientAddress('');
    setAddressError('');
    setQuantityError('');
  };

  const handleClose = () => {
    props.setVisible(false);
    clearInputs();
  };

  const handleSend = async () => {
    try {
      const transaction = await Web3Service.service.transferVoucher(
        [BigNumber.from(props.voucherId)],
        [BigNumber.from(sendQuantity)],
        recipientAddress
      );
      await transaction.wait();
      handleClose();
      setRefreshVoucher((prev) => prev + 1);
      showSucc('Voucher sent');
    } catch (e: any) {
      showError('Network Error');
    }
  };

  return (
    <Popup {...props}>
      <div className="relative h-[288px] w-[280px] rounded-2xl bg-white p-4 pt-10 text-[#323232] max-sm:rounded-lg md:w-[1136px] md:px-10 md:pb-10 md:pt-[60px]">
        <div
          className="absolute right-1.5 top-1.5 cursor-pointer"
          onClick={handleClose}
        >
          <i className="iconfont icon-close-outlined text-xl text-[#323232]" />
        </div>

        <section className="flex text-base font-normal max-sm:flex-col md:space-x-[30px]">
          <div className="font-bold">
            Available Voucher Value:
            <span className="ml-1 text-[#93DC08]">${props.availableValue}</span>
          </div>
          <div className="font-bold">
            Available Voucher Quantity:{' '}
            <span className="text-[#93DC08]">{props.availableQuantity}</span>
          </div>
        </section>

        <section className="mt-[20px] flex h-[74px] max-sm:flex-col max-sm:space-y-[10px] md:space-x-5">
          <div className="flex flex-col">
            <div className="flex">
              <div className="mt-[13px] text-[16px] font-bold max-sm:hidden">
                Quantity to Send
              </div>

              <section className="relative max-sm:w-full">
                <input
                  value={sendQuantity}
                  onChange={handleQuantityChange}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={
                    isMobileWeb
                      ? 'Enter voucher quantity to send'
                      : 'Enter the number'
                  }
                  className={`h-9 w-[248px] border max-sm:text-sm md:ml-[10px] md:h-12 md:w-[183px] md:placeholder:font-normal ${
                    quantityError ? 'border-[#FF4D6C]' : 'border-[#E7E7E9]'
                  } rounded-lg px-4 font-normal outline-none placeholder:text-[#C8C8C9] max-sm:rounded-md md:px-6 md:py-3`}
                />
                {quantityError && (
                  <div className="absolute bottom-0 left-[16px] text-nowrap text-xs text-red-500 max-sm:text-[10px] max-sm:font-normal max-sm:leading-3 md:-bottom-[26px] md:left-[10px]">
                    {quantityError}
                  </div>
                )}
              </section>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex">
              <div className="mt-[13px] text-[16px] font-bold max-sm:hidden">
                Recipient Address
              </div>

              <section className="relative max-sm:w-full">
                <input
                  value={recipientAddress}
                  onChange={handleAddressChange}
                  type="text"
                  placeholder={
                    isMobileWeb
                      ? 'Enter voucher recipient address'
                      : 'Enter the voucher recipient address'
                  }
                  className={`h-9 w-[248px] border max-sm:text-sm md:ml-[10px] md:h-12 md:w-[550px] ${
                    addressError ? 'border-[#FF4D6C]' : 'border-[#E7E7E9]'
                  } rounded-lg px-4 font-normal outline-none placeholder:text-[#C8C8C9] max-sm:rounded-md md:px-6 md:py-3`}
                />
                {addressError && (
                  <div className="absolute bottom-0 left-[16px] text-nowrap text-xs text-red-500 max-sm:text-[10px] max-sm:font-normal max-sm:leading-3 md:-bottom-[26px] md:left-[10px]">
                    {addressError}
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>

        <section className="mt-[30px] flex justify-end">
          <button
            className={buttonClassName}
            disabled={isDisabled}
            onClick={handleSend}
          >
            Send Voucher
          </button>
        </section>
      </div>
    </Popup>
  );
};

export default SendVoucher;
