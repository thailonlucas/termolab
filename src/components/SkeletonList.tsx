interface SkeletonListProps {
  count?: number;
  height?: string;
}

export function SkeletonList({ count = 3, height = "h-16" }: SkeletonListProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} rounded-xl bg-muted animate-pulse`} />
      ))}
    </div>
  );
}
