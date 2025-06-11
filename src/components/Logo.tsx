import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string; // This will carry text-size and color e.g. text-2xl text-primary
}

export function Logo({ className }: LogoProps) {
  return (
    // The overall className (e.g., text-2xl text-primary) is applied here
    // and will affect the size and color of the text within the spans.
    // Apply base font-headline (Inter) to the parent div.
    <div className={cn("flex items-baseline font-headline", className)}>
      {/* SIL uses specific weight and tracking */}
      <span className="font-extrabold tracking-wider">SIL</span>
      {/* VU is also uppercase, uses a slightly lighter weight for distinction but same font family */}
      <span className="font-semibold tracking-wide">VU</span>
    </div>
  );
}
