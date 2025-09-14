import { readableAddr } from '../../utils/format';
import { useCurrentUser, useLogout } from '../../hooks/user';
import { showSucc } from '../../utils/notify';

const CurrentUser: React.FC = () => {
  const { avatar, address } = useCurrentUser();
  const logout = useLogout();

  if (!address) return null;

  return (
    <div className="flex w-full items-center justify-between border-b border-white/10 py-5 text-xl text-white">
      <span className="flex w-8 space-x-2">
        <img className="h-8 w-8 rounded" src={avatar} alt={address}></img>
        <span>{readableAddr(address)}</span>
      </span>
      <span className="flex space-x-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark0 text-dark4"
          onClick={logout}
        >
          <span className="iconfont_old icon-duankai-zhengchang"></span>
        </span>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark0 text-dark4"
          onClick={() => {
            navigator.clipboard.writeText(address);
            showSucc('Address Copied!');
          }}
        >
          <span className="iconfont_old icon-copy"></span>
        </span>
      </span>
    </div>
  );
};

export default CurrentUser;
