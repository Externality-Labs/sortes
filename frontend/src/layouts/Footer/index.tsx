import { Link } from 'react-router-dom';
import Links from '../../utils/links';
import logTitle from '../../assets/svg/logo-title.svg';

export const MediaLink: React.FC<{
  iconClz: string;
  href: string;
}> = ({ href, iconClz }) => {
  return (
    <Link to={href} target="_blank" rel="noreferrer">
      <span
        className={
          'iconfont flex size-10 cursor-pointer items-center justify-center rounded-full border border-white hover:bg-white max-sm:size-6 max-sm:border-white ' +
          iconClz
          //  + judgeColor()
        }
      ></span>
    </Link>
  );
};

interface FooterProps {
  mode: 'swap' | 'sortes' | 'home';
  bottomText: string;
}

const bgColors = {
  swap: 'linear-gradient(273deg, rgba(255, 90, 116, 0.12) 0%, rgba(185, 80, 240, 0.12) 50.65%, rgba(58, 78, 255, 0.12) 100%), var(--Neutral-000, #FFF)',
  sortes: 'var(--mainV1, #7B61FF)',
  home: 'linear-gradient(277deg, #79F1A4 -35.71%, #0E549C 79.58%)',
};

const Footer: React.FC<FooterProps> = ({ mode, bottomText }) => {
  return (
    <>
      <footer
        className={`hidden w-full bg-[#7B61FF] px-10 py-10 text-white ${mode !== 'home' ? 'md:block' : 'hidden'} md:py-20`}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 text-left text-sm text-white md:grid-cols-5 md:text-base">
          <div className="col-span-1 -mt-[22px] flex flex-col space-y-2">
            <img src={logTitle} alt="logo" />
          </div>

          {/* Products */}
          <div className="col-span-1 flex flex-col space-y-2">
            <div className="font-bold">Products</div>
            <Link to="/play">Play</Link>
            <Link to="/pools">Pools</Link>
            <Link to="/create-spd-table">Impact Draw</Link>
            <Link to="/charity-governance">Charity Governance</Link>
            <Link to="/charity-donation">Charity Donation</Link>
          </div>

          {/* User Benefits */}
          <div className="col-span-1 flex flex-col space-y-2">
            <div className="font-bold">User Benefits</div>
            <Link to="/Voucher">Voucher</Link>
            <Link to="/exp">EXP Points</Link>
            <Link to="/vip">VIP System</Link>
          </div>

          {/* Protocol */}
          <div className="col-span-1 flex flex-col space-y-2">
            <div className="font-bold">Protocol</div>
            <a href={Links.Tokenomic} target="_blank" rel="noreferrer">
              Tokenomics
            </a>
            <a href={Links.Whitepaper} target="_blank" rel="noreferrer">
              WhitePaper
            </a>
            {/* <a href={Links.Github} target="_blank" rel="noreferrer">
              Github
            </a> */}
            <a href={Links.Gitbook} target="_blank" rel="noreferrer">
              Docs
            </a>
          </div>

          {/* Social Media */}
          <div className="col-span-1">
            <div className="mb-2 font-bold">Follow Us</div>
            <div className="flex space-x-3">
              <MediaLink
                iconClz="icon-Twitter-logo bg-white text-black text-xl"
                href={Links.Twitter}
              />
              <MediaLink
                iconClz="icon-TG_default text-[37px] text-[#2AABEE] bg-white"
                href={Links.Telegram}
              />
              <MediaLink
                iconClz="icon-Discord_default text-4xl text-[#5865f2] bg-white"
                href={Links.Discord}
              />
              <MediaLink
                iconClz="icon-Medium-logo text-black bg-white"
                href={Links.Medium}
              />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center justify-between border-t border-white pt-5 text-[10px] text-white md:text-sm">
          <div className="mb-2 flex space-x-9 md:mb-0">
            <span>© 2025 Externality Labs</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex space-x-4">
            <span className="cursor-pointer">Restricted Regions Policy</span>
            <span className="cursor-pointer">Privacy Policy</span>
            <span className="cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

      <footer
        style={{
          background: bgColors[mode],
        }}
        className={`m-auto w-full py-[85px] text-center max-sm:py-[30px] ${mode === 'home' ? 'block' : 'md:hidden'}`}
      >
        <p
          className={`text-sm max-sm:font-bold md:text-xl ${
            mode === 'swap' ? 'text-mainV1' : 'text-white'
          }`}
        >
          Join in Community
        </p>
        <p className="my-[10px] flex justify-center space-x-5 text-white md:my-5">
          <MediaLink
            iconClz="icon-Twitter-logo bg-white text-black text-xl max-sm:text-black max-sm:text-[12px] max-sm:bg-white   "
            href={Links.Twitter}
          />
          <MediaLink
            iconClz="icon-TG_default text-[37px] text-[#2AABEE] bg-white max-sm:text-[24px] max-sm:text-[#26a5e5] max-sm:bg-white "
            href={Links.Telegram}
          />
          <MediaLink
            href={Links.Discord}
            iconClz="icon-Discord_default text-4xl text-[#5865f2] bg-white max-sm:text-[24px] max-sm:text-[#5865F2] max-sm:bg-white "
          />
          <MediaLink
            href={Links.Medium}
            iconClz="icon-Medium-logo  text-black max-sm:text-[10px] bg-white max-sm:text-black max-sm:bg-white "
          />
        </p>
        <p
          className={`text-[8px] md:text-base ${
            mode === 'swap' ? 'text-mainV1' : 'text-white'
          }`}
        >
          {bottomText}
        </p>
      </footer>
    </>
  );
};

export default Footer;
