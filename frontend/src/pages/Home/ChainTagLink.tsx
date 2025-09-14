import { Link } from 'react-router-dom';

interface ChainTagProps {
  url: string;
  img: string;
}
const ChainTag: React.FC<ChainTagProps> = ({ url, img }) => {
  return (
    <Link to={url} target="_blank" rel="noreferrer" className={`relative`}>
      <img src={img} className="h-[48px] max-sm:h-[30px]" />
    </Link>
  );
};

export default ChainTag;
