import React from 'react';
import { currentChainInfo, RandomnessSource } from '../../utils/env';
import ChainLink from '../../assets/icons/chainlink.png';
import Arpa from '../../assets/icons/arpa.png';

type RandomnessIconProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  randomness?: RandomnessSource;
  isPlay?: boolean;
};

export const RandomnessIcon: React.FC<RandomnessIconProps> = (props) => {
  const {
    isPlay = false,
    randomness: randomnessProp,
    className,
    ...imgProps
  } = props;
  const randomness = randomnessProp ?? currentChainInfo().randomness;
  const iconSrc = randomness === RandomnessSource.Chainlink ? ChainLink : Arpa;
  const altText =
    randomness === RandomnessSource.Chainlink ? 'ChainLink' : 'Arpa';

  return (
    <div className={`${isPlay ? '' : 'rounded-md bg-[#e6e8f5] px-3 py-2'}`}>
      <img
        {...imgProps}
        src={iconSrc as string}
        alt={altText}
        className={className ? className : 'h-auto w-[60px]'}
      />{' '}
    </div>
  );
};
