import { useCallback, useEffect, useState } from 'react';
import { useRef } from 'react';
import IconXbit from '../../../assets/icons/icon-XBit.png';
import { Web3Service } from '../../../services/web3';
import { useJkptBalance, useXbitBalance } from '../../../hooks/balance';
import { useJkpt, useXbitPrice } from '../../../hooks/pool';
import { Link, useSearchParams } from 'react-router-dom';
import { showError, showSucc } from '../../../utils/notify';
import Spin from '../../../components/Spin';
import JkptIcon from '../../../components/jkpt/Icon';
import MinerLeftImage from '../.././../assets/images/miner/miner-left.svg';
import MinerRightImage from '../.././../assets/images/miner/miner-right.svg';
import MinerLeftImageMobile from '../.././../assets/images/miner/miner-left-mobile.svg';
import MinerRightImageMobile from '../.././../assets/images/miner/miner-right-mobile.svg';
import { formatTokenAmount } from '../../../utils/format';
import Token from '../../../utils/token';
import { isMobileWeb } from '../../../utils/env';
import { Tokens } from '../../../utils/address';

const IconJkptComp = ({
  tokenAddress,
}: {
  tokenAddress: string;
  setTokens: (tokenAddress: string, lpAddress: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span
      className="relative flex w-[112px] cursor-pointer items-center rounded-full px-4 py-[7px] font-normal max-sm:w-[91px] max-sm:px-2"
      style={{ background: 'rgba(255, 164, 27, 0.50)' }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <JkptIcon
        tokenAddress={tokenAddress}
        sizeClz="size-[22px] max-sm:size-[18px]"
      />

      <span className="ml-1 text-center text-sm max-sm:mr-2 max-sm:text-xs">
        {Token.getTokenByAddress(tokenAddress).name.toUpperCase()}
      </span>
    </span>
  );
};

const IconXbitComp = ({ xTokenName }: { xTokenName: string }) => (
  // -ml-3解决了往右偏移的问题
  <span className="-ml-3 flex shrink-0 items-center space-x-1 text-nowrap rounded-full bg-[#D5F3EA] px-4 py-1.5 font-normal">
    <img
      className="size-[22px] max-sm:size-5"
      src={IconXbit}
      alt="X-Token"
    ></img>
    <span className="flex-1 text-center text-sm max-sm:text-xs">
      {xTokenName}
    </span>
  </span>
);

const ReadOnlyInput: React.FC<{ value: number | null }> = ({ value }) => (
  <input
    id="wallet-readonly"
    className="flex-1 text-base font-normal text-[#3F3535] placeholder:text-[#3F3535] focus:outline-none max-sm:text-base"
    placeholder="---"
    value={value || '---'}
    readOnly
  ></input>
);

const WalletExchange: React.FC<{
  tokenAddress: string;
  setTokens: (tokenAddress: string, lpAddress: string) => void;
}> = ({ tokenAddress, setTokens }) => {
  const inputRef = useRef(null);

  const [searchParams] = useSearchParams();
  const [isDeposit, setIsDeposit] = useState<boolean>(true);
  const [amount, setAmount] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const xbitPrice = useXbitPrice(tokenAddress);
  const { balance, loadBalance } = useJkptBalance(tokenAddress);
  const { xbitBalance, loadXbitBalance } = useXbitBalance(tokenAddress);
  const { jkptName } = useJkpt(tokenAddress);
  const xTokenName = `x-${jkptName}`.toUpperCase();

  const disabled = amount === '0' || amount === null || loading;

  const setDepositAmount = useCallback((val: string | number) => {
    const floatVal = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(floatVal)) setAmount('');
    else setAmount((Math.floor(floatVal * 1e8) / 1e8).toFixed(8));
  }, []);

  useEffect(() => {
    const depositVal = searchParams.get('deposit');
    const withdrawVal = searchParams.get('withdraw');
    if (!inputRef.current) return;
    if (depositVal) {
      setIsDeposit(true);
      setDepositAmount(parseFloat(depositVal).toFixed(8));
      (inputRef.current as HTMLInputElement).value = depositVal;
      (inputRef.current as HTMLInputElement).focus();
    } else if (withdrawVal) {
      setIsDeposit(false);
      setAmount(parseFloat(withdrawVal).toFixed(8));
      (inputRef.current as HTMLInputElement).value = withdrawVal;
      (inputRef.current as HTMLInputElement).focus();
      (inputRef.current as HTMLInputElement).dispatchEvent(
        new Event('change', { bubbles: true })
      );
    }
  }, [searchParams, setDepositAmount]);

  const switchTab = useCallback(
    (isDeposit: boolean) => {
      setIsDeposit(isDeposit);
      if (isDeposit) loadBalance();
      else loadXbitBalance();
    },
    [loadBalance, loadXbitBalance]
  );

  const handleDeposit = useCallback(
    async (value: string | null, isDeposit: boolean) => {
      if (value === null) return;
      setLoading(true);
      try {
        if (isDeposit) {
          await Web3Service.service.deposit(value, jkptName as keyof Tokens);
          showSucc('Deposit success!');
          loadBalance();
        } else {
          await Web3Service.service.withdraw(value, jkptName as keyof Tokens);
          showSucc('Withdraw success!');
          loadXbitBalance();
        }
        setAmount('0');
        if (inputRef && inputRef.current)
          (inputRef.current as HTMLInputElement).value = '';
      } catch (e: any) {
        showError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [loadBalance, loadXbitBalance, jkptName]
  );

  const handleClickMax = useCallback(() => {
    if (!balance || !isDeposit) return;
    setDepositAmount(balance);
  }, [isDeposit, setDepositAmount, balance]);
  return (
    <section
      className="h-[483px] rounded-xl bg-[#f7faff] px-10 pb-3 pt-[31px] max-sm:h-[375px] max-sm:px-4 max-sm:pt-[25px] md:ml-[45px] md:w-[453px]"
      style={{
        backgroundImage: `url("${
          isDeposit
            ? isMobileWeb
              ? MinerLeftImageMobile
              : MinerLeftImage
            : isMobileWeb
              ? MinerRightImageMobile
              : MinerRightImage
        }")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="text-2xl max-sm:font-medium">
        {(() => {
          if (isDeposit) {
            return (
              <>
                <span className="mr-32 cursor-pointer font-bold text-mainV1 max-sm:mr-[100px] max-sm:text-2xl">
                  Deposit
                </span>
                <span
                  className="font-normal text-mainV1 hover:cursor-pointer max-sm:text-xl"
                  onClick={() => switchTab(false)}
                >
                  Withdraw
                </span>
              </>
            );
          } else {
            return (
              <>
                <span
                  className="mr-32 cursor-pointer font-normal text-mainV1 max-sm:mr-[100px] max-sm:text-xl"
                  onClick={() => switchTab(true)}
                >
                  Deposit
                </span>
                <span className="font-bold text-mainV1 hover:cursor-pointer max-sm:text-2xl">
                  Withdraw
                </span>
              </>
            );
          }
        })()}
      </div>
      <div className="mt-[57px] flex items-center justify-between text-sm text-[#FFA41B] sm:text-base">
        <div
          className={`flex sm:items-center ${isDeposit ? 'text-[#FFA41B]' : 'text-[#93DC08]'}`}
        >
          <span className="mr-1">Balance:</span>
          <span>
            <span className="mr-1">
              {isDeposit
                ? formatTokenAmount(balance)
                : formatTokenAmount(xbitBalance)}
            </span>
            <span>{isDeposit ? jkptName.toUpperCase() : xTokenName}</span>
          </span>
        </div>

        {isDeposit && (
          <span className="mr-[13px] flex rounded bg-[#3487FF] px-2 py-1 text-sm font-bold text-white">
            <Link
              className="text-nowrap text-[10px] max-sm:text-[8px]"
              to="https://app.uniswap.org/"
              target="_blank"
            >
              Swap USD to {jkptName.toLocaleUpperCase()}
            </Link>
          </span>
        )}
      </div>
      <div className="relative mb-5 mt-4 rounded-2xl border border-[#7B61FF] bg-white px-[15px] py-5 max-sm:my-4 max-sm:px-4 max-sm:py-[10px] max-sm:text-sm">
        <div className="relative flex items-center">
          <input
            id="wallet-input"
            ref={inputRef}
            type="number"
            onWheel={() =>
              inputRef.current && (inputRef.current as HTMLInputElement).blur()
            }
            min={0}
            className="flex-1 text-base font-normal text-[#3F3535] placeholder:text-[#3F3535] focus:outline-none max-sm:text-base"
            placeholder="Amount"
            value={amount ? parseFloat(amount) : ''}
            onChange={(e) => {
              setDepositAmount(e.target.value);
            }}
          />

          {isDeposit && (
            <span
              className="absolute right-[140px] top-2 cursor-pointer text-base text-link underline underline-offset-4 max-sm:right-[100px] max-sm:text-base"
              onClick={handleClickMax}
            >
              Max
            </span>
          )}
          <div className="flex-shrink-0">
            {isDeposit ? (
              <IconJkptComp tokenAddress={tokenAddress} setTokens={setTokens} />
            ) : (
              <IconXbitComp xTokenName={xTokenName} />
            )}
          </div>
        </div>
        <div className="absolute left-0 right-0 my-5 border-t border-[#7B61FF] max-sm:my-3"></div>
        <div className="mt-10 flex max-sm:mt-6">
          <ReadOnlyInput
            value={(() => {
              if (amount === null || xbitPrice === null) return null;
              return isDeposit
                ? parseFloat(amount) / (xbitPrice as number)
                : parseFloat(amount) * (xbitPrice as number);
            })()}
          />
          {isDeposit ? (
            <IconXbitComp xTokenName={xTokenName} />
          ) : (
            <IconJkptComp tokenAddress={tokenAddress} setTokens={setTokens} />
          )}
        </div>
      </div>
      <div className="mb-[30px] font-normal leading-none text-[#3F3535] max-sm:mb-5 max-sm:text-sm">
        <span>
          1 {xTokenName} = {formatTokenAmount(xbitPrice)}{' '}
          {jkptName.toUpperCase()}
        </span>
      </div>
      <div
        className={`flex justify-center rounded-xl py-[23px] text-2xl text-white max-sm:py-4 max-sm:text-base ${
          disabled ? 'bg-[#FFA41B]/50' : 'bg-[#FFA41B]'
        }`}
      >
        <button
          disabled={disabled}
          onClick={() => handleDeposit(amount, isDeposit)}
        >
          {!loading &&
            (isDeposit
              ? `Deposit ${jkptName.toUpperCase()} to Pool`
              : `Withdraw ${jkptName.toUpperCase()} to Wallet`)}
          {loading && <Spin className="h-8 w-8"></Spin>}
        </button>
      </div>
    </section>
  );
};

export default WalletExchange;
