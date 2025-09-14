import { HTMLAttributes } from 'react';

const ArrowIcon: React.FC<
  { enable: boolean } & HTMLAttributes<HTMLSpanElement>
> = ({ enable, className, onClick, ...props }) => {
  return (
    <span
      className={`cursor-pointer ${className}`}
      onClick={onClick}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        className="max-sm:h-[5px] max-sm:w-[5px]"
      >
        {enable ? (
          <path
            d="M13.2104 10.222L8.15953 4.36524C8.01496 4.19759 7.73658 4.19759 7.59047 4.36524L2.5396 10.222C2.35196 10.4404 2.52114 10.7603 2.82413 10.7603H12.9259C13.2289 10.7603 13.398 10.4404 13.2104 10.222Z"
            fill="#2FB3FA"
          />
        ) : (
          <path
            d="M13.2104 10.222L8.15953 4.36524C8.01496 4.19759 7.73658 4.19759 7.59047 4.36524L2.5396 10.222C2.35196 10.4404 2.52114 10.7603 2.82413 10.7603H12.9259C13.2289 10.7603 13.398 10.4404 13.2104 10.222Z"
            fill="#999999"
          />
        )}
      </svg>
    </span>
  );
};
export default ArrowIcon;
