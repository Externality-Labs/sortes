import { useMemo, useState } from 'react';

import ExpCard from '../Exp/ExpCard';
import Card from './Card';
import MobileProgress from './MobileProgress';

import { useVipInfo } from '../../hooks/vip';
import { isMobileWeb } from '../../utils/env';
import { progressStyle, vipDesc } from './constants';

import ExpSrc from '../../assets/images/exp.png';
import AvatarVip1 from '../../assets/svg/avatar-vip1.tsx';
import AvatarVip2 from '../../assets/svg/avatar-vip2.tsx';
import AvatarVip3 from '../../assets/svg/avatar-vip3.tsx';
import AvatarVip4 from '../../assets/svg/avatar-vip4.tsx';

const VipPage = () => {
  const { vip, progress } = useVipInfo();
  const [descs] = useState(vipDesc);
  const [menuIndex, setMenuIndex] = useState(0);
  const [menuDesc, setMenuDesc] = useState(vipDesc[0]);

  const vipProgressConfig = useMemo(() => {
    return [
      {
        avatar: AvatarVip1,
        progressBgStyle: progressStyle[0],
        progressTextStyle: '#7B61FF',
        title: 'Adam Smith',
        progress: vip > 1 ? '100%' : progress,
        showText: vip === 1,
        showProgress: vip >= 1,
        titleStyle: {},
      },
      {
        avatar: AvatarVip2,
        progressBgStyle: progressStyle[1],
        progressTextStyle: '#26b0f6',
        title: 'Friedrich August von Hayek',
        progress: vip > 2 ? '100%' : progress,
        showText: vip === 2,
        showProgress: vip >= 2,
        titleStyle: { transform: 'translateX(-30%)' },
      },
      {
        avatar: AvatarVip3,
        progressBgStyle: progressStyle[2],
        progressTextStyle: '#8270f4',
        title: 'Robert Alexander Mundell',
        progress: vip > 3 ? '100%' : progress,
        showText: vip === 3,
        showProgress: vip >= 3,
        titleStyle: { transform: 'translateX(-30%)' },
      },
      {
        avatar: AvatarVip4,
        progressBgStyle: progressStyle[3],
        progressTextStyle: '#3579a7',
        title: 'Satoshi Nakamoto',
        progress: '100%',
        showText: vip === 4,
        titleStyle: { transform: 'translateX(-20%)' },
        showProgress: vip >= 4,
      },
    ];
  }, [vip, progress]);

  const changeMenuIndex = (index: number) => {
    if (index === menuIndex) {
      return;
    }
    setMenuIndex(index);
    setMenuDesc(vipDesc[index]);
  };

  return (
    <div className="min-h-[calc(100svh-300px)] bg-mainV1 max-sm:bg-secondary">
      <section className="mx-auto w-[1100px] bg-mainV1 pt-20 max-sm:w-full max-sm:overflow-x-scroll max-sm:px-4 max-sm:pt-0">
        {!isMobileWeb ? (
          <header className="flex items-center rounded-2xl bg-white pl-10">
            <ExpCard />
            <img className="mt-3 h-[328px] w-[621px] flex-1" src={ExpSrc} />
          </header>
        ) : (
          <div className="rounded-[18px] border-[2px] border-white p-[2px]">
            <div className="overflow-hidden rounded-2xl">
              <ExpCard />
            </div>
          </div>
        )}
        <div className="mb-[70px] mt-[80px] text-center text-4xl text-[26px] text-white max-sm:my-7 max-sm:text-xl max-sm:text-white">
          Sortes VIP System
        </div>
        {isMobileWeb ? (
          <MobileProgress config={vipProgressConfig} />
        ) : (
          <div>
            <div className="flex justify-start gap-3.5">
              {vipProgressConfig.map((item, index) => (
                <div className="flex-1" key={index}>
                  <div className="mb-2.5 flex items-center gap-4">
                    <item.avatar
                      className="size-20"
                      color={vip > index ? '#7B61FF' : '#D7D0FF'}
                    />
                    <div className="relative h-3 flex-1 rounded-md bg-bg3">
                      {item.showText ? (
                        <span
                          className="absolute text-sm leading-5"
                          style={{
                            left: item.progress,
                            transform: 'translateY(-130%) translateX(-50%)',
                            color: '#FFA41B',
                          }}
                        >
                          {item.progress}
                        </span>
                      ) : null}
                      {item.showProgress ? (
                        <div
                          className="h-3 rounded-md"
                          style={{
                            background: '#FFA41B',
                            width: item.progress,
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                  <div
                    className="inline-block text-base leading-5 text-white"
                    style={item.titleStyle}
                  >
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-start gap-5">
              {descs.map((item, index) => (
                <div
                  className="relative box-border h-[450px] flex-1 rounded-2xl bg-white p-[30px]"
                  key={index}
                >
                  <div
                    className={`inline-block rounded-lg ${vip > index ? 'bg-mainV1' : 'bg-[#7B61FF4D]'} px-5 py-2.5 text-xl font-bold leading-5 text-white`}
                  >
                    {`VIP ${index + 1}`}
                  </div>
                  <div className="mt-5 text-xl font-bold text-text1">
                    {item.condition}
                  </div>
                  <div className="mb-5 text-lg font-normal text-text2">
                    {item.title}
                  </div>
                  <div
                    className={[
                      index >= descs.length - 2
                        ? 'common-scroll-bar max-h-60'
                        : '',
                    ].join(' ')}
                  >
                    {item.privileges.map((privileges, i) => (
                      <div
                        key={i}
                        className="mb-5 text-base font-normal text-text2"
                      >
                        {privileges.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mb-[70px] mt-20 text-center text-[26px] text-white max-sm:my-7 max-sm:text-xl max-sm:text-white">
          VIP Privileges
        </div>
        <div className="flex justify-start gap-7 pb-20 max-sm:flex-col max-sm:pb-10">
          <div className="max-sm:item-center box-border flex h-[22.25rem] flex-col gap-y-5 rounded-2xl bg-white px-5 py-7 text-2xl max-sm:h-auto max-sm:flex-row max-sm:self-center max-sm:rounded-lg max-sm:p-1 max-sm:text-base">
            {vipDesc.map((_, i) => (
              <div
                key={i}
                className={
                  menuIndex === i
                    ? 'w-[200px] cursor-pointer rounded-2xl bg-mainV1 p-5 text-lg font-bold text-white max-sm:w-auto max-sm:rounded-lg max-sm:px-3 max-sm:py-1'
                    : 'text w-[200px] cursor-pointer rounded-2xl p-3.5 text-lg font-normal text-text1 max-sm:w-auto max-sm:rounded-lg max-sm:px-3 max-sm:py-1'
                }
                onClick={() => changeMenuIndex(i)}
              >
                {`VIP ${i + 1}`}
              </div>
            ))}
          </div>
          <div className="flex-1 rounded-2xl bg-white p-10 pb-[10px] max-sm:rounded-xl max-sm:p-5">
            <div className="mb-[30px] text-xl text-mainV1 max-sm:mb-2.5 max-sm:text-lg max-sm:text-mainV1">
              {`VIP ${menuIndex + 1} Privileges`}
            </div>
            {menuDesc.privileges.map((item, i) => (
              <Card key={i} title={item.title} detail={item.detail} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VipPage;
