interface DrawAmountItemProps {
  value: number;
  active: boolean;
  setValue: (value: number) => void;
}

const DrawAmountItem: React.FC<DrawAmountItemProps> = ({
  value,
  active,
  setValue,
}) => {
  const textColorClz = active ? 'text-white' : 'text-link';
  const borderColorClz = active ? '' : 'border border-mainV1';
  return (
    <div
      className={
        'flex flex-1 cursor-pointer items-center justify-center rounded-lg border py-3 sm:py-6 ' +
        borderColorClz
      }
      style={{
        background: active ? '#6f6bfe' : '#fff',
      }}
      onClick={() => setValue(value)}
    >
      <span className={`${textColorClz} text-2xl sm:text-3xl`}>${value}</span>
    </div>
  );
};
export default DrawAmountItem;
