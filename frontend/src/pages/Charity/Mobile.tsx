import { useCharityBalance } from '../../hooks/balance';
import { formatUSD } from '../../utils/format';
import charityImg from '../../assets/images/charity/charity.jpg';
import SupportedBy from '../../components/SupportedBy';

const MobileCharityPage = () => {
  const { totalFunds, donatedFunds, fundsToDonate } = useCharityBalance();
  if (!fundsToDonate === null) return null;
  return (
    <div className="flex flex-col">
      <div className="bg-mainV1 px-5 pb-8 text-white">
        <div
          className="my-10 overflow-hidden rounded-lg"
          style={{
            backgroundImage:
              'linear-gradient(to right, #FFDD17, #FFDD17), linear-gradient(289deg, #93DC08 11.56%, #FA48E8 150.15%)',
            backgroundClip: 'padding-box, border-box',
            backgroundOrigin: 'padding-box, border-box',
            border: '2px solid transparent',
          }}
        >
          <div className="flex flex-col space-y-1.5 bg-mainV1 p-3.5 font-bold">
            <div className="text-base">
              Total Charity Funds:{' '}
              <span className="text-[#FFA41B]">
                {formatUSD(totalFunds)} USD
              </span>
            </div>
            <div className="flex flex-col gap-0.5 text-sm">
              <span>
                Donated:{' '}
                <span className="text-[#FFA41B]">
                  {formatUSD(donatedFunds)}
                </span>
              </span>
              <span>
                To be Donated:{' '}
                <span className="text-[#FFA41B]">
                  {formatUSD(fundsToDonate)}
                </span>
              </span>
            </div>
            <div className="text-xs font-light">
              This charity fund will be governed by the community and contribute
              to the social welfare.
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-5">
        <img src={charityImg} alt="charity" className="h-auto w-full" />
      </div>
      <div className="border-top mx-auto w-[270px] border-[1px] border-dashed border-[#7B61FF]"></div>
      <div className="mb-12 mt-5 text-center font-bold text-mainV1">
        <SupportedBy />
      </div>
    </div>
  );
};

export default MobileCharityPage;
