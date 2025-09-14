import Modal from '../../components/Modal/Modal';
import useChainSelection from '../../hooks/chainSelect.ts';
import { useCurrentUser } from '../../hooks/user.ts';
import { convertName } from '../../utils/format.ts';

type chainSelectMobileType = {
  mode?: 'swap' | 'sortes';
};

const ChainSelectionMobile: React.FC<chainSelectMobileType> = ({
  mode = 'sortes',
}) => {
  const {
    chainId,
    dropdownVisible,
    setDropdownVisible,
    reselectChainVisible,
    setReselectChainVisible,
    infos,
    currentChain,
    askUserToSwitchChain,
  } = useChainSelection();

  const { address } = useCurrentUser();
  if (!address) return null;

  const LogoComponent = currentChain?.logo;

  return (
    <div className="relative my-2 w-[260px] rounded-xl font-sf-compact text-lg font-semibold sm:block">
      <span
        className="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-mainV1 px-4 py-[14px]"
        onClick={() => setDropdownVisible(!dropdownVisible)}
      >
        {LogoComponent && (
          <img
            alt=""
            src={LogoComponent}
            className="mr-4 size-6 flex-shrink-0"
          ></img>
        )}
        <span className="flex h-7 min-w-0 flex-grow items-center">
          <span className="mr-4 overflow-hidden text-nowrap font-sf-compact text-lg text-black">
            {convertName(currentChain?.name)}
          </span>
        </span>
        <i
          className={`iconfont icon-chevron-up text-[7px] text-black ${dropdownVisible ? '' : 'rotate-180'}`}
        />
      </span>

      {dropdownVisible && (
        //   默认是left:0
        <ul className="z-20 mt-2 flex w-max flex-col space-y-2">
          {infos.map((info) => (
            <li
              key={info.name}
              className={`flex cursor-pointer items-center rounded-lg px-4 py-4 text-lg text-text1 ${mode === 'swap' ? 'hover:bg-[#fff1ff]' : 'hover:bg-[#f7f6ff]'} `}
              onClick={() => askUserToSwitchChain(info.chainId)}
            >
              <span className="mr-4 flex min-w-48 flex-1 items-center space-x-4 font-roboto">
                <img
                  src={info.logo}
                  alt={info.name}
                  width={'24'}
                  height={'24'}
                />
                <span className="font-sf-compact">
                  {convertName(info.name)}
                </span>
              </span>
              {chainId === info.chainId && (
                <i
                  className={`iconfont icon-check flex items-center justify-center text-[10px] ${
                    mode === 'swap' ? 'text-[#FC72FF]' : 'text-text1'
                  }`}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {/*{dropdownVisible && (*/}
      {/*  <div*/}
      {/*    className="fixed inset-0 z-10 bg-transparent"*/}
      {/*    onClick={() => setDropdownVisible(false)}*/}
      {/*  />*/}
      {/*)}*/}
      {reselectChainVisible && (
        <Modal>
          <div
            className="relative flex h-[278px] w-[310px] flex-col rounded-xl bg-white p-5 text-left font-roboto"
            style={{ boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
          >
            <span className="text-xl font-semibold text-text1">
              Please switch the network
            </span>
            <div className="mt-7 text-base font-normal text-black">
              <p className="leading-[24px]">
                Sorry, the network you selected from your wallet is not
                supported by Sortes yet.
              </p>
              <p className="leading-[24px]">
                Please select the network from the menu on our navigation bar.
              </p>
            </div>

            <div className="absolute bottom-5 right-5 flex h-9 w-full justify-end space-x-10 text-sm font-normal">
              <button
                onClick={() => setReselectChainVisible(false)}
                className="rounded-lg border border-[#3370FF] px-2 text-[#3370FF]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setReselectChainVisible(false);
                  setDropdownVisible(true);
                }}
                className="rounded-lg border border-primary bg-[#3370FF] px-2 text-white"
              >
                Re-select
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ChainSelectionMobile;
