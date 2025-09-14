import { useCallback } from 'react';

interface PagationProps {
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number; // items per page, default 10
}

const Pagers: React.FC<{
  start: number;
  end: number;
  page: number;
  onPageChange: (page: number) => void;
}> = ({ start, end, page, onPageChange }) => {
  return (
    <>
      {Array.from({ length: end - start + 1 }).map((_, idx) => (
        <button
          key={`page-${idx + start}`}
          className={`${
            idx + start === page
              ? 'border-link bg-white text-mainV1'
              : 'border-[#D8D8D8] text-white'
          } mx-[2px] flex h-8 w-8 items-center justify-center rounded-[4px] border`}
          onClick={() => onPageChange(idx + start)}
        >
          {idx + start + 1}
        </button>
      ))}
    </>
  );
};

const Dots = () => <span>...</span>;

const Pagation: React.FC<PagationProps> = ({
  total,
  page,
  onPageChange,
  pageSize = 10,
}) => {
  const size = pageSize > 0 ? pageSize : 10;
  const pageCount = Math.ceil(total / size);
  const isFirstPage = page === 0;
  const isLastPage = page === pageCount - 1;
  const isProfitPage = location.pathname.includes('/distributor-profit');

  const renderPagers = useCallback(
    (start: number, end: number) => {
      return (
        <Pagers
          start={start}
          end={end}
          page={page}
          onPageChange={onPageChange}
        />
      );
    },
    [onPageChange, page]
  );

  if (!total) return null;

  return (
    <div
      className={`mb-8 flex items-center justify-end pt-5 max-sm:mb-0 max-sm:w-[100vw] max-sm:justify-center ${isProfitPage && 'max-sm:bg-mainV1'} max-sm:pb-[30px]`}
    >
      <button
        className="mr-4 h-8 w-8 rounded-[4px] border border-[#D8D8D8] text-white disabled:border-dark1 disabled:text-dark1"
        disabled={isFirstPage}
        onClick={() => onPageChange(page - 1)}
      >
        {'<'}
      </button>
      {(() => {
        if (pageCount <= 9) {
          return renderPagers(0, pageCount - 1);
        } else {
          if (page <= 4) {
            return (
              <>
                {renderPagers(0, page + 2)}
                <Dots />
                {renderPagers(pageCount - 2, pageCount - 1)}
              </>
            );
          } else if (page >= pageCount - 5) {
            return (
              <>
                {renderPagers(0, 1)}
                {<Dots />}
                {renderPagers(page - 2, pageCount - 1)}
              </>
            );
          } else {
            return (
              <>
                {renderPagers(0, 1)}
                <Dots />
                {renderPagers(page - 2, page + 2)}
                <Dots />
                {renderPagers(pageCount - 2, pageCount - 1)}
              </>
            );
          }
        }
      })()}
      <button
        className="ml-4 h-8 w-8 rounded-[4px] border border-[#D8D8D8] text-white disabled:border-dark1 disabled:text-dark1"
        disabled={isLastPage}
        onClick={() => onPageChange(page + 1)}
      >
        {'>'}
      </button>
    </div>
  );
};

export default Pagation;
