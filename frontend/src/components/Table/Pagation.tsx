import { useCallback, useState, useEffect } from 'react';

interface PagationProps {
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  isPool?: boolean;
}

const PageSize = 10;

// Left Arrow Icon Component
const LeftArrowIcon: React.FC<{ isPool?: boolean }> = ({ isPool = false }) => (
  <div
    className={`break-words text-center text-sm font-normal ${isPool ? 'text-[#666666]' : 'text-white'}`}
  >
    {'<'}
  </div>
);

// Right Arrow Icon Component
const RightArrowIcon: React.FC<{ isPool?: boolean }> = ({ isPool = false }) => (
  <div
    className={`break-words text-center text-sm font-normal ${isPool ? 'text-[#666666]' : 'text-white'}`}
  >
    {'>'}
  </div>
);

// Function to get text color based on current page and pool status
const getTextColor = (isCurrentPage: boolean, isPool: boolean): string => {
  if (isCurrentPage) {
    return isPool ? 'text-white' : 'text-[#202020]';
  } else {
    return isPool ? 'text-[#202020]' : 'text-white';
  }
};

// Function to get background color based on current page and pool status
const getBackgroundColor = (
  isCurrentPage: boolean,
  isPool: boolean
): string => {
  if (isCurrentPage) {
    return isPool ? 'bg-[#1890FF] border border-[#D8D8D8]' : 'bg-white';
  } else {
    return 'bg-transparent border border-[#D8D8D8]';
  }
};

const Pagers: React.FC<{
  start: number;
  end: number;
  page: number;
  onPageChange: (page: number) => void;
  isPool?: boolean;
}> = ({ start, end, page, onPageChange, isPool = false }) => {
  return (
    <>
      {Array.from({ length: end - start + 1 }).map((_, idx) => {
        const pageNumber = idx + start;
        const isCurrentPage = pageNumber === page;

        return (
          <button
            key={idx}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded ${getBackgroundColor(isCurrentPage, isPool)}`}
            style={{
              outline: isCurrentPage ? 'none' : '1px white solid',
              outlineOffset: isCurrentPage ? 0 : '-0.5px',
            }}
            onClick={() => onPageChange(pageNumber)}
          >
            <div
              className={`break-words text-center text-sm font-normal ${getTextColor(isCurrentPage, isPool)}`}
            >
              {pageNumber + 1}
            </div>
          </button>
        );
      })}
    </>
  );
};

const Dots = () => (
  <div className="flex h-8 items-center justify-center rounded px-1.5">
    <div className="break-words text-center text-sm font-normal text-white">
      ...
    </div>
  </div>
);

const Pagation: React.FC<PagationProps> = ({
  total,
  page,
  onPageChange,
  isPool = false,
}) => {
  const pageCount = Math.ceil(total / PageSize);
  const isFirstPage = page === 0;
  const isLastPage = page === pageCount - 1;
  const isProfitPage = location.pathname.includes('/distributor-profit');

  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleJumpToPage = useCallback(
    (targetPageStr: string) => {
      const targetPage = parseInt(targetPageStr);
      if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= pageCount) {
        onPageChange(targetPage - 1); // Convert to 0-based index
        setInputValue(''); // Clear input after successful jump
      }
    },
    [pageCount, onPageChange]
  );

  // Debounce effect for auto jump
  useEffect(() => {
    if (!inputValue.trim()) return; // Don't process empty input

    const timeoutId = setTimeout(() => {
      handleJumpToPage(inputValue);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [inputValue, handleJumpToPage]);

  const renderPagers = useCallback(
    (start: number, end: number) => {
      return (
        <Pagers
          start={start}
          end={end}
          page={page}
          onPageChange={onPageChange}
          isPool={isPool}
        />
      );
    },
    [onPageChange, page, isPool]
  );

  if (!total) return null;

  return (
    <div
      className={`mb-8 flex items-center justify-end pt-5 max-sm:mb-0 max-sm:w-full max-sm:justify-end ${isProfitPage && 'max-sm:bg-mainV1'} max-sm:pb-[30px]`}
    >
      <div className="inline-flex h-full w-full items-start justify-end gap-2">
        {/* Left Arrow Button */}
        <button
          className={`flex h-8 w-8 items-center justify-center rounded ${isPool ? 'border border-[#D8D8D8]' : 'border-none'} bg-transparent ${
            isFirstPage
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer opacity-100'
          }`}
          style={{
            outline: '1px white solid',
            outlineOffset: '-0.5px',
          }}
          disabled={isFirstPage}
          onClick={() => onPageChange(page - 1)}
        >
          <LeftArrowIcon isPool={isPool} />
        </button>

        {/* Page Numbers */}
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
                  <Dots />
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

        {/* Right Arrow Button */}
        <button
          className={`flex h-8 w-8 items-center justify-center rounded ${isPool ? 'border border-[#D8D8D8]' : 'border-none'} bg-transparent ${
            isLastPage
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer opacity-100'
          }`}
          style={{
            outline: '1px white solid',
            outlineOffset: '-0.5px',
          }}
          disabled={isLastPage}
          onClick={() => onPageChange(page + 1)}
        >
          <RightArrowIcon isPool={isPool} />
        </button>

        {/* "To" Label */}
        <div className="flex h-8 items-center justify-center rounded px-1.5">
          <div
            className={`break-words text-center text-xs font-normal leading-6 ${isPool ? 'text-[#666666]' : 'text-white'}`}
          >
            To
          </div>
        </div>

        {/* Page Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={String(page + 1)}
          className={`h-8 w-8 rounded bg-transparent px-1 text-center text-sm font-normal ${isPool ? 'border border-[#D8D8D8] text-[#202020]' : 'border-none text-white'} placeholder:text-gray-300 focus:outline-none`}
          style={{
            outline: '1px white solid',
            outlineOffset: '-0.5px',
          }}
        />

        {/* "Page" Label */}
        <div className="flex h-8 items-center justify-center rounded px-1.5">
          <div
            className={`break-words text-center text-xs font-normal leading-6 ${isPool ? 'text-[#666666]' : 'text-white'} `}
          >
            Page
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagation;
