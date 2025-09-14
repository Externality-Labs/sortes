import Protocol from './protocol.tsx';
import SupportedBy from '../../components/SupportedBy.tsx';
import Roadmap from '../../components/Roadmap/index.tsx';

const TouristPage = () => {
  return (
    <div className="mx-auto w-full sm:w-[1200px]">
      <div className="mx-auto mt-5 w-auto text-2xl max-sm:mb-10 max-sm:leading-[29px] md:mt-20 md:w-[1160px]">
        <h1 className="flex text-2xl font-bold text-mainV1 max-sm:justify-center max-sm:leading-[29px] md:ml-[30px] md:text-4xl">
          What's Sortes Protocol?
        </h1>
        <Protocol />
      </div>
      <div className="text-center font-bold text-mainV1 max-sm:mb-[60px] max-sm:mt-5 sm:mx-auto sm:mt-[100px] sm:w-[1160px] sm:text-left">
        <SupportedBy />
      </div>
      <div className="pb-4 max-sm:hidden max-sm:px-8 sm:pb-[114px] md:mt-[100px]">
        <Roadmap isApp={true} />
      </div>
    </div>
  );
};

export default TouristPage;
