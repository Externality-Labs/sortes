import { FC } from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const ArrowSvg = ({ canGo }: { canGo: boolean }) => (
  <svg
    width="8"
    height="12"
    viewBox="0 0 8 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.00697 11.8155C0.800946 11.5867 0.81942 11.2342 1.04824 11.0282L6.63259 6L1.04824 0.971826C0.81942 0.765797 0.800946 0.413286 1.00697 0.184467C1.213 -0.0443497 1.56551 -0.0628242 1.79433 0.143205L7.81537 5.56458C7.94323 5.67969 8.00541 5.84055 7.99945 6C8.00541 6.15945 7.94323 6.3203 7.81537 6.43542L1.79433 11.8568C1.56551 12.0628 1.213 12.0443 1.00697 11.8155Z"
      fill={canGo ? '#7B61FF' : '#FFFFFF'}
    />
  </svg>
);

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="inline-flex w-full items-start justify-center gap-10">
      <div
        className={`flex size-8 rotate-180 items-center justify-center rounded text-[#666666] ${
          canGoPrevious
            ? 'cursor-pointer bg-white hover:bg-gray-100'
            : 'cursor-not-allowed bg-[#a290ff]'
        }`}
        onClick={() => canGoPrevious && handlePageChange(currentPage - 1)}
      >
        <ArrowSvg canGo={canGoPrevious} />
      </div>
      <div
        className={`flex size-8 items-center justify-center rounded text-[#666666] ${
          canGoNext
            ? 'cursor-pointer bg-white hover:bg-gray-100'
            : 'cursor-not-allowed bg-[#a290ff]'
        }`}
        onClick={() => canGoNext && handlePageChange(currentPage + 1)}
      >
        <ArrowSvg canGo={canGoNext} />
      </div>
    </div>
  );
};

export default Pagination;
