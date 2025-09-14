import iconTrusless from '../../assets/svg/protocol/trustless.svg';
import iconFinancial from '../../assets/svg/protocol/financial.svg';
import iconPurely from '../../assets/svg/protocol/purely.svg';
import iconProbability from '../../assets/svg/protocol/probability.svg';

const protocolData = [
  {
    icon: iconTrusless,
    title: 'Trustless Social Welfare System',
    content: 'A trustless welfare system that can benefit many parties.',
  },
  {
    icon: iconProbability,
    title: 'Reliable Probability Depth Source',
    content:
      'Power and re-build any product that highly relied on trusted mechanisms to generate mathematically crucial results, by providing infinite probabilistically depth.',
  },
  {
    icon: iconFinancial,
    title: 'Decentralized Pool Generating BTC Revenue',
    content:
      'A Decentralized Pool that generates Bitcoin revenue with low risk.',
  },
  {
    icon: iconPurely,
    title: 'Purely Altruistic Charity DAO',
    content: 'A purely altruistic charity DAO that serves public good.',
  },
];
interface ProtocolItemProps {
  title: string;
  content: string;
  icon: string;
}
interface ProtocolProps {}

const ProtocolItem: React.FC<ProtocolItemProps> = (props) => {
  const { title, content, icon } = props;

  return (
    <div
      className="w-[310px] rounded-2xl px-5 py-[30px] text-[#5962BA] md:w-[260px]"
      style={{
        border: '2px solid transparent',
        backgroundClip: 'padding-box, border-box',
        backgroundOrigin: 'padding-box, border-box',
        backgroundImage:
          'linear-gradient(to right, #fff, #fff), linear-gradient(to left, #1CADFF, #DBFF00)',
      }}
    >
      <img src={icon} alt="" className="mb-3" />
      <h1 className="mb-6 text-xl font-bold leading-9 max-sm:mt-[17px]">
        {title}
      </h1>
      <span className="text-base font-normal leading-9 max-sm:mt-6">
        {content}
      </span>
    </div>
  );
};

const Protocol: React.FC<ProtocolProps> = () => {
  return (
    <div className="mt-10 flex max-sm:flex-col max-sm:items-center max-sm:space-y-[30px] md:mt-[70px] md:w-[1160px] md:space-x-10">
      {protocolData.map((item) => {
        return (
          <ProtocolItem
            content={item.content}
            title={item.title}
            icon={item.icon as string}
            key={item.content}
          ></ProtocolItem>
        );
      })}
    </div>
  );
};
export default Protocol;
