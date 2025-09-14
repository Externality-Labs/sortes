import { FC, useState, useEffect } from 'react';
import { Popup, PopupProps } from '../../components/Modal/Popup';
import { useXexpBalance } from '../../hooks/balance';
import { Web3Service } from '../../services/web3';
import { ethers } from 'ethers';
import { expToUsd, UsdToExp } from '../../utils/format';
import ProgressBar from './ProgressBar';
import Lottie from 'lottie-react';
import LoadingHourglass from '../../assets/animations/loading-hourglass.json';
import { showSucc, showError } from '../../utils/notify';

interface VotePopupProps extends PopupProps {
  donationId: string;
  currentDonation: any;
  onSuccess?: () => void;
}

const VotePopup: FC<VotePopupProps> = ({
  visible,
  setVisible,
  donationId,
  currentDonation = {},
  onSuccess,
}) => {
  const [votingAmount, setVotingAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { xexpBalance, loadXexpBalance } = useXexpBalance();
  const [step, setStep] = useState<number>(0);
  // 添加标志位，控制是否应该通过 step 自动更新 votingAmount
  const [isManualInput, setIsManualInput] = useState<boolean>(false);
  // 添加错误状态
  const [error, setError] = useState<boolean>(false);

  // 当弹窗可见性发生变化时，重置状态
  useEffect(() => {
    if (visible) {
      // 弹窗打开时重置所有状态
      setVotingAmount('');
      setStep(0);
      setIsManualInput(false);
      setIsSubmitting(false);
      setError(false);
    }
  }, [visible]);

  // 当 step 变化时，更新 votingAmount
  useEffect(() => {
    // 如果是手动输入模式，不自动更新金额
    if (isManualInput) return;

    if (step === 0) {
      setVotingAmount('');
    } else {
      const balance = parseInt(xexpBalance || '0');
      const baseAmount = Math.floor(balance / 4);
      let finalAmount = baseAmount * step;

      // 确保金额大于等于 10 且是 10 的倍数
      if (finalAmount < 10) {
        finalAmount = 10;
      } else {
        // 将金额调整为 10 的倍数
        finalAmount = Math.floor(finalAmount / 10) * 10;
      }

      setVotingAmount(finalAmount.toString());
    }
  }, [step, xexpBalance, isManualInput]);

  // 处理投票金额变化
  const handleVotingAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许输入数字
    if (/^\d*$/.test(value)) {
      // 设置为手动输入模式
      setIsManualInput(true);
      setVotingAmount(value);

      // 校验输入值
      const amount = parseInt(value || '0');
      if (value === '' || amount === 0) {
        setError(false);
        setStep(0);
      } else if (amount < 10 || amount % 10 !== 0) {
        // 如果金额小于 10 或不是 10 的倍数，显示错误
        setError(true);
        return;
      } else {
        // 输入有效，清除错误状态
        setError(false);

        // 根据输入的金额更新 step
        const balance = parseInt(xexpBalance || '0');
        const baseAmount = Math.floor(balance / 4);

        if (amount >= baseAmount * 3) {
          setStep(3);
        } else if (amount >= baseAmount * 2) {
          setStep(2);
        } else if (amount >= baseAmount) {
          setStep(1);
        } else {
          setStep(0);
        }
      }
    }
  };

  // 设置最大投票金额
  const handleSetMaxAmount = () => {
    // 关闭手动输入模式
    setIsManualInput(false);
    // 清除错误状态
    setError(false);
    // 使用用户的 XEXP 余额作为最大投票金额
    const balance = parseInt(xexpBalance || '0');
    // 确保金额是 10 的倍数
    const maxAmount = Math.floor(balance / 10) * 10;
    setVotingAmount(maxAmount > 0 ? maxAmount.toString() : '10');
    // 同时将 step 设置为最大值
    setStep(4);
  };

  // 验证投票金额
  const validateVotingAmount = (): boolean => {
    if (votingAmount === '') return false;
    const amount = Number(votingAmount);
    return amount >= 10 && amount % 10 === 0;
  };

  // 提交投票
  const handleSubmit = async () => {
    if (!validateVotingAmount()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 获取 Web3 服务实例
      const web3Service = Web3Service.service;

      if (!web3Service) {
        return;
      }

      // 获取 sortes 合约实例
      const sortesContract = web3Service.contracts?.sortes;
      if (!sortesContract) {
        return;
      }

      // 将投票金额转换为 BigNumber 格式
      const amount = parseInt(votingAmount);

      // 使用更大的金额，最少 10^18 wei
      // 假设 XEXP 有 18 位小数，这是标准的 ERC20 代币设置
      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);

      // 如果上面的方法不起作用，可以尝试下面的方法
      // const amountInWei = ethers.BigNumber.from(amount.toString()); // 不使用小数位
      // const amountInWei = ethers.utils.parseUnits(amount.toString(), 6);  // 6 位小数

      // 确保 donationId 是数字类型
      const donationIdNumber = parseInt(donationId);

      // 获取 XEXP 代币地址
      const xexpAddress = web3Service.tokens?.xexp?.address;

      if (!xexpAddress) {
        throw new Error('cannot get xexp address');
      }

      // 创建 XEXP 代币合约实例
      const xexpContract = new ethers.Contract(
        xexpAddress,
        [
          'function approve(address spender, uint256 amount) external returns (bool)',
          'function allowance(address owner, address spender) external view returns (uint256)',
          'function balanceOf(address account) external view returns (uint256)',
        ],
        web3Service.signer
      );

      // 检查当前授权额度
      const currentAllowance = await xexpContract
        .allowance(web3Service.address, sortesContract.address)
        .catch((e: any) => {
          console.log(e);
        });

      // 如果授权额度小于我们需要的金额，则授权
      if (currentAllowance.lt(amountInWei)) {
        // 授权一个很大的金额，避免频繁授权
        const approveTx = await xexpContract.approve(
          sortesContract.address,
          ethers.constants.MaxUint256,
          { gasLimit: 100000 }
        );

        await approveTx.wait();
      }

      // 调用合约的 voteDonation 函数，添加 gas 限制

      const tx = await sortesContract.voteDonation(
        donationIdNumber,
        amountInWei,
        { gasLimit: 500000 } // 添加足够的 gas 限制
      );

      // 等待交易确认
      await tx.wait();

      // 显示成功提示
      showSucc(`Successfully voted with ${votingAmount} EXP!`);

      // 刷新EXP余额
      await loadXexpBalance();

      // 调用成功回调刷新proposal数据
      onSuccess?.();

      // 提交成功后关闭弹窗
      setVisible(false);
      // 状态重置会在 useEffect 中处理，这里不需要手动重置
    } catch (error: any) {
      console.error('Failed to vote:', error);

      // 显示错误提示
      let errorMessage = 'Failed to vote, please try again';

      // 如果错误中包含具体信息，尝试提取
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 取消投票
  const handleCancel = () => {
    setVisible(false);
    // 状态重置会在 useEffect 中处理，这里不需要手动重置
  };

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
        <div className="w-[642px] scale-95 transform rounded-2xl bg-white p-10 max-sm:w-[280px] max-sm:p-4">
          {/* 捐赠进度标题和金额 */}
          <div className="mb-12 flex w-full items-center text-2xl max-sm:mb-6 max-sm:text-sm">
            <span className="mr-[10px]font-bold text-blue-500">
              Donation Progress:&nbsp;
            </span>
            <span>
              <span className="font-bold text-blue-500">
                ${expToUsd(currentDonation?.amount) || 0}
              </span>
              <span className="font-normal text-neutral-800">/</span>
              <span className="font-bold text-neutral-800">
                ${currentDonation?.donationAmount || 0}
              </span>
            </span>
          </div>

          <section>
            <h3 className="text-right text-xl font-normal max-sm:text-sm">
              {currentDonation?.amount * 0.0001 || 0}/
              {UsdToExp(currentDonation?.donationAmount) || 0} EXP
            </h3>
            <ProgressBar
              width="max-sm:w-[248px] w-[568px]"
              value={currentDonation?.amount * 0.0001 || 0}
              max={UsdToExp(currentDonation?.donationAmount) || 1}
            />
          </section>

          {/* 投票金额输入 */}
          <div className="mt-10 flex w-full items-center justify-between gap-[10px] max-sm:flex-col max-sm:items-start">
            <span className="text-xl font-bold text-blue-500 max-sm:text-sm">
              EXP
            </span>
            <div className="relative flex h-12 w-[506px] items-center justify-between overflow-hidden rounded-lg bg-white px-4 py-3 outline outline-1 outline-offset-[-0.50px] outline-gray-200 max-sm:h-9 max-sm:w-[248px] max-sm:px-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Must be 10 or multiples of 10"
                  className="w-full border-none font-normal outline-none placeholder:font-normal placeholder:text-stone-300 max-sm:text-sm"
                  value={votingAmount}
                  onChange={handleVotingAmountChange}
                />
                {/* USD conversion display positioned after input text */}
                {votingAmount && !error && (
                  <span
                    className="pointer-events-none absolute top-0 font-normal max-sm:top-1/2 max-sm:-translate-y-1/2 max-sm:text-sm"
                    style={{
                      left: `${votingAmount.length * 8 + 10}px`,
                    }}
                  >
                    (= $
                    {(Number(votingAmount) * 0.01).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    )
                  </span>
                )}
              </div>
              <span
                className="cursor-pointer text-base font-bold text-blue-500 underline max-sm:text-sm"
                onClick={handleSetMaxAmount}
              >
                Max
              </span>
            </div>
          </div>
          {error && (
            <div className="mb-4 mt-1 text-right text-xs font-bold text-rose-500">
              Must be 10 or multiples of 10
            </div>
          )}

          {/* 步骤指示器 */}
          <div
            className={`mb-4 flex w-full transform items-center justify-end gap-1 ${
              error ? '' : 'mt-4'
            }`}
          >
            <section className="relative flex">
              {[0, 1, 2, 3].map((index) => (
                <div key={`step-${index}`} className="flex items-center gap-1">
                  <div
                    className={`${index > 0 ? 'ml-1' : ''} relative size-2 rounded-full max-sm:size-1 ${step === index ? 'h-3 w-3 border border-[#3370FF] bg-white' : step > index ? 'bg-[#3370FF]' : 'bg-zinc-300'}`}
                  >
                    <div
                      onClick={() => {
                        setIsManualInput(false);
                        setError(false);
                        setStep(index);
                      }}
                      className="absolute -left-1/2 -top-1/2 size-5 cursor-pointer rounded-full max-sm:size-2"
                    ></div>
                  </div>

                  <div
                    className={`h-1 w-[107px] rounded-[36px] max-sm:w-[50px] ${step > index ? 'bg-[#3370FF]' : 'bg-gray-200'}`}
                  ></div>
                </div>
              ))}
            </section>

            <div className="flex items-center gap-1">
              <div
                className={`relative size-2 rounded-full max-sm:size-1 ${step === 4 ? 'size-3 border border-[#202020] bg-white max-sm:size-1' : 'bg-zinc-300'}`}
              >
                <div
                  onClick={() => {
                    setIsManualInput(false);
                    setError(false);
                    setStep(4);
                  }}
                  className="absolute -left-1/2 -top-1/2 size-5 cursor-pointer rounded-full max-sm:size-2"
                ></div>
              </div>
            </div>
          </div>

          {/* EXP持有量 */}
          <p className="mb-[60px] text-right text-xs font-normal text-neutral-800 max-sm:mb-[26px]">
            Current EXP holdings: {xexpBalance}
          </p>

          {/* 按钮组 */}
          <div className="flex w-full items-center justify-end gap-7">
            <button
              onClick={handleCancel}
              className="flex h-12 items-center rounded-lg bg-white px-7 py-5 text-base font-bold text-blue-500 outline outline-1 outline-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !validateVotingAmount() || error}
              className="flex h-12 items-center rounded-lg bg-blue-500 px-7 py-5 text-base font-bold text-white disabled:opacity-50"
            >
              Vote
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default VotePopup;
