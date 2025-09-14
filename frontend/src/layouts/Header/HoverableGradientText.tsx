export default function HoverableGradientText(props: { children: string }) {
  return (
    <span className="cursor-pointer font-[Roboto] not-italic leading-[normal] text-[#7D7D7D] hover:bg-gradient-to-b hover:from-[#FF48B5] hover:from-[38.5%] hover:via-[#FF884D] hover:via-[72.5%] hover:to-[#FFA000] hover:bg-clip-text hover:text-transparent">
      {props.children}
    </span>
  );
}
