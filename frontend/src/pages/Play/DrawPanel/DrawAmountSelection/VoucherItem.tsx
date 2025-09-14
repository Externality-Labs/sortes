import { BigNumber } from 'ethers';
import useVoucher from '../../../../hooks/voucher';
import Token from '../../../../utils/token';
import { Link } from 'react-router-dom';

export interface VoucherStatus {
  voucherId: BigNumber;
  amount: number;
  repeats: number;
  token: Token;
}

export interface VoucherOptions {
  voucher: VoucherStatus | null;
  setVoucher: (voucher: VoucherStatus | null) => void;
}

interface VoucherItemProps extends VoucherOptions {
  // voucherId: string;
  amount: number;
}
const voucherTwitterPost = 'https://x.com/sortesfun';

const VoucherItem = ({ amount, voucher, setVoucher }: VoucherItemProps) => {
  const { voucherId, voucherQuantity } = useVoucher(
    amount,
    Token.tokenMap.usdc
  );
  const enabled = voucherQuantity > 0;
  const active = enabled && voucherId === voucher?.voucherId;
  const textColorClz = active
    ? 'text-white border-none  '
    : 'text-[#6f6bfe]  border-[#6f6bfe] ';

  return (
    <button
      disabled={!enabled}
      onClick={() => {
        if (voucherId === null) return;
        setVoucher({
          voucherId: voucherId,
          amount: amount,
          repeats: 1,
          token: Token.tokenMap.usdc,
        });
      }}
      className={`relative flex flex-1 overflow-hidden rounded-lg border border-solid px-5 py-3 text-2xl disabled:opacity-50 sm:py-6 sm:text-3xl ${textColorClz}`}
      style={{
        background: active ? '#6f6bfe' : '#fff',
      }}
    >
      <i className="iconfont icon-voucher text-3xl" />
      <span className="ml-5">${amount}</span>
      <span
        className={`absolute right-0 top-0 rounded-bl border-b border-l border-[#6f6bfe] bg-white px-2 text-xs text-[#6f6bfe] sm:py-1`}
      >
        {voucherQuantity}
      </span>
      {!enabled && (
        <Link
          to={voucherTwitterPost}
          className="-sm:bottom-1 absolute -bottom-1.5 right-2 text-[10px] text-link underline"
          target="_blank"
        >
          Go get Free Voucher
        </Link>
      )}
    </button>
  );
};

export default VoucherItem;
