import { ProbabilityTable } from '../../../services/type';
import { useJkpt, usePoolSize } from '../../../hooks/pool';
import { getJackpot, getWinRate } from '../../../utils/probabilityTable';
import JkptIcon from '../../../components/jkpt/Icon';
import Tooltip from '../../../components/Tooltip';

interface JackpotProps {
  probabilityTable: ProbabilityTable;
  name: string;
}

const Jackpot: React.FC<JackpotProps> = ({ probabilityTable, name }) => {
  const { outputToken } = probabilityTable;
  const poolSize = usePoolSize(outputToken);
  const { jkptPrice } = useJkpt(outputToken);
  const winRate = getWinRate(probabilityTable, Number(poolSize), jkptPrice);
  const jackpot = getJackpot(probabilityTable, Number(poolSize), jkptPrice);

  return (
    <>
      <div className="mt-6 inline-flex w-[1000px] items-center justify-center gap-20 border-b-[2px] border-[#E7E7E9] pb-6 max-sm:hidden max-sm:w-full">
        <div className="inline-flex w-[345px] flex-col items-start justify-start gap-2.5 overflow-hidden">
          <div className="max-sm:hi justify-start text-base font-normal text-neutral-800">
            Name
          </div>
          <div className="inline-flex h-6 items-center justify-start gap-2">
            <div className="justify-start text-nowrap text-left text-xl font-bold text-blue-500">
              {name}
            </div>
          </div>
        </div>
        <div className="flex w-80 items-center justify-start gap-6">
          <div className="inline-flex flex-col items-start justify-start gap-2.5">
            <div className="justify-start text-base font-normal text-neutral-800">
              Jackpot
            </div>
            <div className="inline-flex items-center justify-start gap-2">
              <JkptIcon
                tokenAddress={probabilityTable?.outputToken}
                sizeClz="size-6"
              />

              <div className="justify-start text-xl font-bold text-blue-500">
                {jackpot.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
        <div className="relative inline-flex w-48 flex-col items-start justify-start gap-2.5">
          <div className="justify-start text-base font-normal text-neutral-800">
            Total Win Rate
          </div>
          <div className="justify-start text-xl font-bold text-blue-500">
            {(winRate * 100).toFixed(2)}%
          </div>
          <div className="absolute -top-[11px] left-[112px] size-4">
            <Tooltip type="info">
              <div className="absolute -top-[65px] z-30 ml-5 w-[230px] rounded-lg bg-[#f8f8f8] p-2 shadow-lg">
                Based on a $1 ticket. Total Win Rate slightly increases with
                higher ticket values.
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="relative px-4 pb-4 pt-8 md:hidden">
        <div className="text-left text-xl text-blue-500">{name}</div>
        <section className="mt-6 flex items-center justify-between gap-2">
          <div className="flex flex-col items-start space-y-1 text-blue-500">
            <div className="justify-start text-[10px] font-normal text-neutral-800">
              Jackpot
            </div>
            <section className="flex gap-1">
              <JkptIcon
                tokenAddress={probabilityTable?.outputToken}
                sizeClz="size-[17px]"
              />
              <h2 className="text-sm">{jackpot.toFixed(6)}</h2>
            </section>
          </div>
          <div className="relative mr-[50px] flex flex-col space-y-1 text-blue-500">
            <div className="justify-start text-[10px] font-normal text-neutral-800">
              Total Win Rate
            </div>
            <div className="text-sm"> {(winRate * 100).toFixed(2)}%</div>{' '}
            <div className="absolute -top-[11px] left-[72px] size-[10px]">
              <Tooltip type="info">
                <div className="absolute -left-20 -top-[85px] z-30 w-[143px] rounded-lg bg-[#f8f8f8] p-2 shadow-lg">
                  Based on a $1 ticket. Total Win Rate slightly increases with
                  higher ticket values.
                </div>
              </Tooltip>
            </div>
          </div>
        </section>
        <div className="absolute bottom-0 left-4 right-4 border-b border-b-[2px] border-b-[#E7E7E9]"></div>
      </div>
    </>
  );
};

export default Jackpot;
