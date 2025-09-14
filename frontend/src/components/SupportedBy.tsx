import { Link } from 'react-router-dom';
import pngArbitrum from '../assets/images/support/arbitrum.png';
import pngArpa from '../assets/images/support/arpa.png';
import pngSupranational from '../assets/images/support/supranational.png';

import moongatePng from '../assets/images/support/moongate.png';
import pngUniswap from '../assets/images/support/uniswap.png';
import pngChainLink from '../assets/images/support/chainLink.png';
import pngEth from '../assets/images/support/eth.png';
import pngWormhole from '../assets/images/support/wormhole.png';
import maskSvg from '../assets/images/support/mask.svg';
import ethDenverPng from '../assets/images/support/ethDenver.png';
import ethTaipeiPng from '../assets/images/support/ethTaipei.png';
import bnbChainSvg from '../assets/images/support/bnbChain.svg';
import blockChainScotLandPng from '../assets/images/support/blockChainScotLand.png';
import baseSvg from '../assets/images/support/base.svg';
const supportData = [
  {
    url: 'https://ethereum.foundation/',
    image: pngEth,
    height: 70,
    mobileHeight: 32,
  },
  {
    url: 'https://uniswap.org/',
    image: pngUniswap,
    height: 60,
    mobileHeight: 32,
  },
  {
    url: 'https://chain.link/',
    image: pngChainLink,
    height: 63,
    mobileHeight: 32,
  },
  {
    url: 'https://www.arpanetwork.io/en-US/about',
    image: pngArpa,
    height: 42,
    mobileHeight: 25,
  },

  {
    url: 'https://arbitrum.io/',
    image: pngArbitrum,
    height: 60,
    mobileHeight: 32,
  },
  {
    url: 'https://www.base.org/',
    image: baseSvg,
    height: 45,
    mobileHeight: 25,
  },
  {
    url: 'https://www.bnbchain.org/',
    image: bnbChainSvg,
    height: 55,
    mobileHeight: 28,
  },
  {
    url: 'https://www.blockchainscotland.xyz/',
    image: blockChainScotLandPng,
    height: 55,
    mobileHeight: 28,
  },

  {
    url: 'https://www.moongate.id/',
    image: moongatePng,
    height: 45,
    mobileHeight: 25,
  },
  { url: 'https://www.mask.io/', image: maskSvg, height: 60, mobileHeight: 32 },

  {
    url: 'https://www.ethdenver.com/',
    image: ethDenverPng,
    height: 55,
    mobileHeight: 34,
  },
  {
    url: 'https://ethtaipei.org/',
    image: ethTaipeiPng,
    height: 55,
    mobileHeight: 32,
  },

  {
    url: 'https://wormhole.com/',
    image: pngWormhole,
    height: 22,
    mobileHeight: 16,
  },
  {
    url: 'https://www.supranational.net/',
    image: pngSupranational,
    height: 55,
    mobileHeight: 32,
  },
];

const SupportedBy = () => {
  // 将支持者数据分为四行
  const row1 = supportData.slice(0, 4);
  const row2 = supportData.slice(4, 8);
  const row3 = supportData.slice(8, 12);
  const row4 = supportData.slice(12); // 最后两个

  return (
    <div className="mx-auto w-full space-y-12 max-sm:space-y-6 md:w-[1134px]">
      <h1
        className={`mt-0 text-2xl font-bold text-mainV1 md:pl-[26px] md:text-4xl`}
      >
        Supported by
      </h1>{' '}
      <style>{`
        @media (max-width: 639px) {
          .support-logo {
            height: var(--mobile-height) !important;
          }
        }
      `}</style>
      {/* 第二行 */}
      <div className="flex flex-col items-center gap-y-[60px] max-sm:gap-y-6 md:flex-row md:flex-wrap md:justify-center md:gap-x-[60px]">
        {row1.map((item) => (
          <Link
            to={item.url}
            key={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <img
              src={item.image as string}
              alt=""
              className="support-logo object-contain"
              style={
                {
                  height: `${item.height}px`,
                  '--mobile-height': `${item.mobileHeight}px`,
                } as React.CSSProperties & { '--mobile-height': string }
              }
            />
          </Link>
        ))}
      </div>
      {/* 第二行 */}
      <div className="flex flex-col items-center gap-y-[60px] max-sm:gap-y-6 md:flex-row md:flex-wrap md:justify-center md:gap-x-[60px]">
        {row2.map((item) => (
          <Link
            to={item.url}
            key={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <img
              src={item.image as string}
              alt=""
              className="support-logo object-contain"
              style={
                {
                  height: `${item.height}px`,
                  '--mobile-height': `${item.mobileHeight}px`,
                } as React.CSSProperties & { '--mobile-height': string }
              }
            />
          </Link>
        ))}
      </div>
      {/* 第三行 */}
      <div className="flex flex-col items-center gap-y-[60px] max-sm:gap-y-6 md:w-[1156px] md:flex-row md:flex-wrap md:justify-center md:gap-x-[50px]">
        {row3.map((item) => (
          <Link
            to={item.url}
            key={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <img
              src={item.image as string}
              alt=""
              className="support-logo object-contain"
              style={
                {
                  height: `${item.height}px`,
                  '--mobile-height': `${item.mobileHeight}px`,
                } as React.CSSProperties & { '--mobile-height': string }
              }
            />
          </Link>
        ))}
      </div>
      {/* 第四行（最后两个） */}
      <div className="flex flex-col items-center gap-y-[60px] max-sm:gap-y-6 md:flex-row md:justify-center md:gap-y-0 md:space-x-[100px]">
        {row4.map((item) => (
          <Link
            to={item.url}
            key={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <img
              src={item.image as string}
              alt=""
              className="support-logo object-contain"
              style={
                {
                  height: `${item.height}px`,
                  '--mobile-height': `${item.mobileHeight}px`,
                } as React.CSSProperties & { '--mobile-height': string }
              }
            />
          </Link>
        ))}
      </div>
    </div>
  );
};
export default SupportedBy;
