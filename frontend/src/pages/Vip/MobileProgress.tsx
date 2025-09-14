import { useVipInfo } from '../../hooks/vip';
import { vipDesc } from './constants';

const MobileProgress = ({ config }: any) => {
  const { vip } = useVipInfo();
  return config.map((item: any, i: number) => (
    <div className="mt-5 flex justify-start gap-0" key={i}>
      <div className="flex w-12 flex-col items-center">
        <item.avatar
          className="size-10"
          alt=""
          color={vip > i ? '#7B61FF' : '#D7D0FF'}
        />
        <div className="relative mt-2.5 w-2.5 flex-1 rounded-md bg-bg3 max-sm:w-[4px]">
          {item.showText ? (
            <span
              className="absolute text-[10px] font-bold leading-5 text-[#FFA41B]"
              style={{
                transform: ' translateY(-70%)  translateX(60%)',
                top: item.progress,
              }}
            >
              {item.progress}
            </span>
          ) : null}
          {item.showProgress ? (
            <div
              className="w-2.5 rounded-md bg-[#FFA41B] max-sm:w-[4px]"
              style={{
                height: item.progress,
              }}
            />
          ) : null}
        </div>
      </div>
      <div className="ml-[46px] flex-1 rounded-2xl bg-white p-5">
        <div
          className={`inline-block rounded-lg ${vip <= i ? 'bg-[#7B61FF4D]/30' : 'bg-mainV1'} px-5 py-2.5 text-base font-bold leading-5 text-white`}
        >
          {`VIP ${i + 1}`}
        </div>
        <div className="mt-2.5 text-base font-bold text-text1">
          {vipDesc[i].condition}
        </div>
        <div className="mb-2.5 mt-1 text-sm font-normal text-text2">
          {vipDesc[i].title}
        </div>
        {vipDesc[i].privileges.map((p, j) => (
          <div key={j} className="text-base font-normal text-text1">
            {p.title}
          </div>
        ))}
      </div>
    </div>
  ));
};

export default MobileProgress;
