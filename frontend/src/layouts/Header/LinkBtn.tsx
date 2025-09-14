import { Link } from 'react-router-dom';

interface LinkBtnProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  text: string;
  href: string;
  isActive: boolean;
  theme?: 'website' | 'app';
  target?: string;
  isHome?: boolean;
  textColor?: string;
}

const LinkBtn: React.FC<LinkBtnProps> = ({
  text,
  href,
  isActive,
  target,
  isHome = false,
}) => {
  const activeClz = isActive ? 'font-black text-xl' : 'text-base';

  return (
    <Link
      className={`jusfity-center group flex items-center rounded-md font-medium hover:cursor-pointer ${activeClz} ${isHome ? 'text-[#7B61FF]' : 'text-white'}`}
      to={href}
      target={target}
    >
      <span
        className={`mx-auto ${isHome ? '' : 'py-3'} font-roboto ${activeClz}`}
      >
        {text}
      </span>
    </Link>
  );
};

export default LinkBtn;
