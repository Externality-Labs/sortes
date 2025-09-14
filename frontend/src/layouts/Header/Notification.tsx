import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { notifyAtom, NotifyType, removeNotifyAtom } from '../../atoms/notify';

interface NotiItemProps {
  msg: string;
  type: NotifyType;
  id: string;
}

const NotiItem: React.FC<NotiItemProps> = ({ msg, type, id }) => {
  const close = useSetAtom(removeNotifyAtom);

  let icon = null;

  useEffect(() => {
    const timeout = setTimeout(() => close(id), 5 * 1000);
    return () => clearTimeout(timeout);
  }, [close, id]);

  switch (type) {
    case NotifyType.Succ:
      icon = 'icon-succ text-[#00CCAA]';
      break;

    case NotifyType.Error:
      icon = 'icon-error text-[#FF4D6C]';
      break;

    // case NotifyType.Warning:
    //   iconColor = 'bg-warning';
    //   break;

    // case NotifyType.Notice:
    //   iconColor = 'bg-link';
    //   break;

    default:
      return null;
  }

  return (
    <li className="flex max-w-80 items-start space-x-2.5 rounded-lg border border-[#CECECE] bg-white p-2.5 text-xl max-sm:text-sm sm:max-w-2xl">
      <span className="leading-9">
        <i className={'iconfont text-3xl max-sm:text-[14px] ' + icon} />
      </span>
      <span className="flex-1 overflow-hidden font-normal leading-9 text-black">
        {msg}
      </span>
    </li>
  );
};

const Notification = () => {
  const notifications = useAtomValue(notifyAtom);

  return (
    <ul className="fixed top-12 z-[99999] flex h-0 w-full flex-col items-center space-y-10 text-left text-sm">
      {Object.keys(notifications).map((id) => {
        const { msg, type } = notifications[id];
        return <NotiItem key={id} id={id} msg={msg} type={type}></NotiItem>;
      })}
    </ul>
  );
};

export default Notification;
