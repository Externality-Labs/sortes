interface CustomizedItemInputProps {
  refObj: React.RefObject<HTMLInputElement>;
  value: string | number;
  active: boolean;
  valid: boolean;
  onChange: (value: number) => void;
  onInputFocus?: () => void;
}

const CustomizedItemInput: React.FC<CustomizedItemInputProps> = ({
  refObj,
  value,
  active,
  valid,
  onChange,
  onInputFocus,
}) => {
  const isInputEmpty = refObj && refObj.current?.value === '';
  const inputBorderClz =
    active && !valid && !isInputEmpty
      ? ' border-[#FF4D6C]'
      : ' border-transparent';
  return (
    <input
      ref={refObj}
      type="number"
      value={value}
      onFocus={onInputFocus}
      onChange={(e) => onChange(parseInt(e.target.value.trim()))}
      className={
        'inline-block w-24 rounded-lg border-2 bg-white px-2 py-1 text-left text-2xl font-bold focus:border-link focus:outline-none sm:w-36 sm:px-4 sm:text-3xl ' +
        (valid || isInputEmpty ? 'text-link' : 'text-[#FF4D6C]') +
        inputBorderClz
      }
      style={{
        backgroundImage:
          'linear-gradient(to right, #fff, #fff), linear-gradient(289deg, #1CADFF 11.56%, #DBFF00 150.15%)',
        backgroundClip: 'padding-box, border-box',
        backgroundOrigin: 'padding-box, border-box',
        border: '1px solid transparent',
      }}
    />
  );
};
export default CustomizedItemInput;
