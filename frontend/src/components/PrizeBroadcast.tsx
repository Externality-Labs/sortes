import { useCallback, useEffect, useState } from 'react';
import { getUserAvatar } from '../utils/avatarGenerator';
import { getRecentWinners } from '../services/api/xbit';
import { formatTokenAmount, readableAddr } from '../utils/format';
import { currentChainInfo } from '../utils/env';
import Token from '../utils/token';

interface PrizeBroadcastInfo {
  address: string;
  value: number;
  jkpt: string;
}

const PrizeBroadcast: React.FC = () => {
  const [data, setData] = useState<PrizeBroadcastInfo[]>([]);
  const chainId = currentChainInfo().chainId;
  const loadRecentWinners = useCallback(async () => {
    const winners = await getRecentWinners();
    setData(
      winners.map((winner) => ({
        address: winner.player,
        value: winner.outputTotalAmount,
        jkpt: Token.getTokenByAddress(winner.outputToken).name,
      }))
    );
  }, []);

  useEffect(() => {
    loadRecentWinners();
  }, [loadRecentWinners, chainId]);

  return (
    <div className="absolute left-0 flex w-full overflow-x-hidden">
      <ul className="flex w-max space-x-5">
        {data.map(({ address, value, jkpt }, idx) => {
          return (
            <li
              className="flex items-center space-x-1 rounded-full bg-white px-4 py-1 first:animate-[broadcast_40s_linear_infinite] max-sm:px-3 max-sm:py-1"
              key={idx}
            >
              <span className="w-8 max-sm:w-6">
                <img
                  className="h-auto w-full"
                  src={getUserAvatar(address)}
                  alt={address}
                ></img>
              </span>
              <span className="flex items-center space-x-1 max-sm:text-sm">
                <span className="mr-4">{readableAddr(address, 5)}</span>
                <span className="text-warning">
                  +&nbsp;{formatTokenAmount(value)}
                </span>
                <span className="text-warning">{jkpt.toUpperCase()}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PrizeBroadcast;
