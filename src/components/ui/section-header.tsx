type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function SectionHeader({
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-800 pb-3">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
