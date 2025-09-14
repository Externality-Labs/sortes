import React, { useState } from 'react';
import useVoucher from '../../hooks/voucher';
import SendVoucher from './SendVoucher';
import Token from '../../utils/token';
import { Link } from 'react-router-dom';
import Links from '../../utils/links';

interface VoucherPageProps {}
interface VoucherButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive: boolean;
  children: React.ReactNode;
}
const VoucherButton: React.FC<VoucherButtonProps> = (props) => {
  const { children, isActive, className, onClick } = props;

  return (
    <div
      className={`mt-[10px] ${className} flex w-[calc(50vw-20px)] cursor-pointer flex-col items-center justify-center gap-[10px] text-nowrap rounded-lg max-sm:mt-1 max-sm:rounded-md md:w-[450px] ${
        isActive ? 'bg-[#93DC08]' : 'bg-[#E5DFFF]'
      } px-5 py-4 text-sm font-normal leading-normal text-white md:text-[18px] md:font-bold`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const VoucherPage: React.FC<VoucherPageProps> = () => {
  const { voucherQuantity, voucherId } = useVoucher(1, Token.tokenMap.usdc);
  const { voucherQuantity: voucherQuantity2, voucherId: voucherId2 } =
    useVoucher(10, Token.tokenMap.usdc);
  const [showSend, setShowSend] = useState(false);
  const [selectedValue, setSelectedValue] = useState<1 | 10>(1);
  return (
    <div className="mx-auto mb-5 w-full px-3 pt-[30px] md:my-10 md:w-[1100px] md:px-[90px]">
      <SendVoucher
        voucherId={selectedValue === 1 ? voucherId! : voucherId2!}
        visible={showSend}
        setVisible={() => setShowSend(!showSend)}
        availableValue={
          selectedValue === 1 ? voucherQuantity : voucherQuantity2 * 10
        }
        availableQuantity={
          selectedValue === 1 ? voucherQuantity : voucherQuantity2
        }
      />
      <header>
        <section>
          <header className="flex text-[18px] max-sm:flex-col max-sm:gap-1 md:pl-[15px] md:pt-10 md:text-[24px]">
            <div className="flex">
              <h1 className="font-bold leading-none text-mainV1 max-sm:!leading-[21px]">
                Accumulated Vouchers:
              </h1>
              <h2 className="ml-[10px] leading-none text-[#93DC08]">
                {voucherQuantity + voucherQuantity2}
              </h2>
            </div>
            <div className="flex md:ml-20">
              <h1 className="font-bold leading-none text-mainV1 max-sm:!leading-[21px]">
                Accumulated Voucher Amount:
              </h1>
              <h2 className="ml-[10px] leading-none text-[#93DC08]">
                $ {voucherQuantity + voucherQuantity2 * 10}
              </h2>
            </div>
          </header>

          <main className="mt-5 flex space-x-[10px] md:mt-10 md:space-x-5">
            <section>
              <div className="flex w-[calc(50vw-20px)] items-center rounded-lg border-[1px] border-mainV1 p-5 max-sm:rounded-md md:h-[132px] md:w-[450px] md:rounded-2xl md:px-10 md:py-4">
                <i className="iconfont icon-voucher text-3xl text-mainV1 max-sm:text-xl"></i>
                <h1 className="leading-trim-both text-edge-cap ml-5 text-base font-bold text-mainV1 md:text-[40px]">
                  $1 ×{' '}
                  <span
                    className={
                      voucherQuantity > 0 ? 'text-[#93DC08]' : 'text-[#E5DFFF]'
                    }
                  >
                    {voucherQuantity}
                  </span>
                </h1>
              </div>
              <VoucherButton
                isActive={voucherQuantity > 0}
                onClick={() => {
                  setSelectedValue(1);
                  setShowSend(true);
                }}
              >
                <span className="max-sm:hidden">
                  Send Voucher to Your Friend
                </span>
                <span className="sm:hidden">Send Voucher to Fren</span>
              </VoucherButton>
            </section>
            <section>
              <div className="flex w-[calc(50vw-20px)] items-center rounded-lg border-[1px] border-mainV1 p-5 md:h-[132px] md:w-[450px] md:rounded-2xl md:px-10 md:py-4">
                <i className="iconfont icon-voucher text-3xl text-mainV1 max-sm:text-xl"></i>
                <h1 className="leading-trim-both text-edge-cap ml-5 text-base font-bold text-mainV1 md:text-[40px]">
                  $10 ×{' '}
                  <span
                    className={
                      voucherQuantity2 > 0 ? 'text-[#93DC08]' : 'text-[#E5DFFF]'
                    }
                  >
                    {voucherQuantity2}
                  </span>
                </h1>
              </div>
              <VoucherButton
                isActive={voucherQuantity2 > 0}
                onClick={() => {
                  setSelectedValue(10);
                  setShowSend(true);
                }}
              >
                <span className="max-sm:hidden">
                  Send Voucher to Your Friend
                </span>
                <span className="sm:hidden">Send Voucher to Fren</span>
              </VoucherButton>
            </section>
          </main>
        </section>

        <section className="mt-20 w-full max-sm:hidden">
          <h1 className="mb-4 flex w-full justify-center text-[36px] font-bold leading-normal text-mainV1">
            Official Tasks
          </h1>

          <Link to={Links.SatoshiMiner}>
            <VoucherButton className="md:w-full" isActive={true}>
              Get Free Vouchers
            </VoucherButton>
          </Link>
          {/* <h2 className="mt-[10px] font-normal text-[#666]">
            No tasks available right now. Stay tuned.
          </h2> */}
        </section>
      </header>
      <main className="mt-9 md:mt-20">
        <h1 className="mb-5 text-[18px] font-bold leading-[21px] text-mainV1 max-sm:mb-2 md:mb-6 md:text-[36px] md:leading-[48px]">
          About Sortes Voucher
        </h1>
        <div className="rounded-2xl border-2 border-[#7B61FF] p-4 text-sm font-normal text-[#666] max-sm:rounded-lg md:p-10 md:text-[20px]">
          <h1 className="font-bold leading-[17px] md:leading-[42px]">
            Introduction
          </h1>
          <p className="mt-[10px] leading-[17px] md:leading-[42px]">
            Sortes Vouchers are issued by the Sortes platform and can only be
            used to play on Sortes platform.
          </p>
          <h1 className="mt-6 font-bold leading-[17px] md:leading-[42px]">
            Usage Rules
          </h1>
          <div className="mt-[10px]">
            <ul className="list-disc pl-5 leading-[17px] marker:text-base md:leading-[42px]">
              <li>
                Vouchers are for Sortes Play use only. It can also be shared to
                your friend.(Gas needed)
              </li>
              <li>
                When selecting a customized draw, vouchers cannot be used, even
                if the user's total voucher balance matches the customized draw
                amount.
              </li>
              <li>
                Vouchers cannot be combined with other tokens for payment (e.g.,
                a $1 voucher + $9 USDT cannot be used to pay for a $10 ticket).
              </li>
              <li>Vouchers have no expiration date.</li>
              <li>
                To Play with a Voucher, the user's wallet must hold at least
                0.001 Arbitrum ETH to serve as gas fee.
              </li>
              <li>
                Voucher denominations and issuance quantities are determined by
                Sortes only and may be adjusted at any time.
              </li>
              <li>
                Conditions for receiving vouchers and gifting policies are set
                by Sortes only and may be adjusted at any time.
              </li>
              <li>
                Sortes reserves the right to interpret all rules regarding
                Sortes Voucher.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoucherPage;
