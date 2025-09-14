import { useRef } from 'react';

interface InputProps {
  value: string | number | undefined;
  type?: 'number' | 'text';
  error?: string;
  readonly?: boolean;
  placeholder?: string;
  onChange?: (val: any) => void;
  disable?: boolean;
}

const Input: React.FC<InputProps> = ({
  value = '',
  type = 'number',
  error,
  onChange,
  placeholder,
  disable = false,
}) => {
  // const [val, setVal] = useState<number | undefined>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const border = error ? 'border-[#FF4D6C]' : 'border-border1';

  return (
    <div className={`relative flex-1 rounded-lg border-[1.5px] ${border}`}>
      <input
        ref={inputRef}
        type={type}
        disabled={disable} // 假设你有一个 disabled 属性
        className={`w-full rounded-lg bg-white px-4 py-3 font-bold font-normal outline-none disabled:cursor-not-allowed disabled:bg-[#FAFAFB] disabled:opacity-100`}
        placeholder={placeholder}
        value={value}
        onWheel={() =>
          inputRef.current && (inputRef.current as HTMLInputElement).blur()
        }
        onChange={(e) => {
          onChange &&
            onChange(
              type === 'number'
                ? Math.round(+e.target.value * 100) / 100
                : e.target.value.trim()
            );
        }}
      />
      {error && (
        <span className="absolute -left-3 top-14 flex items-center space-x-2 px-3 py-1 text-xs font-bold text-[#FF4D6C]">
          <span>{error}</span>
        </span>
      )}
    </div>
  );
};

export default Input;
