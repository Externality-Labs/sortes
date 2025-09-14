import { useAtomValue } from 'jotai';
import { web3ServiceInitedAtom } from '../../atoms/web3';
import useVoucher from '../../hooks/voucher';
import Token from '../../utils/token';
import { Link } from 'react-router-dom';

const Voucher = () => {
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const { voucherQuantity } = useVoucher(1, Token.tokenMap.usdc);
  const { voucherQuantity: voucherQuantity2 } = useVoucher(
    10,
    Token.tokenMap.usdc
  );
  const voucherValue = voucherQuantity + voucherQuantity2 * 10;
  const hasVoucher = voucherValue > 0.01;
  const voucherDisplay = hasVoucher
    ? voucherValue >= 1000
      ? '$1k+'
      : `$${voucherValue}`
    : 'Get Voucher';

  if (!isWeb3ServiceInited) return null;
  const voucherTwitterPost = 'https://x.com/sortesfun';
  return (
    <Link
      to={hasVoucher ? '/play' : voucherTwitterPost}
      target="_blank"
      className="font-roboto text-lg font-normal"
    >
      <span className="hidden h-10 items-center rounded-lg bg-white p-[10px] sm:flex">
        <i className="icon-voucher iconfont text-2xl text-[#FFA41B]" />
        <span className="ml-2 text-base text-mainV1">{voucherDisplay}</span>
      </span>
      <span className="mb-5 flex h-[60px] w-64 items-center justify-center rounded-xl bg-mainV1 sm:hidden">
        <span className="relative">
          <i className="icon-voucher-long iconfont text-3xl text-[#FFA41B]" />
          <span className="absolute left-6 top-[3px] text-mainV1">Voucher</span>
        </span>
        <span className="ml-2 text-white">{voucherDisplay}</span>
      </span>
    </Link>
  );
};

export default Voucher;
