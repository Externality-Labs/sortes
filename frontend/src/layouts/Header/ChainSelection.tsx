import Modal from '../../components/Modal/Modal';

import useChainSelection from '../../hooks/chainSelect.ts';
import { useCurrentUser } from '../../hooks/user.ts';
import { convertName } from '../../utils/format.ts';

const ChainSelection = () => {
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
    <div className="relative flex hidden sm:block">
      <span
        className="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-white p-[10px]"
        onClick={() => setDropdownVisible(!dropdownVisible)}
      >
        {LogoComponent && (
          <img
            src={LogoComponent}
            className="mr-[15px] w-[24px] flex-shrink-0"
          ></img>
        )}
        <i className="iconfont icon-chevron-up rotate-180 text-[7px] text-[#202020]" />
      </span>

      {dropdownVisible && (
        //   默认是left:0
        <ul
          className="absolute left-0 top-[45px] z-20 flex w-64 flex-col space-y-5 rounded-lg bg-white px-4 py-[10px]"
          style={{ boxShadow: '0 4px 4px rgba(0, 0, 0, 0.25)' }}
        >
          {infos.map((info) => (
            <li
              key={info.name}
              className="flex cursor-pointer items-center rounded-lg px-1 py-[14px] text-lg text-text1 hover:bg-[#f5f5f5]"
              onClick={() => askUserToSwitchChain(info.chainId)}
            >
              <span className="flex flex-1 items-center space-x-2 font-roboto">
                <img
                  src={info.logo}
                  alt={info.name}
                  width={'24'}
                  height={'24'}
                />
                <span className="text-base font-medium">
                  {convertName(info.name)}
                </span>
              </span>
              {chainId === info.chainId && (
                <i className="iconfont icon-check text-md size-6 text-mainV1" />
              )}
            </li>
          ))}
        </ul>
      )}
      {dropdownVisible && (
        <div
          className="fixed inset-0 z-10 bg-transparent"
          onClick={() => setDropdownVisible(false)}
        />
      )}
      {reselectChainVisible && (
        <Modal>
          <div className="flex w-[800px] flex-col space-y-8 rounded-2xl bg-white p-10 text-left font-roboto shadow-xl">
            <span className="text-3xl font-bold text-[#202020]">
              Please switch the network
            </span>
            <span className="text-xl font-normal text-black">
              Sorry, the network you selected from your wallet is not supported
              by Sortes yet. Please select the network from the menu on our
              navigation bar.
            </span>
            <div className="flex w-full justify-end space-x-10">
              <button
                onClick={() => setReselectChainVisible(false)}
                className="rounded-lg border border-[#3370FF] px-5 py-[10px] text-xl font-normal text-[#3370FF] hover:bg-[#3370FF]/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setReselectChainVisible(false);
                  setDropdownVisible(true);
                }}
                className="rounded-lg bg-[#3370FF] px-5 py-[10px] text-xl text-white hover:bg-[#3370FF]/80"
              >
                Switch
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ChainSelection;
