import { readableAddr } from '../../utils/format';
import { useCurrentUser, useLogout } from '../../hooks/user';
import Close2 from '../../assets/svg/close2.tsx';

const CurrentUser: React.FC = () => {
  const { avatar, address } = useCurrentUser();
  const logout = useLogout();

  if (!address) return null;

  return (
    <div className="group flex h-10 items-center space-x-[10px] rounded-3xl bg-white px-[10px] py-[10px]">
      <span className="w-6">
        {/*  todo 圆形不彻底*/}
        <img className="h-6 w-6 rounded-full" src={avatar} alt={address}></img>
      </span>
      <span className="font-roboto text-base font-medium text-text1">
        {readableAddr(address)}
      </span>
      <span onClick={logout}>
        <Close2 color="#202020"></Close2>
      </span>
    </div>
  );
};

export default CurrentUser;
