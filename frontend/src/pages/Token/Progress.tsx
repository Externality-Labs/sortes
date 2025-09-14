interface ProgressProps {
  claimable: number;
  claimed: number;
  locked: number;
}

export const Progress = ({ claimable, claimed, locked }: ProgressProps) => {
  const total = claimable + claimed + locked;
  const claimablePercentage = total > 0 ? claimable / total : 0;
  const claimedPercentage = total > 0 ? claimed / total : 0;
  const lockedPercentage = total > 0 ? locked / total : 1;

  return (
    <div className="flex h-5 w-full rounded-lg bg-[#E9ECF5]">
      <div
        className="h-full rounded-lg bg-mainV1"
        style={{ width: `${claimedPercentage * 100}%` }}
      />
      <div
        className="relative h-full rounded-lg bg-[#93DC08]"
        style={{ width: `${claimablePercentage * 100}%` }}
      >
        <span className="text-md absolute -right-12 -top-2.5 rounded-full bg-[#93DC08] px-3 py-2 font-medium text-white">{`${((claimedPercentage + claimablePercentage) * 100).toFixed(1)}%`}</span>
      </div>
      <div
        className="h-full rounded-lg bg-[#E9ECF5]"
        style={{ width: `${lockedPercentage * 100}%` }}
      />
    </div>
  );
};
