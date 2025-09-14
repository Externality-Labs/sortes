import { FC } from 'react';

interface ActionButtonProps {
  text: string;
  onClick: (event: React.MouseEvent) => void;
  className?: string;
}

const ActionButton: FC<ActionButtonProps> = ({
  text,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`cursor-pointer rounded-md bg-[#3370ff] px-4 py-1 text-sm font-normal text-white hover:bg-[#2563eb] max-sm:px-2 max-sm:text-[10px] max-sm:leading-none ${className}`}
      onClick={onClick}
    >
      {text}
    </div>
  );
};

export default ActionButton;
