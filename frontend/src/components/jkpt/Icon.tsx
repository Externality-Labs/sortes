// import IconTaiko from '../../assets/icons/reward-taiko-pink.png';
import IconWBTC from '../../assets/icons/icon-WBTC.png';
import IconWETH from '../../assets/icons/icon-WETH.png';
import IconWBNB from '../../assets/icons/icon-wbnb.svg';
import Token from '../../utils/token';

interface JkptIconProps {
  tokenAddress: string;
  sizeClz?: string;
}

const JkptIcon: React.FC<JkptIconProps> = ({
  tokenAddress,
  sizeClz = 'w-8 max-sm:w-6',
}) => {
  const token = Token.getTokenByAddress(tokenAddress);
  const tokenName = token?.name;
  let icon,
    alt: string = '';

  switch (tokenName) {
    // case 'taiko':
    //   icon = IconTaiko;
    //   alt = 'TAIKO';
    //   break;
    case 'weth':
      icon = IconWETH;
      alt = 'WETH';
      break;
    case 'wbnb':
      icon = IconWBNB;
      alt = 'WBNB';
      break;
    default:
      icon = IconWBTC;
      alt = 'WBTC';
  }

  return (
    <img
      className={`inline-block h-auto ${sizeClz}`}
      src={icon}
      alt={alt}
    ></img>
  );
};

export default JkptIcon;
