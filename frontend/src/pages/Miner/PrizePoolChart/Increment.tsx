interface IncrementProps {
  value: number;
}

const Increment: React.FC<IncrementProps> = (props) => {
  const { value } = props;
  const text = `${value.toFixed(2)}%`;
  if (value > 0)
    return (
      <h1 className="ml-[28px] flex font-bold text-[#93DC08] max-sm:text-base">
        <span className="underline underline-offset-4">{text}</span>
        <div>
          <span className="iconfont_old icon-shangzhang ml-[10px] inline-block pt-[0.5px] text-[27px]"></span>
        </div>
      </h1>
    );
  else if (value < 0)
    return (
      <h1 className="ml-[28px] flex font-bold text-[#FF925C] max-sm:text-base">
        <span className="underline underline-offset-4">{text}</span>
        <div>
          <span className="iconfont_old icon-xiajiang ml-[10px] inline-block pt-[0.5px] text-[27px]"></span>
        </div>
      </h1>
    );
  else if (value === 0)
    return (
      <h1 className="relative ml-[28px] font-bold text-[#6A79FF] max-sm:text-base">
        <span className="underline underline-offset-4">{text}</span>
      </h1>
    );
  else return <></>;
};

export default Increment;
