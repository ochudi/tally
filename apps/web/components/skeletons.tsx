// Loading placeholders that match the real layout, so the page does not jump when
// data arrives. The shimmer respects reduced-motion (see globals.css).

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-shimmer rounded-md bg-line ${className}`} />;
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft">
      <Block className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <Block className="h-3 w-20" />
        <Block className="h-4 w-4/5" />
        <Block className="h-4 w-3/5" />
        <div className="flex items-center justify-between pt-2">
          <Block className="h-6 w-24 rounded-full" />
          <Block className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BrandGroupsSkeleton() {
  return (
    <div className="space-y-12">
      {Array.from({ length: 2 }, (_, i) => (
        <section key={i} className="space-y-5">
          <div className="rounded-xl border border-line bg-surface p-6 shadow-soft">
            <Block className="h-6 w-48" />
            <div className="mt-4 flex gap-6">
              <Block className="h-10 w-64" />
              <Block className="h-10 w-32" />
            </div>
          </div>
          <CardGridSkeleton count={3} />
        </section>
      ))}
    </div>
  );
}
